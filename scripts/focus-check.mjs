// Tabs through the page and reports any focused element without a visible
// focus indicator (outline or box-shadow), plus the tab order summary.
import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(process.argv[2] ?? "http://localhost:3100", { waitUntil: "networkidle0" });
const seen = [];
const missing = [];
for (let i = 0; i < 120; i++) {
  await page.keyboard.press("Tab");
  await new Promise((r) => setTimeout(r, 60));
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    const visible = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== "none";
    const label = (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 40);
    return { label, tag: el.tagName, visible, matches: el.matches(":focus-visible") };
  });
  if (!info) break;
  seen.push(info.label);
  if (!info.visible) missing.push(`${info.tag} "${info.label}"`);
}
console.log(`tab stops checked: ${seen.length}`);
console.log(missing.length ? "no visible focus on:\n" + missing.join("\n") : "every tab stop shows a focus indicator");
console.log("order sample:", seen.slice(0, 40).join(" | "));
await browser.close();
