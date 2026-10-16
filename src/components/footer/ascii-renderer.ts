// Footer ASCII: a field of glyphs with the "Clipstake" wordmark extruded in
// 3D out of the same glyphs.
//
// Two passes so the cost doesn't scale with pixels:
//   1. cells: one fragment per character cell. Decides what's there (front
//      face with bevel lighting, extruded side by depth, or background field),
//      its colour, glyph and opacity. Packs glyph + opacity into alpha.
//   2. glyphs: per pixel, looks up its cell and draws the glyph from an atlas.
// The pointer tilts the extrusion and moves the light; clicks send a ripple.

const CHARS = " .:-=+*#%@";
const LAYERS = 18;
const FPS = 30;

const VERT = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() { gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0); }`;

const CELLS = `#version 300 es
precision highp float;
uniform vec2 uRes;      // canvas px
uniform vec2 uCell;     // cell size px
uniform float uTime;
uniform sampler2D uMask;  // sharp wordmark mask (alpha)
uniform sampler2D uSoft;  // blurred mask, for the bevel normal
uniform vec2 uDir;      // extrusion step per layer, px (y up)
uniform vec2 uLight;    // light direction xy
uniform vec3 uMouse;    // px (y up), strength
uniform vec4 uRipple;   // px xy, radius, strength
uniform float uFieldTop; // px (y up) where the field fades out
out vec4 outColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
float mask(vec2 px) { return texture(uMask, px / uRes).a; }

vec4 pack(vec3 color, float glyph, float alpha) {
  float g = clamp(floor(glyph * ${CHARS.length - 1}.0 + 0.5), 0.0, 15.0);
  float a = clamp(floor(alpha * 15.0 + 0.5), 0.0, 15.0);
  return vec4(color, (g * 16.0 + a) / 255.0);
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec2 p = (cell + 0.5) * uCell;

  float mouse = uMouse.z * exp(-pow(length(p - uMouse.xy) / 150.0, 2.0));
  float ring = uRipple.w * exp(-pow((length(p - uRipple.xy) - uRipple.z) / 36.0, 2.0));
  float jitter = (hash(cell + floor(uTime * 12.0)) - 0.5) * (mouse * 0.6 + ring);

  // Front face, lit through a bevel normal from the blurred mask.
  if (mask(p) > 0.5) {
    vec2 e = vec2(uCell.y * 0.6, 0.0);
    float gx = texture(uSoft, (p + e.xy) / uRes).a - texture(uSoft, (p - e.xy) / uRes).a;
    float gy = texture(uSoft, (p + e.yx) / uRes).a - texture(uSoft, (p - e.yx) / uRes).a;
    vec3 n = normalize(vec3(-gx * 6.0, -gy * 6.0, 1.0));
    float lit = 0.5 + 0.5 * max(dot(n, normalize(vec3(uLight, 1.1))), 0.0);
    float b = clamp(lit + ring * 0.4 + jitter, 0.0, 1.0);
    vec3 color = mix(vec3(1.0, 0.7, 0.68), vec3(1.0, 0.97, 0.96), b);
    outColor = pack(color, mix(0.86, 1.0, b), 1.0);
    return;
  }

  // Extruded sides: nearest layer whose shifted mask covers this cell.
  for (int k = 1; k <= ${LAYERS}; k++) {
    if (mask(p - uDir * float(k)) > 0.5) {
      float depth = float(k) / ${LAYERS}.0;
      float b = clamp(mix(0.95, 0.3, depth) + ring * 0.3 + jitter, 0.0, 1.0);
      vec3 color = mix(vec3(0.35, 0.02, 0.02), vec3(0.93, 0.36, 0.34), b);
      outColor = pack(color, mix(0.3, 0.62, b), 1.0);
      return;
    }
  }

  // Background field: drifting noise rising from the bottom edge, plus the
  // cursor glow and ripple. Fades out before the footer links.
  vec2 uv = p / uRes;
  float n = fbm(vec2(uv.x * 3.2 + uTime * 0.04, uv.y * 2.4 - uTime * 0.11));
  float horizon = 1.0 - smoothstep(0.0, uFieldTop, p.y);
  // Keep a quiet halo around the letters so the wordmark reads as an object.
  float halo = texture(uSoft, uv).a;
  float v = clamp(horizon * 0.6 + (n - 0.5) * 0.7 + mouse * 0.6 + ring * 0.7 + jitter, 0.0, 1.0);
  v *= 1.0 - halo * 0.85;
  float fade = 1.0 - smoothstep(uFieldTop * 0.75, uFieldTop, p.y);
  vec3 color = mix(vec3(0.55, 0.06, 0.06), vec3(1.0, 0.66, 0.66), v);
  outColor = pack(color, v * 0.8, v * fade * 0.6);
}`;

const GLYPHS = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec2 uCell;
uniform sampler2D uCells;
uniform sampler2D uAtlas;
out vec4 outColor;
void main() {
  vec2 cell = floor(gl_FragCoord.xy / uCell);
  vec2 inCell = fract(gl_FragCoord.xy / uCell);
  vec4 data = texelFetch(uCells, ivec2(cell), 0);
  float packed = floor(data.a * 255.0 + 0.5);
  float glyph = floor(packed / 16.0);
  float alpha = mod(packed, 16.0) / 15.0;
  float g = texture(uAtlas, vec2((glyph + inCell.x) / ${CHARS.length}.0, 1.0 - inCell.y)).a * alpha;
  outColor = vec4(data.rgb * g, g);
}`;

export interface Wordmark {
  /** Wordmark box relative to the canvas, CSS px (y down). */
  left: number;
  top: number;
  width: number;
  height: number;
  font: string;
  fontSize: number;
  letterSpacing: number;
  text: string;
}

export interface AsciiHandle {
  start(): void;
  stop(): void;
  layout(wordmark: Wordmark): void;
  pointer(x: number, y: number, inside: boolean): void;
  ripple(x: number, y: number): void;
  destroy(): void;
}

function program(gl: WebGL2RenderingContext, frag: string) {
  const p = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERT],
    [gl.FRAGMENT_SHADER, frag],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(p, shader);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link failed");
  const uniforms = new Proxy({} as Record<string, WebGLUniformLocation | null>, {
    get: (cache, name: string) => (name in cache ? cache[name] : (cache[name] = gl.getUniformLocation(p, name))),
  });
  return { p, u: uniforms };
}

function texture(gl: WebGL2RenderingContext, filter: number) {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

function buildAtlas(cellW: number, cellH: number) {
  const scale = 3;
  const canvas = document.createElement("canvas");
  canvas.width = CHARS.length * cellW * scale;
  canvas.height = cellH * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${cellH * scale * 0.86}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  [...CHARS].forEach((char, i) => ctx.fillText(char, (i + 0.5) * cellW * scale, (cellH * scale) / 2));
  return canvas;
}

export function createAscii(canvas: HTMLCanvasElement, { animate }: { animate: boolean }): AsciiHandle | null {
  const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
  if (!gl) return null;

  const cells = program(gl, CELLS);
  const glyphs = program(gl, GLYPHS);
  gl.bindVertexArray(gl.createVertexArray());

  const maskTex = texture(gl, gl.LINEAR);
  const softTex = texture(gl, gl.LINEAR);
  const atlasTex = texture(gl, gl.LINEAR);
  const cellTex = texture(gl, gl.NEAREST);
  const fbo = gl.createFramebuffer();

  let width = 1;
  let height = 1;
  let cellW = 7;
  let cellH = 11;
  let cols = 1;
  let rows = 1;
  let fieldTop = 300;
  let wordmarkCenter = { x: 0.5, y: 0.5 };

  let frame = 0;
  let running = false;
  let last = 0;
  let time = 6;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, s: 0, ts: 0 };
  const tilt = { x: 0, y: 0 }; // -1..1, smoothed
  let ripple = { x: 0, y: 0, age: 99 };

  function uploadCanvas(tex: WebGLTexture, source: HTMLCanvasElement) {
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, source);
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false);
  }

  function layout(w: Wordmark) {
    width = Math.max(1, Math.round(canvas.clientWidth));
    height = Math.max(1, Math.round(canvas.clientHeight));
    canvas.width = width;
    canvas.height = height;

    // Cells scale with the wordmark so small screens still read as letters.
    cellH = Math.max(6, Math.min(12, Math.round(w.fontSize / 22)));
    cellW = Math.max(4, Math.round(cellH * 0.62));
    cols = Math.ceil(width / cellW);
    rows = Math.ceil(height / cellH);

    // Wordmark masks, drawn where the DOM wordmark sits.
    const draw = (blur: number) => {
      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      const ctx = c.getContext("2d")!;
      if (blur) ctx.filter = `blur(${blur}px)`;
      ctx.fillStyle = "#fff";
      ctx.font = w.font;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${w.letterSpacing}px`;
      // line-height 1: baseline sits at top + (ascent - half the overflow), ~0.863em for Inter.
      ctx.fillText(w.text, w.left + w.width / 2, w.top + w.fontSize * 0.863);
      return c;
    };
    uploadCanvas(maskTex, draw(0));
    uploadCanvas(softTex, draw(Math.max(3, w.fontSize * 0.06)));
    uploadCanvas(atlasTex, buildAtlas(cellW, cellH));

    gl!.bindTexture(gl!.TEXTURE_2D, cellTex);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA8, cols, rows, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, cellTex, 0);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);

    fieldTop = height - w.top + w.fontSize * 0.25; // a little above the wordmark, y up
    wordmarkCenter = { x: w.left + w.width / 2, y: height - (w.top + w.height / 2) };
    mouse.x = mouse.tx = wordmarkCenter.x;
    mouse.y = mouse.ty = wordmarkCenter.y;
    draw2();
  }

  function draw2() {
    // Idle rocking plus pointer tilt (smoothed).
    const idleX = Math.sin(time * 0.45) * 0.45;
    const idleY = Math.sin(time * 0.31 + 1.3) * 0.15;
    const px = Math.max(-1, Math.min(1, (mouse.x - wordmarkCenter.x) / (width / 2)));
    const py = Math.max(-1, Math.min(1, (mouse.y - wordmarkCenter.y) / (height / 2)));
    const targetX = idleX * (1 - mouse.s) + px * mouse.s;
    const targetY = idleY * (1 - mouse.s) + py * mouse.s;
    tilt.x += (targetX - tilt.x) * 0.08;
    tilt.y += (targetY - tilt.y) * 0.08;

    const step = cellH * 0.5;
    const dir = { x: -tilt.x * 0.9, y: -0.85 - tilt.y * 0.5 };
    const len = Math.hypot(dir.x, dir.y) || 1;

    // Pass 1: cells.
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
    gl!.viewport(0, 0, cols, rows);
    gl!.disable(gl!.BLEND);
    gl!.useProgram(cells.p);
    gl!.uniform2f(cells.u.uRes, width, height);
    gl!.uniform2f(cells.u.uCell, cellW, cellH);
    gl!.uniform1f(cells.u.uTime, time);
    gl!.uniform2f(cells.u.uDir, (dir.x / len) * step, (dir.y / len) * step);
    gl!.uniform2f(cells.u.uLight, tilt.x * 0.9, 0.55 + tilt.y * 0.5);
    gl!.uniform3f(cells.u.uMouse, mouse.x, mouse.y, mouse.s);
    const rippleStrength = Math.max(0, 1 - ripple.age / 1.4);
    gl!.uniform4f(cells.u.uRipple, ripple.x, ripple.y, ripple.age * 520, rippleStrength);
    gl!.uniform1f(cells.u.uFieldTop, fieldTop);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, maskTex);
    gl!.uniform1i(cells.u.uMask, 0);
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, softTex);
    gl!.uniform1i(cells.u.uSoft, 1);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);

    // Pass 2: glyphs.
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    gl!.viewport(0, 0, width, height);
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.enable(gl!.BLEND);
    gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
    gl!.useProgram(glyphs.p);
    gl!.uniform2f(glyphs.u.uRes, width, height);
    gl!.uniform2f(glyphs.u.uCell, cellW, cellH);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, cellTex);
    gl!.uniform1i(glyphs.u.uCells, 0);
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, atlasTex);
    gl!.uniform1i(glyphs.u.uAtlas, 1);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function tick(now: number) {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    if (now - last < 1000 / FPS) return;
    const dt = last ? Math.min(now - last, 100) / 1000 : 0;
    last = now;
    time += dt;
    ripple.age += dt;
    mouse.x += (mouse.tx - mouse.x) * 0.2;
    mouse.y += (mouse.ty - mouse.y) * 0.2;
    mouse.s += (mouse.ts - mouse.s) * 0.12;
    draw2();
  }

  return {
    start() {
      if (running || !animate) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
    layout,
    pointer(x, y, inside) {
      mouse.tx = x;
      mouse.ty = height - y;
      mouse.ts = inside ? 1 : 0;
    },
    ripple(x, y) {
      ripple = { x, y: height - y, age: 0 };
    },
    destroy() {
      running = false;
      cancelAnimationFrame(frame);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
