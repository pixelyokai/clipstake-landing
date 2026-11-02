// Runs the CTA panels' prism on an OffscreenCanvas, off the main thread.
import { serveRenderer } from "@/lib/canvas-worker";
import { createPrism } from "./prism";

serveRenderer(createPrism);
