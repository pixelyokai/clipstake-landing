import {
  DeferredCalculatorRays,
  DeferredCpmGlobe,
  DeferredReachCalculator,
} from "@/components/deferred";
import { Container } from "@/components/ui/container";

export function Calculator() {
  return (
    <section
      aria-labelledby="calculator-title"
      className="defer-render relative isolate overflow-clip bg-clipstake-red-600 py-24 md:py-36"
    >
      <DeferredCalculatorRays targetId="reach-calculator" />
      <Container className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-20">
        <div className="flex max-w-[540px] flex-1 flex-col gap-4">
          <h2
            id="calculator-title"
            className="text-heading-light text-3xl leading-9 font-semibold tracking-[-0.01em] md:text-4xl md:leading-10"
          >
            See what your budget buys before you spend it
          </h2>
          <p
            id="calculator-copy"
            className="max-w-[432px] text-base tracking-[-0.01em] text-neutral-50"
          >
            CPM pricing means the math is the pitch. Drag the sliders: that’s
            the number of verified views your budget pays for, at most.
          </p>
        </div>

        {/* Globe sits behind the card; its labels keep clear of the card and the text. */}
        <div className="relative w-full shrink-0 lg:w-[560px]">
          <DeferredCpmGlobe
            avoid={["reach-calculator", "calculator-title", "calculator-copy"]}
          />
          <DeferredReachCalculator />
        </div>
      </Container>
    </section>
  );
}
