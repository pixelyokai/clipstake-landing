import { DeferredFlipCard } from "@/components/deferred";
import { Container } from "@/components/ui/container";
import { CAMPAIGN_TYPES } from "@/content/site";

export function CampaignTypes() {
  return (
    <section aria-labelledby="campaign-types-title" className="defer-render pt-10 pb-20 md:pt-0">
      <Container className="flex flex-col gap-8 pb-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2
            id="campaign-types-title"
            className="text-heading max-w-[560px] text-3xl leading-9 font-semibold tracking-[-0.01em] md:text-4xl md:leading-10"
          >
            Four ways to get your brand in front of millions
          </h2>
          <p className="max-w-[440px] text-base tracking-[-0.01em] text-neutral-500 md:text-right">
            Pick a format that fits your goal. You set the price per view, and you’re only charged when people
            actually watch.
          </p>
        </div>
      </Container>

      {/* Phones get a swipeable row; from md up it's Paper's 2- then 4-column grid. */}
      <Container className="max-md:px-0">
        <ul
          className="-my-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 py-6 [scrollbar-width:none] [touch-action:pan-x_pan-y] md:my-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:py-0 lg:grid-cols-4"
        >
          {CAMPAIGN_TYPES.map((type) => (
            <li
              key={type.title}
              className="h-[373px] w-[72vw] max-w-[300px] shrink-0 snap-start md:w-auto md:max-w-none"
            >
              <DeferredFlipCard title={type.title} video={type.video} description={type.description} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
