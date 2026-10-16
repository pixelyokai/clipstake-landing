// Runs a section's canvases only while the section crosses the middle band of
// the viewport (the middle 30%). Two adjacent sections can't both be in that
// band, so at most one section's canvases animate at a time; with at most two
// canvases per section, that keeps the page under two live canvases.
// Also pauses when the tab is hidden.
export function observeActiveBand(el: Element, onChange: (active: boolean) => void) {
  let inBand = false;
  const emit = () => onChange(inBand && !document.hidden);
  const io = new IntersectionObserver(
    ([entry]) => {
      inBand = entry.isIntersecting;
      emit();
    },
    { rootMargin: "-35% 0px -35% 0px" },
  );
  io.observe(el);
  document.addEventListener("visibilitychange", emit);
  return () => {
    io.disconnect();
    document.removeEventListener("visibilitychange", emit);
  };
}
