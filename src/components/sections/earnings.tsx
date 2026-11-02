import { DeferredCalculatorRays, DeferredEarningsCalculator } from "@/components/deferred";
import { Container } from "@/components/ui/container";
import { CREATOR } from "@/content/pages";

const { calculator } = CREATOR;

// Creator page: the red calculator band. Shares the landing calculator's card,
// sliders and light rays; the globe stays a landing-only flourish.
export function Earnings() {
  return (
    <section
      aria-labelledby="earnings-title"
      className="defer-render relative isolate overflow-clip bg-clipstake-red-600 py-20 md:py-24"
    >
      <DeferredCalculatorRays targetId="earnings-calculator" />
      <Container className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-20">
        <div className="flex max-w-[540px] flex-1 flex-col gap-4">
          <h2
            id="earnings-title"
            className="text-heading-light text-3xl leading-9 font-semibold tracking-[-0.01em] md:text-4xl md:leading-10"
          >
            {calculator.title[0]}
            <br /> {calculator.title[1]}
          </h2>
          <p className="max-w-[432px] text-base tracking-[-0.01em] text-neutral-50">{calculator.body}</p>
        </div>
        <DeferredEarningsCalculator />
      </Container>
    </section>
  );
}
