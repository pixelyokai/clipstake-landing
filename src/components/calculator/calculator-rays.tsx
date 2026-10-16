"use client";

import { useEffect, useRef } from "react";
import { hostRenderer } from "@/lib/canvas-worker";

// Light shafts from the top-right falling onto the calculator card. Sits
// behind the card (pointer-events: none), mounts when the section is near,
// runs only while it's on screen, and is a still frame for reduced motion.
export function CalculatorRays({ targetId }: { targetId: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Created here, not rendered: its control moves to a worker, which can
    // only happen once per element.
    const canvas = document.createElement("canvas");
    canvas.className =
      "pointer-events-none absolute inset-0 size-full opacity-0 transition-opacity duration-1000 ease-(--ease-out) data-ready:opacity-100";
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    wrapRef.current!.append(canvas);
    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    let inView = false;
    let cancelled = false;
    const handle = hostRenderer(canvas, {
      worker: () =>
        new Worker(new URL("./side-rays.worker.ts", import.meta.url), {
          type: "module",
        }),
      local: () => import("./side-rays").then((m) => m.createRays),
      options: { animate },
      onReady: () => {
        if (cancelled) return;
        canvas.dataset.ready = "";
      },
    });

    const aim = () => {
      const card = document.getElementById(targetId);
      if (!card) return;
      const box = canvas.getBoundingClientRect();
      const rect = card.getBoundingClientRect();
      handle.call("aim", {
        x: (rect.left + rect.width * 0.55 - box.left) / box.width,
        y: (rect.top + rect.height * 0.35 - box.top) / box.height,
      });
    };
    const sync = () => {
      if (inView && !document.hidden) handle.start();
      else handle.stop();
    };
    aim();

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);
    const resize = new ResizeObserver(aim);
    resize.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelled = true;
      io.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", sync);
      handle.destroy();
      canvas.remove();
    };
  }, [targetId]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    />
  );
}
