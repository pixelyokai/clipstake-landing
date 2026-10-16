// Measures rAF frame intervals at the top of the page (dome running) with a 4x
// CPU throttle. Usage: node scripts/frame-time.mjs [url] [scrollY]
import puppeteer from "puppeteer-core";

const url = process.argv[2] ?? "http://localhost:3100";
const scrollY = Number(process.argv[3] ?? 0);
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--enable-gpu-rasterization", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: "networkidle0" });
await page.evaluate((y) => window.scrollTo(0, y), scrollY);
await new Promise((r) => setTimeout(r, 6000)); // dome + video settle
const client = await page.createCDPSession();
await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
const stats = await page.evaluate(
  () =>
    new Promise((resolve) => {
      const times = [];
      let last = performance.now();
      const end = last + 4000;
      const tick = (now) => {
        times.push(now - last);
        last = now;
        if (now < end) requestAnimationFrame(tick);
        else {
          times.sort((a, b) => a - b);
          const avg = times.reduce((a, b) => a + b, 0) / times.length;
          resolve({
            frames: times.length,
            avgMs: +avg.toFixed(1),
            p95Ms: +times[Math.floor(times.length * 0.95)].toFixed(1),
            over50ms: times.filter((t) => t > 50).length,
          });
        }
      };
      requestAnimationFrame(tick);
    }),
);
const dome = await page.evaluate(() => ({
  canvas: document.querySelector("canvas")?.width + "x" + document.querySelector("canvas")?.height,
  videoPlaying: !!document.querySelector("video") && !document.querySelector("video").paused,
}));
console.log(JSON.stringify({ ...stats, ...dome }));
await browser.close();
