"use client";

import { HeroBackdrop } from "./hero-backdrop";

const worker = () => new Worker(new URL("./ghost-fibers.worker.ts", import.meta.url), { type: "module" });
const local = () => import("./ghost-fibers").then((m) => m.createFibers);

// Brand hero backdrop: the ghost fibers drifting through the middle of the hero.
export function GhostFibersLayer() {
  return <HeroBackdrop worker={worker} local={local} />;
}
