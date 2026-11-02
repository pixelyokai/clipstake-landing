import Link from "next/link";
import type { ComponentProps } from "react";

// Internal routes get next/link (prefetch + client navigation); placeholder
// "#" links and anything external stay plain anchors.
export function SmartLink({ href = "#", ...props }: ComponentProps<"a">) {
  if (href.startsWith("/")) return <Link href={href} {...props} />;
  return <a href={href} {...props} />;
}
