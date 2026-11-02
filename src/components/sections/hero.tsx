import { HeroDome } from "@/components/hero/dome";
import { LogoCarousel } from "@/components/hero/logo-carousel";
import { Stats } from "@/components/hero/stats";
import { AnimatedWords } from "@/components/motion/animated-words";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section className="relative isolate overflow-clip pt-16">
      <HeroDome />

      <Container className="flex flex-col items-center gap-16 py-14 md:gap-20 md:py-20">
        <div className="flex max-w-[730px] flex-col items-center text-center">
          <p className="hero-fade flex min-h-8 items-center rounded-full bg-[linear-gradient(in_oklab_180deg,color-mix(in_oklab,var(--color-sand-100)_50%,transparent),color-mix(in_oklab,var(--color-sand-200)_50%,transparent))] px-3 text-[13px] leading-5 font-medium text-neutral-900 shadow-[#00000014_0_0_0_1px] [--delay:0ms]">
            50M+ views generated for brands on Clipstake
          </p>

          <div className="flex flex-col items-center gap-4 pt-6 pb-9">
            <h1 className="text-4xl leading-11 font-semibold tracking-[-0.02em] text-pretty [filter:drop-shadow(#00000026_0_1px_1px)] sm:text-5xl sm:leading-14">
              <AnimatedWords text="Run clipping campaigns and pay for only verified views" />
            </h1>
            <p className="hero-fade max-w-[548px] text-base tracking-[-0.01em] text-neutral-500">
              Clipstake turns thousands of short-form clippers into your distribution channel. Set your CPM,
              brief the campaign, and only pay for verified views on TikTok, Reels, Shorts and X.
            </p>
          </div>

          <div className="hero-fade flex flex-wrap items-center justify-center gap-3 [--delay:260ms] sm:gap-4">
            <ButtonLink>Launch a campaign</ButtonLink>
            <ButtonLink variant="secondary">Book a call</ButtonLink>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-8">
            <p className="text-center text-base tracking-[-0.01em] text-neutral-500">
              Trusted by hundreds of brands and agencies
            </p>
            <LogoCarousel />
          </div>
          <Stats />
        </div>
      </Container>
    </section>
  );
}
