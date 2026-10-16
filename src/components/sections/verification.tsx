import { DeferredVerificationScene } from "@/components/deferred";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { VERIFICATION_FEATURES } from "@/content/site";

export function Verification() {
  return (
    <section aria-labelledby="verification-title" className="defer-render pt-16 pb-16 md:pt-20 md:pb-20">
      <Container className="flex flex-col gap-10">
        <h2
          id="verification-title"
          className="text-heading mx-auto max-w-[560px] text-center text-3xl leading-9 font-semibold tracking-[-0.01em] md:text-4xl md:leading-10"
        >
          The verification layer between your budget and bots
        </h2>

        <div className="overflow-clip rounded-lg bg-white outline-[0.5px] outline-black/5 outline-offset-1">
          <div className="relative h-[320px] overflow-clip bg-white sm:h-[380px] lg:aspect-[1200/462] lg:h-auto">
            {/* Paper art + carousel, light cables and an ASCII field (see verification-scene). */}
            <DeferredVerificationScene />
            <div className="absolute inset-x-0 bottom-0 h-[73px] bg-linear-to-b from-white/0 to-white" />
          </div>

          <ul className="grid gap-6 p-6 sm:grid-cols-2 md:p-10 lg:grid-cols-4">
            {VERIFICATION_FEATURES.map((feature) => (
              <li key={feature.title} className="flex flex-col gap-2">
                <h3 className="flex items-center gap-2 text-base font-medium tracking-[-0.01em] text-neutral-800">
                  <Icon name={feature.icon} className="text-neutral-700" />
                  {feature.title}
                </h3>
                <p className="text-sm leading-[22px] text-neutral-500">{feature.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
