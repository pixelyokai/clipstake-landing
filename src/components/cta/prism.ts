// Prism: a glass pyramid turning slowly in place, lit along its faces and
// edges in Clipstake reds. Raymarched with glow accumulation (no surfaces are
// shaded), so it reads as light inside the panel rather than an object on it.
// Soft, so it renders at half resolution and is upscaled by CSS; capped at
// 30fps. Thread-agnostic: runs in a worker on an OffscreenCanvas
// (prism.worker.ts) or in-page.

import { startLoop } from "@/lib/frame-cap";

const VERT = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() { gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
out vec4 outColor;

// Inigo Quilez's square pyramid (base 1, height h, apex up).
float sdPyramid(vec3 p, float h) {
  float m2 = h * h + 0.25;
  p.xz = abs(p.xz);
  p.xz = (p.z > p.x) ? p.zx : p.xz;
  p.xz -= 0.5;
  vec3 q = vec3(p.z, h * p.y - 0.5 * p.x, h * p.x + 0.5 * p.y);
  float s = max(-q.x, 0.0);
  float t = clamp((q.y - 0.5 * p.z) / (m2 + 0.25), 0.0, 1.0);
  float a = m2 * (q.x + s) * (q.x + s) + q.y * q.y;
  float b = m2 * (q.x + 0.5 * t) * (q.x + 0.5 * t) + (q.y - m2 * t) * (q.y - m2 * t);
  float d2 = min(q.y, -q.x * m2 - q.y * 0.5) > 0.0 ? 0.0 : min(a, b);
  return sqrt((d2 + q.z * q.z) / m2) * sign(max(q.z, -p.y));
}

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;
  vec3 ro = vec3(0.0, 0.25, -3.0);
  vec3 rd = normalize(vec3(uv, 1.7));

  float dist = 0.0;
  vec3 glow = vec3(0.0);
  for (int i = 0; i < 56; i++) {
    vec3 p = ro + rd * dist;
    p.xz *= rot(t * 0.22);
    p.yz *= rot(0.32 + 0.08 * sin(t * 0.17));
    p.y += 0.45;
    // Hollow: the faces glow, the interior stays clear.
    float d = abs(sdPyramid(p * 0.62, 1.15)) + 0.02;
    // Height and a slow sweep shift the light from deep red to a hot pink.
    float band = 0.5 + 0.5 * sin(p.y * 3.0 - t * 0.6 + p.x * 1.5);
    vec3 tint = mix(vec3(0.808, 0.067, 0.067), vec3(0.98, 0.62, 0.62), band);
    glow += tint * (0.0042 / d);
    dist += max(d * 0.55, 0.025);
    if (dist > 6.0) break;
  }

  glow = 1.0 - exp(-glow * 1.1);
  float a = clamp(max(glow.r, max(glow.g, glow.b)), 0.0, 1.0);
  outColor = vec4(glow, a);
}`;

export interface PrismHandle {
  start(): void;
  stop(): void;
  resize(width: number, height: number): void;
  destroy(): void;
}

const SCALE = 0.5;
const FPS = 30;

export function createPrism(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  { animate, width: cssWidth, height: cssHeight }: { animate: boolean; width: number; height: number },
): PrismHandle | null {
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
  let time = 4;
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
