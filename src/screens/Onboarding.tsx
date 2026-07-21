import { useRef, useState } from "react";
import { useStore } from "@/store";
import { PLANETS, DEMO_USER } from "@/data/orbit";

export default function Onboarding() {
  const { setOnboarded, go } = useStore();
  const [stage, setStage] = useState<"drop" | "scanning" | "reveal">("drop");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const spawnPlanet = PLANETS.find((p) => p.id === DEMO_USER.spawnPlanetId)!;

  const accept = (name: string) => {
    setFileName(name);
    setStage("scanning");
    window.setTimeout(() => setStage("reveal"), 3000);
  };

  return (
    <div className="relative z-10 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-primary/80">
        ✦ onboarding sequence
      </div>
      <h1 className="mt-3 font-display text-4xl tracking-[0.08em]">
        Welcome to{" "}
        <span className="bg-gradient-to-r from-violet-400 to-amber-300 bg-clip-text text-transparent">
          Orbit
        </span>
      </h1>
      <p className="text-muted-foreground mt-3 max-w-md">
        Day one, {DEMO_USER.name.split(" ")[0]}. Drop your CV and we&apos;ll find your place in the
        galaxy.
      </p>

      {stage === "drop" && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              accept(e.dataTransfer.files?.[0]?.name ?? "your-cv.pdf");
            }}
            onClick={() => inputRef.current?.click()}
            className={`mt-10 w-full max-w-md rounded-3xl border-2 border-dashed px-8 py-14 cursor-pointer transition ${
              dragOver
                ? "border-violet-400 bg-violet-500/10 scale-[1.02]"
                : "border-white/20 bg-white/[0.03] hover:border-violet-400/60"
            }`}
          >
            <div className="text-4xl">📄</div>
            <div className="mt-3 font-semibold">Drop your CV here</div>
            <div className="text-sm text-slate-500 mt-1">or click to browse · PDF, DOCX</div>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => accept(e.target.files?.[0]?.name ?? "your-cv.pdf")}
            />
          </div>
          <button
            onClick={() => {
              setOnboarded(true);
              go("galaxy");
            }}
            className="mt-6 text-sm text-slate-500 hover:text-slate-300 underline underline-offset-4"
          >
            Skip for now
          </button>
        </>
      )}

      {stage === "scanning" && (
        <div className="mt-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] px-8 py-12">
          <div className="text-3xl">🛰️</div>
          <div className="mt-3 font-semibold">Reading {fileName}…</div>
          <div className="text-sm text-slate-500 mt-1">Matching your experience to the galaxy</div>
          <div className="mt-6 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="scan-bar h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-400" />
          </div>
        </div>
      )}

      {stage === "reveal" && (
        <div className="mt-10 flex flex-col items-center">
          <div
            className={`planet float-med bg-gradient-to-br ${spawnPlanet.color} ${spawnPlanet.ring ? "planet-ring" : ""}`}
            style={{ width: 140, height: 140 }}
          />
          <h2 className="mt-8 text-2xl font-bold">
            You&apos;ve been placed on <span className="text-amber-300">{spawnPlanet.name}</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-sm">{spawnPlanet.blurb}</p>
          <div className="mt-5 flex items-center gap-2 text-xs text-emerald-300/90 bg-emerald-500/10 border border-emerald-400/30 rounded-full px-4 py-1.5">
            🔒 And don&apos;t worry — we don&apos;t keep your CV.
          </div>
          <button
            onClick={() => {
              setOnboarded(true);
              go("galaxy");
            }}
            className="mt-8 bg-violet-600 hover:bg-violet-500 transition rounded-xl px-8 py-3 font-semibold"
          >
            Enter the galaxy →
          </button>
        </div>
      )}
    </div>
  );
}
