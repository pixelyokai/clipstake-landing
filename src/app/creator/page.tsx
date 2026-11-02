import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { CtaBanner } from "@/components/pages/cta-banner";
import { FeatureGrid } from "@/components/pages/feature-grid";
import { ProofCards } from "@/components/pages/proof-cards";
import { SplitHero } from "@/components/pages/split-hero";
import { EarningSteps } from "@/components/sections/earning-steps";
import { Earnings } from "@/components/sections/earnings";
import { Faq } from "@/components/sections/faq";
import { SiteFooter } from "@/components/sections/site-footer";
import { ButtonLink } from "@/components/ui/button";
import { CREATOR } from "@/content/pages";

export const metadata: Metadata = {
  title: "Clipstake for creators: Get paid to post content for brands",
  description: CREATOR.hero.body,
};

const STORES = [
  { label: "Download on the App Store", src: "/badges/app-store.svg", width: 120 },
  { label: "Get it on Google Play", src: "/badges/google-play.svg", width: 136 },
];

export default function CreatorPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative z-[1] rounded-b-[48px] bg-neutral-50 md:rounded-b-[80px]">
        <SplitHero
          {...CREATOR.hero}
          large
          actions={
            <>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <ButtonLink>Explore marketplace</ButtonLink>
                <ButtonLink variant="secondary">Get started</ButtonLink>
              </div>
              <ul className="flex flex-wrap items-start gap-4">
                {STORES.map((store) => (
                  <li key={store.label}>
                    <a
                      href="#"
                      aria-label={store.label}
                      className="block overflow-clip rounded-lg border border-[#a6a6a6] bg-black opacity-90 transition-[opacity,scale] duration-[240ms] ease-(--ease-hover) hover:opacity-100 active:scale-[0.97]"
                    >
                      <img src={store.src} alt="" width={store.width} height={40} className="h-10 w-auto" />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          }
          image={{
            src: "/media/pages/creator-marketplace.webp",
            alt: "The Clipstake marketplace showing open campaigns with their pay per 1,000 views",
            width: 1408,
            height: 1240,
          }}
        />
        <EarningSteps />
        <Earnings />
        <FeatureGrid id="trust-title" {...CREATOR.trust} />
        <ProofCards />
        <Faq title={CREATOR.faq.title} items={CREATOR.faq.faqs} initial={0} className="pt-14 pb-14 md:pt-20 md:pb-20" />
        <CtaBanner {...CREATOR.cta} actions={<ButtonLink>Explore marketplace</ButtonLink>} />
        <div id="footer-sentinel" aria-hidden="true" />
      </main>
      <SiteFooter />
    </>
  );
}
