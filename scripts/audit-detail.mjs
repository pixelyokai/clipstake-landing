// Prints the details of one Lighthouse audit. Usage: node scripts/audit-detail.mjs <auditId> [url]
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
const id = process.argv[2];
const url = process.argv[3] ?? "http://localhost:3100";
const chrome = await chromeLauncher.launch({ chromePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", chromeFlags: ["--headless=new"] });
const { lhr } = await lighthouse(url, { port: chrome.port, logLevel: "error", onlyCategories: ["performance"] });
await chrome.kill();
const audit = lhr.audits[id];
console.log(audit.title, audit.score, audit.displayValue ?? "");
console.log(JSON.stringify(audit.details, null, 1).slice(0, 3000));
