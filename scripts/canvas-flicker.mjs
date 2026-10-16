// Records every presented frame (CDP screencast) over a canvas region and
// prints its redness per frame; one- or two-frame dips mean the canvas
// blinked out. Usage: node scripts/canvas-flicker.mjs <selector> [hideCss]
import puppeteer from "puppeteer-core";
import { PNG } from "pngjs";
const sel = process.argv[2] ?? ".vx";
const hide = process.argv[3] ?? ".vx-ascii,.vx-carousel{visibility:hidden!important}";
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist", ...(process.env.UNCAPPED ? ["--disable-gpu-vsync", "--disable-frame-rate-limit"] : [])] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
if (process.env.REDUCE) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await page.goto("http://localhost:3100", { waitUntil: "networkidle0" });
await page.evaluate(async (sel) => { for (let y = 0; y < 4000; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } const r = document.querySelector(sel).getBoundingClientRect(); scrollTo(0, scrollY + r.top + r.height / 2 - 450); }, sel);
if (hide) await page.addStyleTag({ content: hide });
await new Promise((r) => setTimeout(r, 2500));
const box = await page.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: Math.max(0, Math.round(r.x + r.width * 0.3)), y: Math.max(0, Math.round(r.y)), w: Math.round(Math.min(r.width * 0.4, 1400)), h: Math.round(Math.min(r.height * 0.25, 400)) }; }, sel);
const c = await page.createCDPSession();
const reds = [];
c.on("Page.screencastFrame", (f) => {
  c.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  const png = PNG.sync.read(Buffer.from(f.data, "base64"));
  let red = 0;
  for (let y = box.y; y < Math.min(png.height, box.y + box.h); y += 2) for (let x = box.x; x < Math.min(png.width, box.x + box.w); x += 2) { const i = (y * png.width + x) * 4; red += png.data[i] - (png.data[i + 1] + png.data[i + 2]) / 2; }
  reds.push(Math.round(red / 1000));
});
await c.send("Page.startScreencast", { format: "png", everyNthFrame: 1 });
if (process.env.MOVE_MOUSE) { for (let i = 0; i < 60; i++) { await page.mouse.move(300 + (i % 20) * 45, 250 + (i % 7) * 40); await new Promise((r) => setTimeout(r, 80)); } } else await new Promise((r) => setTimeout(r, 5000));
await c.send("Page.stopScreencast");
let dips = 0;
for (let i = 1; i < reds.length - 1; i++) if (reds[i] < reds[i - 1] * 0.93 && reds[i + 1] > reds[i] * 1.05) dips++;
console.log(`${reds.length} frames, ${dips} dips:`, reds.join(" "));
await browser.close();
