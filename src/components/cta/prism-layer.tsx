"use client";

import { useEffect, useRef } from "react";
import { hostRenderer } from "@/lib/canvas-worker";

// CTA panel backdrop: the prism, faded right down and masked away from the
// middle so the heading, body and buttons keep their contrast. Mounts when the
// panel is near, runs only while on screen, still frame under reduced motion.
export function PrismLayer() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      worker: () => new Worker(new URL("./prism.worker.ts", import.meta.url), { type: "module" }),
      local: () => import("./prism").then((m) => m.createPrism),
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
  }, []);

  return <div ref={wrapRef} aria-hidden="true" className="prism-mask pointer-events-none absolute inset-0 -z-10" />;
}
