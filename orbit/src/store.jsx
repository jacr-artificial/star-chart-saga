import { createContext, useContext, useMemo, useState, useCallback } from "react";
import {
  DEMO_USER, COLLEAGUES, INITIALLY_UNLOCKED, SQUAD, AUTO_DETECT_SUGGESTION,
} from "./data.js";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // navigation
  const [screen, setScreen] = useState("onboarding"); // onboarding | galaxy | card | collection | collect | planet | squad
  const [activePlanetId, setActivePlanetId] = useState(null);
  const [collectTargetId, setCollectTargetId] = useState(null);

  // demo user + their card (real: customisable)
  const [onboarded, setOnboarded] = useState(false);
  const [xp, setXp] = useState(DEMO_USER.xp);
  const [myCard, setMyCard] = useState({
    avatar: "🧑‍🚀",
    rarity: "Common",
    catchphrase: "New in the galaxy 👋",
    stats: { insight: 6, energy: 6, collab: 6, craft: 6 },
    customised: false,
  });

  // collection state (real logic: interaction confirmed both sides => unlock)
  const [unlockedIds, setUnlockedIds] = useState(new Set(INITIALLY_UNLOCKED));
  // interactions keyed by colleague id: { confirmedA, confirmedB }
  const [interactions, setInteractions] = useState({});

  // quiz progress (planet Riskara)
  const [answered, setAnswered] = useState({}); // qId -> { pickedIdx, correct }

  // painted doors
  const [autoDetect, setAutoDetect] = useState(false);
  const [autoDetectPrompt, setAutoDetectPrompt] = useState(null); // suggestion object or null
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3400);
  }, []);

  const addXp = useCallback((amount) => setXp((x) => x + amount), []);

  const go = useCallback((s) => setScreen(s), []);

  const openPlanet = useCallback((planetId) => {
    setActivePlanetId(planetId);
    setScreen("planet");
  }, []);

  const startCollect = useCallback((colleagueId) => {
    setCollectTargetId(colleagueId);
    setInteractions((prev) => ({
      ...prev,
      [colleagueId]: prev[colleagueId] ?? { confirmedA: false, confirmedB: false },
    }));
    setScreen("collect");
  }, []);

  // The real unlock rule: both sides confirmed (QR scan sets both at once)
  const confirmSide = useCallback((colleagueId, side) => {
    setInteractions((prev) => {
      const cur = prev[colleagueId] ?? { confirmedA: false, confirmedB: false };
      const next = { ...cur, [side]: true };
      return { ...prev, [colleagueId]: next };
    });
  }, []);

  const qrScan = useCallback((colleagueId) => {
    setInteractions((prev) => ({
      ...prev,
      [colleagueId]: { confirmedA: true, confirmedB: true },
    }));
  }, []);

  const finalizeUnlock = useCallback((colleagueId) => {
    setUnlockedIds((prev) => {
      if (prev.has(colleagueId)) return prev;
      const next = new Set(prev);
      next.add(colleagueId);
      return next;
    });
    addXp(25);
  }, [addXp]);

  const answerQuestion = useCallback((qId, pickedIdx, correct, xpValue) => {
    setAnswered((prev) => {
      if (prev[qId]) return prev;
      if (correct) addXp(xpValue);
      return { ...prev, [qId]: { pickedIdx, correct } };
    });
  }, [addXp]);

  const enableAutoDetect = useCallback(() => {
    setAutoDetect(true);
    // Painted door: a scripted "we noticed you met X" appears moments later
    window.setTimeout(() => setAutoDetectPrompt(AUTO_DETECT_SUGGESTION), 2600);
  }, []);

  const squadXp = SQUAD.baseXp + xp;
  const squadPct = Math.min(100, Math.round((squadXp / SQUAD.goalXp) * 100));

  const value = useMemo(() => ({
    screen, go,
    onboarded, setOnboarded,
    xp, addXp,
    myCard, setMyCard,
    colleagues: COLLEAGUES,
    unlockedIds, interactions,
    startCollect, confirmSide, qrScan, finalizeUnlock, collectTargetId,
    activePlanetId, openPlanet,
    answered, answerQuestion,
    autoDetect, enableAutoDetect, autoDetectPrompt, setAutoDetectPrompt,
    squadXp, squadPct,
    toast, showToast,
  }), [
    screen, go, onboarded, xp, addXp, myCard, unlockedIds, interactions,
    startCollect, confirmSide, qrScan, finalizeUnlock, collectTargetId,
    activePlanetId, openPlanet, answered, answerQuestion,
    autoDetect, enableAutoDetect, autoDetectPrompt, squadXp, squadPct,
    toast, showToast,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
