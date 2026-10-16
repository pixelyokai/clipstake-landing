// Times WebGL context creation, shader compile/link waits and slow draws per
// canvas while scrolling the page. Usage: node scripts/gl-timing.mjs [url]
import puppeteer from "puppeteer-core";
const url = process.argv[2] ?? "http://localhost:3100";
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.evaluateOnNewDocument(() => {
  window.__gl = [];
  const tag = (c) => (c.className && typeof c.className === "string" ? c.className.split(" ")[0] : "") || c.parentElement?.className?.toString().split(" ")[0] || "?";
  const gc = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, o) { const s = performance.now(); const r = gc.call(this, t, o); const d = performance.now() - s; if (/webgl/.test(t) && r) { r.__tag = tag(this); window.__gl.push(["ctx", tag(this), Math.round(d), Math.round(scrollY)]); } return r; };
  for (const P of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
    for (const name of ["getProgramParameter", "getShaderParameter", "getUniformLocation", "getAttribLocation", "drawArrays", "drawArraysInstanced", "useProgram", "texImage2D", "generateMipmap"]) {
      const fn = P[name]; if (!fn) continue;
      P[name] = function (...a) { const s = performance.now(); const r = fn.apply(this, a); const d = performance.now() - s; if (d > 8) window.__gl.push([name, this.__tag, Math.round(d), Math.round(scrollY)]); return r; };
    }
  }
});
await page.goto(url, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 3000));
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 100) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } });
await new Promise((r) => setTimeout(r, 2000));
console.log((await page.evaluate(() => window.__gl)).map((r) => r.join("  ")).join("\n"));
await browser.close();
