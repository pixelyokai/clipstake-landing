// Ghost fibers: three ribbons of fine fibers in Clipstake reds that drift,
// twist and fold. Where a ribbon folds its fibers bunch together and glow;
// the back ribbons are softer and fainter, like a shallow depth of field.
// Soft by nature, so it renders at half resolution and is upscaled by CSS;
// capped at 30fps. Thread-agnostic like the calculator rays: runs in a worker
// on an OffscreenCanvas (ghost-fibers.worker.ts) or in-page.

import { startLoop } from "@/lib/frame-cap";

const VERT = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() { gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
out vec4 outColor;

const int RIBBONS = 3;
const int FIBERS = 26;

void main() {
  vec2 p = gl_FragCoord.xy / uRes.y; // y 0..1, x 0..aspect
  float aspect = uRes.x / uRes.y;
  float t = uTime;
  float acc = 0.0;
  float warm = 0.0;

  for (int k = 0; k < RIBBONS; k++) {
    float fk = float(k);
    float depth = fk / float(RIBBONS - 1); // 0 front, 1 back
    float x = p.x;
    // Centre line: a slow diagonal drift with two waves on top.
    float centre = 0.5 + 0.2 * (fk - 1.0) - 0.08 * (x - aspect * 0.5)
      + 0.10 * sin(x * 1.25 + t * 0.11 + fk * 2.1)
      + 0.05 * sin(x * 2.6 - t * 0.08 + fk * 4.3);
    // Signed width: crossing zero is where the ribbon folds over.
    float twist = cos(x * 1.5 + t * 0.09 + fk * 1.3);
    float width = 0.13 * twist + 0.012 * sign(twist);
    float thickness = mix(0.9, 3.2, depth) / uRes.y;
    float strength = mix(0.55, 0.22, depth);

    for (int i = 0; i < FIBERS; i++) {
      float v = float(i) / float(FIBERS - 1) - 0.5;
      float wobble = 0.006 * sin(x * 7.0 + float(i) * 1.7 + t * 0.35 + fk);
      float d = p.y - (centre + v * width + wobble);
      float line = exp(-(d * d) / (thickness * thickness));
      acc += line * strength;
      warm += line * strength * (0.5 + v);
    }
  }

  float a = (1.0 - exp(-acc * 0.7)) * 0.5;
  float mixAmount = clamp(warm / max(acc, 1e-4), 0.0, 1.0);
  // clipstake-red-300 → red-500 across each ribbon.
  vec3 color = mix(vec3(0.886, 0.439, 0.439), vec3(0.808, 0.067, 0.067), mixAmount);
  outColor = vec4(color * a, a);
}`;

export interface FibersHandle {
  start(): void;
  stop(): void;
  resize(width: number, height: number): void;
  destroy(): void;
}

const SCALE = 0.5;
const FPS = 30;

export function createFibers(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  { animate, width: cssWidth, height: cssHeight }: { animate: boolean; width: number; height: number },
): FibersHandle | null {
  const gl = canvas.getContext("webgl2", {
    preserveDrawingBuffer: true,
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

  let stopLoop: (() => void) | null = null;
  let time = 20;
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
    destroy() {
      stopLoop?.();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
