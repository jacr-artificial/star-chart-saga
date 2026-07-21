import rawPeople from "./people.json";

export type Rarity = "Common" | "Rare" | "Epic" | "Legendary";

export const STAT_DEFS = [
  { key: "insuranceExpert", label: "Insurance Expert" },
  { key: "riskAppetite", label: "Risk Appetite" },
  { key: "customerFacing", label: "Customer Facing" },
  { key: "technical", label: "Technical" },
  { key: "underwriting", label: "Underwriting" },
  { key: "claimsHandling", label: "Claims Handling" },
  { key: "compliance", label: "Compliance" },
  { key: "negotiation", label: "Negotiation" },
] as const;

export type Stats = {
  [K in (typeof STAT_DEFS)[number]["key"]]: number;
};

export const STAT_POINTS = STAT_DEFS.length * 6;

export type PersonRaw = {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  email: string | null;
  profilePhoto: string | null;
};

export type Colleague = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  email: string | null;
  role: string;
  /** Profile photo URL, or null → render initials */
  avatarUrl: string | null;
  initials: string;
  accentHue: number;
  rarity: Rarity;
  catchphrase: string;
  stats: Stats;
};

const ROLES = [
  "Underwriting Lead",
  "Platform Engineer",
  "Product Designer",
  "Actuarial Analyst",
  "Engineering Manager",
  "Data Scientist",
  "Frontend Engineer",
  "Sales Engineer",
  "Claims Specialist",
  "Backend Engineer",
  "Delivery Lead",
  "Pricing Actuary",
  "QA Engineer",
  "Compliance Officer",
  "People Partner",
  "DevOps Engineer",
  "Underwriter",
  "ML Engineer",
  "Ops Manager",
  "Solutions Architect",
  "Product Engineer",
  "Product Manager",
  "Security Engineer",
  "Customer Success",
];

const CATCHPHRASES = [
  "Price the risk, not the fear.",
  "It works on every machine.",
  "Ship the feeling, not the feature.",
  "The tail risk always wags.",
  "Unblock before you build.",
  "In distributions we trust.",
  "Eight hands, one branch.",
  "Demo gods, be kind.",
  "Every claim tells a story.",
  "Latency is a choice.",
  "Scope is a verb.",
  "Margins love the details.",
  "Broken on purpose, fixed for good.",
  "Regulated, not restricted.",
  "Culture ships weekly too.",
  "If it hurts, automate it.",
  "Trust, but verify the schedule.",
  "The model is never done.",
  "Calm is a process.",
  "Draw it before you build it.",
  "New in the galaxy 👋",
  "Orbiting toward better decisions.",
  "Data first, opinions second.",
  "Small PRs, big impact.",
];

const RARITIES: Rarity[] = ["Common", "Rare", "Epic", "Legendary"];

/** Stable 32-bit hash from an id string. */
export function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], h: number, salt: number): T {
  return arr[(h + salt) % arr.length]!;
}

/** Distribute STAT_POINTS across all stats, each clamped 1–10. */
function deriveStats(h: number): Stats {
  const keys = STAT_DEFS.map((s) => s.key);
  const stats = Object.fromEntries(keys.map((k) => [k, 1])) as Stats;
  let remaining = STAT_POINTS - keys.length; // baseline of 1 per stat already assigned
  let seed = h;
  // Hard cap prevents any pathological infinite loop
  for (let guard = 0; remaining > 0 && guard < 400; guard++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const key = keys[seed % keys.length]!;
    if (stats[key] < 10) {
      stats[key] += 1;
      remaining -= 1;
    }
  }
  return stats;
}

function displayName(p: PersonRaw): string {
  const first = p.preferredName?.trim() || p.firstName;
  return `${first} ${p.lastName}`.trim();
}

function makeInitials(p: PersonRaw): string {
  const first = (p.preferredName?.trim() || p.firstName).charAt(0);
  const last = p.lastName.charAt(0);
  return `${first}${last}`.toUpperCase();
}

export function personToColleague(p: PersonRaw): Colleague {
  const h = hashId(p.id);
  return {
    id: p.id,
    name: displayName(p),
    firstName: p.firstName,
    lastName: p.lastName,
    preferredName: p.preferredName,
    email: p.email,
    role: pick(ROLES, h, 7),
    avatarUrl: p.profilePhoto,
    initials: makeInitials(p),
    accentHue: h % 360,
    rarity: pick(RARITIES, h, 13),
    catchphrase: pick(CATCHPHRASES, h, 29),
    stats: deriveStats(h),
  };
}

const people = rawPeople as PersonRaw[];

export const COLLEAGUES: Colleague[] = people.map(personToColleague);

/** Fake demo player — not from people.json */
export const DEMO_PERSON_ID = "demo-alice-broker";

export const DEMO_COLLEAGUE: Colleague = {
  id: DEMO_PERSON_ID,
  name: "Kier Starmer",
  firstName: "Keir",
  lastName: "Starmer",
  preferredName: "Kier",
  email: null,
  role: "Broker",
  avatarUrl: "/avatars/alice-broker.webp",
  initials: "AB",
  accentHue: 265,
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
};

/** Everyone in the directory is collectible (demo user is separate / fake). */
export const COLLECTIBLE_COLLEAGUES: Colleague[] = COLLEAGUES;

/** Everyone starts uncollected — you meet colleagues in real life to collect them. */
export const INITIALLY_UNLOCKED: string[] = [];
