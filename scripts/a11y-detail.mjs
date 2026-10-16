// Prints failing accessibility audits with their nodes. Usage: node scripts/a11y-detail.mjs [url]
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
const url = process.argv[2] ?? "http://localhost:3100";
const chrome = await chromeLauncher.launch({ chromePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", chromeFlags: ["--headless=new"] });
const { lhr } = await lighthouse(url, { port: chrome.port, logLevel: "error", onlyCategories: ["accessibility"] });
await chrome.kill();
for (const audit of Object.values(lhr.audits)) {
  if (audit.score !== 0) continue;
  console.log(`== ${audit.id}`);
  for (const item of audit.details?.items ?? []) {
    console.log(" -", item.node?.selector, "|", item.node?.snippet?.slice(0, 120), "|", item.node?.explanation?.split("\n")[1] ?? "");
  }
}
