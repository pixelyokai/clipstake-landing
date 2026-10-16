// Starts the ASCII background for a canvas: in a worker on an OffscreenCanvas
// where supported, otherwise on the main thread. Both expose the same handle;
// the host owns the ResizeObserver and forwards size changes.
import type { AsciiBgHandle } from "./ascii-bg";
import type { AsciiBgMessage } from "./ascii-bg.worker";

export function hostAsciiBg(
  canvas: HTMLCanvasElement,
  { animate, onReady }: { animate: boolean; onReady: () => void },
): AsciiBgHandle {
  const size = () => ({
    width: canvas.clientWidth,
    height: canvas.clientHeight,
  });
  let inner: AsciiBgHandle | null = null;
  let destroyed = false;
  const queued: (() => void)[] = [];
  const run = (fn: () => void) => (inner ? fn() : queued.push(fn));

  if ("transferControlToOffscreen" in canvas && typeof Worker !== "undefined") {
    const worker = new Worker(
      new URL("./ascii-bg.worker.ts", import.meta.url),
      { type: "module" },
    );
    const send = (message: AsciiBgMessage, transfer: Transferable[] = []) =>
      worker.postMessage(message, transfer);
    const offscreen = canvas.transferControlToOffscreen();
    send({ type: "init", canvas: offscreen, animate, ...size() }, [offscreen]);
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
    import("./ascii-bg").then(({ createAsciiBg }) => {
      if (destroyed) return;
      inner = createAsciiBg(canvas, { animate, ...size() });
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
