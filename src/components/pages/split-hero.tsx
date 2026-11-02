import type { ReactNode } from "react";
import { preload } from "react-dom";
import { LogoCarousel } from "@/components/hero/logo-carousel";
import { AnimatedWords } from "@/components/motion/animated-words";
import { Container } from "@/components/ui/container";

type Props = {
  eyebrow: string;
  title: string;
  body: string;
  actions: ReactNode;
  /** The product screenshot on the right; it bleeds off the edge and fades out.
   *  `src` is the 1408w file, with -704, -1056 and -2112 siblings for other
   *  screen densities. */
  image: { src: string; alt: string; width: number; height: number; position?: string };
  logosLabel: string;
  /** Paper sets the creator headline a size up (60/64) from the brand one (48/52). */
  large?: boolean;
  /** Decorative layer behind the hero (Brand's ghost fibers, currently hidden). */
  backdrop?: ReactNode;
};

// Brand and Creator heroes: copy on the left, a product screenshot bleeding
// off the right edge behind a fade to the page colour, the logo carousel below.
// Same entrance as the landing hero (CSS only, readable without JS).
export function SplitHero({ eyebrow, title, body, actions, image, logosLabel, large = false, backdrop }: Props) {
  const srcSet = [704, 1056, 1408, 2112]
    .map((w) => `${w === 1408 ? image.src : image.src.replace(".webp", `-${w}.webp`)} ${w}w`)
    .join(", ");
  const sizes = "(min-width: 1024px) 760px, calc(100vw - 32px)";
  // The screenshot is the LCP element: start it alongside the CSS, not after.
  preload(image.src, { as: "image", imageSrcSet: srcSet, imageSizes: sizes, fetchPriority: "high" });

  return (
    <section className="relative isolate overflow-x-clip pt-16">
      {backdrop}
      <Container className="flex flex-col items-center gap-16 pt-12 pb-10 md:gap-20 md:pt-20">
        <div className="flex w-full flex-col gap-12 lg:flex-row lg:items-center lg:gap-10">
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <div className="flex flex-col items-start gap-4 pb-9">
              <p className="hero-fade flex min-h-8 items-center rounded-full bg-[linear-gradient(in_oklab_180deg,color-mix(in_oklab,var(--color-sand-100)_50%,transparent),color-mix(in_oklab,var(--color-sand-200)_50%,transparent))] px-3 text-[13px] leading-5 font-medium text-neutral-900 shadow-[#00000014_0_0_0_1px] [--delay:0ms]">
                {eyebrow}
              </p>
              <h1
                className={`max-w-[556px] font-semibold text-pretty lg:w-[556px] lg:max-w-none [filter:drop-shadow(#00000026_0_1px_1px)] ${
                  large
                    ? "text-[44px] leading-12 tracking-[-0.03em] sm:text-6xl sm:leading-16 sm:tracking-[-0.04em]"
                    : "text-4xl leading-11 tracking-[-0.02em] sm:text-5xl sm:leading-[52px]"
                }`}
              >
                <AnimatedWords text={title} />
              </h1>
              <p className="hero-fade max-w-[548px] text-base tracking-[-0.01em] text-neutral-500">{body}</p>
            </div>
            <div className="hero-fade flex flex-col items-start gap-6 [--delay:260ms]">{actions}</div>
          </div>

          {/* 520px slot; the screenshot overflows it to the right, up to 760px
              but never past the viewport edge (520px + the page gutter), and is
              masked from 300px to nothing at 500px (fixed, since the image
              scale is fixed by the height): only the first columns show. It crops from the right. */}
          <div className="hero-fade relative w-full shrink-0 [--delay:200ms] lg:h-[560px] lg:w-[520px]">
            {/* Page-coloured underlay with a soft halo: a backdrop never shows
                through the screenshot or its faded edge. */}
            {backdrop && (
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-[min(760px,calc(520px_+_max(40px,(100vw_-_1200px)/2)))] rounded-lg bg-neutral-50 shadow-[0_0_56px_40px_var(--color-neutral-50)] max-lg:hidden"
              />
            )}
            <div className="relative aspect-[704/520] w-full overflow-clip rounded-lg border border-black/[0.08] lg:absolute lg:inset-y-0 lg:left-0 lg:aspect-auto lg:w-[min(760px,calc(520px_+_max(40px,(100vw_-_1200px)/2)))] lg:[mask-image:linear-gradient(90deg,#000_300px,transparent_500px)]">
              <img
                src={image.src}
                srcSet={srcSet}
                sizes={sizes}
                alt={image.alt}
                width={image.width}
                height={image.height}
                fetchPriority="high"
                decoding="async"
                className="size-full object-cover"
                style={{ objectPosition: image.position ?? "0% 0%" }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8">
          <p className="text-center text-base tracking-[-0.01em] text-neutral-500">{logosLabel}</p>
          <LogoCarousel />
        </div>
      </Container>
    </section>
  );
}
