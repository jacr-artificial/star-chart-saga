import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/store";
import PlayerCard from "@/components/PlayerCard";
import { DEMO_USER, type Colleague } from "@/data/orbit";

function FauxQR({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    let h = 0;
    for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const out: boolean[] = [];
    for (let i = 0; i < 21 * 21; i++) {
      h = (h * 1103515245 + 12345) >>> 0;
      out.push((h >> 16) % 3 !== 0);
    }
    return out;
  }, [seed]);

  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);

  return (
    <div className="bg-white p-3 rounded-xl inline-block">
      <div className="grid" style={{ gridTemplateColumns: "repeat(21, 8px)" }}>
        {cells.map((on, i) => {
          const r = Math.floor(i / 21);
          const c = i % 21;
          let fill = on;
          if (isFinder(r, c)) {
            const rr = r % 14 > 6 ? r - 14 : r;
            const cc = c % 14 > 6 ? c - 14 : c;
            const edge = rr === 0 || rr === 6 || cc === 0 || cc === 6;
            const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
            fill = edge || core;
          }
          return (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                background: fill ? "#0b0d22" : "#fff",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function ConfirmTile({
  label,
  sub,
  confirmed,
  onClick,
}: {
  label: string;
  sub: string;
  confirmed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={confirmed}
      className={`flex-1 rounded-2xl border p-5 text-left transition ${
        confirmed
          ? "border-emerald-400/60 bg-emerald-500/10"
          : "border-white/10 bg-white/5 hover:border-violet-400/50 hover:bg-violet-500/10"
      } disabled:cursor-default`}
    >
      <div className="text-3xl">{confirmed ? "✅" : "🤝"}</div>
      <div className="mt-2 font-semibold">{label}</div>
      <div className="text-xs text-slate-400 mt-1">{confirmed ? "Confirmed" : sub}</div>
    </button>
  );
}

export default function CollectFlow() {
  const {
    colleagues,
    collectTargetId,
    interactions,
    confirmSide,
    qrScan,
    finalizeUnlock,
    unlockedIds,
    go,
  } = useStore();

  const target = colleagues.find((c) => c.id === collectTargetId);
  const inter = interactions[collectTargetId ?? ""] ?? {
    confirmedA: false,
    confirmedB: false,
  };
  const bothConfirmed = inter.confirmedA && inter.confirmedB;
  const alreadyUnlocked = collectTargetId ? unlockedIds.has(collectTargetId) : false;

  const [revealed, setRevealed] = useState(alreadyUnlocked);
  const [mode, setMode] = useState<"tap" | "qr">("tap");
  const finalized = useRef(alreadyUnlocked);

  useEffect(() => {
    if (bothConfirmed && !finalized.current && collectTargetId) {
      finalized.current = true;
      const t = window.setTimeout(() => {
        finalizeUnlock(collectTargetId);
        setRevealed(true);
      }, 650);
      return () => window.clearTimeout(t);
    }
  }, [bothConfirmed, collectTargetId, finalizeUnlock]);

  if (!target || !collectTargetId) {
    return (
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 text-center text-slate-400">
        Pick a locked colleague in the Galaxy to start collecting.
        <div className="mt-4">
          <button onClick={() => go("collection")} className="text-violet-300 underline">
            Open the Galaxy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">
      {!revealed ? (
        <>
          <button
            onClick={() => go("collection")}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            ← Back to Galaxy
          </button>
          <h1 className="text-2xl font-bold mt-3">Collect {target.name}</h1>
          <p className="text-slate-400 text-sm mt-1">
            Cards unlock when you <span className="text-slate-200">actually meet</span>. Both of you
            confirm — or scan to do it in one go.
          </p>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setMode("tap")}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${mode === "tap" ? "bg-violet-500/25 border-violet-400 text-violet-200" : "border-white/10 text-slate-400 hover:bg-white/5"}`}
            >
              🤝 Tap to confirm
            </button>
            <button
              onClick={() => setMode("qr")}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${mode === "qr" ? "bg-violet-500/25 border-violet-400 text-violet-200" : "border-white/10 text-slate-400 hover:bg-white/5"}`}
            >
              📱 QR scan
            </button>
          </div>

          {mode === "tap" ? (
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <ConfirmTile
                label={`${DEMO_USER.name} (you)`}
                sub="Tap when you've met"
                confirmed={inter.confirmedA}
                onClick={() => confirmSide(collectTargetId, "confirmedA")}
              />
              <div className="self-center text-2xl text-slate-600 hidden sm:block">×</div>
              <ConfirmTile
                label={target.name}
                sub="They tap on their device"
                confirmed={inter.confirmedB}
                onClick={() => confirmSide(collectTargetId, "confirmedB")}
              />
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col sm:flex-row items-center gap-6">
              <FauxQR seed={target.id + DEMO_USER.id} />
              <div className="flex-1 text-center sm:text-left">
                <div className="font-semibold">Ask {target.name.split(" ")[0]} to scan this</div>
                <p className="text-sm text-slate-400 mt-1">
                  One scan confirms you both at once — the most reliable way when you&apos;re stood
                  together.
                </p>
                <button
                  onClick={() => qrScan(collectTargetId)}
                  className="mt-4 bg-violet-600 hover:bg-violet-500 transition rounded-xl px-5 py-2.5 text-sm font-semibold"
                >
                  Simulate scan
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
            <div
              className={`h-2.5 w-2.5 rounded-full ${inter.confirmedA ? "bg-emerald-400" : "bg-slate-700"}`}
            />
            <div
              className={`h-2.5 w-2.5 rounded-full ${inter.confirmedB ? "bg-emerald-400" : "bg-slate-700"}`}
            />
            {bothConfirmed ? (
              <span className="text-emerald-400 font-medium">Both confirmed — unlocking…</span>
            ) : (
              <span>{(inter.confirmedA ? 1 : 0) + (inter.confirmedB ? 1 : 0)}/2 confirmations</span>
            )}
          </div>
        </>
      ) : (
        <UnlockReveal target={target} onDone={() => go("collection")} />
      )}
    </div>
  );
}

function UnlockReveal({ target, onDone }: { target: Colleague; onDone: () => void }) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: `${(i * 137.5) % 100}%`,
        delay: `${(i % 12) * 0.12}s`,
        duration: `${2 + (i % 5) * 0.4}s`,
        color: ["#a78bfa", "#fbbf24", "#34d399", "#60a5fa", "#f472b6"][i % 5],
      })),
    [],
  );

  return (
    <div className="flex flex-col items-center text-center py-6">
      {confetti.map((c, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: c.left,
            background: c.color,
            animationDelay: c.delay,
            animationDuration: c.duration,
          }}
        />
      ))}
      <div className="relative">
        <div className="unlock-rays" />
        <div className="unlock-burst relative">
          <PlayerCard
            size="lg"
            name={target.name}
            role={target.role}
            avatarUrl={target.avatarUrl}
            initials={target.initials}
            accentHue={target.accentHue}
            rarity={target.rarity}
            catchphrase={target.catchphrase}
            stats={target.stats}
          />
        </div>
      </div>
      <h2 className="mt-8 text-3xl font-extrabold bg-gradient-to-r from-violet-300 via-amber-200 to-violet-300 bg-clip-text text-transparent">
        {target.name} collected!
      </h2>
      <p className="text-slate-400 text-sm mt-2">
        +25 XP · {target.rarity} card added to your Galaxy
      </p>
      <div className="text-xs text-slate-500 mt-1">
        Click the card to flip it and read their catchphrase
      </div>
      <button
        onClick={onDone}
        className="mt-8 bg-violet-600 hover:bg-violet-500 transition rounded-xl px-8 py-3 font-semibold"
      >
        Back to the Galaxy
      </button>
    </div>
  );
}
