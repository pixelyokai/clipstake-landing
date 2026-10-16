// Starts the light cables for a canvas: in a worker on an OffscreenCanvas
// where supported, otherwise on the main thread. The host owns the
// ResizeObserver and forwards size changes.
import type { LightCablesHandle } from "./light-cables";
import type { LightCablesMessage } from "./light-cables.worker";

export function hostLightCables(
  canvas: HTMLCanvasElement,
  { animate, onReady }: { animate: boolean; onReady: () => void },
): LightCablesHandle {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const size = () => ({
    width: canvas.clientWidth,
    height: canvas.clientHeight,
  });
  let inner: LightCablesHandle | null = null;
  let destroyed = false;
  const queued: (() => void)[] = [];
  const run = (fn: () => void) => (inner ? fn() : queued.push(fn));

  if ("transferControlToOffscreen" in canvas && typeof Worker !== "undefined") {
    const worker = new Worker(
      new URL("./light-cables.worker.ts", import.meta.url),
      { type: "module" },
    );
    const send = (message: LightCablesMessage, transfer: Transferable[] = []) =>
      worker.postMessage(message, transfer);
    const offscreen = canvas.transferControlToOffscreen();
    send({ type: "init", canvas: offscreen, animate, dpr, ...size() }, [
      offscreen,
    ]);
    worker.onmessage = (event) => {
      if (event.data === "ready") onReady();
    };
    inner = {
      start: () => send({ type: "start" }),
      stop: () => send({ type: "stop" }),
      resize: (width, height) => send({ type: "resize", width, height }),
      destroy: () => send({ type: "destroy" }),
    };
  } else {
    import("./light-cables").then(({ createLightCables }) => {
      if (destroyed) return;
      inner = createLightCables(canvas, { animate, dpr, ...size() });
      if (!inner) return;
      onReady();
      queued.splice(0).forEach((fn) => fn());
    });
  }

  const observer = new ResizeObserver(() =>
    run(() => inner!.resize(canvas.clientWidth, canvas.clientHeight)),
  );
  observer.observe(canvas);

  return {
    start: () => run(() => inner!.start()),
    stop: () => run(() => inner!.stop()),
    resize: () => {},
    destroy: () => {
      destroyed = true;
      observer.disconnect();
      inner?.destroy();
    },
  };
}
