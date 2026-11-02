import Link from "next/link";
import { FooterAscii } from "@/components/footer/footer-ascii";
import { SmartLink } from "@/components/ui/smart-link";
import { FOOTER_COLUMNS } from "@/content/site";

const SOCIALS = [
  {
    label: "X",
    viewBox: "0 0 14.38 13",
    d: "M11.327 0.000C11.327 0.000 13.532 0.000 13.532 0.000C13.532 0.000 8.714 5.507 8.714 5.507C8.714 5.507 14.382 13.000 14.382 13.000C14.382 13.000 9.944 13.000 9.944 13.000C9.944 13.000 6.468 8.455 6.468 8.455C6.468 8.455 2.491 13.000 2.491 13.000C2.491 13.000 0.284 13.000 0.284 13.000C0.284 13.000 5.437 7.110 5.437 7.110C5.437 7.110 0.000 0.000 0.000 0.000C0.000 0.000 4.551 0.000 4.551 0.000C4.551 0.000 7.693 4.154 7.693 4.154C7.693 4.154 11.327 0.000 11.327 0.000ZM10.553 11.680C10.553 11.680 11.775 11.680 11.775 11.680C11.775 11.680 3.887 1.251 3.887 1.251C3.887 1.251 2.575 1.251 2.575 1.251C2.575 1.251 10.553 11.680 10.553 11.680Z",
  },
  {
    label: "GitHub",
    viewBox: "0 0 13.33 13",
    d: "M6.667 0.000C2.983 0.000 0.000 2.983 0.000 6.667C0.000 9.617 1.908 12.108 4.558 12.992C4.892 13.050 5.017 12.850 5.017 12.675C5.017 12.517 5.008 11.992 5.008 11.433C3.333 11.742 2.900 11.025 2.767 10.650C2.692 10.458 2.367 9.867 2.083 9.708C1.850 9.583 1.517 9.275 2.075 9.267C2.600 9.258 2.975 9.750 3.100 9.950C3.700 10.958 4.658 10.675 5.042 10.500C5.100 10.067 5.275 9.775 5.467 9.608C3.983 9.442 2.433 8.867 2.433 6.317C2.433 5.592 2.692 4.992 3.117 4.525C3.050 4.358 2.817 3.675 3.183 2.758C3.183 2.758 3.742 2.583 5.017 3.442C5.550 3.292 6.117 3.217 6.683 3.217C7.250 3.217 7.817 3.292 8.350 3.442C9.625 2.575 10.183 2.758 10.183 2.758C10.550 3.675 10.317 4.358 10.250 4.525C10.675 4.992 10.933 5.583 10.933 6.317C10.933 8.875 9.375 9.442 7.892 9.608C8.133 9.817 8.342 10.217 8.342 10.842C8.342 11.733 8.333 12.450 8.333 12.675C8.333 12.850 8.458 13.058 8.792 12.992C11.505 12.076 13.333 9.531 13.333 6.667C13.333 2.983 10.350 0.000 6.667 0.000Z",
  },
  {
    label: "YouTube",
    viewBox: "0 0 13.33 10.67",
    d: "M6.829 0.000C7.185 0.002 8.076 0.011 9.023 0.048C9.023 0.048 9.358 0.063 9.358 0.063C10.311 0.108 11.264 0.185 11.736 0.317C12.366 0.494 12.861 1.010 13.028 1.665C13.295 2.704 13.328 4.733 13.332 5.224C13.332 5.224 13.333 5.326 13.333 5.326C13.333 5.326 13.333 5.333 13.333 5.333C13.333 5.333 13.333 5.335 13.333 5.340C13.333 5.340 13.332 5.442 13.332 5.442C13.328 5.933 13.295 7.961 13.028 9.001C12.859 9.658 12.363 10.174 11.736 10.349C11.264 10.480 10.311 10.557 9.358 10.602C9.358 10.602 9.023 10.617 9.023 10.617C8.076 10.655 7.185 10.664 6.829 10.666C6.829 10.666 6.673 10.666 6.673 10.666C6.673 10.666 6.666 10.666 6.666 10.666C6.666 10.666 6.664 10.666 6.659 10.666C6.659 10.666 6.503 10.666 6.503 10.666C5.749 10.661 2.598 10.627 1.596 10.349C0.966 10.172 0.471 9.655 0.304 9.001C0.037 7.961 0.004 5.933 0.000 5.442C0.000 5.442 0.000 5.224 0.000 5.224C0.004 4.733 0.037 2.704 0.304 1.665C0.474 1.008 0.969 0.492 1.596 0.317C2.598 0.038 5.749 0.004 6.503 0.000C6.503 0.000 6.829 0.000 6.829 0.000ZM5.333 2.999C5.333 2.999 5.333 7.666 5.333 7.666C5.333 7.666 9.333 5.333 9.333 5.333C9.333 5.333 5.333 2.999 5.333 2.999Z",
  },
  {
    label: "Threads",
    viewBox: "0 0 12.18 14.12",
    d: "M6.182 0.000C6.182 0.000 6.181 0.000 6.181 0.000C4.120 0.014 2.527 0.709 1.456 2.070C0.504 3.280 0.016 4.969 0.000 7.064C0.000 7.064 0.000 7.065 0.000 7.065C0.016 9.160 0.504 10.840 1.456 12.050C2.527 13.411 4.128 14.106 6.190 14.120C6.190 14.120 6.190 14.120 6.190 14.120C8.023 14.107 9.322 13.627 10.392 12.557C11.795 11.155 11.754 9.396 11.290 8.315C10.937 7.493 10.240 6.834 9.307 6.425C9.186 4.436 8.066 3.274 6.226 3.263C5.139 3.256 4.159 3.742 3.558 4.654C3.558 4.654 4.661 5.411 4.661 5.411C5.017 4.872 5.579 4.612 6.218 4.618C7.143 4.624 7.751 5.134 7.921 6.029C7.407 5.949 6.853 5.925 6.265 5.959C4.506 6.060 3.353 7.101 3.430 8.543C3.510 10.051 4.971 10.872 6.358 10.797C8.020 10.705 9.007 9.479 9.241 7.916C9.626 8.165 9.910 8.483 10.071 8.858C10.364 9.541 10.382 10.669 9.460 11.590C8.649 12.400 7.674 12.754 6.186 12.765C4.536 12.752 3.298 12.224 2.494 11.202C1.740 10.243 1.346 8.852 1.331 7.060C1.346 5.268 1.740 3.877 2.494 2.918C3.298 1.896 4.536 1.368 6.186 1.355C7.848 1.368 9.108 1.899 9.943 2.926C10.404 3.493 10.693 4.170 10.885 4.869C10.885 4.869 12.178 4.524 12.178 4.524C11.936 3.633 11.554 2.782 10.969 2.062C9.866 0.706 8.248 0.014 6.182 0.000ZM6.340 7.312C6.929 7.278 7.476 7.315 7.961 7.416C7.867 8.468 7.432 9.380 6.287 9.443C5.545 9.485 4.795 9.154 4.759 8.469C4.732 7.960 5.108 7.383 6.340 7.312Z",
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer relative isolate overflow-clip bg-clipstake-red-700 text-white">
      {/* ASCII field with the 3D wordmark; the field fades out before the links. */}
      <FooterAscii />
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col px-4 pt-16 md:px-10 md:pt-20">
        <div className="flex flex-col gap-10 pb-10 md:flex-row md:gap-6">
          <div className="flex shrink-0 flex-col justify-between gap-6 md:w-[320px]">
            <Link href="/" aria-label="Clipstake home" className="w-fit rounded-sm">
              <img loading="lazy" decoding="async" src="/brand/logo-footer.webp" alt="" width={160} height={34} />
            </Link>
            <ul className="flex items-center gap-2">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href="#"
                    aria-label={social.label}
                    className="grid size-8 place-items-center rounded-md transition-[background-color,scale] duration-[240ms] ease-(--ease-hover) hover:bg-white/10 active:scale-[0.97]"
                  >
                    <svg viewBox={social.viewBox} className="size-[13px]" aria-hidden="true">
                      <path d={social.d} fill="currentColor" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer" className="grid flex-1 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col gap-3 text-sm">
                <h2 className="font-medium text-neutral-50">{column.title}</h2>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <SmartLink
                        href={link.href}
                        className="rounded-sm text-neutral-300 transition-colors duration-[240ms] ease-(--ease-hover) hover:text-white"
                      >
                        {link.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] leading-5 text-white/60">All Rights Reserved © 2026</p>
          <ul className="flex gap-4">
            {["Privacy Policy", "Terms of service"].map((label) => (
              <li key={label}>
                <a
                  href="#"
                  className="rounded-sm text-white/60 transition-colors duration-[240ms] ease-(--ease-hover) hover:text-white"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Engraved wordmark from Paper: the no-JS fallback and the layout box
            the ASCII wordmark is drawn over. Room below for descenders and
            the extrusion, so nothing is clipped. */}
        <p
          aria-hidden="true"
          data-wordmark
          className="pointer-events-none pt-4 pb-14 text-center text-[clamp(72px,19.5vw,280px)] leading-none font-semibold tracking-[-0.01em] text-transparent [background-image:linear-gradient(in_oklab_180deg,oklab(29.1%_0.101_0.052),oklab(100%_0_0/0%))] bg-clip-text transition-opacity duration-700 ease-(--ease-out) select-none md:pb-24 [[data-ascii-ready]_&]:opacity-0"
        >
          Clipstake
        </p>
      </div>
    </footer>
  );
}
