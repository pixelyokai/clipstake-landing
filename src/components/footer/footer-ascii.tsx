"use client";

import { useEffect, useRef } from "react";
import type { AsciiHandle } from "./ascii-renderer";

// Mounts the ASCII field + 3D wordmark once the footer starts to show, lays
// the wordmark exactly over the DOM one (which stays as the no-JS fallback and
// for layout), and wires the pointer: moving tilts the extrusion and light and
// lights up glyphs around the cursor; clicking/tapping sends a ripple. Pauses
// when covered or the tab is hidden; reduced motion gets one still frame.
export function FooterAscii() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const footer = canvas.closest<HTMLElement>("footer")!;
    const wordmark = footer.querySelector<HTMLElement>("[data-wordmark]");
    const sentinel = document.getElementById("footer-sentinel");
    if (!wordmark || !sentinel) return;
    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let handle: AsciiHandle | null = null;
    let loading = false;
    let revealed = false;

    const layout = () => {
      if (!handle) return;
      const box = canvas.getBoundingClientRect();
      const rect = wordmark.getBoundingClientRect();
      const style = getComputedStyle(wordmark);
      const fontSize = parseFloat(style.fontSize);
      handle.layout({
        left: rect.left - box.left,
        top: rect.top - box.top + parseFloat(style.paddingTop),
        width: rect.width,
        height: fontSize,
        font: `${style.fontWeight} ${fontSize}px ${style.fontFamily}`,
        fontSize,
        letterSpacing: parseFloat(style.letterSpacing) || 0,
        text: wordmark.textContent?.trim() ?? "Clipstake",
      });
    };

    const sync = () => {
      if (revealed && !document.hidden) handle?.start();
      else handle?.stop();
    };

    const mount = () => {
      loading = true;
      Promise.all([import("./ascii-renderer"), document.fonts.ready]).then(([{ createAscii }]) => {
        handle = createAscii(canvas, { animate });
        if (!handle) return;
        layout();
        footer.dataset.asciiReady = "";
        sync();
      });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        revealed = entry.isIntersecting;
        if (revealed && !handle && !loading) mount();
        sync();
      },
      { rootMargin: "0px 0px 200px 0px" },
    );
    io.observe(sentinel);

    const resize = new ResizeObserver(layout);
    resize.observe(footer);

    const point = (e: PointerEvent, inside = true) => {
      const box = canvas.getBoundingClientRect();
      handle?.pointer(e.clientX - box.left, e.clientY - box.top, inside && e.pointerType === "mouse");
    };
    const onMove = (e: PointerEvent) => point(e);
    const onLeave = (e: PointerEvent) => point(e, false);
    const onDown = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      handle?.ripple(e.clientX - box.left, e.clientY - box.top);
    };
    if (animate) {
      footer.addEventListener("pointermove", onMove);
      footer.addEventListener("pointerleave", onLeave);
      footer.addEventListener("pointerdown", onDown);
    }
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      resize.disconnect();
      footer.removeEventListener("pointermove", onMove);
      footer.removeEventListener("pointerleave", onLeave);
      footer.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", sync);
      handle?.destroy();
      delete footer.dataset.asciiReady;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full opacity-0 transition-opacity duration-700 ease-(--ease-out) [[data-ascii-ready]_&]:opacity-100"
    />
  );
}
