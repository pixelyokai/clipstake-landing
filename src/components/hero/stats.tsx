"use client";

import { useEffect, useRef } from "react";
import { slotText } from "slot-text";
import { STATS } from "@/content/site";

const zeroed = (value: string) => value.replace(/\d/g, "0");

// The four hero numbers roll from zeros to their value the first time they
// enter the viewport, then never again. Widths are reserved with tabular
// figures plus a min-width, so the roll never shifts the layout.
export function Stats() {
  const listRef = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const values = Array.from(listRef.current!.querySelectorAll<HTMLElement>("[data-stat]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      values.forEach((el) => el.setAttribute("data-ready", ""));
      return;
    }

    const controllers = values.map((el) => {
      const final = el.dataset.stat!;
      const controller = slotText(el, zeroed(final), { skipUnchanged: false });
      el.setAttribute("data-ready", "");
      return { el, final, controller };
    });

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        controllers.forEach(({ final, controller }, i) =>
          window.setTimeout(
            () => controller.set(final, { stagger: 40, duration: 520, direction: "up", bounce: 0.3 }),
            i * 90,
          ),
        );
      },
      { threshold: 0.6 },
    );
    io.observe(listRef.current!);

    return () => {
      io.disconnect();
      controllers.forEach(({ el, final, controller }) => {
        controller.destroy();
        el.textContent = final;
      });
    };
  }, []);

  return (
    <dl
      ref={listRef}
      className="grid w-full grid-cols-2 overflow-clip rounded-xl border border-black/[0.08] lg:grid-cols-4"
    >
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex flex-col-reverse justify-end gap-2 border-black/[0.08] px-5 py-5 md:px-10 ${
            i % 2 === 0 ? "border-r" : ""
          } ${i < 2 ? "border-b lg:border-b-0" : ""} ${i === 1 ? "lg:border-r" : ""}`}
        >
          <dt className="text-sm font-medium text-neutral-500">{stat.label}</dt>
          <dd className="text-3xl leading-9 font-semibold tracking-[-0.01em] text-neutral-900 md:text-4xl">
            <span className="sr-only">{stat.value}</span>
            <span
              aria-hidden="true"
              data-stat={stat.value}
              className="inline-block min-w-[6ch] tabular-nums [&_.char-slot]:leading-[inherit]"
            >
              {stat.value}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
