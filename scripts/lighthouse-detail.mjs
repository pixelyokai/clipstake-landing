// One Lighthouse mobile run; prints the LCP element, its phase breakdown and
// the heaviest requests. Usage: node scripts/lighthouse-detail.mjs [url]
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const url = process.argv[2] ?? "http://localhost:3100";
const chrome = await chromeLauncher.launch({
  chromePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  chromeFlags: ["--headless=new"],
});
const { lhr } = await lighthouse(url, { port: chrome.port, logLevel: "error", onlyCategories: ["performance"] });
await chrome.kill();

const metrics = lhr.audits.metrics.details.items[0];
for (const key of Object.keys(metrics).filter((k) => k.startsWith("observed") && !k.endsWith("Ts"))) {
  console.log(key, Math.round(metrics[key]));
}

const lcp = lhr.audits["lcp-breakdown-insight"] ?? lhr.audits["largest-contentful-paint-element"];
console.log("LCP", Math.round(lhr.audits["largest-contentful-paint"].numericValue), "ms");
console.log(JSON.stringify(lcp?.details, null, 1).slice(0, 2500));

console.log("TBT", Math.round(lhr.audits["total-blocking-time"].numericValue), "ms");
for (const id of ["long-tasks", "bootup-time"]) {
  const items = lhr.audits[id]?.details?.items ?? [];
  console.log(`-- ${id}`);
  console.table(
    items.slice(0, 8).map((i) => ({
      url: String(i.url ?? "").replace(url, "").slice(-60),
      start: Math.round(i.startTime ?? 0),
      duration: Math.round(i.duration ?? i.total ?? 0),
      scripting: Math.round(i.scripting ?? 0),
    })),
  );
}

const requests = lhr.audits["network-requests"].details.items
  .map((r) => ({
    url: r.url.replace(url, ""),
    type: r.resourceType,
    kb: +(r.transferSize / 1024).toFixed(1),
    start: Math.round(r.networkRequestTime),
    end: Math.round(r.networkEndTime),
    priority: r.priority,
  }))
  .sort((a, b) => a.start - b.start);
console.table(requests);
