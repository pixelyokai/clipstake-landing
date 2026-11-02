import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { CREATOR } from "@/content/pages";

const { steps } = CREATOR;

// Small looping touches laid over each illustration (positions are % of the
// 600x436 artwork): a light sweep over the brief, an upload filling with a
// click, the approval timer pulsing with a signal down its line, and a glint
// on the payout. Transform and opacity only; off under reduced motion.
const FX = [
  <span key="brief" className="step-sweep top-[33.7%] left-[6.3%] h-[57.6%] w-[42%] rounded-[1.5%]" />,
  <span key="submit" className="contents">
    <span className="step-fill top-[45.2%] left-[25.3%] h-[2.8%] w-[52.7%]" />
    <span className="step-ripple top-[48.2%] left-[64.7%] w-[7%]" />
  </span>,
  <span key="approved" className="contents">
    <span className="step-pulse top-[23.4%] left-[21.3%] w-[9%]" />
    <span className="step-signal top-[34.2%] left-[50.3%] h-[9.6%] w-[0.5%]" />
  </span>,
  <span key="payout" className="contents">
    <span className="step-sweep top-[50.7%] left-[30%] h-[32.8%] w-[70%] rounded-l-full [--sweep-delay:0.6s]" />
    <span className="step-ripple top-[77.8%] left-[21.2%] w-[7%] [--ripple-delay:0.2s]" />
  </span>,
];

// Creator page: the four steps from brief to payout, each with its product
// illustration fading into the card and a subtle loop on top.
export function EarningSteps() {
  return (
    <section aria-labelledby="steps-title" className="defer-render pt-10 pb-16">
      <SectionHeading id="steps-title" title={steps.title} body={steps.body} className="pb-10" />
      <Container>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.items.map((step, i) => (
            <li
              key={step.title}
              className="rise-in flex flex-col overflow-clip rounded-lg bg-white outline-1 outline-offset-1 outline-black/[0.08]"
              style={{ "--i": i } as React.CSSProperties}
            >
              <div className="relative aspect-[287/220] w-full">
                <img
                  loading="lazy"
                  decoding="async"
                  src={step.image}
                  alt=""
                  width={600}
                  height={435}
                  className="size-full object-cover"
                />
                {/* Same box as the cover-fitted artwork, so the % positions line up. */}
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 left-1/2 aspect-[600/436] h-full -translate-x-1/2 -translate-y-1/2"
                >
                  {FX[i]}
                </span>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(in_oklab_180deg,#fff0_75%,#fff_100%)]"
                />
              </div>
              <div className="flex flex-col gap-2 px-6 pb-6">
                <h3 className="text-base font-semibold tracking-[-0.01em] text-neutral-900">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="text-sm leading-[21px] text-neutral-500">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
