import { DeferredBotsArc } from "@/components/deferred";
import { Container } from "@/components/ui/container";
import { BRAND } from "@/content/pages";

const { bots } = BRAND;

// Brand page: how bot views are kept off the bill, with every published
// campaign's numbers turning past on an arc.
export function BotsCaught() {
  return (
    <section aria-labelledby="bots-title" className="defer-render bg-white py-16 md:py-20">
      <Container className="flex flex-col gap-12 lg:flex-row lg:items-stretch lg:gap-10">
        <div className="flex flex-1 flex-col justify-center gap-8">
          <div className="flex flex-col gap-4">
            <h2
              id="bots-title"
              className="text-heading text-3xl leading-9 font-semibold tracking-[-0.01em] md:text-4xl md:leading-10"
            >
              {bots.title[0]}
              <br /> {bots.title[1]}
            </h2>
            <p className="max-w-[440px] text-base tracking-[-0.01em] text-neutral-500">{bots.body}</p>
          </div>
          <ul className="flex flex-col gap-4">
            {bots.points.map((point) => (
              <li key={point.title} className="flex max-w-[540px] flex-col gap-1">
                <h3 className="text-lg leading-6 font-medium tracking-tight text-neutral-800">{point.title}</h3>
                <p className="max-w-[432px] text-sm text-neutral-500">{point.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <figure className="flex items-center justify-center lg:w-[640px] lg:shrink-0">
          <DeferredBotsArc examples={bots.examples} />
        </figure>
      </Container>
    </section>
  );
}
