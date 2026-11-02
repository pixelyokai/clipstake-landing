import { Container } from "@/components/ui/container";

type Props = {
  id: string;
  title: string;
  body?: string;
  className?: string;
  /** Let the title run the full column (Paper's proof heading is one line). */
  wide?: boolean;
  /** Light text for dark bands. */
  light?: boolean;
};

// Paper's centred section heading: gradient h2 (36/44) over a muted 16px line.
export function SectionHeading({ id, title, body, className = "", wide = false, light = false }: Props) {
  return (
    <Container className={`flex flex-col items-center gap-3 text-center ${className}`}>
      <h2
        id={id}
        className={`${light ? "text-heading-light" : "text-heading"} ${wide ? "" : "max-w-[660px]"} text-3xl leading-9 font-semibold tracking-[-0.01em] text-balance md:text-4xl md:leading-11`}
      >
        {title}
      </h2>
      {body && <p className={`${wide ? "max-w-[720px]" : "max-w-[600px]"} text-base tracking-[-0.01em] ${light ? "text-neutral-400" : "text-neutral-500"}`}>{body}</p>}
    </Container>
  );
}
