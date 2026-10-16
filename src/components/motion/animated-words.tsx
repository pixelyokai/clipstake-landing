import { Fragment } from "react";

// Splits text into words that blur in and rise, staggered, purely in CSS
// (see .hero-word in globals.css). The words keep real spaces between them,
// so the text reads and wraps exactly like the unsplit version.
export function AnimatedWords({ text }: { text: string }) {
  const words = text.split(" ");
  return words.map((word, i) => (
    <Fragment key={i}>
      <span className="hero-word" style={{ "--i": i } as React.CSSProperties}>
        {word}
      </span>
      {i < words.length - 1 && " "}
    </Fragment>
  ));
}
