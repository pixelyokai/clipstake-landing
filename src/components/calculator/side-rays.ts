// Side rays: light shafts fanning
// from a source past the top-right corner, aimed at a target point (the
// calculator card). Soft by nature, so it renders at half resolution and is
// upscaled by CSS; capped at 30fps. Thread-agnostic: runs in a worker on an
// OffscreenCanvas (side-rays.worker.ts) or in-page; the host reports sizes.

import { startLoop } from "@/lib/frame-cap";

const VERT = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() { gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uSource; // px, y up
uniform vec2 uTarget; // px, y up
out vec4 outColor;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 w = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  vec2 v = p - uSource;
  float r = length(v) / max(uRes.x, uRes.y);
  vec2 aim = normalize(uTarget - uSource);
  float angle = atan(v.y, v.x) - atan(aim.y, aim.x);
  angle = mod(angle + 3.14159265, 6.28318531) - 3.14159265;

  float t = uTime;
  float sway = 0.35 * sin(t * 0.23) + 0.2 * sin(t * 0.13 + 1.7);
  float u = angle * 9.0;
  float shafts = 0.65 * noise(vec2(u + sway, t * 0.18)) + 0.35 * noise(vec2(u * 2.3 - sway * 1.4, t * 0.27 + 4.0));
  shafts = smoothstep(0.35, 0.85, shafts);

  float fan = exp(-pow(angle / 0.42, 2.0));
  float reach = 1.0 / (1.0 + pow(r / 0.55, 2.4));
  float light = shafts * fan * reach + 0.18 * fan * reach; // soft base glow under the shafts

  vec3 color = mix(vec3(1.0, 0.74, 0.74), vec3(1.0, 0.95, 0.92), shafts);
  float a = clamp(light * 0.55, 0.0, 0.8);
  outColor = vec4(color * a, a);
}`;

export interface RaysHandle {
  start(): void;
  stop(): void;
  resize(width: number, height: number): void;
  aim(target: { x: number; y: number }): void;
  destroy(): void;
}

const SCALE = 0.5;
const FPS = 30;

export function createRays(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  {
    animate,
    width: cssWidth,
    height: cssHeight,
  }: { animate: boolean; width: number; height: number },
): RaysHandle | null {
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

  const uRes = gl.getUniformLocation(program, "uRes");
  const uTime = gl.getUniformLocation(program, "uTime");
  const uSource = gl.getUniformLocation(program, "uSource");
  const uTarget = gl.getUniformLocation(program, "uTarget");

  let stopLoop: (() => void) | null = null;
  let time = 12;
  let target = { x: 0.6, y: 0.5 }; // fraction of the canvas, y down

  let size = { width: cssWidth, height: cssHeight };
  function resize() {
    const width = Math.max(1, Math.round(size.width * SCALE));
    const height = Math.max(1, Math.round(size.height * SCALE));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl!.viewport(0, 0, width, height);
    gl!.uniform2f(uRes, width, height);
    // Source sits just past the top-right corner.
    gl!.uniform2f(uSource, width * 1.04, height * 1.12);
    gl!.uniform2f(uTarget, width * target.x, height * (1 - target.y));
  }

  function draw() {
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.uniform1f(uTime, time);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  resize();
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
    resize(width, height) {
      size = { width, height };
      resize();
      draw();
    },
    aim(next) {
      target = next;
      resize();
      draw();
    },
    destroy() {
      stopLoop?.();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
