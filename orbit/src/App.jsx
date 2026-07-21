import { useStore } from "./store.jsx";
import { DEMO_USER } from "./data.js";
import Onboarding from "./screens/Onboarding.jsx";
import GalaxyMap from "./screens/GalaxyMap.jsx";
import CardEditor from "./screens/CardEditor.jsx";
import Collection from "./screens/Collection.jsx";
import CollectFlow from "./screens/CollectFlow.jsx";
import PlanetView from "./screens/PlanetView.jsx";
import SquadView from "./screens/SquadView.jsx";

const NAV = [
  { id: "galaxy", label: "Galaxy map", icon: "🪐" },
  { id: "card", label: "My card", icon: "🃏" },
  { id: "collection", label: "The Galaxy", icon: "🌌" },
  { id: "squad", label: "Squad", icon: "🛡️" },
];

export default function App() {
  const {
    screen, go, onboarded, xp, toast,
    autoDetectPrompt, setAutoDetectPrompt, startCollect, colleagues,
  } = useStore();

  const suggestion = autoDetectPrompt
    ? colleagues.find((c) => c.id === autoDetectPrompt.colleagueId)
    : null;

  return (
    <div className="min-h-screen">
      <div className="starfield" />

      {onboarded && (
        <header className="relative z-20 border-b border-white/10 bg-[#0a0c20]/80 backdrop-blur">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
            <button onClick={() => go("galaxy")} className="font-extrabold tracking-tight text-lg">
              🪐 <span className="bg-gradient-to-r from-violet-400 to-amber-300 bg-clip-text text-transparent">Orbit</span>
            </button>
            <nav className="flex gap-1 ml-2">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => go(n.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    screen === n.id || (n.id === "collection" && screen === "collect")
                      ? "bg-violet-500/20 text-violet-200"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <span className="mr-1.5">{n.icon}</span>
                  <span className="hidden sm:inline">{n.label}</span>
                </button>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-xs bg-amber-400/15 text-amber-300 border border-amber-400/30 rounded-full px-3 py-1 font-semibold">
                ⭐ {xp} XP
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <span className="text-lg">🧑‍🚀</span> {DEMO_USER.name}
              </div>
            </div>
          </div>
        </header>
      )}

      <main>
        {screen === "onboarding" && <Onboarding />}
        {screen === "galaxy" && <GalaxyMap />}
        {screen === "card" && <CardEditor />}
        {screen === "collection" && <Collection />}
        {screen === "collect" && <CollectFlow />}
        {screen === "planet" && <PlanetView />}
        {screen === "squad" && <SquadView />}
      </main>

      {/* auto-detect scripted prompt (painted door) */}
      {suggestion && (
        <div className="fixed bottom-6 right-6 z-50 toast-in max-w-sm rounded-2xl border border-emerald-400/30 bg-[#0d1028]/95 backdrop-blur p-5 shadow-2xl shadow-emerald-900/30">
          <div className="flex items-start gap-3">
            <div className="relative h-2.5 w-2.5 mt-1.5 rounded-full bg-emerald-400 ping-dot" />
            <div className="flex-1">
              <div className="text-sm font-semibold">We noticed you met {suggestion.name} 👀</div>
              <div className="text-xs text-slate-400 mt-1">{autoDetectPrompt.context}</div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setAutoDetectPrompt(null);
                    startCollect(suggestion.id);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 transition text-xs font-semibold rounded-lg px-3 py-1.5"
                >
                  Collect their card
                </button>
                <button
                  onClick={() => setAutoDetectPrompt(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 toast-in bg-[#191c3a] border border-white/15 rounded-full px-5 py-2.5 text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
