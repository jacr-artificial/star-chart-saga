/**
 * The Summit's running header/footer convention (Branding Pack §3): a lemon
 * "ARTIFICIAL" tag, a dark "GLOBAL SUMMIT" tag, and a mono date tag. Meant to
 * appear as a persistent cluster, not just on a title screen.
 */
export default function BadgeCluster({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="rounded-full bg-brand-lemon px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#14110f]">
        Artificial
      </span>
      <span className="rounded-full border border-brand-panel-hover bg-brand-panel px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/80">
        Global Summit
      </span>
      <span className="rounded-full border border-brand-panel-hover px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        21.06.26
      </span>
    </div>
  );
}
