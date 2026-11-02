"use client";

import { useEffect, useState } from "react";
import { RangeSlider } from "@/components/calculator/range-slider";
import { ExpandingArrowButton } from "@/components/ui/expanding-arrow-button";
import { formatCpm } from "@/content/calculator";
import { EARNINGS } from "@/content/pages";

const formatViews = (value: number) => new Intl.NumberFormat("en-US").format(value);
const formatEarnings = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);

// The creator side of the reach calculator: views on a clip times the
// campaign's CPM. Same card, sliders and CTA as the landing page's.
export function EarningsCalculator() {
  const [views, setViews] = useState<number>(EARNINGS.views.initial);
  const [cpm, setCpm] = useState<number>(EARNINGS.cpm.initial);
  const earned = formatEarnings((views / 1000) * cpm);

  // Screen readers get the settled value, not every step while dragging.
  const [announced, setAnnounced] = useState(earned);
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnounced(earned), 500);
    return () => window.clearTimeout(timer);
  }, [earned]);

  return (
    <div
      id="earnings-calculator"
      className="relative isolate flex w-full shrink-0 flex-col gap-4 rounded-2xl bg-[linear-gradient(in_oklab_180deg,color-mix(in_oklab,#fff_80%,transparent),color-mix(in_oklab,#fff_95%,transparent))] p-6 backdrop-blur-[8px] md:p-8 lg:w-[560px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[radial-gradient(120%_80%_at_100%_0%,#fff8f5_0%,#fff8f500_55%)] shadow-[inset_0_1px_0_#ffffff]"
      />
      <div className="flex flex-col gap-3.5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm leading-[18px] font-semibold text-neutral-800 md:text-base">Views on your clip</span>
          <span className="font-mono text-xl leading-6 font-medium text-neutral-800 tabular-nums">
            {formatViews(views)}
          </span>
        </div>
        <RangeSlider
          label="Views on your clip"
          {...EARNINGS.views}
          value={views}
          valueText={`${formatViews(views)} views`}
          onChange={setViews}
        />
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm leading-[18px] font-semibold text-neutral-800 md:text-base">
            Campaign CPM (per 1,000 views)
          </span>
          <span className="font-mono text-xl leading-6 font-medium text-neutral-800 tabular-nums">{formatCpm(cpm)}</span>
        </div>
        <RangeSlider
          label="Campaign CPM, paid per 1,000 views"
          {...EARNINGS.cpm}
          value={cpm}
          valueText={formatCpm(cpm)}
          onChange={(v) => setCpm(Math.round(v * 100) / 100)}
        />
      </div>

      <div className="flex flex-col gap-1.5 border-t border-black/[0.06] pt-4 pb-2">
        <span className="text-sm leading-[18px] font-medium text-neutral-800">You’d earn</span>
        <span
          aria-hidden="true"
          className="text-heading w-fit text-5xl font-semibold tracking-[-0.01em] tabular-nums"
        >
          {earned}
        </span>
        <output aria-live="polite" className="sr-only">
          You’d earn {announced}
        </output>
      </div>

      <ExpandingArrowButton className="w-full">Explore marketplace</ExpandingArrowButton>
    </div>
  );
}
