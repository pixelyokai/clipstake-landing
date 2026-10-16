# Clipstake landing page

Next.js 16 (App Router) + Tailwind v4.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Where things live

- `src/components/sections/` – one Server Component per page section
- `src/components/deferred.tsx` – below-the-fold interactive pieces, code-split and hydrated on approach (`lazyHydrate`)
- `src/content/` – copy, stats, FAQ, API samples, and calculator ranges (`calculator.ts`). Placeholder copy is marked there.
- `src/lib/scroll.ts` – the single scroll source (Lenis when active, otherwise one passive listener)
- `src/app/globals.css` – Paper tokens (`@theme`), motion tokens (springs as CSS `linear()`), and the CSS-driven effects

## Scripts

| Script | What it does |
| --- | --- |
| `bash scripts/transcode.sh` | Re-encodes `Assets/` videos into `public/media/` (cards, dome mosaic, posters) |
| `node scripts/port-illustrations.mjs` | Regenerates the "How it works" illustrations from `Assets/Illustrations/` |
| `node scripts/spring-easing.mjs <duration> <bounce>` | Prints a CSS `linear()` easing for a spring |
| `bash scripts/measure.sh [runs]` | Builds, serves on :3100 and runs Lighthouse mobile (4x CPU, Slow 4G) |
| `node scripts/qa.mjs` | Scrolls the page at 1440/360 (and reduced motion) and reports console errors |
| `node scripts/focus-check.mjs` | Tabs through the page and flags stops without a visible focus ring |
| `node scripts/shoot.mjs <dir> [--widths=] [--to=] [--click=] [--full]` | Screenshots at the test widths |
| `node scripts/frame-time.mjs [url] [scrollY]` | rAF frame times with a 4x CPU throttle |
| `node scripts/profile-sections.mjs` | Main-thread and GPU cost per section while idling on it |
| `node scripts/scroll-jank.mjs` | Frame pacing and long frames while wheel-scrolling the page |
| `node scripts/gl-timing.mjs` | WebGL context/shader setup times per canvas |
| `node scripts/canvas-flicker.mjs <selector>` | Records every presented frame to catch canvas flicker |

The Lighthouse and screenshot scripts drive the locally installed Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe`).
