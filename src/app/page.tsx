import { SiteHeader } from "@/components/site-header";
import { ApiConsole } from "@/components/sections/api-console";
import { Calculator } from "@/components/sections/calculator";
import { CampaignTypes } from "@/components/sections/campaign-types";
import { CaseStudies } from "@/components/sections/case-studies";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { SiteFooter } from "@/components/sections/site-footer";
import { Verification } from "@/components/sections/verification";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="relative z-[1] rounded-b-[48px] bg-neutral-50 md:rounded-b-[80px]">
        <Hero />
        <CampaignTypes />
        <HowItWorks />
        <Calculator />
        <Verification />
        <ApiConsole />
        <CaseStudies />
        <Faq />
        <div id="footer-sentinel" aria-hidden="true" />
      </main>
      <SiteFooter />
    </>
  );
}
