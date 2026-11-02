"use client";

import { useEffect, useRef } from "react";
import { averia } from "@/components/pages/averia";
import type { ProofStudy } from "@/content/pages";

type Example = { logo: ProofStudy["logo"]; views: string; bots: string };

const RADIUS = 900; // px; how tightly the column bends
const STEP = 250; // px between rows: neighbours sit mostly past the faded edges
const EVERY = 2600; // ms each campaign rests in the middle
// Spring for the hand-off between rows (the arc picker's layout spring).
const SPRING = { stiffness: 360, damping: 32, mass: 0.6 };

// Where row `i` sits when the wheel is at `at`. Rows wrap around, so the
// distance is folded into [-n/2, n/2): a row leaving the top re-enters at the
// bottom while it's fully transparent.
function place(i: number, at: number, n: number) {
  const d = ((((i - at) % n) + n + n / 2) % n) - n / 2;
  const angle = (d * STEP) / RADIUS;
  const along = RADIUS * Math.sin(angle);
  const bend = RADIUS * (1 - Math.cos(angle));
  // Full strength until the row is well past the faded edges, then gone by the
  // wrap point. The container mask does the visible fading, so no row text is
  // ever drawn at low contrast.
  const opacity = Math.min(1, Math.max(0, (2 - Math.abs(d)) / 0.5));
  return {
    transform: `translate(-50%, -50%) translate(${-bend}px, ${along}px) rotate(${(angle * 180) / Math.PI}deg) scale(${1 - Math.min(Math.abs(d), 2) * 0.1})`,
    opacity: String(opacity),
  };
}

// Brand page, "Bots get caught": every published campaign's logo and numbers
// on a slowly turning arc, after beui's arc picker. The rows bend away from
// the centre and fade into the top and bottom edges; the wheel advances one
// row every few seconds on a spring. It pauses while hovered, focused,
// off-screen or in a background tab, and holds still under reduced motion.
export function BotsArc({ examples }: { examples: Example[] }) {
  const rowsRef = useRef<(HTMLLIElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const n = examples.length;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current!;
    let at = 0;
    let target = 0;
    let velocity = 0;
    let raf = 0;
    let last = 0;
    let visible = false;
    let held = false;

    function paint() {
      rowsRef.current.forEach((row, i) => {
        if (!row) return;
        const { transform, opacity } = place(i, at, n);
        row.style.transform = transform;
        row.style.opacity = opacity;
      });
    }

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const force = -SPRING.stiffness * (at - target) - SPRING.damping * velocity;
      velocity += (force / SPRING.mass) * dt;
      at += velocity * dt;
      if (Math.abs(at - target) < 0.0005 && Math.abs(velocity) < 0.0005) {
        at = target;
        velocity = 0;
        paint();
        raf = 0;
        return;
      }
      paint();
      raf = requestAnimationFrame(frame);
    }

    const timer = window.setInterval(() => {
      if (!visible || held || document.hidden) return;
      target += 1;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }, EVERY);

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(root);
    const hold = () => (held = true);
    const release = () => (held = false);
    root.addEventListener("pointerenter", hold);
    root.addEventListener("pointerleave", release);

    return () => {
      window.clearInterval(timer);
      cancelAnimationFrame(raf);
      io.disconnect();
      root.removeEventListener("pointerenter", hold);
      root.removeEventListener("pointerleave", release);
    };
  }, [n]);

  return (
    <div
      ref={rootRef}
      className="relative h-[420px] w-full overflow-x-clip [mask-image:linear-gradient(to_bottom,transparent,#000_26%,#000_74%,transparent)] md:h-[480px]"
    >
      <ul className="sr-only">
        {examples.map((example) => (
          <li key={example.views}>
            {"wordmark" in example.logo ? example.logo.wordmark : example.logo.alt}: {example.views}, {example.bots}
          </li>
        ))}
      </ul>
      <ul aria-hidden="true">
        {examples.map((example, i) => (
          <li
            key={example.views}
            ref={(el) => {
              rowsRef.current[i] = el;
            }}
            style={place(i, 0, n)}
            className="absolute top-1/2 left-1/2 flex w-max flex-col items-center gap-5 will-change-transform"
          >
            <span className="flex h-[46px] items-center">
              {"wordmark" in example.logo ? (
                <span className={`${averia.className} text-[40px] leading-none text-neutral-900`}>
                  {example.logo.wordmark}
                </span>
              ) : (
                <img
                  loading="lazy"
                  decoding="async"
                  src={example.logo.src}
                  alt=""
                  width={example.logo.width}
                  height={example.logo.height}
                  className="h-[46px] w-auto"
                />
              )}
            </span>
            <span className="text-center text-xl leading-7 font-medium whitespace-nowrap text-sand-600 sm:text-2xl sm:leading-8 md:text-3xl">
              {example.views} · <span className="text-clipstake-red-500">{example.bots}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
