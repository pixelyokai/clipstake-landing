import { DeferredFaqAccordion } from "@/components/deferred";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { FAQS } from "@/content/site";

export function Faq() {
  return (
    <section aria-labelledby="faq-title" className="defer-render pt-10 pb-20">
      <Container className="flex max-w-[1190px] flex-col gap-10 lg:flex-row lg:gap-20">
        <div className="flex max-w-[540px] flex-1 flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2
              id="faq-title"
              className="text-heading text-3xl leading-9 font-semibold tracking-[-0.01em] md:text-4xl md:leading-11"
            >
              FAQs
            </h2>
            <p className="max-w-[432px] text-base tracking-[-0.01em] text-neutral-500">
              Discover quick and comprehensive answers to common questions about our platform, services, and
              features.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <p className="text-base tracking-[-0.01em] text-neutral-500">Still unsure? Book a 30-minute call with the team.</p>
            <ButtonLink variant="secondary">Contact us</ButtonLink>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <DeferredFaqAccordion items={FAQS.map((item) => ({ q: item.q, a: item.a }))} initial={1} />
        </div>
      </Container>
    </section>
  );
}
