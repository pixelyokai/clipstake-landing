// Lighthouse mobile run (4x CPU throttle, Slow 4G) against the production
// server, plus the JS transferred during load. Runs N times and reports the median.
// Usage: node scripts/lighthouse.mjs [url] [runs]
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const url = process.argv[2] ?? "http://localhost:3100";
const runs = Number(process.argv[3] ?? 3);

const results = [];
for (let i = 0; i < runs; i++) {
  const chrome = await chromeLauncher.launch({
    chromePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    chromeFlags: ["--headless=new"],
  });
  const { lhr } = await lighthouse(url, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  });
  await chrome.kill();

  const requests = lhr.audits["network-requests"].details.items;
  const js = requests.filter((r) => r.resourceType === "Script");
  results.push({
    perf: Math.round(lhr.categories.performance.score * 100),
    a11y: Math.round(lhr.categories.accessibility.score * 100),
    bp: Math.round(lhr.categories["best-practices"].score * 100),
    seo: Math.round(lhr.categories.seo.score * 100),
    lcp: lhr.audits["largest-contentful-paint"].numericValue,
    cls: lhr.audits["cumulative-layout-shift"].numericValue,
    tbt: lhr.audits["total-blocking-time"].numericValue,
    fcp: lhr.audits["first-contentful-paint"].numericValue,
    jsKb: js.reduce((sum, r) => sum + r.transferSize, 0) / 1024,
    jsFiles: js.length,
    failing: Object.values(lhr.audits)
      .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative")
      .map((a) => a.id),
  });
}

results.sort((a, b) => a.perf - b.perf);
const median = results[Math.floor(results.length / 2)];
console.log(
  JSON.stringify(
    {
      runs: results.map((r) => r.perf),
      performance: median.perf,
      accessibility: median.a11y,
      bestPractices: median.bp,
      seo: median.seo,
      LCP_ms: Math.round(median.lcp),
      FCP_ms: Math.round(median.fcp),
      TBT_ms: Math.round(median.tbt),
      CLS: Number(median.cls.toFixed(3)),
      jsTransferredKB: Number(median.jsKb.toFixed(1)),
      jsFiles: median.jsFiles,
      auditsBelow90: median.failing,
    },
    null,
    2,
  ),
);
