"use client";

import { useEffect, useId, useRef, useState } from "react";
import { slotText, type SlotTextController } from "slot-text";
import ElectricBorder from "@/components/api/electric-border";

type Tab = { label: string; html: string };

// Tabs + copy for server-highlighted code. The active-tab underline glides
// between tabs on clip-path (one element, no layout work). Copy confirms with
// a rolled "Copied" label and a check icon that blurs in over the copy icon.
export function CodeTabs({ tabs }: { tabs: Tab[] }) {
  const id = useId();
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  // Electric border while the pointer is over the block or focus is inside it.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const rollerRef = useRef<SlotTextController | null>(null);

  useEffect(() => {
    const list = listRef.current!;
    const underline = underlineRef.current!;
    const place = () => {
      const tab = list.querySelectorAll<HTMLElement>("[role=tab]")[active];
      const box = list.getBoundingClientRect();
      const rect = tab.getBoundingClientRect();
      underline.style.clipPath = `inset(0 ${box.right - rect.right + 10}px 0 ${rect.left - box.left + 10}px)`;
    };
    place();
    const resize = new ResizeObserver(place);
    resize.observe(list);
    return () => resize.disconnect();
  }, [active]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    rollerRef.current = slotText(labelRef.current!, "Copy", { rollBy: "word" });
    return () => rollerRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    const label = copied ? "Copied" : "Copy";
    if (rollerRef.current)
      rollerRef.current.set(label, {
        direction: copied ? "up" : "down",
        duration: 240,
      });
    else if (labelRef.current) labelRef.current.textContent = label;
  }, [copied]);

  async function copy() {
    try {
      // Copy straight from the rendered code; line numbers are CSS, so they're not in the text.
      const code =
        document.getElementById(`${id}-panel-${active}`)?.querySelector("code")
          ?.textContent ?? "";
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight"
        ? active === last
          ? 0
          : active + 1
        : event.key === "ArrowLeft"
          ? active === 0
            ? last
            : active - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    listRef.current!.querySelectorAll<HTMLElement>("[role=tab]")[next].focus();
  }

  return (
    <ElectricBorder
      active={hovered || focused}
      color="#ce1111"
      glowColor="#a50e0e"
      chaos={0.3}
      flicker={0.7}
      speed={0.75}
      thickness={1.6}
      intensity={0.85}
      borderRadius={8}
      className="h-full"
    >
      <div
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={(e) => e.target.matches(":focus-visible") && setFocused(true)}
        onBlur={(e) =>
          !e.currentTarget.contains(e.relatedTarget as Node) &&
          setFocused(false)
        }
        className="flex h-full min-h-0 flex-col overflow-clip rounded-lg bg-sand-800 shadow-[inset_0_0_0_1px_#ffffff0f]"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] pr-2">
          <div
            ref={listRef}
            role="tablist"
            aria-label="Code samples"
            className="relative flex"
            onKeyDown={onKeyDown}
          >
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${id}-panel-${i}`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                className={`relative h-11 cursor-pointer px-[18px] text-[13px] font-medium transition-colors duration-[240ms] ease-(--ease-hover) ${
                  i === active
                    ? "text-neutral-50"
                    : "text-sand-400 hover:text-sand-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <span
              ref={underlineRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-clipstake-red-400 transition-[clip-path] duration-200 ease-(--ease-out) motion-reduce:transition-none"
            />
          </div>

          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Copied to clipboard" : "Copy code"}
            className="group relative flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-sand-300 transition-[background-color,color,scale] duration-[240ms] ease-(--ease-hover) hover:bg-white/[0.06] hover:text-neutral-50 active:scale-[0.97]"
          >
            <span className="relative size-4" aria-hidden="true">
              <svg
                viewBox="0 0 16 16"
                className={`absolute inset-0 transition-[opacity,scale,filter] duration-200 ease-(--ease-out) ${copied ? "scale-25 opacity-0 blur-[4px]" : ""}`}
              >
                <rect
                  x="5"
                  y="5"
                  width="8.5"
                  height="8.5"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M10.5 3.2A1.8 1.8 0 0 0 8.8 2H4a2 2 0 0 0-2 2v4.8c0 .8.5 1.4 1.2 1.7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              <svg
                viewBox="0 0 16 16"
                className={`absolute inset-0 text-clipstake-red-300 transition-[opacity,scale,filter] duration-200 ease-(--ease-out) ${copied ? "" : "scale-25 opacity-0 blur-[4px]"}`}
              >
                <path
                  d="M3.5 8.5l3 3 6-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span ref={labelRef} aria-hidden="true" className="inline-block">
              Copy
            </span>
          </button>
        </div>

        {tabs.map((tab, i) => (
          <div
            key={tab.label}
            role="tabpanel"
            id={`${id}-panel-${i}`}
            aria-labelledby={`${id}-tab-${i}`}
            hidden={i !== active}
            tabIndex={0}
            className="code-panel min-h-0 flex-1 overflow-auto focus-visible:outline-offset-[-2px]"
            dangerouslySetInnerHTML={{ __html: tab.html }}
          />
        ))}
      </div>
    </ElectricBorder>
  );
}
