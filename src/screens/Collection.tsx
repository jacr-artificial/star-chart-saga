import { useMemo, useState } from "react";
import { useStore } from "@/store";
import PlayerCard from "@/components/PlayerCard";
import Avatar from "@/components/Avatar";

export default function Collection() {
  const { colleagues, unlockedIds, startCollect } = useStore();
  const unlockedCount = colleagues.filter((c) => unlockedIds.has(c.id)).length;

  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return colleagues;
    return colleagues.filter((c) => c.name.toLowerCase().includes(q));
  }, [colleagues, query]);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wide">The Galaxy</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Every colleague is a card. Meet them in real life to collect them.
          </p>
        </div>
        <div className="text-sm bg-white/5 border border-brand-panel rounded-full px-4 py-1.5">
          <span className="font-bold text-brand-lemon">{unlockedCount}</span>
          <span className="text-muted-foreground"> / {colleagues.length} collected</span>
        </div>
      </div>

      <div className="mt-6 relative max-w-md">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people by name…"
          aria-label="Search people by name"
          className="w-full rounded-full border border-brand-panel bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-brand-magenta/50 focus:bg-white/[0.06]"
        />
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground/80">
          No colleagues match “{query.trim()}”.
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {filtered.map((c) => {
          const unlocked = unlockedIds.has(c.id);
          return unlocked ? (
            <div key={c.id} className="flex flex-col items-center gap-2">
              <PlayerCard
                size="sm"
                name={c.name}
                role={c.role}
                avatarUrl={c.avatarUrl}
                initials={c.initials}
                accentHue={c.accentHue}
                rarity={c.rarity}
                catchphrase={c.catchphrase}
                stats={c.stats}
              />
              <span className="text-[0.65rem] text-brand-lemon/90 uppercase tracking-widest">
                Collected
              </span>
            </div>
          ) : (
            <button
              key={c.id}
              type="button"
              onClick={() => startCollect(c.id)}
              className="group flex flex-col items-center gap-2"
              title={`Meet ${c.name} to collect their card`}
            >
              <div className="w-40 h-56 rounded-2xl border border-brand-panel bg-white/[0.03] flex flex-col items-center justify-center gap-2 transition group-hover:border-brand-magenta/40 group-hover:bg-brand-magenta/5">
                <Avatar
                  url={c.avatarUrl}
                  initials={c.initials}
                  accentHue={c.accentHue}
                  size="md"
                  locked
                />
                <div className="text-muted-foreground text-xs font-medium px-2 text-center leading-tight">
                  {c.name}
                </div>
                <div className="text-muted-foreground/55 text-[0.65rem] px-2 text-center">
                  {c.role}
                </div>
                <div className="mt-2 text-[0.65rem] px-2.5 py-1 rounded-full bg-white/5 text-muted-foreground border border-brand-panel group-hover:text-brand-magenta group-hover:border-brand-magenta/40 transition">
                  🔒 Meet to collect
                </div>
              </div>
              <span className="text-[0.65rem] text-muted-foreground/55 uppercase tracking-widest">
                Locked
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
