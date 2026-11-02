"use client";

import { useEffect, useRef } from "react";
import { observeVideo } from "@/lib/video-autoplay";

// One 9:16 creator clip from /media/clips: muted loop that plays while in
// view. Nothing downloads until it's near (poster) or visible (video).
export function ClipVideo({ id, className = "" }: { id: number; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => observeVideo(ref.current!), []);
  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      data-poster={`/media/clips/${id}.avif`}
      aria-hidden="true"
      className={`aspect-[9/16] w-full rounded-xl bg-neutral-900 object-cover ${className}`}
    >
      <source src={`/media/clips/${id}.webm`} type='video/webm; codecs="av01.0.05M.08"' />
      <source src={`/media/clips/${id}.mp4`} type="video/mp4" />
    </video>
  );
}
