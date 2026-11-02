import { SmartLink } from "@/components/ui/smart-link";
import type { CaseStudy } from "@/content/pages";

// Customer cards: a 16:9 cover with the campaign format tagged in the corner,
// and the one-line description below. Columns are split by hairlines that sit
// in the middle of the gap, as in Paper.
export function CaseStudyGrid({ studies, headingLevel = "h2" }: { studies: CaseStudy[]; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <ul className="grid gap-x-[33px] gap-y-10 sm:grid-cols-2 md:grid-cols-3 md:gap-y-12">
      {studies.map((study) => (
        <li
          key={study.slug}
          className="relative sm:max-md:[&:nth-child(2n)]:before:absolute md:[&:not(:nth-child(3n+1))]:before:absolute before:inset-y-0 before:-left-[16.5px] before:w-px before:rounded-full before:bg-black/[0.08]"
        >
          <SmartLink href={study.href} className="group flex flex-col gap-4 rounded-sm">
            <span className="relative isolate block aspect-video overflow-clip rounded-sm bg-[#0f1011]">
              <img
                loading="lazy"
                decoding="async"
                src={study.cover}
                alt=""
                width={720}
                height={405}
                className="size-full object-cover brightness-95 transition-[scale,filter] duration-300 ease-(--ease-out) group-hover:scale-[1.03] group-hover:brightness-100 motion-reduce:group-hover:scale-100"
              />
              <span className="absolute top-2 right-2 rounded-lg bg-black/40 px-2 py-1 text-xs font-medium text-white">
                {study.format}
              </span>
            </span>
            <Heading className="line-clamp-2 pr-6 text-base font-medium tracking-[-0.01em] text-neutral-800 transition-colors duration-[240ms] ease-(--ease-hover) group-hover:text-neutral-950">
              <span className="sr-only">{study.name}: </span>
              {study.body}
            </Heading>
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}
