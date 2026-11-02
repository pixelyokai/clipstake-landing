import { DeferredPixelCanvas } from "@/components/deferred";
import { RollIn, RollingValue } from "@/components/motion/roll-in";
import { averia } from "@/components/pages/averia";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { SmartLink } from "@/components/ui/smart-link";
import { PROOF, ROUTES } from "@/content/pages";

// The red gradient is clipped to the text. While the value rolls, slot-text
// moves each glyph on its own layer, which the parent's background-clip can't
// follow, so the gradient moves onto every glyph. It's vertical, so per-glyph
// and per-line look the same.
const VALUE_GRADIENT =
  "[&:not(.slot-text)]:bg-[linear-gradient(in_oklab_180deg,var(--color-clipstake-red-600),var(--color-clipstake-red-400))] [&:not(.slot-text)]:bg-clip-text text-transparent [&_.char-face]:bg-[linear-gradient(in_oklab_180deg,var(--color-clipstake-red-600),var(--color-clipstake-red-400))] [&_.char-face]:bg-clip-text";

// "Proof, in views that were actually paid for": a dark sand band with one
// sand-50 card per published study, headline number in the red gradient,
// three supporting figures underneath.
// The headline rolls in once on scroll; on hover the landing case study card's
// pixel field grows out from the centre.
export function ProofCards() {
  return (
    <section aria-labelledby="proof-title" className="defer-render bg-sand-900 py-10">
      <SectionHeading id="proof-title" title={PROOF.title} body={PROOF.body} className="pb-10" wide light />
      <Container className="flex flex-col items-center gap-6 pb-10">
        <RollIn className="w-full">
          <ul className="grid w-full gap-4 md:grid-cols-3">
            {PROOF.studies.map((study) => (
              <li key={study.value}>
                <SmartLink
                  href={study.href}
                  data-pixel-card
                  className="surface-card group relative isolate bg-sand-50! flex h-full flex-col overflow-clip rounded-lg outline-black/10 transition-[scale] duration-150 ease-(--ease-out) active:scale-[0.99]"
                >
                  <DeferredPixelCanvas />
                  <span className="relative flex items-start justify-between p-6">
                    {"wordmark" in study.logo ? (
                      <span className={`${averia.className} text-lg leading-6 tracking-[-0.01em] text-neutral-900`}>
                        {study.logo.wordmark}
                      </span>
                    ) : (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={study.logo.src}
                        alt={study.logo.alt}
                        width={study.logo.width}
                        height={study.logo.height}
                        className="h-auto"
                        style={{ width: study.logo.width }}
                      />
                    )}
                    <span className="rounded-full bg-sand-100 px-2 py-1 text-xs font-medium text-sand-600">
                      {study.format}
                    </span>
                  </span>
                  <span className="relative flex flex-1 flex-col gap-5 px-6 pb-6">
                    <span className="flex flex-col gap-2">
                      <span className="text-5xl leading-[52px] font-semibold tracking-[-0.045em]">
                        <RollingValue value={study.value} className={VALUE_GRADIENT} />
                      </span>
                      <span className="text-sm text-neutral-600">{study.caption}</span>
                    </span>
                    <span className="mt-auto flex gap-6 border-t border-[#30303014] pt-4">
                      {study.stats.map((stat) => (
                        <span key={stat.label} className="flex flex-1 flex-col gap-0.5">
                          <span className="text-base font-medium tracking-[-0.01em] text-neutral-800">{stat.value}</span>
                          <span className="text-sm leading-4 text-neutral-500">{stat.label}</span>
                        </span>
                      ))}
                    </span>
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </RollIn>
        <ButtonLink href={ROUTES.caseStudies} variant="ghost" arrow className="bg-sand-900 text-base font-semibold text-neutral-200! hover:text-white!">
          All case studies
        </ButtonLink>
      </Container>
    </section>
  );
}
