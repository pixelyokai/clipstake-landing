// Prints a CSS linear() easing for a damped spring, using motion's
// { type: "spring", duration, bounce } mapping (mass 1, zeta = 1 - bounce).
// Usage: node scripts/spring-easing.mjs <duration> <bounce>
const duration = Number(process.argv[2] ?? 0.5);
const bounce = Number(process.argv[3] ?? 0.2);

const zeta = 1 - bounce;
const stiffness = ((2 * Math.PI) / duration) ** 2;
const damping = 2 * zeta * Math.sqrt(stiffness);

const dt = 1 / 1000;
let x = 0;
let v = 0;
const samples = [];
let settledAt = 0;
for (let t = 0; t < 4; t += dt) {
  const a = stiffness * (1 - x) - damping * v;
  v += a * dt;
  x += v * dt;
  samples.push([t, x]);
  if (Math.abs(1 - x) > 0.001 || Math.abs(v) > 0.01) settledAt = t;
}

const total = settledAt + dt;
const points = 40;
const stops = [];
for (let i = 0; i <= points; i++) {
  const t = (total * i) / points;
  const s = samples[Math.min(samples.length - 1, Math.round(t / dt))][1];
  stops.push(i === 0 ? "0" : i === points ? "1" : Number(s.toFixed(4)).toString());
}

console.log(`/* spring duration ${duration}s bounce ${bounce}: settles in ${Math.round(total * 1000)}ms */`);
console.log(`linear(${stops.join(", ")})`);
