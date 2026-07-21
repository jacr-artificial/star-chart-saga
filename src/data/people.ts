import rawPeople from "./people.json";

export type Rarity = "Common" | "Rare" | "Epic" | "Legendary";

export type Stats = {
  insight: number;
  energy: number;
  collab: number;
  craft: number;
};

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

/** Distribute STAT_POINTS across 4 stats, each clamped 1–10. */
function deriveStats(h: number): Stats {
  const keys: (keyof Stats)[] = ["insight", "energy", "collab", "craft"];
  const stats: Stats = { insight: 1, energy: 1, collab: 1, craft: 1 };
  let remaining = 20; // 24 - 4 baseline
  let seed = h;
  // Hard cap prevents any pathological infinite loop
  for (let guard = 0; remaining > 0 && guard < 200; guard++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const key = keys[seed % 4]!;
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

/** Sam Shariatmadari — fixed demo "you" from people.json */
export const DEMO_PERSON_ID = "mmCmsGosPlA7EM53lMMAAsJx";

export const DEMO_COLLEAGUE: Colleague =
  COLLEAGUES.find((c) => c.id === DEMO_PERSON_ID) ?? COLLEAGUES[0]!;

/** Colleagues excluding the demo user (for the collection grid). */
export const COLLECTIBLE_COLLEAGUES: Colleague[] = COLLEAGUES.filter(
  (c) => c.id !== DEMO_PERSON_ID,
);

/** Two people with photos so the collection looks alive on day one. */
export const INITIALLY_UNLOCKED: string[] = (() => {
  const withPhotos = COLLECTIBLE_COLLEAGUES.filter((c) => c.avatarUrl);
  return [withPhotos[0]?.id, withPhotos[1]?.id].filter(Boolean) as string[];
})();
