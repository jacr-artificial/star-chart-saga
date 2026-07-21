import { useState } from "react";
import { RARITY_STYLES, STAT_KEYS, type Rarity, type Stats } from "@/data/orbit";
import Avatar from "@/components/Avatar";

type PlayerCardProps = {
  name: string;
  role: string;
  avatarUrl: string | null;
  initials: string;
  accentHue?: number;
  rarity: Rarity;
  catchphrase: string;
  stats: Stats;
  size?: "sm" | "md" | "lg";
  flippable?: boolean;
  holo?: boolean;
  className?: string;
};

export default function PlayerCard({
  name,
  role,
  avatarUrl,
  initials,
  accentHue = 260,
  rarity,
  catchphrase,
  stats,
  size = "md",
  flippable = true,
  holo = true,
  className = "",
}: PlayerCardProps) {
  const [flipped, setFlipped] = useState(false);
  const r = RARITY_STYLES[rarity] ?? RARITY_STYLES.Common;

  const dims = size === "lg" ? "w-72 h-[26rem]" : size === "sm" ? "w-40 h-56" : "w-56 h-80";
  const textScale = size === "sm" ? "text-[0.6rem]" : "text-xs";
  const avatarSize = size === "lg" ? "lg" : size === "sm" ? "sm" : "md";

  return (
    <div
      className={`card-scene ${dims} ${className}`}
      onClick={() => flippable && setFlipped((f) => !f)}
      role={flippable ? "button" : undefined}
      title={flippable ? "Click to flip" : undefined}
    >
      <div className={`card-inner relative w-full h-full ${flipped ? "flipped" : ""}`}>
        <div
          className={`card-face absolute inset-0 rounded-2xl bg-gradient-to-br ${r.gradient} ${r.glow} ${holo ? "holo" : ""} border border-white/15 p-[3px] cursor-pointer`}
        >
          <div className="w-full h-full rounded-xl bg-[#0b0d22]/85 flex flex-col items-center px-3 pt-4 pb-3">
            <div
              className={`self-end px-2 py-0.5 rounded-full border ${r.chip} ${textScale} font-semibold tracking-wide`}
            >
              {r.label}
            </div>
            <div
              className={`${size === "sm" ? "mt-1" : "mt-3"} drop-shadow-[0_0_12px_rgba(167,139,250,0.5)]`}
            >
              <Avatar url={avatarUrl} initials={initials} accentHue={accentHue} size={avatarSize} />
            </div>
            <div
              className={`mt-2 font-bold ${size === "sm" ? "text-sm" : "text-lg"} text-center leading-tight`}
            >
              {name}
            </div>
            <div className={`${textScale} text-slate-400 text-center`}>{role}</div>
            <div className="mt-auto w-full grid grid-cols-2 gap-1.5">
              {STAT_KEYS.map((s) => (
                <div
                  key={s.key}
                  className={`flex items-center gap-1 min-w-0 bg-white/5 rounded-md px-1.5 py-1 ${textScale}`}
                >
                  <span className="text-slate-400 truncate whitespace-nowrap">{s.label}</span>
                  <span className={`ml-auto shrink-0 font-bold ${r.text}`}>
                    {stats?.[s.key] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className={`card-face card-back absolute inset-0 rounded-2xl bg-gradient-to-br ${r.gradient} border border-white/15 p-[3px] cursor-pointer`}
        >
          <div className="w-full h-full rounded-xl bg-[#0b0d22]/90 flex flex-col items-center justify-center px-4 text-center">
            <div className="text-3xl mb-3">💬</div>
            <div
              className={`italic ${size === "sm" ? "text-xs" : "text-sm"} text-slate-200 leading-relaxed`}
            >
              “{catchphrase || "…"}”
            </div>
            <div className={`mt-4 ${textScale} text-slate-500 uppercase tracking-widest`}>
              catchphrase
            </div>
            <div className="mt-6 text-slate-600 text-2xl">🪐</div>
          </div>
        </div>
      </div>
    </div>
  );
}
