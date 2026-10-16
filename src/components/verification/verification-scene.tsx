"use client";

import { useEffect, useRef } from "react";
import { observeActiveBand } from "@/lib/active-band";
import { MIN_FRAME_MS } from "@/lib/frame-cap";
import type { AsciiBgHandle } from "./ascii-bg";
import { hostAsciiBg } from "./ascii-bg-host";
import type { LightCablesHandle } from "./light-cables";
import { hostLightCables } from "./light-cables-host";

// Paper's verification art, brought to life:
//   - a faint ASCII noise field behind everything (WebGL, 24fps)
//   - Paper's glow + tilted glass cards (pre-rendered from the SVGs in
//     public/illustrations: their drop-shadow filters made the browser stall
//     ~0.2s rasterizing them as the section scrolled in)
//   - a curved 3D carousel of clips (cards on the inside of a cylinder)
//     drifting left to right behind the shield.
//     A clip is "unverified" on the left and flips to verified (or held as a
//     bot) as it passes behind the shield
//   - the shield block from Paper
//   - light cables: fibre bundles fanning in
//     from the top and bottom edges onto the block, with pulses travelling
//     down them and flaring where they land (WebGL, in a worker)
// Units are container-query units over the 1200x462 artwork. Everything
// pauses off-screen; reduced motion gets a still frame.

type Clip = { handle: string; views: string; thumb: number; bot?: boolean };

// thumb indexes the 5x2 sprite in /media/verification-clips.webp
const CLIPS: Clip[] = [
  { handle: "@ana.clips", views: "48K", thumb: 0 },
  { handle: "@milo.cuts", views: "12K", thumb: 1 },
  { handle: "@devonmakes", views: "31K", thumb: 2 },
  { handle: "@vw_clips_8821", views: "91K", thumb: 3, bot: true },
  { handle: "@shorts.hub", views: "22K", thumb: 4 },
  { handle: "@kat.edits", views: "9K", thumb: 5 },
  { handle: "@x_viral_tv", views: "57K", thumb: 6 },
  { handle: "@reelcraft", views: "36K", thumb: 7 },
  { handle: "@daily.reels.4k", views: "140K", thumb: 8, bot: true },
  { handle: "@nora.cuts", views: "18K", thumb: 9 },
  { handle: "@clipzone", views: "27K", thumb: 2 },
  { handle: "@studio.shorts", views: "64K", thumb: 6 },
  { handle: "@bot_farm_19", views: "210K", thumb: 0, bot: true },
  { handle: "@lena.edits", views: "15K", thumb: 9 },
  { handle: "@frame.daily", views: "44K", thumb: 4 },
];

// Ring geometry, in cqw. The camera sits CAMERA cqw from the screen plane
// and DEPTH cqw behind the ring's centre, so the centre card is the
// farthest (smallest) and the side cards grow and turn toward us.
const STEP = 12; // degrees between cards
const COUNT = 360 / STEP; // a full ring, so the loop never has a gap
const RADIUS = 40;
const DEPTH = 20;
const CAMERA = 50;
const SPEED = 4.5; // degrees per second
const VISIBLE = 70; // cards past this angle are off the edge

// Layout for the scene canvases, inline so they fill the scene even before
// (or without) the stylesheet; a bare canvas would sit at 300x150.
const FILL = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";

function Card({ clip }: { clip: Clip }) {
  const col = clip.thumb % 5;
  const row = Math.floor(clip.thumb / 5);
  return (
    <div className="vx-clip" data-bot={clip.bot || undefined}>
      <span
        className="vx-thumb"
        style={{ backgroundPosition: `${col * 25}% ${row * 100}%` }}
      />
      <span className="vx-play" />
      <span className="vx-meta">
        <span>{clip.handle}</span>
        <b>{clip.views}</b>
      </span>
      <span className="vx-tag vx-tag-pending">Unverified</span>
      {clip.bot ? (
        <span className="vx-tag vx-tag-bot">Bot · held</span>
      ) : (
        <span className="vx-tag vx-tag-ok">✓ Verified</span>
      )}
    </div>
  );
}

export function VerificationScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const cards = [...ringRef.current!.children] as HTMLElement[];
    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    let handle: AsciiBgHandle | null = null;
    let cables: LightCablesHandle | null = null;
    let visible = false;
    let cancelled = false;

    // Ring: place every card for the current rotation. Only cards in view
    // are shown; a card is "verified" once it has passed the centre.
    let offset = STEP / 2; // start with no card dead centre
    let frame = 0;
    let last = 0;
    const shown = new Array<boolean>(COUNT).fill(true); // so the first pass hides the rest
    const after = new Array<boolean>(COUNT).fill(false);
    const place = () => {
      for (let i = 0; i < COUNT; i++) {
        const angle = ((((i * STEP + offset) % 360) + 540) % 360) - 180; // -180..180
        const show = Math.abs(angle) <= VISIBLE;
        if (show !== shown[i]) {
          shown[i] = show;
          // display:none, not visibility: hidden cards would still be
          // composited layers updated every frame.
          cards[i].style.display = show ? "" : "none";
        }
        if (!show) continue;
        cards[i].style.transform =
          `rotateY(${-angle}deg) translateZ(${-RADIUS}cqw)`;
        const verified = angle > 0;
        if (verified !== after[i]) {
          after[i] = verified;
          cards[i].toggleAttribute("data-after", verified);
        }
      }
    };
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (last && now - last < MIN_FRAME_MS) return;
      offset += (last ? Math.min(now - last, 100) / 1000 : 0) * SPEED;
      last = now;
      place();
    };
    place();

    const sync = () => {
      const playing = visible;
      root.toggleAttribute("data-playing", playing);
      if (playing) {
        handle?.start();
        cables?.start();
      } else {
        handle?.stop();
        cables?.stop();
      }
      cancelAnimationFrame(frame);
      if (playing && animate) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    // The canvas is created here rather than rendered: its control moves to
    // a worker (transferControlToOffscreen), which can only happen once per
    // element, and effects can run twice in development.
    const canvas = document.createElement("canvas");
    canvas.className = "vx-ascii";
    canvas.style.cssText = FILL;
    root.prepend(canvas);
    handle = hostAsciiBg(canvas, {
      animate,
      onReady: () => {
        if (!cancelled) canvas.dataset.ready = "";
      },
    });
    // Cables sit on top of the art (they never draw over the block itself).
    const cablesCanvas = document.createElement("canvas");
    cablesCanvas.className = "vx-cables";
    cablesCanvas.style.cssText = FILL;
    root.append(cablesCanvas);
    cables = hostLightCables(cablesCanvas, {
      animate,
      onReady: () => {
        if (!cancelled) cablesCanvas.dataset.ready = "";
      },
    });

    // Canvases run only while this section crosses the middle of the viewport.
    const stop = observeActiveBand(root, (inBand) => {
      visible = inBand;
      sync();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stop();
      handle?.destroy();
      cables?.destroy();
      canvas.remove();
      cablesCanvas.remove();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="vx absolute top-0 left-1/2 aspect-[1200/462] h-full -translate-x-1/2 [container-type:size]"
    >
      <img
        src="/illustrations/verification-bg@1x.webp"
        srcSet="/illustrations/verification-bg@1x.webp 1x, /illustrations/verification-bg@2x.webp 2x"
        alt=""
        loading="lazy"
        decoding="async"
        width={1200}
        height={462}
        className="vx-art"
      />
      <div className="vx-carousel">
        <div
          ref={ringRef}
          className="vx-ring"
          style={{ transform: `translateZ(${CAMERA - DEPTH}cqw)` }}
        >
          {Array.from({ length: COUNT }, (_, i) => (
            <Card key={i} clip={CLIPS[i % CLIPS.length]} />
          ))}
        </div>
      </div>
      <img
        src="/illustrations/verification-shield@1x.webp"
        srcSet="/illustrations/verification-shield@1x.webp 1x, /illustrations/verification-shield@2x.webp 2x"
        alt=""
        loading="lazy"
        decoding="async"
        width={1200}
        height={462}
        className="vx-art"
      />
    </div>
  );
}
