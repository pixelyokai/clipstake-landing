import type Lenis from "lenis";

// The one scroll source for the page. Effects subscribe here instead of adding
// their own `scroll` listeners. Lenis drives it when smooth scrolling is on;
// otherwise a single passive, rAF-throttled listener does.

type Listener = (y: number) => void;

const listeners = new Set<Listener>();
let lenis: Lenis | null = null;
let nativeBound = false;
let frame = 0;

function emit(y: number) {
  for (const listener of listeners) listener(y);
}

function onNativeScroll() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    emit(window.scrollY);
  });
}

function bindNative() {
  if (nativeBound || lenis) return;
  nativeBound = true;
  window.addEventListener("scroll", onNativeScroll, { passive: true });
}

function unbindNative() {
  if (!nativeBound) return;
  nativeBound = false;
  window.removeEventListener("scroll", onNativeScroll);
}

export function attachLenis(instance: Lenis) {
  lenis = instance;
  unbindNative();
  const off = instance.on("scroll", (l: Lenis) => emit(l.scroll));
  return () => {
    off();
    lenis = null;
    if (listeners.size) bindNative();
  };
}

export function getLenis() {
  return lenis;
}

export function subscribeScroll(listener: Listener) {
  listeners.add(listener);
  bindNative();
  listener(lenis ? lenis.scroll : window.scrollY);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) unbindNative();
  };
}
