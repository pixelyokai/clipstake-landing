import { DeferredFaqAccordion } from "@/components/deferred";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { FAQS } from "@/content/site";

type Props = {
  title?: string;
  items?: readonly { q: string; a: string }[];
  /** Which question starts open. */
  initial?: number;
  className?: string;
};

export function Faq({ title = "FAQs", items = FAQS, initial = 1, className = "pt-10 pb-20" }: Props) {
  return (
    <section aria-labelledby="faq-title" className={`defer-render ${className}`}>
      <Container className="flex flex-col gap-10 lg:flex-row lg:gap-20">
        <div className="flex max-w-[540px] flex-1 flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2
              id="faq-title"
              className="text-heading text-3xl leading-9 font-semibold tracking-[-0.01em] md:text-4xl md:leading-11"
            >
              {title}
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
          <DeferredFaqAccordion items={items.map((item) => ({ q: item.q, a: item.a }))} initial={initial} />
        </div>
      </Container>
    </section>
  );
}
