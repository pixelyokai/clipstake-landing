// Runs the light cables on an OffscreenCanvas, off the main thread.
import { createLightCables, type LightCablesHandle } from "./light-cables";

export type LightCablesMessage =
  | {
      type: "init";
      canvas: OffscreenCanvas;
      animate: boolean;
      width: number;
      height: number;
      dpr: number;
    }
  | { type: "start" | "stop" | "destroy" }
  | { type: "resize"; width: number; height: number };

let handle: LightCablesHandle | null = null;

self.onmessage = (event: MessageEvent<LightCablesMessage>) => {
  const message = event.data;
  if (message.type === "init") {
    handle = createLightCables(message.canvas, message);
    self.postMessage(handle ? "ready" : "failed");
  } else if (message.type === "resize") {
    handle?.resize(message.width, message.height);
  } else if (message.type === "destroy") {
    handle?.destroy();
    handle = null;
    self.close();
  } else {
    handle?.[message.type]();
  }
};
