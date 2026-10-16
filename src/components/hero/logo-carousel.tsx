"use client";

import { useEffect, useRef } from "react";
import { HERO_LOGOS } from "@/content/site";

const INTERVAL = 3000;
const STAGGER = 60;
const MOVE = 600;
const SETS = HERO_LOGOS.length;

// Staggered logo swap: every 3s each slot rolls its logo up and out while the
// other set's logo rolls in from below, left to right. Slots are sized to the
// wider of their two logos, so nothing around them moves. Cycling writes
// data-state attributes directly: no React render per swap.
export function LogoCarousel() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const list = listRef.current!;
    const slots = Array.from(list.children).map((slot) =>
      Array.from(slot.querySelectorAll<HTMLImageElement>("img")),
    );
    let active = 0;
    let inView = false;
    let hovered = false;
    let timer = 0;
    let settleTimer = 0;

    const setState = (img: HTMLImageElement, state: string) => {
      img.dataset.state = state;
      img.alt = state === "current" ? img.dataset.alt! : "";
      img.setAttribute("aria-hidden", String(state !== "current"));
    };

    const swap = () => {
      const previous = active;
      active = (active + 1) % SETS;
      for (const imgs of slots) {
        setState(imgs[previous], "exiting");
        setState(imgs[active], "current");
      }
      settleTimer = window.setTimeout(() => {
        for (const imgs of slots) setState(imgs[previous], "waiting");
      }, MOVE + STAGGER * slots.length + 50);
    };

    const schedule = () => {
      window.clearTimeout(timer);
      if (!inView || hovered || document.hidden) return;
      timer = window.setTimeout(() => {
        swap();
        schedule();
      }, INTERVAL);
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      schedule();
    });
    io.observe(list);

    const enter = () => {
      hovered = true;
      window.clearTimeout(timer);
    };
    const leave = () => {
      hovered = false;
      schedule();
    };
    list.addEventListener("pointerenter", enter);
    list.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", schedule);

    return () => {
      io.disconnect();
      list.removeEventListener("pointerenter", enter);
      list.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", schedule);
      window.clearTimeout(timer);
      window.clearTimeout(settleTimer);
    };
  }, []);

  return (
    <ul
      ref={listRef}
      className="grid grid-cols-2 place-items-center gap-x-8 gap-y-6 [--s:0.857] sm:grid-cols-3 sm:[--s:1] lg:flex lg:gap-10"
    >
      {HERO_LOGOS[0].map((_, slot) => {
        const width = Math.max(...HERO_LOGOS.map((set) => set[slot].width));
        return (
          <li
            key={slot}
            className="relative h-[calc(29px*var(--s))]"
            style={{ width: `calc(${width}px * var(--s))` }}
          >
            {HERO_LOGOS.map((set, setIndex) => {
              const logo = set[slot];
              const current = setIndex === 0;
              return (
                <img
                  key={logo.src}
                  src={logo.src}
                  alt={current ? logo.alt : ""}
                  data-alt={logo.alt}
                  aria-hidden={!current}
                  width={logo.width}
                  height={logo.height}
                  loading={current ? "eager" : "lazy"}
                  data-state={current ? "current" : "waiting"}
                  className="logo-slot absolute top-1/2 left-1/2 max-w-none"
                  style={{
                    width: `calc(${logo.width}px * var(--s))`,
                    height: `calc(${logo.height}px * var(--s))`,
                    transitionDelay: `${slot * STAGGER}ms`,
                  }}
                />
              );
            })}
          </li>
        );
      })}
    </ul>
  );
}
