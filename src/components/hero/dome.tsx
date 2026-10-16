"use client";

import { useEffect, useRef, useState } from "react";
import type { DomeTier } from "./dome-renderer";

type Mode = "pending" | "webgl" | "css";

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

function pickTier(): { tier: DomeTier; dpr: number } {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return { tier: "static", dpr: 1 };
  const nav = navigator as NavigatorHints;
  const lowEnd =
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4 ||
    nav.connection?.saveData === true ||
    /(^|-)(2g|3g)$/.test(nav.connection?.effectiveType ?? "");
  return { tier: lowEnd ? "low" : "capable", dpr: lowEnd ? 1 : Math.min(window.devicePixelRatio || 1, 1.5) };
}

// Runs a callback once the page has loaded and the main thread is idle, so the
// dome never competes with the hero text for first paint.
function afterLoadIdle(callback: () => void) {
  let idle = 0;
  const run = () => {
    idle = window.requestIdleCallback
      ? window.requestIdleCallback(callback, { timeout: 2000 })
      : window.setTimeout(callback, 200);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    window.removeEventListener("load", run);
    if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
    else window.clearTimeout(idle);
  };
}

export function HeroDome() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    const wrapper = wrapperRef.current!;
    let handle: import("./dome-renderer").DomeHandle | null = null;
    let inView = true;
    let cancelled = false;

    const sync = () => {
      if (!handle) return;
      if (inView && !document.hidden) handle.start();
      else handle.stop();
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(wrapper);
    document.addEventListener("visibilitychange", sync);

    const cancelIdle = afterLoadIdle(async () => {
      const { createDome } = await import("./dome-renderer");
      if (cancelled) return;
      const { tier, dpr } = pickTier();
      handle = createDome(canvasRef.current!, {
        tier,
        dpr,
        atlas: { avif: "/media/dome/atlas.avif", webp: "/media/dome/atlas.webp" },
        video: "/media/dome/mosaic.mp4",
      });
      if (!handle) {
        setMode("css");
        return;
      }
      setMode("webgl");
      sync();
    });

    return () => {
      cancelled = true;
      cancelIdle();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      handle?.destroy();
    };
  }, []);

  return (
    <div ref={wrapperRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 ease-(--ease-out) data-ready:opacity-100"
      />
      {mode === "css" && <div className="dome-fallback absolute inset-x-0 top-0 h-[70%]" />}

      {/* Contrast: the dome stays at the edges, the copy sits on near-solid page colour. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_46%_42%_at_50%_34%,var(--color-neutral-50)_55%,color-mix(in_oklab,var(--color-neutral-50)_70%,transparent)_80%,transparent_100%)] max-md:bg-[radial-gradient(ellipse_75%_38%_at_50%_34%,var(--color-neutral-50)_60%,color-mix(in_oklab,var(--color-neutral-50)_75%,transparent)_85%,transparent_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-neutral-50)_0%,color-mix(in_oklab,var(--color-neutral-50)_70%,transparent)_7%,transparent_20%,transparent_48%,var(--color-neutral-50)_66%)]" />
    </div>
  );
}
