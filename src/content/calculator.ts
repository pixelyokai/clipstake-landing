// Reach calculator ranges. Assumed for now: change them here.
export const CALCULATOR = {
  budget: { min: 1_000, max: 100_000, step: 500, initial: 10_000 },
  cpm: { min: 0.5, max: 5, step: 0.05, initial: 1.5 },
} as const;

/** Verified views a budget buys at a given CPM (cost per 1,000 views). */
export const verifiedViews = (budget: number, cpm: number) => (budget / cpm) * 1000;

export const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export const formatBudget = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export const formatCpm = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(value);
