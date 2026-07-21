import { lazy, Suspense, useState } from "react";
import { useStore } from "@/store";
import { PLANETS, QUESTIONS } from "@/data/orbit";

const Orrery = lazy(() => import("@/components/Orrery"));

export default function GalaxyMap() {
  const { openPlanet, answered } = useStore();
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const riskaraPct = Math.round(
    (Object.values(answered).filter((a) => a.correct).length / QUESTIONS.length) * 100,
  );

  const focused = focusedId ? (PLANETS.find((p) => p.id === focusedId) ?? null) : null;

  return (
    <div className="relative z-10 mx-auto flex h-[calc(100dvh-9rem)] max-w-7xl flex-col overflow-hidden px-6 pt-2">
      <div className="relative flex-1 overflow-hidden rounded-3xl border border-brand-panel bg-gradient-to-b from-brand-panel/40 to-background/20">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground/80">
              aligning orrery…
            </div>
          }
        >
          <Orrery
            progressById={{ "p-riskara": riskaraPct }}
            focusedId={focusedId}
            onFocusChange={setFocusedId}
          />
        </Suspense>

        {/* Detail sidebar — slides in when a planet is engaged */}
        <div
          className={`absolute right-0 top-0 z-30 flex h-full w-full max-w-sm transform flex-col border-l border-brand-panel bg-background/92 backdrop-blur-xl transition-transform duration-500 ease-out ${
            focused ? "translate-x-0" : "translate-x-full"
          }`}
          aria-hidden={!focused}
        >
          {focused && (
            <div className="flex h-full flex-col overflow-y-auto">
              <div className={`relative h-40 w-full shrink-0 bg-gradient-to-br ${focused.color}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
                <button
                  onClick={() => setFocusedId(null)}
                  className="absolute left-4 top-4 rounded-lg border border-brand-panel-hover bg-black/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-white backdrop-blur transition hover:bg-white/15"
                >
                  ← disengage
                </button>
                <div className="absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-magenta/80">
                  ↳ target locked
                </div>
              </div>

              <div className="flex-1 space-y-5 px-6 py-6">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-brand-magenta/80">
                    {focused.comingSoon ? "uncharted world" : `sector ${focused.order}`}
                  </div>
                  <h2 className="mt-1.5 font-display text-3xl tracking-[0.06em]">{focused.name}</h2>
                  <div className="mt-1 text-sm text-brand-magenta">{focused.domain}</div>
                </div>

                <p className="text-sm leading-relaxed text-foreground/85">{focused.blurb}</p>

                {focused.real ? (
                  <div className="space-y-4 border-t border-brand-panel pt-5">
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Mission progress</span>
                        <span className="text-brand-lemon">{riskaraPct}%</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-magenta to-brand-lemon"
                          style={{ width: `${riskaraPct}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => openPlanet(focused.id)}
                      className="w-full rounded-xl bg-brand-lemon px-5 py-3 font-semibold text-[#14110f] transition hover:brightness-110"
                    >
                      Begin missions →
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-brand-panel pt-5">
                    <div className="flex items-center gap-2 rounded-xl border border-brand-magenta/30 bg-brand-magenta/10 px-4 py-3 text-sm text-brand-magenta">
                      🚧 Terraforming in progress — missions landing soon.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
