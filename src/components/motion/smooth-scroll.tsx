"use client";

import { useEffect } from "react";
import { attachLenis } from "@/lib/scroll";

// Lenis smooth scrolling for mouse and trackpad. It loads once the page is
// idle after load (or on the first wheel, whichever comes first), so it stays
// out of the first-paint window but is ready before most people scroll.
// Touch-only devices keep native momentum and never download it; reduced
// motion keeps native scroll.
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(any-pointer: fine)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    let started = false;
    let idle = 0;

    const start = () => {
      if (started) return;
      started = true;
      window.removeEventListener("wheel", start);
      window.removeEventListener("load", onLoad);
      import("lenis").then(({ default: Lenis }) => {
        if (cancelled) return;
        const lenis = new Lenis({
          autoRaf: true,
          // Low lerp: each wheel tick eases in and glides to a stop.
          lerp: 0.085,
          // Nested scrollers (the code panel, card rows) scroll natively only
          // when they can move in the wheel's direction; otherwise the page
          // scrolls, so hovering them never traps the wheel.
          allowNestedScroll: true,
          // Offset in-page anchors so targets clear the floating navbar.
          anchors: { offset: -88 },
        });
        const detach = attachLenis(lenis);
        cleanup = () => {
          detach();
          lenis.destroy();
        };
      });
    };
    const onLoad = () => {
      idle =
        window.requestIdleCallback?.(start, { timeout: 2000 }) ??
        window.setTimeout(start, 500);
    };

    window.addEventListener("wheel", start, { passive: true });
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("wheel", start);
      window.removeEventListener("load", onLoad);
      window.cancelIdleCallback?.(idle);
      cleanup?.();
    };
  }, []);

  return null;
}
