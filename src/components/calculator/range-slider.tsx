"use client";

import { useEffect, useRef } from "react";
import { createSpring } from "@/lib/spring";

type Props = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  valueText: string;
  onChange: (value: number) => void;
};

// Range slider without a motion library: a 32px muted track, a 4px bar thumb
// that rides a stiff overdamped spring, a fill whose edge trails just past the
// thumb, and a vertical stretch while held that springs back with a bounce.
// A native <input type="range"> sits on top (invisible) for pointer, touch,
// keyboard and screen readers.
const GLIDE = { stiffness: 700, damping: 50, mass: 0.5 };
const BOUNCY = { stiffness: 500, damping: 14, mass: 0.7 };

function place(travel: HTMLElement, fill: HTMLElement, p: number) {
  // The thumb's travel box is the track minus 8px left / 12px right, so
  // translating it by p * 100% of its own width moves the thumb p of the way.
  travel.style.transform = `translateX(${p * 100}%)`;
  // The fill's right edge sits ~4px past the thumb.
  fill.style.transform = `translateX(calc(${(p - 1) * 100}% + ${14 - 16 * p}px))`;
}

export function RangeSlider({ label, min, max, step, value, valueText, onChange }: Props) {
  const travelRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const springs = useRef<{ pos: ReturnType<typeof createSpring>; scale: ReturnType<typeof createSpring> } | null>(
    null,
  );
  const ratio = (value - min) / (max - min);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pos = createSpring(ratio, GLIDE, (p) => place(travelRef.current!, fillRef.current!, p));
    const scale = createSpring(1, BOUNCY, (s) => {
      thumbRef.current!.style.transform = `translateY(-50%) scaleY(${s})`;
    });
    springs.current = { pos, scale };
    return () => {
      pos.stop();
      scale.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const s = springs.current;
    if (!s) return;
    if (reduce.current) s.pos.jump(ratio);
    else s.pos.set(ratio);
  }, [ratio]);

  const grab = () => {
    if (reduce.current) return;
    springs.current?.scale.set(1.35);
    window.addEventListener("pointerup", release, { once: true });
    window.addEventListener("pointercancel", release, { once: true });
  };
  const release = () => springs.current?.scale.set(1);

  return (
    <div className="relative flex h-8 w-full cursor-grab touch-none items-center overflow-hidden rounded-lg bg-white/50 active:cursor-grabbing">
      <div className="pointer-events-none absolute inset-x-[2px] inset-y-0 overflow-hidden rounded-lg">
        <div
          ref={fillRef}
          className="absolute inset-0 rounded-lg bg-clipstake-red-600/15"
          style={{ transform: `translateX(calc(${(ratio - 1) * 100}% + ${14 - 16 * ratio}px))` }}
        />
      </div>
      <div
        ref={travelRef}
        className="pointer-events-none absolute inset-y-0 right-3 left-2"
        style={{ transform: `translateX(${ratio * 100}%)` }}
      >
        <div
          ref={thumbRef}
          className="absolute top-1/2 left-0 h-5 w-1 rounded-full bg-clipstake-red-600"
          style={{ transform: "translateY(-50%)" }}
        />
      </div>
      <input
        type="range"
        aria-label={label}
        aria-valuetext={valueText}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        onPointerDown={grab}
        className="range-input peer absolute inset-y-0 right-[2px] left-[2px] m-0 cursor-[inherit] appearance-none bg-transparent opacity-0"
      />
      {/* Keyboard focus ring, inset. */}
      <div className="pointer-events-none absolute inset-0 rounded-lg ring-clipstake-red-600/30 ring-inset peer-focus-visible:ring-4" />
    </div>
  );
}
