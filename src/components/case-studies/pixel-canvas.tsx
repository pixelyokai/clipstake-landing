"use client";

import { useEffect, useRef } from "react";

const GAP = 6; // px between pixel centres
const COLORS = ["#fae7e7", "#f0b8b8", "#e27070"]; // clipstake-red 25 / 100 / 300
const GROW = 0.18; // px per frame toward max size
const SHRINK = 0.12;

type Pixel = {
  x: number;
  y: number;
  color: string;
  size: number;
  max: number;
  delay: number; // frames before it starts growing, by distance from the centre
  shimmer: number;
  phase: number;
};

// Pixel-grid hover for the case study cards. A 2D canvas behind the card content: pixels grow outward
// from the centre while the card is hovered or focused, shimmer gently, and
// shrink away on leave. The canvas is created on first hover, the loop stops
// as soon as every pixel is gone, and touch devices or reduced motion skip it.
export function PixelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const card = canvas.closest<HTMLElement>("[data-pixel-card]")!;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: CanvasRenderingContext2D | null = null;
    let pixels: Pixel[] = [];
    let active = false;
    let frame = 0;
    let tick = 0;

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const { width, height } = card.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      pixels = [];
      for (let x = GAP / 2; x < width; x += GAP) {
        for (let y = GAP / 2; y < height; y += GAP) {
          const distance = Math.hypot(x - width / 2, y - height / 2);
          pixels.push({
            x,
            y,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: 0,
            max: 1 + Math.random() * 1.6,
            delay: distance / 9,
            shimmer: 0.04 + Math.random() * 0.06,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    function draw() {
      if (!ctx) return;
      tick += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pixels) {
        if (active) {
          if (tick > p.delay) p.size = Math.min(p.max, p.size + GROW);
        } else {
          p.size = Math.max(0, p.size - SHRINK);
        }
        if (p.size <= 0) continue;
        alive = true;
        const size = active && p.size >= p.max ? p.max * (0.75 + 0.25 * Math.sin(tick * p.shimmer + p.phase)) : p.size;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }
      frame = active || alive ? requestAnimationFrame(draw) : 0;
    }

    function start() {
      if (!ctx) build();
      active = true;
      tick = 0;
      if (!frame) frame = requestAnimationFrame(draw);
    }
    function stop() {
      active = false;
      if (!frame) frame = requestAnimationFrame(draw);
    }

    const onFocusIn = () => card.matches(":focus-visible") && start();
    card.addEventListener("pointerenter", start);
    card.addEventListener("pointerleave", stop);
    card.addEventListener("focusin", onFocusIn);
    card.addEventListener("focusout", stop);
    const resize = new ResizeObserver(() => ctx && build());
    resize.observe(card);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      card.removeEventListener("pointerenter", start);
      card.removeEventListener("pointerleave", stop);
      card.removeEventListener("focusin", onFocusIn);
      card.removeEventListener("focusout", stop);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />;
}
