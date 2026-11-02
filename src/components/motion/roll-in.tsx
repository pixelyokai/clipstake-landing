"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { slotText } from "slot-text";

const zeroed = (value: string) => value.replace(/\d/g, "0");

// Every [data-stat] inside rolls from zeros to its value the first time the
// group enters the viewport, then never again. Callers reserve the width with
// tabular figures plus a min-width, so the roll never shifts the layout, and
// pair each value with an sr-only copy (the rolling one is aria-hidden).
export function RollIn({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const values = Array.from(ref.current!.querySelectorAll<HTMLElement>("[data-stat]"));
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
    io.observe(ref.current!);

    return () => {
      io.disconnect();
      controllers.forEach(({ el, final, controller }) => {
        controller.destroy();
        el.textContent = final;
      });
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** A value that rolls in: sr-only text for assistive tech, the animated copy for sight. */
export function RollingValue({ value, className = "" }: { value: string; className?: string }) {
  return (
    <>
      <span className="sr-only">{value}</span>
      <span
        aria-hidden="true"
        data-stat={value}
        className={`inline-block tabular-nums [&_.char-slot]:leading-[inherit] ${className}`}
      >
        {value}
      </span>
    </>
  );
}
