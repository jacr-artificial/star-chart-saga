import type { ReactNode } from "react";

/**
 * The taupe, generously-tracked label the deck uses for overlines like
 * "Overview" (Branding Pack §2). The grotesque display face, small, in the
 * secondary tone — reads as a label rather than a sentence.
 */
export default function Overline({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-display text-[11px] font-medium uppercase tracking-[0.4em] text-muted-foreground ${className}`}
    >
      {children}
    </div>
  );
}
