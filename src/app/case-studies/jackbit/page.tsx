import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { AnimatedWords } from "@/components/motion/animated-words";
import { RollIn, RollingValue } from "@/components/motion/roll-in";
import { CaseStudyGrid } from "@/components/pages/case-study-grid";
import { ClipVideo } from "@/components/pages/clip-video";
import { SiteFooter } from "@/components/sections/site-footer";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CASE_STUDY_CARDS, JACKBIT, ROUTES } from "@/content/pages";

export const metadata: Metadata = {
  title: "How JackBit turned one logo into 14,241 clips | Clipstake",
  description: JACKBIT.lead,
};

// "Next up" shows the other studies (Paper repeats JackBit in its own list).
const NEXT_UP = CASE_STUDY_CARDS.filter((study) => study.slug !== "jackbit").slice(0, 3);

// A row of 9:16 clips: equal columns on wider screens, a swipeable
// snap carousel on phones (cards bleed to the screen edge).
function ClipRow({ ids, phoneWidth }: { ids: number[]; phoneWidth: string }) {
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0">
      {ids.map((id) => (
        <li key={id} className={`shrink-0 snap-start sm:min-w-0 sm:flex-1 ${phoneWidth}`}>
          <ClipVideo id={id} />
        </li>
      ))}
    </ul>
  );
}

export default function JackBitCaseStudy() {
  return (
    <>
      <SiteHeader />
      <main className="relative z-[1] rounded-b-[48px] bg-neutral-50 md:rounded-b-[80px]">
        <article>
          <header className="pt-16">
            <Container className="flex flex-col gap-5 pt-12 pb-10 md:pt-16">
              <nav aria-label="Breadcrumb" className="hero-fade [--delay:0ms]">
                <ol className="flex items-center gap-2 text-sm">
                  <li>
                    <Link
                      href={ROUTES.caseStudies}
                      className="rounded-sm text-neutral-500 transition-colors duration-[240ms] ease-(--ease-hover) hover:text-neutral-900"
                    >
                      Case studies
                    </Link>
                  </li>
                  <li aria-hidden="true" className="text-neutral-400">
                    /
                  </li>
                  <li aria-current="page" className="text-neutral-900">
                    {JACKBIT.name}
                  </li>
                </ol>
              </nav>
              <h1 className="max-w-[880px] text-4xl leading-11 font-semibold tracking-[-0.02em] text-pretty [filter:drop-shadow(#00000026_0_1px_0.5px)] sm:text-5xl sm:leading-14">
                <AnimatedWords text={JACKBIT.title} />
              </h1>
              <p className="hero-fade max-w-[640px] text-base tracking-[-0.01em] text-neutral-500">{JACKBIT.lead}</p>
            </Container>
          </header>

          {/* Co-branded panel: the two marks on Clipstake red over a faint grid. */}
          <Container className="hero-fade [--delay:200ms]">
            <div className="relative isolate flex aspect-[1110/480] min-h-[220px] w-full items-center justify-center overflow-clip rounded-2xl bg-[radial-gradient(ellipse_60%_80%_at_50%_110%_in_oklab,#d8414166_0%,#d8414100_70%),linear-gradient(in_oklab_160deg,var(--color-clipstake-red-600)_0%,var(--color-clipstake-red-800)_70%,var(--color-clipstake-red-950)_100%)] shadow-[#ffffff26_0_1px_0_inset,#50141440_0_40px_80px_-40px] md:rounded-3xl">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] bg-size-[48px_48px] opacity-[0.09]"
              />
              <div className="flex items-center gap-4 px-6 sm:gap-8">
                <img
                  src="/brand/logo-mark-lg.webp"
                  alt="Clipstake"
                  width={226}
                  height={48}
                  className="h-auto w-[30vw] max-w-[226px] brightness-0 invert"
                />
                <span aria-hidden="true" className="text-2xl leading-8 font-light text-white/60 sm:text-[28px]">
                  ×
                </span>
                <img
                  src="/case-studies/jackbit-lg.webp"
                  alt="JackBit"
                  width={212}
                  height={47}
                  className="h-auto w-[28vw] max-w-[212px] invert"
                />
              </div>
            </div>
          </Container>

          <Container className="pt-14">
            <RollIn>
              <dl className="grid border-y border-[#30303017] sm:grid-cols-3">
                {JACKBIT.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col-reverse gap-2 border-[#30303017] py-6 not-last:max-sm:border-b sm:p-8 sm:first:pl-0 sm:not-first:border-l"
                  >
                    <dt className="text-[15px] leading-[22px] text-neutral-500">{stat.label}</dt>
                    <dd
                      className={`text-5xl leading-none font-semibold tracking-[-0.045em] md:text-6xl ${
                        "accent" in stat && stat.accent ? "text-clipstake-red-600" : "text-neutral-900"
                      }`}
                    >
                      <RollingValue value={stat.value} className="min-w-[3ch]" />
                    </dd>
                  </div>
                ))}
              </dl>
            </RollIn>
          </Container>

          <Container className="flex flex-col gap-14 pt-14 md:pt-[72px] lg:flex-row lg:items-start lg:gap-20">
            {/* At-a-glance sidebar; sticks beside the story on wide screens. */}
            <aside aria-label="Campaign summary" className="flex flex-col gap-6 lg:sticky lg:top-24 lg:w-80 lg:shrink-0">
              <div className="flex flex-col gap-3 border-b border-[#30303017] pb-5">
                <div className="flex h-8 items-center">
                  <img loading="lazy" decoding="async" src="/case-studies/jackbit-lg.webp" alt="JackBit" width={124} height={28} />
                </div>
                <p className="text-sm leading-[21px] text-neutral-500">{JACKBIT.about}</p>
              </div>
              <div className="flex flex-col gap-4">
                <dl className="grid gap-3.5 sm:grid-cols-2 lg:flex lg:flex-col">
                  {JACKBIT.facts.map((fact) => (
                    <div key={fact.label} className="flex flex-col gap-0.5">
                      <dt className="text-[13px] leading-[18px] text-neutral-500">{fact.label}</dt>
                      <dd
                        className={`font-medium text-neutral-900 ${
                          "small" in fact ? "text-sm leading-[22px]" : "text-[15px] leading-[22px]"
                        }`}
                      >
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <dl className="flex flex-col border-t border-[#30303017] pt-1">
                  {JACKBIT.numbers.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-baseline justify-between gap-3 border-[#3030300f] py-2.5 not-last:border-b"
                    >
                      <dt className="shrink-0 text-[13px] leading-5 text-neutral-500">{row.label}</dt>
                      <dd className="text-right text-[13px] leading-5 font-medium whitespace-nowrap text-neutral-900">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <a
                href={JACKBIT.website}
                className="group flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-clipstake-red-600 transition-colors duration-[240ms] ease-(--ease-hover) hover:text-clipstake-red-700"
              >
                Visit JackBit
                <span
                  aria-hidden="true"
                  className="font-normal transition-[translate] duration-[280ms] ease-(--ease-hover) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:group-hover:translate-none"
                >
                  ↗
                </span>
              </a>
              <div className="flex flex-col gap-3.5 rounded-xl bg-sand-100 p-5 shadow-[#30303014_0_0_0_1px_inset]">
                <div className="flex flex-col gap-1">
                  <p className="text-[15px] leading-[22px] font-semibold text-balance text-neutral-900">
                    {JACKBIT.sideCta.title}
                  </p>
                  <p className="text-[13px] leading-5 text-neutral-600">{JACKBIT.sideCta.body}</p>
                </div>
                <ButtonLink className="self-start">Launch a campaign</ButtonLink>
              </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div className="grid gap-6 border-b border-[#30303017] pb-7 sm:grid-cols-2">
                {[
                  { label: "Challenge", body: JACKBIT.challenge },
                  { label: "Solution", body: JACKBIT.solution },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-2">
                    <h2 className="text-xs font-medium tracking-[0.06em] text-neutral-500 uppercase">{item.label}</h2>
                    <p className="text-base leading-[26px] text-neutral-700">{item.body}</p>
                  </div>
                ))}
              </div>

              {JACKBIT.sections.map((section) => (
                <section key={section.title} className="flex flex-col gap-4 pt-5">
                  <h2 className="text-2xl leading-8 font-semibold tracking-tight text-neutral-900 md:text-[28px] md:leading-[34px]">
                    {section.title}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-[17px] leading-7 text-neutral-700">
                      {paragraph}
                    </p>
                  ))}
                  {"clips" in section && section.clips && (
                    <div className="pt-2">
                      <ClipRow ids={section.clips} phoneWidth="w-[62%]" />
                    </div>
                  )}
                  {"split" in section && section.split && (
                    <figure className="flex flex-col gap-3 rounded-xl border border-black/5 bg-sand-100 px-[22px] py-5 shadow-[#ffffff14_0_1px_0_inset]">
                      <div className="flex h-2.5 gap-0.5 overflow-clip rounded-[3px]">
                        <div className="bg-green-500" style={{ flexGrow: section.split.organic }} />
                        <div className="bg-clipstake-red-400" style={{ flexGrow: 100 - section.split.organic }} />
                      </div>
                      <figcaption className="flex justify-between gap-3 text-sm leading-4 text-sand-600">
                        <span className="flex items-center gap-1.5">
                          <span aria-hidden="true" className="size-2 shrink-0 rounded-xs bg-green-500" />
                          {section.split.organicLabel}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span aria-hidden="true" className="size-2 shrink-0 rounded-xs bg-clipstake-red-400" />
                          {section.split.botLabel}
                        </span>
                      </figcaption>
                    </figure>
                  )}
                </section>
              ))}

              <section className="flex flex-col gap-4 pt-7">
                <h2 className="text-xl leading-7 font-semibold tracking-[-0.015em] text-neutral-900">
                  From the campaign submissions
                </h2>
                <ClipRow ids={JACKBIT.submissions} phoneWidth="w-[44%]" />
              </section>
            </div>
          </Container>
        </article>

        <section aria-labelledby="next-title" className="defer-render pt-20 pb-24 md:pb-40">
          <Container>
            <div className="flex flex-col gap-7 border-t border-[#30303017] pt-14">
              <h2
                id="next-title"
                className="text-heading text-3xl leading-9 font-semibold tracking-tight md:text-4xl md:leading-11"
              >
                Next up
              </h2>
              <CaseStudyGrid studies={NEXT_UP} headingLevel="h3" />
            </div>
          </Container>
        </section>
        <div id="footer-sentinel" aria-hidden="true" />
      </main>
      <SiteFooter />
    </>
  );
}
