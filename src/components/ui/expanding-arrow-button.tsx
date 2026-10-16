import type { ComponentProps, CSSProperties } from "react";

// Expanding arrow button, in Clipstake red. CSS only: a light
// tile on the left holds one dotted chevron; on hover (or keyboard focus) the
// tile slides out across the button (clip-path, so nothing reflows) into a
// trail of dotted arrows while the label fades away. Styles: .xa-* in
// globals.css.

function Chevron({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width="10"
      height="16"
      viewBox="0 0 10 16"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <circle cx="2" cy="2" r="1.4" />
      <circle cx="5" cy="5" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="5" cy="11" r="1.4" />
      <circle cx="2" cy="14" r="1.4" />
    </svg>
  );
}

export function ExpandingArrowButton({
  href = "#",
  className = "",
  children,
  ...props
}: ComponentProps<"a">) {
  return (
    <a href={href} className={`xa ${className}`} {...props}>
      <span className="xa-label">{children}</span>
      <span aria-hidden="true" className="xa-tile">
        <Chevron className="xa-rest" />
        <span className="xa-trail">
          {[0.16, 0.32, 0.54, 0.78, 1].map((opacity, i) => (
            <Chevron
              key={i}
              className="xa-trail-arrow"
              // Lead arrow (right) arrives first; the fading tail follows.
              style={
                {
                  "--o": opacity,
                  "--d": `${40 + (4 - i) * 25}ms`,
                } as CSSProperties
              }
            />
          ))}
        </span>
      </span>
    </a>
  );
}
