// Hero dome: tiles of the mosaic video on the inside of a sphere, drawn as one
// instanced mesh (one draw call) in raw WebGL2. Every tile samples its cell of
// a single mosaic texture, so there's one decode and at most one texture upload
// per frame however many tiles are visible.

import { MIN_FRAME_MS } from "@/lib/frame-cap";

export type DomeTier = "capable" | "low" | "static";

export interface DomeOptions {
  tier: DomeTier;
  dpr: number;
  atlas: { avif: string; webp: string };
  /** H.264: at this size it beats AV1 on bytes, and decodes in hardware everywhere. */
  video: string;
  /** Called if the GPU can't keep up and the dome drops to the poster atlas. */
  onDowngrade?: () => void;
}

export interface DomeHandle {
  start(): void;
  stop(): void;
  destroy(): void;
}

const GRID = { cols: 4, rows: 2 }; // mosaic layout, see scripts/transcode.sh
const CELLS = GRID.cols * GRID.rows;
const RADIUS = 10;
const TILE_H = 0.17; // angular height in radians (~10deg)
const TILE_W = TILE_H * (9 / 16); // 9:16 tiles
const GAP = 0.024;
const ROWS = [-0.582, -0.388, -0.194, 0, 0.194, 0.388, 0.582];
const SPEED = 0.035; // rad/s auto-rotate
const SUBDIV_X = 4;
const SUBDIV_Y = 6;
const UPLOAD_INTERVAL = 1000 / 30; // texture uploads capped at 30fps
const OPACITY = 0.5;
const SATURATION = 0.55;

const VERT = `#version 300 es
in vec2 a_pos;
in vec4 a_tile; // lon, lat, cell, unused
uniform mat4 u_proj;
uniform float u_rot;
uniform vec2 u_tile;
uniform float u_radius;
out vec2 v_uv;
out float v_cell;
out float v_shade;
void main() {
  float lat = a_tile.y + (a_pos.y - 0.5) * u_tile.y;
  // Widen longitude away from the equator so tiles keep their 9:16 shape.
  float lon = a_tile.x + u_rot + (a_pos.x - 0.5) * u_tile.x / cos(a_tile.y);
  vec3 p = u_radius * vec3(cos(lat) * sin(lon), sin(lat), -cos(lat) * cos(lon));
  gl_Position = u_proj * vec4(p, 1.0);
  v_uv = vec2(a_pos.x, 1.0 - a_pos.y);
  v_cell = a_tile.z;
  // Tiles turning away toward the sides fade out.
  v_shade = smoothstep(0.2, 0.7, cos(lon));
}`;

const FRAG = `#version 300 es
precision mediump float;
in vec2 v_uv;
in float v_cell;
in float v_shade;
uniform sampler2D u_tex;
uniform float u_opacity;
uniform float u_saturation;
out vec4 outColor;
float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
void main() {
  vec2 cell = vec2(mod(v_cell, ${GRID.cols}.0), floor(v_cell / ${GRID.cols}.0));
  vec2 uv = (cell + mix(vec2(0.004), vec2(0.996), v_uv)) / vec2(${GRID.cols}.0, ${GRID.rows}.0);
  vec3 c = texture(u_tex, uv).rgb;
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(lum), c, u_saturation);
  // Rounded corners in tile space (9:16).
  vec2 p = (v_uv - 0.5) * vec2(0.5625, 1.0);
  float d = roundedBox(p, vec2(0.28125, 0.5), 0.045);
  float aa = fwidth(d);
  float a = (1.0 - smoothstep(-aa, aa, d)) * u_opacity * v_shade;
  outColor = vec4(c * a, a);
}`;

function perspective(fovY: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  // Column-major.
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    -1,
    0,
    0,
    2 * far * near * nf,
    0,
  ]);
}

function buildTiles() {
  const tiles: number[] = [];
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  ROWS.forEach((lat, row) => {
    const spacing = TILE_W / Math.cos(lat) + GAP;
    const count = Math.floor((Math.PI * 2) / spacing);
    const step = (Math.PI * 2) / count;
    const offset = row % 2 ? step / 2 : 0;
    for (let i = 0; i < count; i++) {
      tiles.push(i * step + offset, lat, Math.floor(random() * CELLS), 0);
    }
  });
  return new Float32Array(tiles);
}

function buildGrid() {
  const verts: number[] = [];
  const index: number[] = [];
  for (let y = 0; y <= SUBDIV_Y; y++) {
    for (let x = 0; x <= SUBDIV_X; x++) verts.push(x / SUBDIV_X, y / SUBDIV_Y);
  }
  const row = SUBDIV_X + 1;
  for (let y = 0; y < SUBDIV_Y; y++) {
    for (let x = 0; x < SUBDIV_X; x++) {
      const i = y * row + x;
      index.push(i, i + 1, i + row, i + 1, i + row + 1, i + row);
    }
  }
  return { verts: new Float32Array(verts), index: new Uint16Array(index) };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const nextFrame = () =>
  new Promise<number>((resolve) => requestAnimationFrame(resolve));

/**
 * Setup is split across frames (context, shader compile, buffers, atlas upload,
 * video) so no single main-thread task gets long on a throttled CPU.
 * Returns null when WebGL2 isn't available.
 */
export function createDome(
  canvas: HTMLCanvasElement,
  options: DomeOptions,
): DomeHandle | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  let tier = options.tier;
  let ready = false;
  let wantRunning = false;
  let running = false;
  let destroyed = false;
  let hasTexture = false;
  let rotation = 0.4;
  let frame = 0;
  let last = 0;
  let video: HTMLVideoElement | null = null;
  // Frames go through a 2D canvas before the GPU: uploading a <video> element
  // straight into a texture reads the hardware decoder's surface, which on
  // some Windows drivers arrives as noise/speckle. Drawing it first forces a
  // clean readback. ~0.3ms per upload at 640x568.
  let frameCanvas: HTMLCanvasElement | null = null;
  let frameCtx: CanvasRenderingContext2D | null = null;
  let newVideoFrame = false;
  let lastUpload = 0;
  let videoTimer = 0;
  const frameTimes: number[] = [];

  const grid = buildGrid();
  const tiles = buildTiles();
  let uProj: WebGLUniformLocation | null = null;
  let uRot: WebGLUniformLocation | null = null;
  let texture: WebGLTexture | null = null;
  let resizeObserver: ResizeObserver | null = null;

  // Immutable storage with a short mip chain: tiles near the edges are heavily
  // foreshortened, and sampling video frames without mips + anisotropic
  // filtering aliased into ripples/speckle. MAX_LEVEL 3 keeps the coarsest
  // level detailed enough that neighbouring mosaic cells don't bleed.
  let allocated = false;
  function upload(
    source: TexImageSource & {
      width?: number;
      height?: number;
      videoWidth?: number;
      videoHeight?: number;
    },
  ) {
    gl!.bindTexture(gl!.TEXTURE_2D, texture);
    if (!allocated) {
      const width = source.videoWidth || source.width || 640;
      const height = source.videoHeight || source.height || 568;
      gl!.texStorage2D(gl!.TEXTURE_2D, 4, gl!.RGBA8, width, height);
      allocated = true;
    }
    gl!.texSubImage2D(
      gl!.TEXTURE_2D,
      0,
      0,
      0,
      gl!.RGBA,
      gl!.UNSIGNED_BYTE,
      source,
    );
    gl!.generateMipmap(gl!.TEXTURE_2D);
    hasTexture = true;
  }

  function resize() {
    const width = Math.max(1, Math.round(canvas.clientWidth * options.dpr));
    const height = Math.max(1, Math.round(canvas.clientHeight * options.dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl!.viewport(0, 0, width, height);
    const aspect = width / height;
    // Narrow screens get a wider vertical FOV so tiles stay a similar size.
    const fov = aspect > 1 ? 0.95 : 1.25;
    gl!.uniformMatrix4fv(uProj, false, perspective(fov, aspect, 0.1, 50));
  }

  function draw() {
    if (!ready || !hasTexture) return;
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.uniform1f(uRot, rotation);
    gl!.drawElementsInstanced(
      gl!.TRIANGLES,
      grid.index.length,
      gl!.UNSIGNED_SHORT,
      0,
      tiles.length / 4,
    );
  }

  function downgrade() {
    if (tier !== "capable") return;
    tier = "low";
    window.clearTimeout(videoTimer);
    video?.pause();
    video?.remove();
    video = null;
    options.onDowngrade?.();
  }

  function tick(now: number) {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    if (last && now - last < MIN_FRAME_MS) return;
    const dt = last ? Math.min(now - last, 100) : 16;
    last = now;

    // First ~60 frames: if they average over 20ms, drop to the poster atlas.
    if (tier === "capable" && frameTimes.length < 60) {
      frameTimes.push(dt);
      if (
        frameTimes.length === 60 &&
        frameTimes.reduce((a, b) => a + b, 0) / 60 > 20
      )
        downgrade();
    }

    rotation += (dt / 1000) * SPEED;
    if (
      video &&
      newVideoFrame &&
      now - lastUpload >= UPLOAD_INTERVAL &&
      video.readyState >= 2
    ) {
      newVideoFrame = false;
      lastUpload = now;
      if (!frameCanvas) {
        frameCanvas = document.createElement("canvas");
        frameCanvas.width = video.videoWidth || 640;
        frameCanvas.height = video.videoHeight || 568;
        frameCtx = frameCanvas.getContext("2d", {
          alpha: false,
          desynchronized: true,
        });
      }
      frameCtx!.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);
      upload(frameCanvas);
    }
    draw();
  }

  function startLoop() {
    if (!ready || running || destroyed) return;
    if (tier === "static") {
      draw();
      return;
    }
    running = true;
    last = 0;
    video?.play().catch(() => undefined);
    frame = requestAnimationFrame(tick);
  }

  function stopLoop() {
    running = false;
    cancelAnimationFrame(frame);
    video?.pause();
  }

  function watchVideoFrames(v: HTMLVideoElement) {
    if ("requestVideoFrameCallback" in v) {
      const onFrame = () => {
        newVideoFrame = true;
        if (!destroyed && video === v) v.requestVideoFrameCallback(onFrame);
      };
      v.requestVideoFrameCallback(onFrame);
    } else {
      (v as HTMLVideoElement).addEventListener(
        "timeupdate",
        () => (newVideoFrame = true),
      );
    }
  }

  function startVideo() {
    const v = document.createElement("video");
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "auto";
    v.setAttribute("aria-hidden", "true");
    v.style.cssText =
      "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none";
    v.src = options.video;
    canvas.parentElement?.appendChild(v);
    video = v;
    watchVideoFrames(v);
    if (running) v.play().catch(() => downgrade());
  }

  async function setup() {
    // Compile. With KHR_parallel_shader_compile the driver compiles off-thread
    // and we poll each frame instead of blocking.
    const parallel = gl!.getExtension("KHR_parallel_shader_compile");
    const program = gl!.createProgram()!;
    const vs = gl!.createShader(gl!.VERTEX_SHADER)!;
    const fs = gl!.createShader(gl!.FRAGMENT_SHADER)!;
    gl!.shaderSource(vs, VERT);
    gl!.shaderSource(fs, FRAG);
    gl!.compileShader(vs);
    gl!.compileShader(fs);
    gl!.attachShader(program, vs);
    gl!.attachShader(program, fs);
    gl!.linkProgram(program);
    await nextFrame();
    if (parallel) {
      while (
        !gl!.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)
      ) {
        await nextFrame();
        if (destroyed) return;
      }
    }
    if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
      throw new Error(
        gl!.getShaderInfoLog(vs) ||
          gl!.getShaderInfoLog(fs) ||
          "dome link failed",
      );
    }
    gl!.useProgram(program);

    // Next frame: geometry and uniforms.
    await nextFrame();
    if (destroyed) return;
    gl!.bindVertexArray(gl!.createVertexArray());

    gl!.bindBuffer(gl!.ARRAY_BUFFER, gl!.createBuffer());
    gl!.bufferData(gl!.ARRAY_BUFFER, grid.verts, gl!.STATIC_DRAW);
    const aPos = gl!.getAttribLocation(program, "a_pos");
    gl!.enableVertexAttribArray(aPos);
    gl!.vertexAttribPointer(aPos, 2, gl!.FLOAT, false, 0, 0);

    gl!.bindBuffer(gl!.ARRAY_BUFFER, gl!.createBuffer());
    gl!.bufferData(gl!.ARRAY_BUFFER, tiles, gl!.STATIC_DRAW);
    const aTile = gl!.getAttribLocation(program, "a_tile");
    gl!.enableVertexAttribArray(aTile);
    gl!.vertexAttribPointer(aTile, 4, gl!.FLOAT, false, 0, 0);
    gl!.vertexAttribDivisor(aTile, 1);

    gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, gl!.createBuffer());
    gl!.bufferData(gl!.ELEMENT_ARRAY_BUFFER, grid.index, gl!.STATIC_DRAW);

    uProj = gl!.getUniformLocation(program, "u_proj");
    uRot = gl!.getUniformLocation(program, "u_rot");
    gl!.uniform2f(gl!.getUniformLocation(program, "u_tile"), TILE_W, TILE_H);
    gl!.uniform1f(gl!.getUniformLocation(program, "u_radius"), RADIUS);
    gl!.uniform1f(gl!.getUniformLocation(program, "u_opacity"), OPACITY);
    gl!.uniform1f(gl!.getUniformLocation(program, "u_saturation"), SATURATION);
    gl!.uniform1i(gl!.getUniformLocation(program, "u_tex"), 0);

    texture = gl!.createTexture();
    gl!.bindTexture(gl!.TEXTURE_2D, texture);
    gl!.texParameteri(
      gl!.TEXTURE_2D,
      gl!.TEXTURE_MIN_FILTER,
      gl!.LINEAR_MIPMAP_LINEAR,
    );
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAX_LEVEL, 3);
    const aniso = gl!.getExtension("EXT_texture_filter_anisotropic");
    if (aniso) {
      const maxAniso = gl!.getParameter(
        aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT,
      ) as number;
      gl!.texParameterf(
        gl!.TEXTURE_2D,
        aniso.TEXTURE_MAX_ANISOTROPY_EXT,
        Math.min(8, maxAniso),
      );
    }
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);

    gl!.enable(gl!.BLEND);
    gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
    gl!.clearColor(0, 0, 0, 0);
    resize();
    resizeObserver = new ResizeObserver(() => {
      resize();
      if (!running) draw();
    });
    resizeObserver.observe(canvas);

    // Poster atlas: decoded off-thread, uploaded on its own frame.
    const img = await loadImage(options.atlas.avif).catch(() =>
      loadImage(options.atlas.webp),
    );
    await img.decode().catch(() => undefined);
    await nextFrame();
    if (destroyed) return;
    upload(img);
    ready = true;
    draw();
    canvas.dataset.ready = "";
    if (wantRunning) startLoop();

    // The video waits for the atlas to fade in and the page to settle.
    if (tier === "capable") videoTimer = window.setTimeout(startVideo, 1500);
  }

  setup().catch(() => {
    canvas.dataset.failed = "";
  });

  return {
    start() {
      wantRunning = true;
      startLoop();
    },
    stop() {
      wantRunning = false;
      stopLoop();
    },
    destroy() {
      destroyed = true;
      stopLoop();
      window.clearTimeout(videoTimer);
      resizeObserver?.disconnect();
      video?.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
