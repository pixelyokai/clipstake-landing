"use client";

import { useEffect, useRef } from "react";
import { observeActiveBand } from "@/lib/active-band";
import { MIN_FRAME_MS } from "@/lib/frame-cap";
import type { GlobeMessage } from "./globe.worker";

// Rotating dotted globe (COBE) behind the calculator, with CPM labels pinned
// to a random, well-spread set of countries. Labels are plain DOM positioned
// with COBE's own projection; a label shows only while its marker faces us
// and it doesn't collide with another label or any of the `avoid` elements
// (the calculator card and the section's text).

type Country = { code: string; lat: number; lon: number };

const POOL: Country[] = [
  { code: "US", lat: 39, lon: -98 },
  { code: "CA", lat: 56, lon: -106 },
  { code: "MX", lat: 23, lon: -102 },
  { code: "BR", lat: -10, lon: -55 },
  { code: "AR", lat: -34, lon: -64 },
  { code: "CO", lat: 4, lon: -72 },
  { code: "CL", lat: -35, lon: -71 },
  { code: "GB", lat: 54, lon: -2 },
  { code: "DE", lat: 51, lon: 10 },
  { code: "FR", lat: 46, lon: 2 },
  { code: "ES", lat: 40, lon: -4 },
  { code: "SE", lat: 62, lon: 15 },
  { code: "TR", lat: 39, lon: 35 },
  { code: "NG", lat: 9, lon: 8 },
  { code: "ZA", lat: -30, lon: 25 },
  { code: "EG", lat: 26, lon: 30 },
  { code: "AE", lat: 24, lon: 54 },
  { code: "SA", lat: 24, lon: 45 },
  { code: "IN", lat: 21, lon: 78 },
  { code: "SG", lat: 1.35, lon: 103.8 },
  { code: "ID", lat: -2, lon: 118 },
  { code: "PH", lat: 13, lon: 122 },
  { code: "JP", lat: 36, lon: 138 },
  { code: "KR", lat: 36, lon: 128 },
  { code: "AU", lat: -25, lon: 134 },
  { code: "NZ", lat: -41, lon: 174 },
  { code: "NO", lat: 64, lon: 11 },
  { code: "FI", lat: 64, lon: 26 },
  { code: "IS", lat: 65, lon: -18 },
  { code: "PL", lat: 52, lon: 20 },
  { code: "NL", lat: 52.3, lon: 5.5 },
  { code: "IT", lat: 42, lon: 12.5 },
  { code: "PT", lat: 39.5, lon: -8 },
  { code: "GR", lat: 39, lon: 22 },
  { code: "UA", lat: 49, lon: 32 },
  { code: "KZ", lat: 48, lon: 68 },
  { code: "PK", lat: 30, lon: 69 },
  { code: "TH", lat: 15, lon: 101 },
  { code: "VN", lat: 16, lon: 108 },
  { code: "MY", lat: 4, lon: 102 },
  { code: "PE", lat: -10, lon: -76 },
  { code: "UY", lat: -33, lon: -56 },
  { code: "BO", lat: -17, lon: -65 },
  { code: "KE", lat: 1, lon: 38 },
  { code: "MA", lat: 32, lon: -6 },
  { code: "GH", lat: 8, lon: -1 },
  { code: "MG", lat: -19, lon: 47 },
  { code: "MZ", lat: -18, lon: 35 },
  { code: "PG", lat: -6, lon: 147 },
  { code: "FJ", lat: -17.7, lon: 178 },
  { code: "RU", lat: 60, lon: 60 },
  { code: "DK", lat: 56, lon: 10 },
  { code: "EE", lat: 59, lon: 26 },
  { code: "LT", lat: 55.5, lon: 24 },
  { code: "IE", lat: 53.3, lon: -8 },
  { code: "BY", lat: 53.5, lon: 28 },
  { code: "MN", lat: 47, lon: 104 },
  { code: "PY", lat: -23.5, lon: -58 },
  { code: "NA", lat: -22.5, lon: 17 },
  { code: "BW", lat: -22.5, lon: 24 },
];

const PICK = 36;
const MIN_SEPARATION = 10; // degrees between chosen countries
const SPEED = 0.12; // rad/s
const THETA = 0.2;
const ELEVATION = 0.03;
const GAP = 6; // px between labels

const toRad = (d: number) => (d * Math.PI) / 180;
function angularDistance(a: Country, b: Country) {
  const [la, lb] = [toRad(a.lat), toRad(b.lat)];
  const c =
    Math.sin(la) * Math.sin(lb) +
    Math.cos(la) * Math.cos(lb) * Math.cos(toRad(a.lon - b.lon));
  return (Math.acos(Math.min(1, Math.max(-1, c))) * 180) / Math.PI;
}

// The calculator card hides the middle of the globe, so far-north and
// far-south countries (the ones that show above and below it) go first.
const polar = (c: Country) => c.lat >= 45 || c.lat <= -20;
function pickCountries() {
  const shuffled = [...POOL]
    .sort(() => Math.random() - 0.5)
    .sort((a, b) => Number(polar(b)) - Number(polar(a)));
  const chosen: Country[] = [];
  for (const country of shuffled) {
    if (chosen.every((c) => angularDistance(c, country) >= MIN_SEPARATION))
      chosen.push(country);
    if (chosen.length === PICK) break;
  }
  return chosen.map((c) => ({
    ...c,
    // $0.40 to $4.80 in 5¢ steps
    cpm: (Math.round((0.4 + Math.random() * 4.4) * 20) / 20).toFixed(2),
  }));
}

// COBE's own marker projection (cobe/dist: functions U and O), so labels sit
// exactly on the markers. Returns 0..1 coordinates, depth, and facing.
function project(lat: number, lon: number, phi: number, theta: number) {
  const r = toRad(lat);
  const a = toRad(lon) - Math.PI;
  const k = 0.8 + ELEVATION;
  const x = -Math.cos(r) * Math.cos(a) * k;
  const y = Math.sin(r) * k;
  const z = Math.cos(r) * Math.sin(a) * k;
  const cx = Math.cos(phi) * x + Math.sin(phi) * z;
  const cy =
    Math.sin(phi) * Math.sin(theta) * x +
    Math.cos(theta) * y -
    Math.cos(phi) * Math.sin(theta) * z;
  const cz =
    -Math.sin(phi) * Math.cos(theta) * x +
    Math.sin(theta) * y +
    Math.cos(phi) * Math.cos(theta) * z;
  return { x: (cx + 1) / 2, y: (-cy + 1) / 2, z: cz, front: cz >= 0 };
}

export function CpmGlobe({ avoid = [] }: { avoid?: string[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    // Created here, not rendered: its control may move to a worker, which can
    // only happen once per element.
    const canvas = document.createElement("canvas");
    canvas.className = "size-full";
    wrap.prepend(canvas);
    const labelLayer = labelsRef.current!;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4;
    const dpr = lowEnd ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    const countries = pickCountries();

    // Build labels once.
    const labels = countries.map((c) => {
      const el = document.createElement("span");
      el.className = "globe-label";
      el.innerHTML = `<img src="/flags/${c.code.toLowerCase()}.png" alt="" width="16" height="12"><b>${c.code}</b><i>$${c.cpm}</i>`;
      labelLayer.appendChild(el);
      return el;
    });

    let globe: {
      update: (s: Record<string, unknown>) => void;
      destroy: () => void;
    } | null = null;
    let phi = 0.6;
    let frame = 0;
    let last = 0;
    let running = false;
    let size = 0;

    // Everything the placement needs from layout is measured here, outside
    // the frame loop (on load and resize): reading sizes inside the loop,
    // right after writing transforms, forced a layout per label per frame.
    type Box = { l: number; t: number; r: number; b: number };
    let avoidRects: Box[] = [];
    let viewL = 0;
    let viewR = 0;
    let sizes: { w: number; h: number }[] = [];
    const measure = () => {
      const box = wrap.getBoundingClientRect();
      // Labels must stay inside the viewport (the globe overhangs it on phones).
      viewL = -box.left + 8;
      viewR = document.documentElement.clientWidth - box.left - 8;
      avoidRects = [];
      for (const id of avoid) {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        if (rect)
          avoidRects.push({
            l: rect.left - box.left,
            t: rect.top - box.top,
            r: rect.right - box.left,
            b: rect.bottom - box.top,
          });
      }
      sizes = labels.map((el) => ({ w: el.offsetWidth, h: el.offsetHeight }));
    };
    const prevSide: string[] = [];
    const prevShown: boolean[] = [];

    const place = () => {
      if (!size) return;
      const occupied: Box[] = [...avoidRects];
      const points = countries
        .map((c, i) => ({ i, ...project(c.lat, c.lon, phi, THETA) }))
        .sort((a, b) => b.z - a.z); // front-most first
      for (const p of points) {
        const el = labels[p.i];
        const x = p.x * size;
        const y = p.y * size;
        const { w, h } = sizes[p.i];
        // Each label points away from the card: up above it, down below it,
        // and sideways in the strips left and right of it.
        const card = occupied[0];
        const side =
          !card || y < card.t
            ? "above"
            : y > card.b
              ? "below"
              : x < (card.l + card.r) / 2
                ? "left"
                : "right";
        const rect =
          side === "above"
            ? { l: x - w / 2, t: y - h - 10, r: x + w / 2, b: y - 10 }
            : side === "below"
              ? { l: x - w / 2, t: y + 10, r: x + w / 2, b: y + 10 + h }
              : side === "left"
                ? { l: x - 10 - w, t: y - h / 2, r: x - 10, b: y + h / 2 }
                : { l: x + 10, t: y - h / 2, r: x + 10 + w, b: y + h / 2 };
        const clear =
          p.front &&
          p.z > 0.02 &&
          rect.l >= viewL &&
          rect.r <= viewR &&
          occupied.every(
            (o) =>
              rect.r + GAP < o.l ||
              rect.l - GAP > o.r ||
              rect.b + GAP < o.t ||
              rect.t - GAP > o.b,
          );
        if (clear) occupied.push(rect);
        // Hidden labels on the far side don't need moving every frame (they
        // fade out from where they were).
        if (clear || prevShown[p.i])
          el.style.transform = `translate(${x}px, ${y}px)`;
        if (side !== prevSide[p.i]) {
          prevSide[p.i] = side;
          el.dataset.side = side;
        }
        if (clear !== prevShown[p.i]) {
          prevShown[p.i] = clear;
          el.toggleAttribute("data-shown", clear);
        }
      }
    };

    const tick = (now: number) => {
      if (!running) return;
      frame = requestAnimationFrame(tick);
      if (last && now - last < MIN_FRAME_MS) return;
      const dt = last ? Math.min(now - last, 100) / 1000 : 0;
      last = now;
      phi += dt * SPEED;
      globe?.update({ phi });
      place();
    };

    const setRunning = (active: boolean) => {
      if (active && !running && !reduce) {
        running = true;
        last = 0;
        frame = requestAnimationFrame(tick);
      } else if (!active && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
    };

    let stopBand: (() => void) | null = null;
    const resize = new ResizeObserver(() => {
      size = wrap.clientWidth;
      if (!size) return;
      // COBE multiplies width/height by devicePixelRatio itself, so these are
      // CSS pixels (passing device pixels rendered at dpr² resolution).
      globe?.update({ width: size, height: size });
      measure();
      place();
    });

    const options = {
      devicePixelRatio: dpr,
      // Keep the last frame on ticks we don't redraw (see light-cables.ts).
      context: { preserveDrawingBuffer: true },
      // COBE multiplies width/height by devicePixelRatio itself, so these are
      // CSS pixels.
      width: wrap.clientWidth,
      height: wrap.clientWidth,
      phi,
      theta: THETA,
      // Light globe; the canvas is faded in CSS so it
      // reads as a pale tint on the red section.
      dark: 0,
      diffuse: 1.2,
      mapSamples: lowEnd ? 9000 : 14000,
      mapBrightness: 6,
      mapBaseBrightness: 0,
      baseColor: [1, 1, 1] as [number, number, number],
      markerColor: [1, 1, 1] as [number, number, number],
      glowColor: [1, 0.92, 0.92] as [number, number, number],
      markerElevation: ELEVATION,
      markers: countries.map((c) => ({
        location: [c.lat, c.lon] as [number, number],
        size: 0.035,
      })),
    };

    const start = () => {
      size = wrap.clientWidth;
      measure();
      place();
      wrap.dataset.ready = "";
      resize.observe(wrap);
      stopBand = observeActiveBand(wrap, (active) => {
        if (active) measure(); // cheap, and catches late font/flag loads
        setRunning(active);
      });
    };

    // COBE runs in a worker on an OffscreenCanvas where supported, so its
    // context and shader setup (~0.1s) and every draw stay off the main
    // thread; otherwise it runs here.
    let cancelled = false;
    if (
      "transferControlToOffscreen" in canvas &&
      typeof Worker !== "undefined"
    ) {
      const worker = new Worker(new URL("./globe.worker.ts", import.meta.url), {
        type: "module",
      });
      const send = (message: GlobeMessage, transfer: Transferable[] = []) =>
        worker.postMessage(message, transfer);
      const offscreen = canvas.transferControlToOffscreen();
      send({ type: "init", canvas: offscreen, options }, [offscreen]);
      globe = {
        update: (state) => send({ type: "update", state }),
        destroy: () => send({ type: "destroy" }),
      };
      worker.onmessage = (event) => {
        if (event.data === "ready" && !cancelled) start();
      };
    } else {
      import("cobe").then(({ default: createGlobe }) => {
        if (cancelled) return;
        globe = createGlobe(canvas, options);
        start();
      });
    }

    return () => {
      cancelled = true;
      running = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      stopBand?.();
      globe?.destroy();
      labels.forEach((el) => el.remove());
      canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ids are static
  }, []);

  return (
    <div ref={wrapRef} aria-hidden="true" className="cpm-globe">
      <div ref={labelsRef} className="absolute inset-0" />
    </div>
  );
}
