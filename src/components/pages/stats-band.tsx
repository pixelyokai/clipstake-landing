import { RollIn, RollingValue } from "@/components/motion/roll-in";
import { Container } from "@/components/ui/container";

type Props = { title: string; items: readonly { value: string; label: string }[] };

// The brand page's red band: a light heading over a frosted strip of three
// figures that roll in once, like the landing hero's.
export function StatsBand({ title, items }: Props) {
  return (
    <section aria-labelledby="band-title" className="defer-render bg-clipstake-red-600 py-16">
      <Container className="flex flex-col items-center gap-10">
        <h2
          id="band-title"
          className="text-heading-light max-w-[540px] text-center text-3xl leading-9 font-semibold tracking-[-0.01em] text-balance md:text-4xl md:leading-10"
        >
          {title}
        </h2>
        <RollIn className="w-full">
          <dl className="grid w-full overflow-clip rounded-2xl bg-[linear-gradient(in_oklab_180deg,color-mix(in_oklab,#fff_80%,transparent),color-mix(in_oklab,#fff_95%,transparent))] md:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex flex-col-reverse gap-2 border-black/[0.08] px-10 py-5 text-center not-last:max-md:border-b md:not-last:border-r"
              >
                <dt className="text-sm font-medium text-neutral-500">{item.label}</dt>
                <dd className="text-5xl leading-none font-semibold tracking-[-0.01em] text-neutral-900 md:text-6xl">
                  <RollingValue value={item.value} className="min-w-[5ch]" />
                </dd>
              </div>
            ))}
          </dl>
        </RollIn>
      </Container>
    </section>
  );
}
