"use client";

import { useEffect, useRef, useState } from "react";

type Step = { title: string; body: string };

const STEP_MS = 9000; // each illustration is a 9s loop, so a step shows one full loop
const FADE_MS = 320;

// Timed steps: the active step is highlighted and its divider fills over STEP_MS,
// then the next step takes over. The fill is a CSS animation and its
// animationend advances the step, so pausing the animation pauses the timer:
// keyboard focus inside, off-screen or a hidden tab pause it (hovering
// doesn't: the steps keep moving under the pointer).
// Clicking a step jumps to it and restarts its timer. Reduced motion: no
// auto-advance (the fill animation is off in CSS), steps change on click.
export function StepsScroller({ steps }: { steps: Step[] }) {
  // The illustration markup is decorative and heavy, so it loads as its own
  // chunk when the section gets within 800px instead of shipping in the HTML.
  const [illustrations, setIllustrations] = useState<string[] | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const [round, setRound] = useState(0); // restarts the fill when re-selecting

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        import("./illustrations").then(({ S1, S2, S3 }) =>
          setIllustrations([S1, S2, S3]),
        );
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(panelRef.current!);
    return () => io.disconnect();
  }, []);

  // Zoom the 720x640 illustrations to the panel (zoom, not transform, so
  // text and strokes are rendered crisp at the final size).
  useEffect(() => {
    const panel = panelRef.current!;
    const resize = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      panel.style.setProperty(
        "--ill-scale",
        String(Math.min(width / 720, height / 640)),
      );
    });
    resize.observe(panel);
    return () => resize.disconnect();
  }, []);

  // Only plays (illustration and timer) while the section is on screen.
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );
    io.observe(rootRef.current!);
    return () => io.disconnect();
  }, []);

  // The outgoing illustration keeps playing through its fade.
  useEffect(() => {
    if (previous === null) return;
    const timer = window.setTimeout(() => setPrevious(null), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [previous]);

  function go(index: number) {
    setPrevious(active === index ? null : active);
    setActive(index);
    setRound((r) => r + 1);
  }

  const paused = !visible || focused;

  return (
    <div
      ref={rootRef}
      data-paused={paused || undefined}
      onFocus={(e) => e.target.matches(":focus-visible") && setFocused(true)}
      onBlur={(e) =>
        !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)
      }
      className="steps mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 md:px-10 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:gap-20"
    >
      <div className="flex flex-1 flex-col gap-10 min-[1200px]:max-w-[540px] min-[1200px]:gap-12">
        <div className="flex flex-col gap-4">
          <h2
            id="how-title"
            className="text-heading text-3xl leading-9 font-semibold tracking-[-0.01em] md:text-4xl md:leading-10"
          >
            Set it up once, pay only when it works
          </h2>
          <p className="max-w-[432px] text-base tracking-[-0.01em] text-neutral-500">
            Tell creators what you want, approve the posts you like, and pay
            only for the views they bring in.
          </p>
        </div>

        <ol className="flex flex-col gap-4 sm:max-[800px]:flex-row sm:max-[800px]:gap-6">
          {steps.map((step, i) => {
            const isActive = i === active;
            return (
              <li
                key={step.title}
                className="group relative flex flex-1 cursor-pointer flex-col pb-4"
              >
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={isActive ? "step" : undefined}
                  aria-controls={`step-body-${i}`}
                  className={`-mx-2 cursor-pointer rounded-md px-2 py-0.5 text-left after:absolute after:inset-0 after:content-[''] text-xl leading-6 font-medium tracking-[-0.025em] transition-colors duration-[240ms] ease-(--ease-hover) ${
                    isActive
                      ? "text-neutral-800"
                      : "text-neutral-500 group-hover:text-neutral-800"
                  }`}
                >
                  {step.title}
                </button>
                {/* Every description stays rendered, so switching steps moves
                    nothing; the title colour and divider mark the active step. */}
                <p
                  id={`step-body-${i}`}
                  className="max-w-[432px] pt-2.5 text-sm leading-6 text-neutral-500"
                >
                  {step.body}
                </p>
                {/* Divider under the active step; fills over the step's time. */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0 h-px bg-black/10 transition-opacity duration-300 ease-(--ease-out) ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {isActive && (
                    <span
                      key={round}
                      className="step-progress absolute inset-0 origin-left bg-black/40"
                      style={{ animationDuration: `${STEP_MS}ms` }}
                      onAnimationEnd={() => go((i + 1) % steps.length)}
                    />
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div
        ref={panelRef}
        className="relative aspect-[560/480] w-full shrink-0 overflow-clip rounded-xl bg-[#f9e6e6] min-[1200px]:w-[560px]"
      >
        {illustrations?.map((html, i) => (
          <div
            key={i}
            dangerouslySetInnerHTML={{ __html: html }}
            data-playing={
              (visible && (i === active || i === previous)) || undefined
            }
            aria-hidden={i !== active}
            className={`steps-ill absolute inset-0 grid place-items-center transition-opacity ease-(--ease-out) ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDuration: `${FADE_MS}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
