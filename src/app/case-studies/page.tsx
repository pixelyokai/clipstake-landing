import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { RollIn, RollingValue } from "@/components/motion/roll-in";
import { CaseStudyGrid } from "@/components/pages/case-study-grid";
import { CtaBanner } from "@/components/pages/cta-banner";
import { SiteFooter } from "@/components/sections/site-footer";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BRAND_CTA, CASE_STUDY_CARDS, CUSTOMERS } from "@/content/pages";

export const metadata: Metadata = {
  title: "Customers: Clipstake case studies",
  description:
    "343M verified views across four published campaigns, from logo drops to clipped interviews and music pushes, with 63.5M bot views caught and never billed.",
};

export default function CaseStudiesPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative z-[1] rounded-b-[48px] bg-neutral-50 md:rounded-b-[80px]">
        <section aria-labelledby="customers-title" className="pt-16">
          <Container className="flex flex-col gap-8 pt-12 pb-10 md:pt-20">
            <h1
              id="customers-title"
              className="text-4xl leading-11 font-semibold tracking-[-0.02em] text-pretty sm:text-5xl sm:leading-14"
            >
              <span className="hero-word">{CUSTOMERS.title}</span>
            </h1>
            <div className="hero-fade flex flex-col gap-3 [--delay:120ms]">
              <RollIn>
                <dl className="grid grid-cols-2 pt-px pl-px [filter:drop-shadow(#4040400f_0_1px_0.5px)_drop-shadow(#40404008_0_2px_1px)] lg:grid-cols-4">
                  {CUSTOMERS.totals.map((total) => (
                    // Every cell draws its own border; the negative margins fold
                    // neighbouring ones into a single hairline.
                    <div
                      key={total.label}
                      className="-mt-px -ml-px flex flex-col-reverse justify-end gap-2 border border-[#0a0a0a14] px-5 py-5 md:px-8 md:py-6"
                    >
                      <dt className="text-sm tracking-[-0.005em] text-[#626262]">{total.label}</dt>
                      <dd
                        className={`text-3xl leading-9 font-medium md:text-4xl ${
                          "accent" in total && total.accent ? "text-clipstake-red-500" : "text-neutral-950"
                        }`}
                      >
                        <RollingValue value={total.value} className="min-w-[4ch]" />
                      </dd>
                    </div>
                  ))}
                </dl>
              </RollIn>
              <p className="font-mono text-xs text-neutral-500">{CUSTOMERS.note}</p>
            </div>
          </Container>
        </section>

        <section aria-label="Case studies" className="pt-6">
          <Container>
            <CaseStudyGrid studies={CASE_STUDY_CARDS} />
          </Container>
        </section>

        <CtaBanner
          {...BRAND_CTA}
          className="pt-24 pb-20 md:pt-40"
          actions={
            <>
              <ButtonLink>Launch a campaign</ButtonLink>
              <ButtonLink variant="secondary">Book a call</ButtonLink>
            </>
          }
        />
        <div id="footer-sentinel" aria-hidden="true" />
      </main>
      <SiteFooter />
    </>
  );
}
