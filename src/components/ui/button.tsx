import type { ComponentProps } from "react";
import { Icon } from "@/components/ui/icon";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const base =
  "group relative isolate inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1 overflow-clip font-medium whitespace-nowrap " +
  "transition-[scale,color] duration-[160ms,240ms] ease-(--ease-out) active:scale-[0.97] motion-reduce:active:scale-100 " +
  // Hover tint lives on ::after so only its opacity animates; gradients can't transition.
  "after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-[280ms] after:ease-(--ease-hover) after:will-change-[opacity] hover:after:opacity-100";

const sizes: Record<Size, string> = {
  // 28px visual height; ::before extends the hit area to 40px.
  sm: "min-h-7 rounded-md px-2.5 text-[13px] leading-5 before:absolute before:-inset-y-1.5 before:inset-x-0",
  md: "min-h-10 rounded-xl px-3.5 text-sm",
};

const variants: Record<Variant, string> = {
  primary:
    "text-white bg-[linear-gradient(in_oklab_180deg,var(--color-clipstake-red-400),var(--color-clipstake-red-600))] " +
    "shadow-[#ffffff33_0_2px_0_inset,#0000001a_0_-1px_0_inset,#0000001a_0_1px_2px] outline-[0.5px] outline-hairline -outline-offset-[0.5px] " +
    "after:bg-[linear-gradient(in_oklab_180deg,var(--color-clipstake-red-500),var(--color-clipstake-red-700))] after:shadow-[#ffffff33_0_2px_0_inset]",
  secondary:
    "text-neutral-900 bg-[linear-gradient(in_oklab_180deg,#fff,var(--color-sand-200))] " +
    "shadow-[#16191d1f_0_-0.5px_0_inset,#16191d0a_0_1px_2px_-0.5px] outline-[0.5px] outline-hairline -outline-offset-[0.5px] " +
    "after:bg-[linear-gradient(in_oklab_180deg,var(--color-sand-100),var(--color-sand-300))]",
  ghost: "text-neutral-600 hover:text-neutral-900 after:hidden",
};

function Arrow() {
  return (
    <Icon
      name="arrow-right"
      className="transition-[translate] duration-[280ms] ease-(--ease-hover) group-hover:translate-x-[3px] motion-reduce:group-hover:translate-x-0"
    />
  );
}

type ButtonLinkProps = ComponentProps<"a"> & {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
};

// Every CTA on the page is a link: destinations aren't decided yet, so they
// default to "#" but still get the full hover, press and focus treatment.
export function ButtonLink({
  variant = "primary",
  size = "md",
  arrow = false,
  href = "#",
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      href={href}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="relative px-0.5">{children}</span>
      {arrow && <Arrow />}
    </a>
  );
}
