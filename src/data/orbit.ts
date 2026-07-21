import {
  COLLEAGUES,
  COLLECTIBLE_COLLEAGUES,
  DEMO_COLLEAGUE,
  DEMO_PERSON_ID,
  INITIALLY_UNLOCKED,
  STAT_DEFS,
  STAT_POINTS,
  type Colleague,
  type Rarity,
  type Stats,
} from "./people";

export type { Colleague, Rarity, Stats };

export { COLLEAGUES, COLLECTIBLE_COLLEAGUES, DEMO_COLLEAGUE, DEMO_PERSON_ID, INITIALLY_UNLOCKED };

export const RARITIES: Rarity[] = ["Common", "Rare", "Epic", "Legendary"];

export const RARITY_STYLES: Record<
  Rarity,
  {
    label: string;
    gradient: string;
    glow: string;
    text: string;
    chip: string;
  }
> = {
  // Restrained ladder in the Summit palette: taupe → dim magenta → bright
  // magenta → lemon (the reserved call-out) for Legendary.
  Common: {
    label: "Common",
    gradient: "from-[#3a3633] to-[#191512]",
    glow: "glow-common",
    text: "text-foreground",
    chip: "bg-brand-panel text-muted-foreground border-brand-panel-hover",
  },
  Rare: {
    label: "Rare",
    gradient: "from-[#4a2444] to-[#1c0f18]",
    glow: "glow-rare",
    text: "text-brand-magenta",
    chip: "bg-brand-magenta-dim/20 text-brand-magenta border-brand-magenta-dim/40",
  },
  Epic: {
    label: "Epic",
    gradient: "from-[#7a3a6f] to-[#291423]",
    glow: "glow-epic",
    text: "text-brand-magenta",
    chip: "bg-brand-magenta/20 text-brand-magenta border-brand-magenta/40",
  },
  Legendary: {
    label: "Legendary",
    gradient: "from-[#5a5a16] to-[#1a1a08]",
    glow: "glow-legendary",
    text: "text-brand-lemon",
    chip: "bg-brand-lemon/15 text-brand-lemon border-brand-lemon/40",
  },
};

export const STAT_KEYS = STAT_DEFS;

export { STAT_POINTS };

export const DEMO_USER = {
  id: DEMO_PERSON_ID,
  name: DEMO_COLLEAGUE.name,
  role: DEMO_COLLEAGUE.role,
  squadId: "sq-nebula",
  spawnPlanetId: "p-riskara",
  xp: 40,
  avatarUrl: DEMO_COLLEAGUE.avatarUrl,
  initials: DEMO_COLLEAGUE.initials,
  accentHue: DEMO_COLLEAGUE.accentHue,
};

export type Planet = {
  id: string;
  name: string;
  domain: string;
  order: number;
  size: number;
  color: string;
  ring: boolean;
  real: boolean;
  /** Painted door — show the planet in the orrery but no details/missions yet. */
  comingSoon?: boolean;
  blurb: string;
};

export const PLANETS: Planet[] = [
  {
    id: "p-riskara",
    name: "Riskara",
    domain: "Insurance Fundamentals",
    order: 1,
    size: 150,
    color: "from-[#F0F95F] via-[#CF6FA5] to-[#4a1f42]",
    ring: true,
    real: true,
    blurb:
      "Where every new joiner learns to speak insurance. Complete missions to earn XP for your squad.",
  },
  {
    id: "p-actuaria",
    name: "Actuaria",
    domain: "Pricing, Data & Models",
    order: 2,
    size: 115,
    color: "from-[#C1B0A6] via-[#9A4890] to-[#2a1526]",
    ring: false,
    real: false,
    blurb:
      "Where exposure becomes a distribution — pricing models, loss ratios, and the data behind every quote.",
  },
  {
    id: "p-bindara",
    name: "Bindara",
    domain: "Placing & Binding Authority",
    order: 3,
    size: 130,
    color: "from-[#CF6FA5] via-[#9A4890] to-[#1c1613]",
    ring: true,
    real: false,
    blurb: "How cover is placed, bound, and delivered — from slip to policy, binder to bordereaux.",
  },
  {
    id: "p-brossa",
    name: "Brossa IV",
    domain: "Engineering & Platform",
    order: 4,
    size: 120,
    color: "from-[#9A4890] via-[#6b2f61] to-[#1c1613]",
    ring: false,
    real: false,
    blurb: "Engineering and platform — the systems we build and run behind every policy.",
  },
];

export type Question = {
  id: string;
  prompt: string;
  options: string[];
  answerIdx: number;
  xp: number;
};

export const QUESTIONS: Question[] = [
  {
    id: "q01",
    prompt: "What does 'underwriting' mean?",
    options: [
      "Signing documents in ink",
      "Assessing and pricing risk before offering cover",
      "Writing policy documents",
      "Auditing claims after they happen",
    ],
    answerIdx: 1,
    xp: 10,
  },
  {
    id: "q02",
    prompt: "A 'premium' is…",
    options: [
      "The payout after a claim",
      "A top-tier customer",
      "The price the insured pays for cover",
      "An optional policy add-on",
    ],
    answerIdx: 2,
    xp: 10,
  },
  {
    id: "q03",
    prompt: "What is an 'excess' (deductible)?",
    options: [
      "Extra cover beyond the policy limit",
      "The amount the insured pays before the insurer pays",
      "A penalty for late premiums",
      "Profit above the loss ratio",
    ],
    answerIdx: 1,
    xp: 10,
  },
  {
    id: "q04",
    prompt: "The 'loss ratio' compares…",
    options: [
      "Claims paid to premiums earned",
      "Staff costs to revenue",
      "Policies lapsed to policies sold",
      "Reserves to reinsurance",
    ],
    answerIdx: 0,
    xp: 10,
  },
  {
    id: "q05",
    prompt: "What is reinsurance?",
    options: [
      "Renewing a policy",
      "Insurance that insurers buy to spread their own risk",
      "Re-issuing a lost policy document",
      "A second opinion on a claim",
    ],
    answerIdx: 1,
    xp: 10,
  },
  {
    id: "q06",
    prompt: "In the London Market, a 'syndicate' is…",
    options: [
      "A broker network",
      "A group underwriting risk together at Lloyd's",
      "An industry regulator",
      "A claims committee",
    ],
    answerIdx: 1,
    xp: 10,
  },
  {
    id: "q07",
    prompt: "A broker's main job is to…",
    options: [
      "Pay claims",
      "Regulate insurers",
      "Match clients with insurers and negotiate cover",
      "Set industry-wide prices",
    ],
    answerIdx: 2,
    xp: 10,
  },
  {
    id: "q08",
    prompt: "'Exposure' refers to…",
    options: [
      "Bad press about an insurer",
      "The extent of potential loss an insurer faces",
      "Publishing policy terms",
      "Sunlight damage claims",
    ],
    answerIdx: 1,
    xp: 10,
  },
  {
    id: "q09",
    prompt: "What is a 'binder' (binding authority)?",
    options: [
      "A folder of policies",
      "Authority delegated to an agent to accept risks for an insurer",
      "A legally binding claim",
      "The cover note stapler",
    ],
    answerIdx: 1,
    xp: 15,
  },
  {
    id: "q10",
    prompt: "An 'MGA' is a…",
    options: [
      "Managing General Agent",
      "Mutual Guarantee Association",
      "Major General Adjuster",
      "Minimum Guaranteed Amount",
    ],
    answerIdx: 0,
    xp: 15,
  },
  {
    id: "q11",
    prompt: "'Aggregation' risk means…",
    options: [
      "Too many policies from one broker",
      "Many separate losses arising from a single event",
      "Combining premiums into one invoice",
      "Merging two insurers",
    ],
    answerIdx: 1,
    xp: 15,
  },
  {
    id: "q12",
    prompt: "A 'slip' in specialty insurance is…",
    options: [
      "A pricing error",
      "The document setting out risk terms for underwriters",
      "A cancelled policy",
      "A wet floor claim",
    ],
    answerIdx: 1,
    xp: 15,
  },
  {
    id: "q13",
    prompt: "'Capacity' in an insurance context is…",
    options: [
      "Office headcount",
      "The maximum risk an insurer can accept",
      "Server bandwidth",
      "Claims team workload",
    ],
    answerIdx: 1,
    xp: 15,
  },
  {
    id: "q14",
    prompt: "What does 'parametric insurance' pay out on?",
    options: [
      "Proven financial loss only",
      "A pre-agreed trigger event, like wind speed above X",
      "Court judgements",
      "Annual review outcomes",
    ],
    answerIdx: 1,
    xp: 20,
  },
  {
    id: "q15",
    prompt: "Why do insurers digitise underwriting (hint: it's why we exist)?",
    options: [
      "To print fewer slips",
      "Faster, more consistent, data-driven risk decisions",
      "To replace underwriters entirely",
      "Because paper is expensive",
    ],
    answerIdx: 1,
    xp: 20,
  },
];

/** Squad members drawn from real people (first few collectibles + you). */
const squadPeers = COLLECTIBLE_COLLEAGUES.slice(2, 7).map((c) => c.id);

export const SQUAD = {
  id: "sq-nebula",
  name: "Squad Nebula",
  memberIds: [DEMO_PERSON_ID, ...squadPeers],
  goalXp: 600,
  baseXp: 210,
};

export const CREWS = [
  {
    id: "cr-01",
    name: "Crew Ignition",
    desc: "Engineers × Underwriters — shipping the new submission flow.",
    memberCount: 6,
  },
  {
    id: "cr-02",
    name: "Crew Deep Field",
    desc: "Data × Claims — anomaly detection for claims triage.",
    memberCount: 5,
  },
  {
    id: "cr-03",
    name: "Crew Starling",
    desc: "Design × Sales — the demo environment glow-up.",
    memberCount: 4,
  },
];

export const AUTO_DETECT_SUGGESTION = {
  colleagueId: COLLECTIBLE_COLLEAGUES[2]?.id ?? COLLECTIBLE_COLLEAGUES[0]!.id,
  context: "Design Review — 25 min together, 2:00pm today",
};

export type ScreenId =
  "onboarding" | "galaxy" | "card" | "collection" | "collect" | "planet" | "squad";

export type MyCard = {
  rarity: Rarity;
  catchphrase: string;
  stats: Stats;
  customised: boolean;
};
