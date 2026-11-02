// Runs the Brand hero's ghost fibers on an OffscreenCanvas, off the main thread.
import { serveRenderer } from "@/lib/canvas-worker";
import { createFibers } from "./ghost-fibers";

serveRenderer(createFibers);
