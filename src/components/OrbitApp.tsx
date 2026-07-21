import { useStore } from "@/store";
import { DEMO_USER } from "@/data/orbit";
import Avatar from "@/components/Avatar";
import SpaceBackground from "@/components/SpaceBackground";
import SummitFrame from "@/components/brand/SummitFrame";
import GalaxyMap from "@/screens/GalaxyMap";
import CardEditor from "@/screens/CardEditor";
import Collection from "@/screens/Collection";
import CollectFlow from "@/screens/CollectFlow";
import PlanetView from "@/screens/PlanetView";
import SquadView from "@/screens/SquadView";
import type { ScreenId } from "@/data/orbit";

const NAV: { id: ScreenId; label: string; icon: string }[] = [
  { id: "galaxy", label: "Galaxy map", icon: "🪐" },
  { id: "card", label: "My card", icon: "🃏" },
  { id: "collection", label: "The Galaxy", icon: "🌌" },
];

export default function OrbitApp() {
  const {
    screen,
    go,
    xp,
    toast,
    autoDetect,
    enableAutoDetect,
    autoDetectPrompt,
    setAutoDetectPrompt,
    startCollect,
    colleagues,
  } = useStore();

  const suggestion = autoDetectPrompt
    ? colleagues.find((c) => c.id === autoDetectPrompt.colleagueId)
    : null;

  return (
    <>
      <SpaceBackground />
      <SummitFrame>
        <header className="relative z-10 mt-4 border-b border-brand-panel">
          <div className="flex items-center gap-6 px-5 pb-4 sm:px-7">
            <button
              onClick={() => go("galaxy")}
              className="flex items-center gap-2 font-display text-lg font-semibold tracking-wide text-foreground"
            >
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-brand-lemon" />
              Hire Orbit
            </button>
            <nav className="ml-2 flex gap-1">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => go(n.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${
                    screen === n.id || (n.id === "collection" && screen === "collect")
                      ? "bg-brand-magenta/15 text-brand-magenta"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="mr-1.5">{n.icon}</span>
                  <span className="hidden sm:inline">{n.label}</span>
                </button>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <label className="hidden sm:flex items-center gap-2 bg-white/5 border border-brand-panel rounded-full px-3 py-1 cursor-pointer select-none">
                <span className="text-xs text-foreground/90">✨ Auto-detect</span>
                <button
                  onClick={() => !autoDetect && enableAutoDetect()}
                  className={`relative w-9 h-5 rounded-full transition ${autoDetect ? "bg-brand-lemon" : "bg-brand-panel-hover"}`}
                  role="switch"
                  aria-checked={autoDetect}
                  aria-label="Auto-detect meetings"
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${autoDetect ? "left-[1.15rem]" : "left-0.5"}`}
                  />
                </button>
              </label>
              <div className="rounded-full border border-brand-lemon/30 bg-brand-lemon/10 px-3 py-1 font-mono text-xs font-semibold tracking-wide text-brand-lemon">
                ⭐ {xp} XP
              </div>
              <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                <Avatar
                  url={DEMO_USER.avatarUrl}
                  initials={DEMO_USER.initials}
                  accentHue={DEMO_USER.accentHue}
                  size="xs"
                />
                {DEMO_USER.name}
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 pb-16">
          {screen === "galaxy" && <GalaxyMap />}
          {screen === "card" && <CardEditor />}
          {screen === "collection" && <Collection />}
          {screen === "collect" && <CollectFlow />}
          {screen === "planet" && <PlanetView />}
          {screen === "squad" && <SquadView />}
        </main>

        {suggestion && autoDetectPrompt && (
          <div className="toast-in fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-brand-magenta/30 bg-brand-panel/95 p-5 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="ping-dot relative mt-1.5 h-2.5 w-2.5 rounded-full bg-brand-lemon" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">
                  We noticed you met {suggestion.name} 👀
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{autoDetectPrompt.context}</div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setAutoDetectPrompt(null);
                      startCollect(suggestion.id);
                    }}
                    className="rounded-lg bg-brand-lemon px-3 py-1.5 text-xs font-semibold text-[#14110f] transition hover:brightness-110"
                  >
                    Collect their card
                  </button>
                  <button
                    onClick={() => setAutoDetectPrompt(null)}
                    className="px-2 text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="toast-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-brand-panel-hover bg-brand-panel px-5 py-2.5 text-sm text-foreground shadow-xl">
            {toast}
          </div>
        )}
      </SummitFrame>
    </>
  );
}
