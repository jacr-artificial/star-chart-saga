import { useRef, useState } from "react";
import { useStore } from "@/store";
import { PLANETS, DEMO_USER } from "@/data/orbit";
import WireMotif from "@/components/brand/WireMotif";

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
      <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-brand-magenta/80">
        ✦ onboarding sequence
      </div>
      <h1 className="mt-3 font-display text-4xl tracking-[0.08em]">
        Welcome to{" "}
        <span className="bg-gradient-to-r from-brand-magenta to-brand-lemon bg-clip-text text-transparent">
          Orbit
        </span>
      </h1>
      <p className="text-muted-foreground mt-3 max-w-md">
        Day one, {DEMO_USER.name.split(" ")[0]}. Drop your CV and we&apos;ll find your place in the
        galaxy.
      </p>
      <WireMotif variant="bracket" className="mt-6 h-7 w-64" />

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
                ? "border-brand-magenta bg-brand-magenta/10 scale-[1.02]"
                : "border-brand-panel-hover bg-white/[0.03] hover:border-brand-magenta/60"
            }`}
          >
            <div className="text-4xl">📄</div>
            <div className="mt-3 font-semibold">Drop your CV here</div>
            <div className="text-sm text-muted-foreground/80 mt-1">or click to browse · PDF, DOCX</div>
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
            className="mt-6 text-sm text-muted-foreground/80 hover:text-foreground underline underline-offset-4"
          >
            Skip for now
          </button>
        </>
      )}

      {stage === "scanning" && (
        <div className="mt-10 w-full max-w-md rounded-3xl border border-brand-panel bg-white/[0.04] px-8 py-12">
          <div className="text-3xl">🛰️</div>
          <div className="mt-3 font-semibold">Reading {fileName}…</div>
          <div className="text-sm text-muted-foreground/80 mt-1">Matching your experience to the galaxy</div>
          <div className="mt-6 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="scan-bar h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-lemon" />
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
            You&apos;ve been placed on <span className="text-brand-lemon">{spawnPlanet.name}</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm">{spawnPlanet.blurb}</p>
          <div className="mt-5 flex items-center gap-2 text-xs text-brand-lemon/90 bg-brand-lemon/10 border border-brand-lemon/30 rounded-full px-4 py-1.5">
            🔒 And don&apos;t worry — we don&apos;t keep your CV.
          </div>
          <button
            onClick={() => {
              setOnboarded(true);
              go("galaxy");
            }}
            className="mt-8 bg-brand-lemon text-[#14110f] hover:brightness-110 transition rounded-xl px-8 py-3 font-semibold"
          >
            Enter the galaxy →
          </button>
        </div>
      )}
    </div>
  );
}
