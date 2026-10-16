// Per-section main-thread + GPU cost while idling on each section (no input).
// Usage: node scripts/profile-sections.mjs [url]
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const url = process.argv[2] ?? "http://localhost:3100";
const SECTIONS = [
  ["hero", "main"],
  ["campaigns", "#campaign-types-title, [aria-labelledby*='campaign']"],
  ["steps", "#how-title"],
  ["calculator", "#reach-calculator"],
  ["verification", ".vx"],
  ["api", ".code-panel"],
  ["cases", "[aria-labelledby*='case']"],
  ["footer", "footer"],
];
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: Number(process.env.DPR || 1) });
await page.goto(url, { waitUntil: "networkidle0" });
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)); }
});
const gpu = await page.evaluate(() => {
  const gl = document.createElement("canvas").getContext("webgl2");
  const ext = gl?.getExtension("WEBGL_debug_renderer_info");
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "none";
});
console.log("renderer:", gpu);
if (process.env.CPU_THROTTLE) await (await page.createCDPSession()).send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.CPU_THROTTLE) });
const rows = [];
for (const [name, sel] of SECTIONS) {
  const ok = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    window.scrollTo(0, scrollY + r.top + Math.min(r.height, 900) / 2 - 450);
    return true;
  }, sel);
  if (!ok) { rows.push({ name, missing: true }); continue; }
  await new Promise((r) => setTimeout(r, 2500));
  const file = `${process.env.TMP || "."}/trace-${name}.json`;
  await page.tracing.start({ path: file, categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "gpu", "viz"] });
  const frames = await page.evaluate(() => new Promise((res) => {
    const t = []; let last = performance.now(); const end = last + 3000;
    const tick = (now) => { t.push(now - last); last = now; if (now < end) requestAnimationFrame(tick); else res(t); };
    requestAnimationFrame(tick);
  }));
  await page.tracing.stop();
  const ev = JSON.parse(fs.readFileSync(file, "utf8")).traceEvents ?? [];
  const main = ev.find((e) => e.name === "thread_name" && e.args?.name === "CrRendererMain");
  const sum = (pred) => ev.filter((e) => e.ph === "X" && pred(e)).reduce((a, e) => a + (e.dur || 0), 0) / 1000;
  const onMain = (e) => main && e.tid === main.tid && e.pid === main.pid;
  frames.sort((a, b) => a - b);
  rows.push({
    name,
    fps: +(frames.length / 3).toFixed(0),
    p95: +frames[Math.floor(frames.length * 0.95)].toFixed(1),
    script: +sum((e) => onMain(e) && ["FunctionCall", "FireAnimationFrame", "EvaluateScript", "TimerFire", "EventDispatch"].includes(e.name)).toFixed(0),
    style: +sum((e) => onMain(e) && (e.name === "UpdateLayoutTree" || e.name === "RecalculateStyles")).toFixed(0),
    layout: +sum((e) => onMain(e) && e.name === "Layout").toFixed(0),
    paint: +sum((e) => onMain(e) && (e.name === "Paint" || e.name === "PrePaint")).toFixed(0),
    commit: +sum((e) => onMain(e) && (e.name === "Commit" || e.name === "Layerize" || e.name === "UpdateLayer")).toFixed(0),
    raster: +sum((e) => e.name === "RasterTask").toFixed(0),
    gpu: +sum((e) => e.name === "GPUTask").toFixed(0),
  });
}
console.table(rows);
await browser.close();
