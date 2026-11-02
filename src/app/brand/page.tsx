import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { CtaBanner } from "@/components/pages/cta-banner";
import { FeatureGrid } from "@/components/pages/feature-grid";
import { ProofCards } from "@/components/pages/proof-cards";
import { SplitHero } from "@/components/pages/split-hero";
import { StatsBand } from "@/components/pages/stats-band";
import { BotsCaught } from "@/components/sections/bots-caught";
import { CampaignTypes } from "@/components/sections/campaign-types";
import { Faq } from "@/components/sections/faq";
import { SiteFooter } from "@/components/sections/site-footer";
import { ButtonLink } from "@/components/ui/button";
import { BRAND, BRAND_CTA } from "@/content/pages";

export const metadata: Metadata = {
  title: "Clipstake for brands: Short-form reach, paid per verified view",
  description: BRAND.hero.body,
};

export default function BrandPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative z-[1] rounded-b-[48px] bg-neutral-50 md:rounded-b-[80px]">
        <SplitHero
          {...BRAND.hero}
          // Ghost fibers hidden for now; restore with backdrop={<DeferredGhostFibers />}.
          actions={
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <ButtonLink>Launch a campaign</ButtonLink>
              <ButtonLink variant="secondary">Book a call</ButtonLink>
            </div>
          }
          image={{
            src: "/media/pages/brand-dashboard.webp",
            alt: "The Clipstake dashboard listing a brand’s campaigns with their status, budget and views",
            width: 1408,
            height: 1044,
          }}
        />
        <CampaignTypes heading={BRAND.formats} />
        <StatsBand {...BRAND.stats} />
        <FeatureGrid id="controls-title" {...BRAND.controls} roomy>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <ButtonLink>Launch a campaign</ButtonLink>
            <ButtonLink variant="secondary">Book a call</ButtonLink>
          </div>
        </FeatureGrid>
        <ProofCards />
        <BotsCaught />
        <Faq title={BRAND.faq.title} items={BRAND.faq.faqs} initial={0} className="pt-14 pb-10 md:pt-20" />
        <CtaBanner
          {...BRAND_CTA}
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
