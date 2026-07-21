import type { ReactNode } from "react";
import BadgeCluster from "./BadgeCluster";

/**
 * The Summit's signature card chrome (Branding Pack §3): every surface sits on
 * a rounded-rectangle card on the near-black canvas with a thin #232120 border.
 * The top-left corner is cut away with a diagonal notch holding the ARTIFICIAL
 * wordmark; the top-right carries the persistent badge cluster.
 */
export default function SummitFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative min-h-dvh bg-background p-3 sm:p-4">
      <div className="starfield" />
      <div
        className={`relative min-h-[calc(100dvh-1.5rem)] rounded-[1.75rem] rounded-tl-none border border-brand-panel bg-brand-panel/10 sm:min-h-[calc(100dvh-2rem)] ${className}`}
      >
        {/* Diagonal notch — the corner cut away rather than rounded. */}
        <span
          aria-hidden
          className="absolute -left-px -top-px z-20 bg-background"
          style={{
            width: "2.6rem",
            height: "2.6rem",
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
          }}
        />
        <span
          aria-hidden
          className="absolute left-0 top-0 z-20 origin-top-left border-t border-brand-panel"
          style={{ width: "3.68rem", transform: "translateY(2.6rem) rotate(-45deg)" }}
        />

        {/* Running header: wordmark (in the notch) + badge cluster. */}
        <div className="relative z-10 flex items-start justify-between gap-3 px-5 pt-4 sm:px-7 sm:pt-5">
          <div className="flex items-center gap-2 pl-8 sm:pl-9">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-brand-magenta" />
            <span className="font-display text-sm font-bold uppercase tracking-[0.28em] text-foreground">
              Artificial
            </span>
          </div>
          <BadgeCluster className="hidden sm:flex" />
          <span className="rounded-full bg-brand-lemon px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#14110f] sm:hidden">
            Artificial
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
