// Runs the COBE globe on an OffscreenCanvas, so creating its WebGL context,
// building its shaders and drawing every frame stay off the main thread.
import "./cobe-worker-shims";
import createGlobe from "cobe";

export type GlobeMessage =
  | {
      type: "init";
      canvas: OffscreenCanvas;
      options: Parameters<typeof createGlobe>[1];
    }
  | { type: "update"; state: Record<string, unknown> }
  | { type: "destroy" };

let globe: ReturnType<typeof createGlobe> | null = null;

self.onmessage = (event: MessageEvent<GlobeMessage>) => {
  const message = event.data;
  if (message.type === "init") {
    globe = createGlobe(
      message.canvas as unknown as HTMLCanvasElement,
      message.options,
    );
    self.postMessage("ready");
  } else if (message.type === "update") {
    globe?.update(message.state);
  } else {
    globe?.destroy();
    globe = null;
    self.close();
  }
};
