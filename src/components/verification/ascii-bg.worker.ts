// Runs the verification ASCII background on an OffscreenCanvas, off the main
// thread (its WebGL context and shader setup would otherwise block scrolling).
import { createAsciiBg, type AsciiBgHandle } from "./ascii-bg";

export type AsciiBgMessage =
  | {
      type: "init";
      canvas: OffscreenCanvas;
      animate: boolean;
      width: number;
      height: number;
    }
  | { type: "start" | "stop" | "destroy" }
  | { type: "resize"; width: number; height: number };

let handle: AsciiBgHandle | null = null;

self.onmessage = (event: MessageEvent<AsciiBgMessage>) => {
  const message = event.data;
  if (message.type === "init") {
    handle = createAsciiBg(message.canvas, message);
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
