"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { holdVideo, observeVideo } from "@/lib/video-autoplay";

type Props = { title: string; video: string; description: string };

// Front: the campaign video, autoplaying while in view. Back: title,
// description and a "Show case studies" link. The whole card is a toggle
// button; the link sits outside the button (interactive elements can't nest)
// and is only reachable while the back is showing.
export function FlipCard({ title, video, description }: Props) {
  const [flipped, setFlipped] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Reduced motion: poster only, no autoplay.
    const autoplay = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return observeVideo(videoRef.current!, { autoplay });
  }, []);

  useEffect(() => {
    holdVideo(videoRef.current!, flipped);
  }, [flipped]);


  return (
    <div data-flipped={flipped || undefined} className="group/card relative h-full">
      <div className="relative size-full [perspective:1200px]">
        <div className="flip-face flip-front surface-card absolute inset-0 overflow-clip rounded-lg">
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            data-poster={`/media/cards/${video}.avif`}
            aria-hidden="true"
            className="absolute inset-0 size-full bg-neutral-200 object-cover"
          >
            <source src={`/media/cards/${video}.webm`} type='video/webm; codecs="av01.0.05M.08"' />
            <source src={`/media/cards/${video}.mp4`} type="video/mp4" />
          </video>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/65 to-transparent p-6 pt-20">
            <h3 className="text-xl leading-6 font-medium tracking-[-0.01em] text-white">{title}</h3>
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/20 text-white transition-[background-color,scale] duration-[240ms] ease-(--ease-hover) group-hover/card:scale-110 group-hover/card:bg-white/30 motion-reduce:group-hover/card:scale-100">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>

        <div className="flip-face flip-back surface-card absolute inset-0 flex flex-col gap-3 rounded-lg p-6">
          <h3 className="text-xl leading-6 font-semibold tracking-[-0.01em] text-clipstake-red-600">{title}</h3>
          <p className="text-base leading-6 text-neutral-600">{description}</p>
        </div>
      </div>

      <button
        type="button"
        aria-pressed={flipped}
        aria-label={`${title}: ${flipped ? "show video" : "show details"}`}
        onClick={() => setFlipped((f) => !f)}
        className="absolute inset-0 cursor-pointer rounded-lg transition-[scale] duration-150 ease-(--ease-out) active:scale-[0.99]"
      />

      <Link
        href="/case-studies"
        inert={!flipped}
        className="flip-link group absolute bottom-6 left-6 inline-flex min-h-10 items-center gap-1 overflow-clip rounded-xl bg-[linear-gradient(in_oklab_180deg,var(--color-clipstake-red-400),var(--color-clipstake-red-600))] px-3.5 text-sm font-medium text-white shadow-[#ffffff33_0_2px_0_inset,#0000001a_0_-1px_0_inset,#0000001a_0_1px_2px] transition-[scale,opacity,translate] ease-(--ease-out) active:scale-[0.97]"
      >
        Show case studies
        <Icon
          name="arrow-right"
          className="transition-[translate] duration-[280ms] ease-(--ease-hover) group-hover:translate-x-[3px]"
        />
      </Link>
    </div>
  );
}
