import { SectionHeading } from "@/components/ui/section-heading";
import { Container } from "@/components/ui/container";

// The 24px stroke icons from the Paper file, path data copied verbatim.
const ICONS = {
  coin: (
    <>
      <path d="M21 12C21 16.971 16.971 21 12 21C7.029 21 3 16.971 3 12C3 7.029 7.029 3 12 3C16.971 3 21 7.029 21 12Z" />
      <path d="M12 7.5V6.5M12 16.5V17.5M14 9C13 7 9.5 7.552 9.5 9.778C9.5 12.674 14.5 11.313 14.5 14.146C14.5 16.391 10.5 17 9.5 15" />
    </>
  ),
  banknote: (
    <>
      <path d="M2 18V6C2 5.448 2.448 5 3 5H21C21.552 5 22 5.448 22 6V18C22 18.552 21.552 19 21 19H3C2.448 19 2 18.552 2 18Z" />
      <path d="M5 8H6" />
      <path d="M18 16H19" />
      <path d="M14 12C14 13.105 13.105 14 12 14C10.895 14 10 13.105 10 12C10 10.895 10.895 10 12 10C13.105 10 14 10.895 14 12Z" />
    </>
  ),
  eye: (
    <>
      <path d="M15 12C15 13.657 13.657 15 12 15C10.343 15 9 13.657 9 12C9 10.343 10.343 9 12 9C13.657 9 15 10.343 15 12Z" />
      <path d="M2.246 11.54C7.088 2.82 16.912 2.82 21.754 11.54C21.911 11.824 21.911 12.176 21.754 12.46C16.912 21.18 7.088 21.18 2.246 12.46C2.089 12.176 2.089 11.824 2.246 11.54Z" />
    </>
  ),
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.875L10.625 15.5L15 9" />
    </>
  ),
  users: (
    <>
      <path d="M10.999 7C10.999 8.657 9.656 10 7.999 10C6.342 10 4.999 8.657 4.999 7C4.999 5.343 6.342 4 7.999 4C9.656 4 10.999 5.343 10.999 7Z" />
      <path d="M19.499 7.5C19.499 8.881 18.38 10 16.999 10C15.619 10 14.499 8.881 14.499 7.5C14.499 6.119 15.619 5 16.999 5C18.38 5 19.499 6.119 19.499 7.5Z" />
      <path d="M3.073 20H12.927C13.507 20 13.97 19.502 13.875 18.93C12.564 11.023 3.436 11.023 2.125 18.93C2.03 19.502 2.493 20 3.073 20Z" />
      <path d="M17.999 19H21.072C21.652 19 22.116 18.505 22.012 17.934C21.318 14.143 18.497 12.537 15.999 13.115" />
    </>
  ),
  wallet: (
    <>
      <path
        d="M4 6.5V17C4 18.657 5.343 20 7 20H19C19.552 20 20 19.552 20 19V10C20 9.448 19.552 9 19 9H16M4 6.5C4 7.881 5.119 9 6.5 9H16M4 6.5C4 5.119 5.119 4 6.5 4H15.25C15.664 4 16 4.336 16 4.75V9"
        strokeLinecap="square"
      />
      <circle cx="15.5" cy="14.5" r="0.75" fill="currentColor" strokeWidth="1" />
    </>
  ),
} as const;

export type FeatureIconName = keyof typeof ICONS;
type Feature = { icon: string; title: string; body: string };

type Props = {
  id: string;
  title: string;
  body: string;
  items: readonly Feature[];
  /** Brand's two rows sit on wider cell padding than Creator's single row. */
  roomy?: boolean;
  children?: React.ReactNode;
};

// Paper's feature cells: an embossed icon tile, a title and a muted line, split
// by hairlines (vertical between columns, horizontal between rows).
export function FeatureGrid({ id, title, body, items, roomy = false, children }: Props) {
  return (
    <section aria-labelledby={id} className="defer-render pt-16 pb-10">
      <SectionHeading id={id} title={title} body={body} className="pb-10" />
      <Container className="flex flex-col items-center gap-6">
        <ul className="grid w-full md:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.title}
              className={`flex flex-col items-start gap-6 border-black/[0.08] py-6 [filter:drop-shadow(#4040400f_0_1px_0.5px)_drop-shadow(#40404008_0_2px_1px)] max-md:border-b max-md:px-2 max-md:last:border-b-0 md:[&:not(:nth-child(3n))]:border-r md:[&:nth-child(-n+3):nth-last-child(n+4)]:border-b md:[&:nth-child(-n+3):nth-last-child(n+4)]:border-b-black/10 ${
                roomy ? "md:px-6 lg:px-10" : "md:px-6 lg:px-8"
              }`}
            >
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-lg bg-[linear-gradient(in_oklab_180deg,#ededed,#00000005)] text-sand-800 shadow-[#ffffff33_0_10px_25px_inset,#00000033_0_-1px_1px_inset]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ICONS[item.icon as FeatureIconName]}
                </svg>
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-medium text-neutral-950">{item.title}</h3>
                <p className="text-sm tracking-[-0.005em] text-[#626262]">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
        {children}
      </Container>
    </section>
  );
}
