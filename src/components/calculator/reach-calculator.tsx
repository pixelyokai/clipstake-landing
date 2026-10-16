"use client";

import { useEffect, useState } from "react";
import { RangeSlider } from "@/components/calculator/range-slider";
import { ExpandingArrowButton } from "@/components/ui/expanding-arrow-button";
import {
  CALCULATOR,
  formatBudget,
  formatCompact,
  formatCpm,
  verifiedViews,
} from "@/content/calculator";

export function ReachCalculator() {
  const [budget, setBudget] = useState<number>(CALCULATOR.budget.initial);
  const [cpm, setCpm] = useState<number>(CALCULATOR.cpm.initial);
  const views = formatCompact(verifiedViews(budget, cpm));

  // Screen readers get the settled value, not every step while dragging.
  const [announced, setAnnounced] = useState(views);
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnounced(views), 500);
    return () => window.clearTimeout(timer);
  }, [views]);

  return (
    <div
      id="reach-calculator"
      className="relative isolate flex w-full shrink-0 flex-col gap-4 rounded-2xl backdrop-blur-[8px] bg-[linear-gradient(in_oklab_180deg,color-mix(in_oklab,#fff_80%,transparent),color-mix(in_oklab,#fff_95%,transparent))] p-6 lg:w-[560px]"
    >
      {/* Where the side rays land: a soft warm sheen on the top-right of the card. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[radial-gradient(120%_80%_at_100%_0%,#fff8f5_0%,#fff8f500_55%)] shadow-[inset_0_1px_0_#ffffff]"
      />
      <div className="flex flex-col gap-3.5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm leading-[18px] font-semibold text-neutral-800">
            Campaign budget
          </span>
          <span className="font-mono text-xl leading-6 font-medium text-neutral-800 tabular-nums">
            {formatBudget(budget)}
          </span>
        </div>
        <RangeSlider
          label="Campaign budget"
          {...CALCULATOR.budget}
          value={budget}
          valueText={formatBudget(budget)}
          onChange={setBudget}
        />
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm leading-[18px] font-semibold text-neutral-800">
            CPM (per 1,000 views)
          </span>
          <span className="font-mono text-xl leading-6 font-medium text-neutral-800 tabular-nums">
            {formatCpm(cpm)}
          </span>
        </div>
        <RangeSlider
          label="CPM, cost per 1,000 views"
          {...CALCULATOR.cpm}
          value={cpm}
          valueText={formatCpm(cpm)}
          onChange={(v) => setCpm(Math.round(v * 100) / 100)}
        />
      </div>

      <div className="flex flex-col gap-1.5 border-t border-black/[0.06] pt-4 pb-2">
        <span className="text-sm leading-[18px] font-semibold text-neutral-800">
          Verified views
        </span>
        <div className="flex items-baseline gap-3">
          <span
            aria-hidden="true"
            className="inline-block text-5xl text-neutral-800 [filter:drop-shadow(#00000026_0_1px_1px)] font-semibold tracking-[-0.01em] tabular-nums"
          >
            {views}
          </span>
          <output aria-live="polite" className="sr-only">
            {announced} verified views
          </output>
          <span className="font-mono text-xs text-clipstake-red-800">
            bots excluded
          </span>
        </div>
      </div>

      <ExpandingArrowButton className="w-full">
        Launch a campaign
      </ExpandingArrowButton>
    </div>
  );
}
