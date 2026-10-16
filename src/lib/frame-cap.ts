// Continuous canvas/JS animations don't need more than ~60-72fps, but rAF runs
// at the display's refresh rate (120-180Hz on many screens), which multiplies
// their cost. Loops skip a rAF tick until at least this long has passed:
// 60Hz renders every frame, 120Hz every 2nd (60fps), 144Hz every 2nd (72fps),
// 180Hz every 3rd (60fps).
export const MIN_FRAME_MS = 13;

/**
 * Runs `draw(dtSeconds)` at up to `fps`. In a worker (OffscreenCanvas) it uses
 * a timer, so frames are only presented when something was drawn: skipping
 * rAF ticks there let the browser show un-drawn (blank) frames, a flicker. In
 * a page it uses rAF and skips ticks. Returns a stop function.
 */
export function startLoop(fps: number, draw: (dt: number) => void): () => void {
  const interval = 1000 / fps;
  let last = 0;
  let stopped = false;
  let id = 0;
  if (typeof document === "undefined") {
    const step = () => {
      if (stopped) return;
      const now = performance.now();
      draw(last ? Math.min(now - last, 100) / 1000 : 0);
      last = now;
      id = self.setTimeout(
        step,
        Math.max(0, interval - (performance.now() - now)),
      );
    };
    step();
    return () => {
      stopped = true;
      self.clearTimeout(id);
    };
  }
  const tick = (now: number) => {
    if (stopped) return;
    id = requestAnimationFrame(tick);
    if (last && now - last < interval - 1) return;
    draw(last ? Math.min(now - last, 100) / 1000 : 0);
    last = now;
  };
  id = requestAnimationFrame(tick);
  return () => {
    stopped = true;
    cancelAnimationFrame(id);
  };
}
