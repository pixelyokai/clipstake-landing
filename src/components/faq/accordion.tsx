"use client";

import { useEffect, useId, useRef, useState } from "react";

type Item = { q: string; a: string };

// One item open at a time. Rows expand with grid-template-rows (0fr -> 1fr);
// the answer itself rides a small spring (slight overshoot, no wobble) and the
// plus icon springs into an x. The column keeps a min-height equal to its
// tallest single-open state, so the page below never jumps. Answers stay in
// the DOM for search engines.
export function FaqAccordion({ items, initial = 1 }: { items: Item[]; initial?: number }) {
  const id = useId();
  const [open, setOpen] = useState<number | null>(initial);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current!;
    // Answers keep their natural height even inside a collapsed (0fr) row,
    // so: height of every row closed + gaps + the tallest answer.
    const measure = () => {
      const rows = Array.from(list.children) as HTMLElement[];
      const answers = rows.map((row) => row.querySelector<HTMLElement>("[data-answer]")!.offsetHeight);
      const closed = rows.reduce(
        (sum, row, i) => sum + row.offsetHeight - (row.hasAttribute("data-open") ? answers[i] : 0),
        0,
      );
      list.style.minHeight = `${closed + (rows.length - 1) * 8 + Math.max(...answers)}px`;
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(list);
    return () => resize.disconnect();
  }, []);

  return (
    <div ref={listRef} className="flex flex-col items-stretch gap-2 self-start">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            data-row
            data-open={isOpen || undefined}
            className="faq-row rounded-xl border-[0.5px] border-b border-hairline transition-colors duration-200 ease-(--ease-out) data-open:bg-white"
          >
            <h3>
              <button
                type="button"
                id={`${id}-q-${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-a-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full cursor-pointer items-start gap-3 rounded-xl p-4 text-left text-base font-medium tracking-[-0.01em] text-neutral-800"
              >
                <span className="flex-1">{item.q}</span>
                <span className="grid size-6 shrink-0 place-items-center" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 20 20" className="faq-icon">
                    <path
                      d="M10 4.583V15.417M4.583 10H15.417"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.667"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={`${id}-a-${i}`}
              role="region"
              aria-labelledby={`${id}-q-${i}`}
              className="faq-panel grid"
            >
              <div className="min-h-0 overflow-hidden">
                <p data-answer className="faq-answer px-4 pb-4 text-sm text-neutral-500">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
