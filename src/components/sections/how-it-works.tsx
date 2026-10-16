import { DeferredStepsScroller } from "@/components/deferred";
import { STEPS } from "@/content/site";

// The illustrations are CSS-only animations ported from Assets/Illustrations
// (see scripts/port-illustrations.mjs); the scroller loads them on approach.
export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="py-16 md:py-20">
      <DeferredStepsScroller steps={STEPS.map((step) => ({ ...step }))} />
    </section>
  );
}
