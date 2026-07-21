import { useState } from "react";
import { useStore } from "@/store";
import { PLANETS, QUESTIONS } from "@/data/orbit";

export default function PlanetView() {
  const { activePlanetId, go } = useStore();
  const planet = PLANETS.find((p) => p.id === activePlanetId) ?? PLANETS[0]!;

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
      <button onClick={() => go("galaxy")} className="text-sm text-slate-400 hover:text-slate-200">
        ← Back to galaxy
      </button>
      <div className="mt-4 flex items-center gap-6">
        <div
          className={`planet float-med bg-gradient-to-br ${planet.color} ${planet.ring ? "planet-ring" : ""} shrink-0`}
          style={{ width: 90, height: 90 }}
        />
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wide">{planet.name}</h1>
          <div className="text-sm text-violet-300">{planet.domain}</div>
          <p className="text-sm text-slate-400 mt-1">{planet.blurb}</p>
        </div>
      </div>

      {planet.real ? (
        <Quiz />
      ) : (
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-16 text-center">
          <div className="text-4xl">🚧</div>
          <div className="mt-3 font-semibold text-lg">Terraforming in progress</div>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Missions for {planet.domain} are being generated from our own docs. Landing soon.
          </p>
        </div>
      )}
    </div>
  );
}

function Quiz() {
  const { answered, answerQuestion } = useStore();
  const answeredCount = Object.keys(answered).length;
  const correctCount = Object.values(answered).filter((a) => a.correct).length;
  const firstUnanswered = QUESTIONS.findIndex((q) => !answered[q.id]);
  const [idx, setIdx] = useState(firstUnanswered === -1 ? 0 : firstUnanswered);
  const q = QUESTIONS[idx]!;
  const state = answered[q.id];

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          Mission {idx + 1} of {QUESTIONS.length}
        </span>
        <span className="text-slate-400">
          <span className="text-emerald-400 font-semibold">{correctCount}</span> correct ·{" "}
          {answeredCount}/{QUESTIONS.length} attempted
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="progress-fill h-full bg-gradient-to-r from-violet-500 to-amber-400"
          style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-7">
        <div className="text-xs text-amber-300/90 uppercase tracking-widest">+{q.xp} XP</div>
        <h2 className="mt-2 text-lg font-semibold leading-snug">{q.prompt}</h2>
        <div className="mt-5 grid gap-2.5">
          {q.options.map((opt, i) => {
            let cls =
              "border-white/10 bg-white/5 hover:border-violet-400/50 hover:bg-violet-500/10";
            if (state) {
              if (i === q.answerIdx) cls = "border-emerald-400/70 bg-emerald-500/15";
              else if (i === state.pickedIdx) cls = "border-rose-400/70 bg-rose-500/15";
              else cls = "border-white/5 bg-white/[0.02] opacity-60";
            }
            return (
              <button
                key={i}
                disabled={!!state}
                onClick={() => answerQuestion(q.id, i, i === q.answerIdx, q.xp)}
                className={`text-left rounded-xl border px-4 py-3 text-sm transition disabled:cursor-default ${cls}`}
              >
                <span className="text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>
        {state && (
          <div
            className={`mt-4 text-sm font-medium ${state.correct ? "text-emerald-400" : "text-rose-400"}`}
          >
            {state.correct
              ? `✨ Correct — +${q.xp} XP for you and Squad Nebula`
              : "Not quite — the right answer is highlighted"}
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-between">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="px-4 py-2 rounded-xl text-sm border border-white/10 text-slate-300 disabled:opacity-30 hover:bg-white/5"
        >
          ← Previous
        </button>
        <button
          onClick={() => setIdx((i) => Math.min(QUESTIONS.length - 1, i + 1))}
          disabled={idx === QUESTIONS.length - 1}
          className="px-4 py-2 rounded-xl text-sm border border-white/10 text-slate-300 disabled:opacity-30 hover:bg-white/5"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
