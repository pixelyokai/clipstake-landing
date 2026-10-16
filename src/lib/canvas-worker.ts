// Runs a canvas renderer in a worker on an OffscreenCanvas where supported
// (its WebGL context, shader setup and draws then never block the main
// thread), or in-page otherwise. Renderers expose start/stop/resize/destroy
// plus any extra methods, which the host forwards by name.
//
// Main thread: hostRenderer(...)   Worker: serveRenderer(create)

export type Renderer = {
  start(): void;
  stop(): void;
  resize(width: number, height: number): void;
  destroy(): void;
};

type Create<O> = (
  canvas: HTMLCanvasElement | OffscreenCanvas,
  options: O & { width: number; height: number },
) => Renderer | null;

type Message<O> =
  | {
      type: "init";
      canvas: OffscreenCanvas;
      options: O & { width: number; height: number };
    }
  | { type: "call"; name: string; args: unknown[] };

export function hostRenderer<O extends object>(
  canvas: HTMLCanvasElement,
  {
    worker,
    local,
    options,
    onReady,
  }: {
    /** `() => new Worker(new URL("./x.worker.ts", import.meta.url), { type: "module" })` */
    worker: () => Worker;
    /** In-page fallback: resolves to the renderer's create function. */
    local: () => Promise<Create<O>>;
    options: O;
    onReady?: () => void;
  },
) {
  const size = () => ({
    width: canvas.clientWidth,
    height: canvas.clientHeight,
  });
  let call: ((name: string, args: unknown[]) => void) | null = null;
  let destroyed = false;
  const queued: [string, unknown[]][] = [];
  const invoke = (name: string, args: unknown[] = []) =>
    call ? call(name, args) : queued.push([name, args]);

  if ("transferControlToOffscreen" in canvas && typeof Worker !== "undefined") {
    const thread = worker();
    const offscreen = canvas.transferControlToOffscreen();
    const init: Message<O> = {
      type: "init",
      canvas: offscreen,
      options: { ...options, ...size() },
    };
    thread.postMessage(init, [offscreen]);
    thread.onmessage = (event) => {
      if (event.data === "ready") onReady?.();
    };
    call = (name, args) =>
      thread.postMessage({ type: "call", name, args } satisfies Message<O>);
  } else {
    local().then((create) => {
      if (destroyed) return;
      const renderer = create(canvas, { ...options, ...size() });
      if (!renderer) return;
      onReady?.();
      call = (name, args) =>
        (renderer as unknown as Record<string, (...a: unknown[]) => void>)[
          name
        ]?.(...args);
      queued.splice(0).forEach(([name, args]) => call!(name, args));
    });
  }

  const observer = new ResizeObserver(() =>
    invoke("resize", [canvas.clientWidth, canvas.clientHeight]),
  );
  observer.observe(canvas);

  return {
    start: () => invoke("start"),
    stop: () => invoke("stop"),
    /** Calls any other renderer method by name (arguments must be cloneable). */
    call: (name: string, ...args: unknown[]) => invoke(name, args),
    destroy: () => {
      destroyed = true;
      observer.disconnect();
      invoke("destroy");
    },
  };
}

/** Worker side: wires messages from hostRenderer to a renderer. */
export function serveRenderer<O>(create: Create<O>) {
  let renderer: Renderer | null = null;
  self.onmessage = (event: MessageEvent<Message<O>>) => {
    const message = event.data;
    if (message.type === "init") {
      renderer = create(message.canvas, message.options);
      self.postMessage(renderer ? "ready" : "failed");
      return;
    }
    (renderer as unknown as Record<string, (...a: unknown[]) => void> | null)?.[
      message.name
    ]?.(...message.args);
    if (message.name === "destroy") {
      renderer = null;
      self.close();
    }
  };
}
