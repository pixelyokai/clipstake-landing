import { DeferredPixelCanvas } from "@/components/deferred";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { SmartLink } from "@/components/ui/smart-link";
import { CASE_STUDIES } from "@/content/site";

export function CaseStudies() {
  return (
    <section aria-labelledby="cases-title" className="defer-render pt-16 pb-16 md:pt-20 md:pb-20">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="cases-title"
            className="text-heading max-w-[720px] text-3xl leading-9 font-semibold tracking-[-0.01em] md:text-4xl md:leading-11"
          >
            See how brands scale with Clipstake
          </h2>
          <ButtonLink href="/case-studies" variant="ghost" arrow className="-mx-3.5 text-base font-semibold">
            All case studies
          </ButtonLink>
        </div>

        <ul className="grid gap-4 md:grid-cols-3">
          {CASE_STUDIES.map((study) => (
            <li key={study.logo.alt}>
              <SmartLink
                href={study.href}
                data-pixel-card
                className="surface-card group relative isolate flex h-72 flex-col justify-between overflow-clip rounded-lg p-6 transition-[scale] duration-150 ease-(--ease-out) active:scale-[0.99] md:h-80"
              >
                <DeferredPixelCanvas />
                {/* Logo sits on the same left lane as the copy; height-capped so
                    the three brands read at one size. */}
                <span className="relative flex h-10 items-center">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={study.logo.src}
                    alt={study.logo.alt}
                    width={study.logo.width}
                    height={study.logo.height}
                    className="h-auto max-h-10 w-auto max-w-[68%]"
                  />
                </span>
                <span className="relative flex items-end justify-between gap-4">
                  <span className="max-w-[26ch] text-base font-medium tracking-[-0.01em] text-neutral-800">
                    {study.body}
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-700 outline-[0.5px] outline-black/[0.06] transition-[background-color,color,scale] duration-[240ms] ease-(--ease-hover) group-hover:bg-clipstake-red-500 group-hover:text-white group-active:scale-95">
                    <Icon
                      name="arrow-right"
                      className="transition-[translate] duration-[280ms] ease-(--ease-hover) group-hover:translate-x-[2px]"
                    />
                  </span>
                </span>
              </SmartLink>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
