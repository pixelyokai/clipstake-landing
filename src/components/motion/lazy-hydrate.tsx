"use client";

import { type ComponentType, lazy, Suspense, useEffect, useRef } from "react";

// Code-split and hydrate a client component only when it nears the viewport.
// The server renders it normally (full HTML, readable without JS). On the
// client its chunk isn't requested until the wrapper is within `rootMargin`
// (or the visitor points at / focuses inside it); until then React leaves the
// server HTML in place, since a suspended lazy boundary simply isn't hydrated yet.
export function lazyHydrate<P extends object>(
  load: () => Promise<ComponentType<P>>,
  rootMargin = "400px 0px",
) {
  let start: () => void = () => {};
  const started = new Promise<void>((resolve) => (start = resolve));

  const Lazy = lazy(async () => {
    if (typeof window !== "undefined") await started;
    return { default: await load() };
  });

  function Deferred(props: P) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const wrapper = ref.current!;
      // display:contents has no box, so watch the server-rendered root instead.
      const target = (wrapper.firstElementChild as HTMLElement | null) ?? wrapper;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) start();
        },
        { rootMargin },
      );
      io.observe(target);
      wrapper.addEventListener("pointerdown", start, { capture: true, once: true });
      wrapper.addEventListener("focusin", start, { capture: true, once: true });
      started.then(() => io.disconnect());
      return () => io.disconnect();
    }, []);

    return (
      <div ref={ref} className="contents">
        <Suspense fallback={null}>
          <Lazy {...props} />
        </Suspense>
      </div>
    );
  }

  return Deferred;
}
