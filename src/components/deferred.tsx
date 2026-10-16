"use client";

// Below-the-fold interactive pieces, code-split and hydrated on approach.
// Server components import these instead of the originals so none of their
// code lands in the initial bundle.
import { lazyHydrate } from "@/components/motion/lazy-hydrate";

export const DeferredFlipCard = lazyHydrate(() =>
  import("@/components/campaign-types/flip-card").then((m) => m.FlipCard),
);
export const DeferredStepsScroller = lazyHydrate(
  () => import("@/components/how-it-works/steps-scroller").then((m) => m.StepsScroller),
  "600px 0px",
);
export const DeferredReachCalculator = lazyHydrate(() =>
  import("@/components/calculator/reach-calculator").then((m) => m.ReachCalculator),
);
// Wider margin: its WebGL workers get a head start before it scrolls in.
export const DeferredVerificationScene = lazyHydrate(
  () => import("@/components/verification/verification-scene").then((m) => m.VerificationScene),
  "1000px 0px",
);
export const DeferredCodeTabs = lazyHydrate(() => import("@/components/api/code-tabs").then((m) => m.CodeTabs));
export const DeferredPixelCanvas = lazyHydrate(() =>
  import("@/components/case-studies/pixel-canvas").then((m) => m.PixelCanvas),
);
export const DeferredCpmGlobe = lazyHydrate(
  () => import("@/components/calculator/cpm-globe").then((m) => m.CpmGlobe),
  "600px 0px",
);
export const DeferredCalculatorRays = lazyHydrate(() =>
  import("@/components/calculator/calculator-rays").then((m) => m.CalculatorRays),
);
export const DeferredFaqAccordion = lazyHydrate(() =>
  import("@/components/faq/accordion").then((m) => m.FaqAccordion),
);
