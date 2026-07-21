import { useMemo } from "react";
import { useStore } from "@/store";
import PlayerCard from "@/components/PlayerCard";
import Avatar from "@/components/Avatar";
import { STAT_KEYS, STAT_POINTS, DEMO_USER } from "@/data/orbit";

export default function CardEditor() {
  const { myCard, setMyCard, showToast, go } = useStore();

  const spent = useMemo(
    () => STAT_KEYS.reduce((sum, s) => sum + (myCard.stats[s.key] ?? 0), 0),
    [myCard.stats],
  );
  const remaining = STAT_POINTS - spent;

  const setStat = (key: keyof typeof myCard.stats, val: number) => {
    const others = spent - (myCard.stats[key] ?? 0);
    const clamped = Math.max(1, Math.min(val, STAT_POINTS - others, 10));
    setMyCard({
      ...myCard,
      customised: true,
      stats: { ...myCard.stats, [key]: clamped },
    });
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold font-display tracking-wide">My card</h1>
      <p className="text-muted-foreground text-sm mt-1">
        This is how colleagues see you when they collect you. Make it yours.
      </p>

      <div className="mt-8 flex flex-col lg:flex-row gap-10 items-start">
        <div className="mx-auto lg:mx-0 shrink-0">
          <PlayerCard
            size="lg"
            name={DEMO_USER.name}
            role={DEMO_USER.role}
            avatarUrl={DEMO_USER.avatarUrl}
            initials={DEMO_USER.initials}
            accentHue={DEMO_USER.accentHue}
            rarity={myCard.rarity}
            catchphrase={myCard.catchphrase}
            stats={myCard.stats}
          />
          <div className="text-center text-xs text-muted-foreground/80 mt-3">Click the card to flip it</div>
        </div>

        <div className="flex-1 w-full space-y-7">
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Your photo
            </h2>
            <div className="mt-3 flex items-center gap-4 rounded-2xl border border-brand-panel bg-white/[0.04] p-4">
              <Avatar
                url={DEMO_USER.avatarUrl}
                initials={DEMO_USER.initials}
                accentHue={DEMO_USER.accentHue}
                size="md"
              />
              <div>
                <div className="text-sm font-medium">{DEMO_USER.name}</div>
                <div className="text-xs text-muted-foreground/80 mt-0.5">
                  Demo profile · Kier Starmer
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Catchphrase
            </h2>
            <input
              value={myCard.catchphrase}
              maxLength={60}
              onChange={(e) =>
                setMyCard({
                  ...myCard,
                  catchphrase: e.target.value,
                  customised: true,
                })
              }
              placeholder="One line that's very you…"
              className="mt-3 w-full bg-white/5 border border-brand-panel rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-magenta placeholder:text-muted-foreground/55"
            />
            <div className="text-xs text-muted-foreground/55 mt-1 text-right">
              {myCard.catchphrase.length}/60
            </div>
          </section>

          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Stats
              </h2>
              <span
                className={`text-xs ${remaining === 0 ? "text-brand-lemon" : "text-muted-foreground"}`}
              >
                {remaining} point{remaining === 1 ? "" : "s"} left
              </span>
            </div>
            <div className="mt-3 space-y-3">
              {STAT_KEYS.map((s) => (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 whitespace-nowrap text-sm text-foreground/90">
                    {s.label}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={myCard.stats[s.key]}
                    onChange={(e) => setStat(s.key, Number(e.target.value))}
                    className="flex-1 accent-brand-magenta"
                  />
                  <span className="w-6 text-right font-bold text-brand-magenta">
                    {myCard.stats[s.key]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <button
            onClick={() => {
              showToast("✨ Card saved — looking stellar");
              go("collection");
            }}
            className="w-full bg-brand-lemon text-[#14110f] hover:brightness-110 transition rounded-xl py-3 font-semibold shadow-lg shadow-black/40"
          >
            Save my card
          </button>
        </div>
      </div>
    </div>
  );
}
