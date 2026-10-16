// Runs the calculator's side rays on an OffscreenCanvas, off the main thread.
import { serveRenderer } from "@/lib/canvas-worker";
import { createRays } from "./side-rays";

serveRenderer(createRays);
