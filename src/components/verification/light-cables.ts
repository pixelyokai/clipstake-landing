// Light cables for the verification illustration. Two bundles of fibre-optic cables, one
// entering from the top edge and a mirrored one from the bottom, each fan in
// through a single bend and land across the shield block's edge. Light
// pulses travel along every cable and flare where they land; a soft light
// hugs the block's outline.
//
// One full-screen triangle, everything computed per pixel (no geometry).
// Thread-agnostic: runs in a worker on an OffscreenCanvas (see
// light-cables.worker.ts) or in-page; the caller reports size changes.

// Shield block in the 1200x462 artwork, as fractions of the scene.
const BLOCK = { l: 0.4049, r: 0.5929, t: 0.229, b: 0.717, radius: 0.029 };
const CABLES = 18; // per bundle

const VERT = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() { gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;      // CSS px
uniform float uDpr;
uniform float uTime;
uniform vec4 uBlock;    // l, t, r, b in CSS px
uniform float uRadius;
out vec4 outColor;

const int N = ${CABLES};
const vec3 SHEATH = vec3(0.808, 0.067, 0.067);   // clipstake red-500
const vec3 CORE = vec3(0.92, 0.18, 0.16);
const vec3 FLARE = vec3(1.0, 0.42, 0.36);

float hash(float n) { return fract(sin(n * 12.9898 + 78.233) * 43758.5453); }

float roundBox(vec2 p, vec2 half_, float r) {
  vec2 q = abs(p) - half_ + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// One bundle. u: 0 at the entry edge, 1 where the cables land on the block.
// Returns premultiplied red light (rgb) and coverage (a).
vec4 bundle(vec2 p, float entryY, float landY, float side) {
  float span = landY - entryY;
  float u = (p.y - entryY) / span;
  if (u < -0.02 || u > 1.02) return vec4(0.0);
  float scale = uRes.x / 1200.0;
  float cx = 0.5 * (uBlock.x + uBlock.z);
  float landL = uBlock.x + uRadius * 0.9;
  float landR = uBlock.z - uRadius * 0.9;
  float fanHalf = uRes.x * 0.34;

  vec3 light = vec3(0.0);
  float cover = 0.0;
  float bend0 = 0.18, bend1 = 0.9;
  float b = smoothstep(bend0, bend1, u);
  float db = 6.0 * (u - bend0) * (bend1 - u) / pow(bend1 - bend0, 3.0) * step(bend0, u) * step(u, bend1);

  for (int i = 0; i < N; i++) {
    float fi = float(i);
    float k = (fi + 0.5) / float(N);
    float seed = fi * 7.13 + side * 101.0;
    float jitter = (hash(seed) - 0.5) / float(N);
    // Fan: spread wide at the entry edge, packed across the block at landing.
    float xs = cx + (k - 0.5 + jitter * 0.8) * 2.0 * fanHalf;
    float xe = mix(landL, landR, k);
    float x = mix(xs, xe, b);
    float slope = (xe - xs) * db / span;           // dx/dy
    float d = abs(p.x - x) / sqrt(1.0 + slope * slope);

    // Tube: tight core in a soft sheath; nearer (centre) cables slightly thicker.
    float w = max(scale * mix(0.75, 1.15, 1.0 - abs(k - 0.5) * 2.0), 0.9 / uDpr);
    float core = exp(-(d * d) / (w * w * 0.9));
    float sheath = exp(-d / (w * 4.5));

    // Pulses: one per cable, staggered, travelling toward the block.
    float speed = 0.22 + 0.16 * hash(seed + 3.1);
    // The head runs past the block (to 1.6) before wrapping, so the tail
    // drains into the block and is fully gone when the next pulse starts;
    // wrapping at 1 made each tail vanish in one frame (a flicker).
    float head = fract(uTime * speed * 0.625 + hash(seed + 9.7)) * 1.6;
    float behind = head - u;
    float pulse = behind >= 0.0 ? exp(-behind / 0.16) : exp(-(behind * behind) / 0.0009);
    pulse *= smoothstep(0.0, 0.12, head);            // fade in at the entry edge
    float lit = 0.05 + 1.1 * pulse;

    light += (SHEATH * sheath * 0.22 + CORE * core * 0.75) * lit;
    cover += (sheath * 0.22 + core * 0.75) * lit;

    // Landing flare where the pulse meets the block.
    // Gentle, longer landing glow (short sharp flares twinkled).
    float land = exp(-pow((1.0 - head) / 0.16, 2.0)) * 0.45;
    float fd = length(p - vec2(xe, landY)) / scale;
    light += FLARE * land * exp(-fd / 9.0);
    cover += land * exp(-fd / 9.0);
  }
  // Soft entry fade so the bundle emerges from the edge.
  float fade = smoothstep(-0.02, 0.18, u);
  return vec4(light, cover) * fade;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 c = vec2(0.5 * (uBlock.x + uBlock.z), 0.5 * (uBlock.y + uBlock.w));
  vec2 half_ = vec2(0.5 * (uBlock.z - uBlock.x), 0.5 * (uBlock.w - uBlock.y));
  float sd = roundBox(p - c, half_, uRadius);
  float scale = uRes.x / 1200.0;

  vec4 col = p.y < c.y ? bundle(p, 0.0, uBlock.y, 0.0) : bundle(p, uRes.y, uBlock.w, 1.0);
  // Soft oval mask around the block: the fans dissolve toward the scene's
  // edges, so the light reads as gathering into the shield.
  vec2 q = (p - c) / uRes.x * vec2(1.0, 2.0);
  col *= 1.0 - smoothstep(0.12, 0.6, length(q));

  // Light hugging the block's outline, plus a faint ambient bloom.
  float outside = max(sd, 0.0) / scale;
  float rim = exp(-outside / 1.6) * 0.45 + exp(-outside / 9.0) * 0.16;
  float bloom = exp(-outside / 70.0) * 0.08;
  col += vec4(CORE * rim + SHEATH * bloom, rim + bloom);
  col *= step(0.0, sd); // nothing over the block itself

  float a = clamp(col.a, 0.0, 1.0);
  vec3 rgb = col.a > 0.0 ? col.rgb / col.a : vec3(0.0);
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  outColor = vec4(clamp(rgb, 0.0, 1.0) * a + grain, a);
}`;

export interface LightCablesHandle {
  start(): void;
  stop(): void;
  resize(width: number, height: number): void;
  destroy(): void;
}

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
const raf = (cb: FrameRequestCallback) => self.requestAnimationFrame(cb);
const caf = (id: number) => self.cancelAnimationFrame(id);

export function createLightCables(
  canvas: AnyCanvas,
  {
    animate,
    width,
    height,
    dpr,
  }: { animate: boolean; width: number; height: number; dpr: number },
): LightCablesHandle | null {
  const gl = canvas.getContext("webgl2", {
    // preserveDrawingBuffer: in a worker the canvas can be presented on rAF
    // ticks we skip (frame cap); without it those show a cleared buffer,
    // which flickers.
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
  const u = (name: string) => gl.getUniformLocation(program, name);
  const uRes = u("uRes");
  const uDpr = u("uDpr");
  const uTime = u("uTime");
  const uBlock = u("uBlock");
  const uRadius = u("uRadius");

  let frame = 0;
  let running = false;
  let last = 0;
  let time = 3; // start mid-flow so pulses are already travelling

  function resize(w: number, h: number) {
    w = Math.max(1, w);
    h = Math.max(1, h);
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    gl!.viewport(0, 0, pw, ph);
    gl!.uniform2f(uRes, w, h);
    gl!.uniform1f(uDpr, dpr);
    gl!.uniform4f(uBlock, BLOCK.l * w, BLOCK.t * h, BLOCK.r * w, BLOCK.b * h);
    gl!.uniform1f(uRadius, BLOCK.radius * w);
  }
  function draw() {
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.uniform1f(uTime, time);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }
  function tick(now: number) {
    if (!running) return;
    // Draws on every tick (no frame cap): a worker canvas can be presented
    // on ticks that didn't draw, which flickered on high-refresh displays.
    frame = raf(tick);
    time += last ? Math.min(now - last, 100) / 1000 : 0;
    last = now;
    draw();
  }

  resize(width, height);
  draw();

  return {
    start() {
      if (running || !animate) return;
      running = true;
      last = 0;
      frame = raf(tick);
    },
    stop() {
      running = false;
      caf(frame);
    },
    resize(w, h) {
      resize(w, h);
      draw();
    },
    destroy() {
      running = false;
      caf(frame);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
