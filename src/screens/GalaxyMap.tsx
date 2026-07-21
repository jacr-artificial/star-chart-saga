import { lazy, Suspense } from "react";
import { useStore } from "@/store";
import { QUESTIONS } from "@/data/orbit";

const Orrery = lazy(() => import("@/components/Orrery"));

export default function GalaxyMap() {
  const { xp, unlockedIds, colleagues, openPlanet, go, answered, autoDetect, enableAutoDetect } =
    useStore();

  const collected = colleagues.filter((c) => unlockedIds.has(c.id)).length;
  const riskaraPct = Math.round(
    (Object.values(answered).filter((a) => a.correct).length / QUESTIONS.length) * 100,
  );

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary/70">
            navigation hub
          </div>
          <h1 className="text-2xl font-bold font-display tracking-wide mt-1">Your galaxy</h1>
          <p className="text-slate-400 text-sm mt-1">
            Spawned on <span className="text-amber-300">Riskara</span> · {collected} colleague
            {collected === 1 ? "" : "s"} collected · {xp} XP
          </p>
        </div>

        <label className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 cursor-pointer select-none">
          <span className="text-sm text-slate-300">✨ Auto-detect meetings</span>
          <button
            onClick={() => !autoDetect && enableAutoDetect()}
            className={`relative w-11 h-6 rounded-full transition ${autoDetect ? "bg-emerald-500" : "bg-slate-700"}`}
            role="switch"
            aria-checked={autoDetect}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${autoDetect ? "left-[1.35rem]" : "left-0.5"}`}
            />
          </button>
        </label>
      </div>

      <div className="mt-8 h-[30rem] rounded-3xl border border-white/10 bg-gradient-to-b from-[#0b0d26]/80 to-[#070818]/40">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
              aligning orrery…
            </div>
          }
        >
          <Orrery
            progressById={{ "p-riskara": riskaraPct }}
            onSelect={(planetId) => openPlanet(planetId)}
          />
        </Suspense>
      </div>

      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        <button
          onClick={() => go("card")}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left hover:border-violet-400/50 transition"
        >
          <div className="text-2xl">🃏</div>
          <div className="font-semibold mt-2">My card</div>
          <div className="text-xs text-slate-500 mt-1">Customise how colleagues collect you</div>
        </button>
        <button
          onClick={() => go("collection")}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left hover:border-violet-400/50 transition"
        >
          <div className="text-2xl">🌌</div>
          <div className="font-semibold mt-2">The Galaxy</div>
          <div className="text-xs text-slate-500 mt-1">
            {collected}/{colleagues.length} colleagues collected
          </div>
        </button>
        <button
          onClick={() => go("squad")}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left hover:border-violet-400/50 transition"
        >
          <div className="text-2xl">🛡️</div>
          <div className="font-semibold mt-2">Squad Nebula</div>
          <div className="text-xs text-slate-500 mt-1">
            Shared progress toward this sprint&apos;s goal
          </div>
        </button>
      </div>
    </div>
  );
}
