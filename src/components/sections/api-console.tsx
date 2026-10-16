import { DeferredCodeTabs } from "@/components/deferred";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { API_SAMPLES } from "@/content/api-samples";
import { API_FEATURES } from "@/content/site";
import { highlight } from "@/lib/highlight";

export async function ApiConsole() {
  return (
    <section aria-labelledby="api-title" className="defer-render bg-sand-900 pt-16 pb-20 md:pt-20 md:pb-[120px]">
      <Container className="flex flex-col gap-12 lg:flex-row lg:items-stretch lg:gap-20">
        <div className="flex flex-1 flex-col justify-between gap-10">
          <div className="flex flex-col gap-4">
            <h2
              id="api-title"
              className="text-heading-light text-3xl leading-9 font-semibold tracking-[-0.01em] md:text-4xl md:leading-10"
            >
              The Clipstake Infrastructure
              <br />
              as an API
            </h2>
            <p className="text-base tracking-[-0.01em] text-neutral-400">
              Console is the developer platform behind Clipstake. Launch campaigns from your own product, pull
              verified view data into your stack, and get notified the moment a post is approved or paid.
            </p>
          </div>

          <ul className="grid gap-6 sm:grid-cols-2">
            {API_FEATURES.map((feature) => (
              <li key={feature.title} className="flex flex-col gap-2">
                <h3 className="flex items-center gap-2 text-base font-medium tracking-[-0.01em] text-neutral-200">
                  <Icon name={feature.icon} />
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-400">{feature.body}</p>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <ButtonLink>Get an API key</ButtonLink>
            <ButtonLink variant="secondary">View Documentation</ButtonLink>
          </div>
        </div>

        <div className="h-[420px] w-full shrink-0 sm:h-[480px] lg:w-[560px]">
          <DeferredCodeTabs
            tabs={await Promise.all(
              API_SAMPLES.map(async (sample) => ({
                label: sample.label,
                html: await highlight(sample.code, sample.lang),
              })),
            )}
          />
        </div>
      </Container>
    </section>
  );
}
