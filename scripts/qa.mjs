// Scrolls the whole page (so every deferred component hydrates and every
// effect starts), then reports console errors/warnings, page errors and failed
// requests. Runs at 1440 and 360, with and without reduced motion.
// Usage: node scripts/qa.mjs [url]
import puppeteer from "puppeteer-core";

const url = process.argv[2] ?? "http://localhost:3100";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});

for (const [width, reduce] of [
  [1440, false],
  [360, false],
  [1440, true],
]) {
  const page = await browser.newPage();
  const problems = [];
  page.on("console", (msg) => {
    if (["error", "warn"].includes(msg.type())) problems.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));
  page.on("requestfailed", (req) => {
    const reason = req.failure()?.errorText ?? "";
    // Media requests get aborted when videos pause or ranges change.
    if (!/ERR_ABORTED/.test(reason)) problems.push(`requestfailed: ${req.url()} ${reason}`);
  });
  await page.setViewport({ width, height: 900 });
  if (reduce) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await new Promise((r) => setTimeout(r, 1500));
  const state = await page.evaluate(() => ({
    hydratedDeferred: document.querySelectorAll("[data-pixel-card] canvas").length,
    videos: document.querySelectorAll("video").length,
    domeReady: !!document.querySelector("section canvas[data-ready]"),
    asciiReady: document.querySelector(".site-footer")?.hasAttribute("data-ascii-ready"),
  }));
  console.log(`\n== ${width}px${reduce ? " reduced-motion" : ""}`, JSON.stringify(state));
  console.log(problems.length ? problems.join("\n") : "no console errors, page errors or failed requests");
  await page.close();
}
await browser.close();
