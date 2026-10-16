// Wheel-scrolls the whole page (Lenis active) and reports frame pacing and
// long tasks per scroll segment. Usage: node scripts/scroll-jank.mjs [url]
import puppeteer from "puppeteer-core";
const url = process.argv[2] ?? "http://localhost:3100";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: Number(process.env.DPR || 1) });
await page.goto(url, { waitUntil: "networkidle0" });
if (process.argv[3]) await page.addStyleTag({ content: process.argv[3] });
await new Promise((r) => setTimeout(r, 3000));
if (process.env.CPU_THROTTLE) await (await page.createCDPSession()).send("Emulation.setCPUThrottlingRate", { rate: Number(process.env.CPU_THROTTLE) });
await page.evaluate(() => {
  window.__frames = []; window.__long = [];
  let last = performance.now();
  const tick = (now) => { window.__frames.push([now, now - last, scrollY]); last = now; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push([e.startTime, e.duration, scrollY, (e.scripts || []).sort((a, b) => b.duration - a.duration).slice(0, 3).map((s) => `${Math.round(s.duration)}ms ${s.invoker} @${(s.sourceURL || "").split("/").pop()}:${s.sourceFunctionName}`), Math.round(e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0)]))).observe({ type: "long-animation-frame", buffered: false });
});
await page.mouse.move(400, 450);
const height = await page.evaluate(() => document.body.scrollHeight);
for (let i = 0; i < 400 && (await page.evaluate(() => scrollY + innerHeight)) < height - 10; i++) {
  await page.mouse.wheel({ deltaY: 100 });
  await new Promise((r) => setTimeout(r, 16));
}
await new Promise((r) => setTimeout(r, 1500));
const { frames, long } = await page.evaluate(() => ({ frames: window.__frames, long: window.__long }));
const segs = {};
for (const [, dt, y] of frames) {
  const k = Math.floor(y / 1000) * 1000;
  (segs[k] ??= []).push(dt);
}
const rows = Object.entries(segs).map(([y, d]) => {
  d.sort((a, b) => a - b);
  return { y: +y, frames: d.length, p50: +d[Math.floor(d.length / 2)].toFixed(1), p95: +d[Math.floor(d.length * 0.95)].toFixed(1), max: +d[d.length - 1].toFixed(1), over20: d.filter((x) => x > 20).length };
});
console.table(rows);
console.log("long animation frames (>50ms):", long.length);
for (const [, d, y, scripts, sl] of long) {
  console.log(`${Math.round(d)}ms @y${Math.round(y)} styleLayout=${sl}ms`);
  for (const s of scripts) console.log(`   ${s}`);
}
await browser.close();
