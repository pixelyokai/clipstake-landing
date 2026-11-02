import { RollIn, RollingValue } from "@/components/motion/roll-in";
import { STATS } from "@/content/site";

// The four hero numbers roll from zeros to their value the first time they
// enter the viewport (see RollIn).
export function Stats() {
  return (
    <RollIn className="w-full">
      <dl className="grid w-full grid-cols-2 overflow-clip rounded-xl border border-black/[0.08] lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col-reverse justify-end gap-2 border-black/[0.08] px-5 py-5 md:px-10 ${
              i % 2 === 0 ? "border-r" : ""
            } ${i < 2 ? "border-b lg:border-b-0" : ""} ${i === 1 ? "lg:border-r" : ""}`}
          >
            <dt className="text-sm font-medium text-neutral-500">{stat.label}</dt>
            <dd className="text-3xl leading-9 font-semibold tracking-[-0.01em] text-neutral-900 md:text-4xl">
              <RollingValue value={stat.value} className="min-w-[6ch]" />
            </dd>
          </div>
        ))}
      </dl>
    </RollIn>
  );
}
