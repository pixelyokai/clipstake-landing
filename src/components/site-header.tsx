"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { SmartLink } from "@/components/ui/smart-link";
import { NAV_LINKS } from "@/content/site";
import { subscribeScroll } from "@/lib/scroll";

// The current section: /case-studies/jackbit still marks "Customers".
function isActive(pathname: string, href: string) {
  return href !== "#" && (pathname === href || pathname.startsWith(`${href}/`));
}

// Hysteresis: become the pill past 80px, go back only under 40px.
const COMPACT_AT = 80;
const EXPAND_AT = 40;

function cssVar(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function insetWithin(outer: DOMRect, inner: DOMRect) {
  const top = inner.top - outer.top;
  const right = outer.right - inner.right;
  const bottom = outer.bottom - inner.bottom;
  const left = inner.left - outer.left;
  // Paper: 16px pill on desktop; phones keep 12px to match the dropdown.
  const radius = window.matchMedia("(max-width: 767px)").matches ? 12 : 16;
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
}

export function SiteHeader() {
  const frameRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const compactRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const frame = frameRef.current!;
    const bg = bgRef.current!;
    const nav = navRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const pieces = () =>
      Array.from(nav.querySelectorAll<HTMLElement>("[data-morph]"));

    function apply(next: boolean) {
      if (next === compactRef.current) return;
      compactRef.current = next;

      const els = pieces();
      const before = els.map((el) => el.getBoundingClientRect().left);
      const frameBox = frame.getBoundingClientRect();
      const bgFrom = insetWithin(frameBox, nav.getBoundingClientRect());

      nav.toggleAttribute("data-compact", next);

      const bgTo = insetWithin(frameBox, nav.getBoundingClientRect());
      bg.style.clipPath = bgTo;
      bg.style.opacity = next ? "1" : "0";

      if (reduce.matches) return;

      // FLIP: every piece slides from where it was; only transforms animate.
      const timing = { duration: 657, easing: cssVar("--ease-spring") };
      els.forEach((el, i) => {
        const dx = before[i] - el.getBoundingClientRect().left;
        if (Math.abs(dx) < 0.5) return;
        el.animate(
          [{ transform: `translateX(${dx}px)` }, { transform: "none" }],
          timing,
        );
      });
      bg.animate(
        [
          { clipPath: bgFrom, opacity: next ? 0 : 1 },
          { clipPath: bgTo, opacity: next ? 1 : 0 },
        ],
        {
          ...timing,
          easing: next ? timing.easing : cssVar("--ease-out"),
          duration: next ? 657 : 300,
        },
      );
    }

    const unsubscribe = subscribeScroll((y) => {
      if (!compactRef.current && y > COMPACT_AT) apply(true);
      else if (compactRef.current && y < EXPAND_AT) apply(false);
    });

    // Keep the pill's clip in sync if the viewport changes width.
    const resize = new ResizeObserver(() => {
      if (!compactRef.current) return;
      bg.style.clipPath = insetWithin(
        frame.getBoundingClientRect(),
        nav.getBoundingClientRect(),
      );
    });
    resize.observe(frame);

    return () => {
      unsubscribe();
      resize.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-center px-4 md:px-10">
      <div
        ref={frameRef}
        className="pointer-events-auto relative w-full max-w-[1200px]"
      >
        {/* Pill surface. drop-shadow sits on the wrapper so it follows the clip. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 [filter:drop-shadow(0_0_0.5px_#00000045)]"
        >
          <div
            ref={bgRef}
            className="absolute inset-0 bg-[linear-gradient(in_oklab_180deg,var(--color-sand-50),var(--color-sand-100))]"
            style={{ opacity: 0 }}
          />
        </div>

        <nav
          ref={navRef}
          aria-label="Main"
          className="group/nav relative flex items-center justify-between gap-3 p-2.5 data-compact:mx-auto md:pl-3 md:data-compact:w-fit"
        >
          <Link
            href="/"
            data-morph
            aria-label="Clipstake home"
            className="shrink-0 rounded-sm"
          >
            <img src="/brand/logo.webp" alt="" width={115} height={24} />
          </Link>

          <NavLinks pathname={pathname} />

          <div
            data-morph
            className="flex items-center gap-1 group-data-compact/nav:-ml-1"
          >
            <ButtonLink
              size="sm"
              className="max-md:min-h-9 max-md:rounded-lg max-md:px-3.5 max-md:text-sm md:rounded-[10px] md:py-1.5"
            >
              Get started
            </ButtonLink>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
              data-open={menuOpen || undefined}
              className="burger relative grid size-9 place-items-center rounded-lg text-neutral-700 transition-[scale,background-color] duration-[240ms] ease-(--ease-hover) before:absolute before:-inset-1 hover:bg-black/5 active:scale-[0.97] md:hidden"
            >
              {/* Two bars that slide to the middle and rotate into a cross. */}
              <span aria-hidden="true" className="burger-bar" />
              <span aria-hidden="true" className="burger-bar" />
            </button>
          </div>
        </nav>

        <div
          id="mobile-menu"
          data-open={menuOpen || undefined}
          inert={!menuOpen}
          className="surface-card invisible absolute inset-x-0 top-full mt-2 origin-top scale-[0.98] -translate-y-1 rounded-xl p-2 opacity-0 transition-[opacity,scale,translate,visibility] duration-200 ease-(--ease-out) data-open:visible data-open:translate-y-0 data-open:scale-100 data-open:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 md:hidden"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <SmartLink
                  href={href}
                  aria-current={isActive(pathname, href) ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 items-center rounded-lg px-3 text-[15px] font-medium text-neutral-700 hover:bg-black/5 aria-[current=page]:bg-sand-100 aria-[current=page]:text-[#303030]"
                >
                  {label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}

// Links share one hover chip that glides between them by animating clip-path
// on a single element, so there's no layout work per hover.
function NavLinks({ pathname }: { pathname: string }) {
  const groupRef = useRef<HTMLUListElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);

  function moveChip(target: HTMLElement | null) {
    const chip = chipRef.current;
    // pointerleave can fire after a route change has unmounted the list.
    if (!chip) return;
    if (!target) {
      chip.style.opacity = "0";
      return;
    }
    // Same 6px corners as the current-page chip (rounded-md).
    const clip = insetWithin(
      groupRef.current!.getBoundingClientRect(),
      target.getBoundingClientRect(),
    ).replace(/round \d+px/, "round 6px");
    if (chip.style.opacity !== "1") {
      // Arriving from outside: place it without gliding, then fade in.
      chip.style.transition = "none";
      chip.style.clipPath = clip;
      void chip.offsetWidth;
      chip.style.transition = "";
      chip.style.opacity = "1";
    } else {
      chip.style.clipPath = clip;
    }
  }

  return (
    <ul
      ref={groupRef}
      data-morph
      onPointerLeave={() => moveChip(null)}
      className="relative hidden items-center gap-1 md:flex"
    >
      <span
        ref={chipRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/[0.05] opacity-0 transition-[opacity,clip-path] duration-[260ms] ease-(--ease-hover)"
      />
      {NAV_LINKS.map(({ label, href }) => (
        <li key={label}>
          {/* Paper marks the current page with a sand chip and full-strength text. */}
          <SmartLink
            href={href}
            aria-current={isActive(pathname, href) ? "page" : undefined}
            onPointerEnter={(e) =>
              e.pointerType === "mouse" && moveChip(e.currentTarget)
            }
            className="relative flex min-h-7 items-center rounded-md px-2.5 text-[13px] leading-5 font-medium text-[#303030a3] transition-colors duration-[240ms] ease-(--ease-hover) hover:text-neutral-900 aria-[current=page]:bg-sand-100 aria-[current=page]:text-[#303030]"
          >
            {label}
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}
