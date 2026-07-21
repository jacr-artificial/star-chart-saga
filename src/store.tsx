import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  AUTO_DETECT_SUGGESTION,
  COLLECTIBLE_COLLEAGUES,
  DEMO_USER,
  INITIALLY_UNLOCKED,
  SQUAD,
  type Colleague,
  type MyCard,
  type ScreenId,
} from "@/data/orbit";

type Interaction = { confirmedA: boolean; confirmedB: boolean };
type AnswerState = { pickedIdx: number; correct: boolean };

type StoreValue = {
  screen: ScreenId;
  go: (s: ScreenId) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  xp: number;
  addXp: (amount: number) => void;
  myCard: MyCard;
  setMyCard: (card: MyCard) => void;
  colleagues: Colleague[];
  unlockedIds: Set<string>;
  interactions: Record<string, Interaction>;
  startCollect: (colleagueId: string) => void;
  confirmSide: (colleagueId: string, side: "confirmedA" | "confirmedB") => void;
  qrScan: (colleagueId: string) => void;
  finalizeUnlock: (colleagueId: string) => void;
  collectTargetId: string | null;
  activePlanetId: string | null;
  openPlanet: (planetId: string) => void;
  answered: Record<string, AnswerState>;
  answerQuestion: (qId: string, pickedIdx: number, correct: boolean, xpValue: number) => void;
  autoDetect: boolean;
  enableAutoDetect: () => void;
  autoDetectPrompt: typeof AUTO_DETECT_SUGGESTION | null;
  setAutoDetectPrompt: (v: typeof AUTO_DETECT_SUGGESTION | null) => void;
  squadXp: number;
  squadPct: number;
  toast: string | null;
  showToast: (msg: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenId>("galaxy");
  const [activePlanetId, setActivePlanetId] = useState<string | null>(null);
  const [collectTargetId, setCollectTargetId] = useState<string | null>(null);

  const [onboarded, setOnboarded] = useState(false);
  const [xp, setXp] = useState(DEMO_USER.xp);
  const [myCard, setMyCard] = useState<MyCard>({
    rarity: "Common",
    catchphrase: "New in the galaxy 👋",
    stats: {
      insuranceExpert: 6,
      riskAppetite: 6,
      customerFacing: 6,
      technical: 6,
      underwriting: 6,
      claimsHandling: 6,
      compliance: 6,
      negotiation: 6,
    },
    customised: false,
  });

  const [unlockedIds, setUnlockedIds] = useState(() => new Set(INITIALLY_UNLOCKED));
  const [interactions, setInteractions] = useState<Record<string, Interaction>>({});
  const [answered, setAnswered] = useState<Record<string, AnswerState>>({});

  const [autoDetect, setAutoDetect] = useState(false);
  const [autoDetectPrompt, setAutoDetectPrompt] = useState<typeof AUTO_DETECT_SUGGESTION | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setToast(null), 3400);
  }, []);

  const addXp = useCallback((amount: number) => setXp((x) => x + amount), []);
  const go = useCallback((s: ScreenId) => setScreen(s), []);

  const openPlanet = useCallback((planetId: string) => {
    setActivePlanetId(planetId);
    setScreen("planet");
  }, []);

  const startCollect = useCallback((colleagueId: string) => {
    setCollectTargetId(colleagueId);
    setInteractions((prev) => ({
      ...prev,
      [colleagueId]: prev[colleagueId] ?? {
        confirmedA: false,
        confirmedB: false,
      },
    }));
    setScreen("collect");
  }, []);

  const confirmSide = useCallback((colleagueId: string, side: "confirmedA" | "confirmedB") => {
    setInteractions((prev) => {
      const cur = prev[colleagueId] ?? {
        confirmedA: false,
        confirmedB: false,
      };
      return { ...prev, [colleagueId]: { ...cur, [side]: true } };
    });
  }, []);

  const qrScan = useCallback((colleagueId: string) => {
    setInteractions((prev) => ({
      ...prev,
      [colleagueId]: { confirmedA: true, confirmedB: true },
    }));
  }, []);

  const finalizeUnlock = useCallback(
    (colleagueId: string) => {
      setUnlockedIds((prev) => {
        if (prev.has(colleagueId)) return prev;
        const next = new Set(prev);
        next.add(colleagueId);
        return next;
      });
      addXp(25);
    },
    [addXp],
  );

  const answerQuestion = useCallback(
    (qId: string, pickedIdx: number, correct: boolean, xpValue: number) => {
      setAnswered((prev) => {
        if (prev[qId]) return prev;
        if (correct) addXp(xpValue);
        return { ...prev, [qId]: { pickedIdx, correct } };
      });
    },
    [addXp],
  );

  const enableAutoDetect = useCallback(() => {
    setAutoDetect(true);
    window.setTimeout(() => setAutoDetectPrompt(AUTO_DETECT_SUGGESTION), 2600);
  }, []);

  const squadXp = SQUAD.baseXp + xp;
  const squadPct = Math.min(100, Math.round((squadXp / SQUAD.goalXp) * 100));

  const value = useMemo<StoreValue>(
    () => ({
      screen,
      go,
      onboarded,
      setOnboarded,
      xp,
      addXp,
      myCard,
      setMyCard,
      colleagues: COLLECTIBLE_COLLEAGUES,
      unlockedIds,
      interactions,
      startCollect,
      confirmSide,
      qrScan,
      finalizeUnlock,
      collectTargetId,
      activePlanetId,
      openPlanet,
      answered,
      answerQuestion,
      autoDetect,
      enableAutoDetect,
      autoDetectPrompt,
      setAutoDetectPrompt,
      squadXp,
      squadPct,
      toast,
      showToast,
    }),
    [
      screen,
      go,
      onboarded,
      xp,
      addXp,
      myCard,
      unlockedIds,
      interactions,
      startCollect,
      confirmSide,
      qrScan,
      finalizeUnlock,
      collectTargetId,
      activePlanetId,
      openPlanet,
      answered,
      answerQuestion,
      autoDetect,
      enableAutoDetect,
      autoDetectPrompt,
      squadXp,
      squadPct,
      toast,
      showToast,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
