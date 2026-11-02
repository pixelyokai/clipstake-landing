import { Averia_Serif_Libre } from "next/font/google";

// Yungblud's wordmark is set in type until there's a logo file. Only used
// below the fold, so no preload.
export const averia = Averia_Serif_Libre({ weight: "700", subsets: ["latin"], display: "swap", preload: false });
