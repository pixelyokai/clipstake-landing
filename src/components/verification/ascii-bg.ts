// Faint ASCII noise field for the verification illustration background.
// One pass: each pixel finds its
// character cell, samples a slowly flowing noise value at the cell centre and
// draws the matching glyph from a tiny atlas. Kept very quiet: low alpha, a
// soft vignette, and it fades out behind the shield. 24fps cap.
// Runs in a worker on an OffscreenCanvas where supported (see
// ascii-bg.worker.ts), so creating its WebGL context never blocks scrolling;
// the same code runs on the main thread as a fallback. It doesn't touch the
// DOM: the caller reports size changes through resize().

import { startLoop } from "@/lib/frame-cap";

const CHARS = " .:-+*";
const CELL = { w: 8, h: 13 };
const FPS = 24;

const VERT = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() { gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform sampler2D uAtlas;
out vec4 outColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; } return v; }

void main() {
  vec2 cell = floor(gl_FragCoord.xy / vec2(${CELL.w}.0, ${CELL.h}.0));
  vec2 inCell = fract(gl_FragCoord.xy / vec2(${CELL.w}.0, ${CELL.h}.0));
  vec2 uv = (cell + 0.5) * vec2(${CELL.w}.0, ${CELL.h}.0) / uRes;
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0);

  float n = fbm(p * 3.0 + vec2(uTime * 0.05, -uTime * 0.03));
  float v = smoothstep(0.3, 0.75, n);

  // Quiet in the middle (behind the shield and glow) and toward the edges.
  vec2 c = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float centre = smoothstep(0.1, 0.42, length(c * vec2(0.9, 1.6)));
  float edge = smoothstep(0.0, 0.12, uv.y) * smoothstep(1.0, 0.82, uv.y) * smoothstep(0.0, 0.06, uv.x) * smoothstep(1.0, 0.94, uv.x);
  v *= centre * edge;

  float index = floor(v * ${CHARS.length - 1}.0 + 0.5);
  float glyph = texture(uAtlas, vec2((index + inCell.x) / ${CHARS.length}.0, 1.0 - inCell.y)).a;
  float a = glyph * (0.2 + 0.45 * v) * step(0.02, v);
  outColor = vec4(vec3(0.83, 0.33, 0.33) * a, a);
}`;

export interface AsciiBgHandle {
  start(): void;
  stop(): void;
  resize(width: number, height: number): void;
  destroy(): void;
}

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

function buildAtlas() {
  const scale = 3;
  const canvas = new OffscreenCanvas(
    CHARS.length * CELL.w * scale,
    CELL.h * scale,
  );
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${CELL.h * scale * 0.8}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  [...CHARS].forEach((char, i) =>
    ctx.fillText(char, (i + 0.5) * CELL.w * scale, (CELL.h * scale) / 2),
  );
  return canvas;
}

export function createAsciiBg(
  canvas: AnyCanvas,
  {
    animate,
    width,
    height,
  }: { animate: boolean; width: number; height: number },
): AsciiBgHandle | null {
  const gl = canvas.getContext("webgl2", {
    preserveDrawingBuffer: true, // belt and braces against blank frames
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
  }) as WebGL2RenderingContext | null;
  if (!gl) return null;

  const program = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERT],
    [gl.FRAGMENT_SHADER, FRAG],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  gl.bindVertexArray(gl.createVertexArray());

  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    buildAtlas(),
  );
  gl.uniform1i(gl.getUniformLocation(program, "uAtlas"), 0);
  const uRes = gl.getUniformLocation(program, "uRes");
  const uTime = gl.getUniformLocation(program, "uTime");
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  let stopLoop: (() => void) | null = null;
  let time = 10;

  function resize(w: number, h: number) {
    w = Math.max(1, Math.round(w));
    h = Math.max(1, Math.round(h));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl!.viewport(0, 0, w, h);
    gl!.uniform2f(uRes, w, h);
  }
  function draw() {
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.uniform1f(uTime, time);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  resize(width, height);
  draw();

  return {
    start() {
      if (stopLoop || !animate) return;
      stopLoop = startLoop(FPS, (dt) => {
        time += dt;
        draw();
      });
    },
    stop() {
      stopLoop?.();
      stopLoop = null;
    },
    resize(w, h) {
      resize(w, h);
      draw();
    },
    destroy() {
      stopLoop?.();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
