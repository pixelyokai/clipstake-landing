// Screenshots the running site at the test widths.
// Usage: node scripts/shoot.mjs <outDir> [url] [--scroll=<px>] [--widths=360,768,1280,1440] [--full]
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const outDir = args[0];
const url = args.find((a) => a.startsWith("http")) ?? "http://localhost:3100";
const flag = (name) => args.find((a) => a.startsWith(`--${name}`))?.split("=")[1];
const widths = (flag("widths") ?? "360,768,1280,1440").split(",").map(Number);
const scroll = Number(flag("scroll") ?? 0);
const full = args.includes("--full");
const reduce = args.includes("--reduce");

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});

for (const width of widths) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  if (reduce) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(url, { waitUntil: "networkidle0" });
  if (full) {
    // Walk the page so lazy images load, then return to the top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 1200));
  } else if (scroll) {
    await page.evaluate((y) => window.scrollTo(0, y), scroll);
    await new Promise((r) => setTimeout(r, 1200));
  } else {
    await new Promise((r) => setTimeout(r, Number(flag("wait") ?? 800)));
  }
  const to = flag("to");
  if (to) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80);
    }, decodeURIComponent(to));
    await new Promise((r) => setTimeout(r, 1500));
  }
  const click = flag("click");
  if (click) {
    await page.click(decodeURIComponent(click));
    await new Promise((r) => setTimeout(r, 900));
  }
  const tag = flag("tag") ?? "";
  const path = `${outDir}/w${width}${scroll ? `-s${scroll}` : ""}${tag}.png`;
  await page.screenshot({ path, fullPage: full });
  console.log(path);
  await page.close();
}

await browser.close();
