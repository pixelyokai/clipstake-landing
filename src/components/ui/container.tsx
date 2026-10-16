import type { ComponentProps } from "react";

// 1200px content column with Paper's gutters (16px on phones, 40px from md up).
export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-[1280px] px-4 md:px-10 ${className}`} {...props} />;
}
