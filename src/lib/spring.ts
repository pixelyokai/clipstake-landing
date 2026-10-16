// A minimal damped spring driven by rAF, for values that must chase a moving
// target (a slider thumb) without a motion library. Configs use the same
// stiffness / damping / mass terms as motion's springs.

export type SpringConfig = { stiffness: number; damping: number; mass: number };

export function createSpring(initial: number, config: SpringConfig, onUpdate: (value: number) => void) {
  let value = initial;
  let velocity = 0;
  let target = initial;
  let frame = 0;
  let last = 0;

  const step = (now: number) => {
    let remaining = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    // Fixed small substeps keep stiff springs stable at any frame rate.
    while (remaining > 0) {
      const h = Math.min(remaining, 1 / 240);
      const force = -config.stiffness * (value - target) - config.damping * velocity;
      velocity += (force / config.mass) * h;
      value += velocity * h;
      remaining -= h;
    }
    if (Math.abs(value - target) < 0.0005 && Math.abs(velocity) < 0.005) {
      value = target;
      velocity = 0;
      frame = 0;
      onUpdate(value);
      return;
    }
    onUpdate(value);
    frame = requestAnimationFrame(step);
  };

  return {
    set(next: number) {
      target = next;
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(step);
      }
    },
    jump(next: number) {
      cancelAnimationFrame(frame);
      frame = 0;
      value = target = next;
      velocity = 0;
      onUpdate(value);
    },
    stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}
