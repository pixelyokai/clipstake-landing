import type { ReactNode } from "react";
import { DeferredPrism } from "@/components/deferred";
import { Container } from "@/components/ui/container";

type Props = {
  /** Two lines; they break apart from sm up. */
  title: readonly string[];
  body: string;
  actions: ReactNode;
  className?: string;
};

// The play-mark from the Clipstake logo, used twice at 5% as a watermark.
function Mark({ className }: { className: string }) {
  return (
    <svg viewBox="-157 -214.093 336 458.181" aria-hidden="true" className={className}>
      <path
        d="M-41.896-93.557L-156.092-150.625-156.092-160.388C-156.092-165.399-153.265-169.984-148.779-172.208L-70.509-211.334C-57.358-217.914-41.896-208.334-41.896-193.605L-41.896-93.557Z"
        fill="#7C0A0A"
      />
      <path
        d="M-42.047 123.568L-156.243 180.636-156.243 190.399C-156.243 195.41-153.416 199.98-148.947 202.217L-70.662 241.345C-57.509 247.924-42.047 238.345-42.047 223.616L-42.047 123.568Z"
        fill="#7C0A0A"
      />
      <path
        d="M156.668-2.219C169.849 5.395 169.849 24.463 156.668 32.094L-136.463 201.715C-145.252 206.801-156.245 200.452-156.245 190.277L-156.245-160.236C-156.245-170.41-145.252-176.76-136.463-171.674L156.668-2.219Z"
        fill="#CE1111"
      />
    </svg>
  );
}

// Closing call to action: a pale red panel with the logo mark watermarked in
// two corners and a faint turning prism behind the copy.
export function CtaBanner({ title, body, actions, className = "pt-6 pb-20" }: Props) {
  return (
    <section aria-labelledby="cta-title" className={`defer-render ${className}`}>
      <Container>
        <div className="relative isolate flex flex-col items-center gap-8 overflow-clip rounded-3xl border border-black/10 bg-[linear-gradient(in_oklab_180deg,var(--color-clipstake-red-25),var(--color-white))] px-6 py-14 text-center shadow-[#ffffff33_0_1px_0_inset] md:p-16">
          <DeferredPrism />
          <Mark className="pointer-events-none absolute top-[70px] -left-[123px] -z-10 w-[336px] origin-top-left -rotate-[22deg] opacity-5" />
          <Mark className="pointer-events-none absolute top-[269px] left-[calc(100%+75px)] -z-10 w-[275px] origin-top-left rotate-[165deg] opacity-5" />
          <div className="flex flex-col gap-3">
            <h2
              id="cta-title"
              className="text-heading text-3xl leading-9 font-semibold tracking-[-0.01em] text-balance md:text-4xl md:leading-11"
            >
              {title[0]}
              <br className="max-sm:hidden" /> {title[1]}
            </h2>
            <p className="text-base tracking-[-0.01em] text-neutral-500">{body}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">{actions}</div>
        </div>
      </Container>
    </section>
  );
}
