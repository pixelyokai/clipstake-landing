"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { hostRenderer } from "@/lib/canvas-worker";

type Create = Parameters<typeof hostRenderer<{ animate: boolean }>>[1];

// Shared shell for the split-hero shader backdrops (Brand's ghost fibers): at most 1440px wide and centred, behind the
// .hero-backdrop mask (gone before the copy column, faded at every edge) and
// the screenshot's opaque underlay, so copy and product stay fully readable.
// Desktop only (on phones the copy spans the width), mounts after hydration,
// renders in a worker, runs only while on screen, still under reduced motion.
export function HeroBackdrop({
  worker,
  local,
  opacity = 1,
}: Pick<Create, "worker" | "local"> & { opacity?: number }): ReactNode {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    // Created here, not rendered: its control moves to a worker, which can
    // only happen once per element.
    const canvas = document.createElement("canvas");
    canvas.className =
      "absolute inset-0 size-full opacity-0 transition-opacity duration-[1.2s] ease-(--ease-out) data-ready:opacity-100";
    wrapRef.current!.append(canvas);
    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let inView = false;
    let cancelled = false;
    const handle = hostRenderer(canvas, {
      worker,
      local,
      options: { animate },
      onReady: () => {
        if (!cancelled) canvas.dataset.ready = "";
      },
    });

    const sync = () => {
      if (inView && !document.hidden) handle.start();
      else handle.stop();
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelled = true;
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      handle.destroy();
      canvas.remove();
    };
  }, [worker, local]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{ "--backdrop-opacity": opacity } as React.CSSProperties}
      className="hero-backdrop pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-full max-w-[1440px] -translate-x-1/2 max-lg:hidden"
    />
  );
}
