// ---------------------------------------------------------------
// Orbit — mock seed data. All state is in-memory (no persistence),
// per the build guidance. A fixed demo user is "logged in".
// ---------------------------------------------------------------

export const RARITIES = ["Common", "Rare", "Epic", "Legendary"];

export const RARITY_STYLES = {
  Common: {
    label: "Common",
    gradient: "from-slate-600 to-slate-800",
    glow: "glow-common",
    text: "text-slate-300",
    chip: "bg-slate-500/20 text-slate-300 border-slate-400/30",
  },
  Rare: {
    label: "Rare",
    gradient: "from-blue-600 to-indigo-900",
    glow: "glow-rare",
    text: "text-blue-300",
    chip: "bg-blue-500/20 text-blue-300 border-blue-400/30",
  },
  Epic: {
    label: "Epic",
    gradient: "from-violet-600 to-purple-950",
    glow: "glow-epic",
    text: "text-violet-300",
    chip: "bg-violet-500/20 text-violet-300 border-violet-400/30",
  },
  Legendary: {
    label: "Legendary",
    gradient: "from-amber-500 to-orange-800",
    glow: "glow-legendary",
    text: "text-amber-300",
    chip: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  },
};

export const AVATARS = [
  "🧑‍🚀", "👩‍🚀", "👨‍🚀", "🛰️", "🚀", "🌟", "🦊", "🐙",
  "🤖", "👾", "🦉", "🐺", "🌙", "☄️", "🔭", "🪐",
];

export const STAT_KEYS = [
  { key: "insight", label: "Insight", icon: "🔮" },
  { key: "energy", label: "Energy", icon: "⚡" },
  { key: "collab", label: "Collab", icon: "🤝" },
  { key: "craft", label: "Craft", icon: "🛠️" },
];

export const STAT_POINTS = 24; // points to allocate across four stats

// The fixed demo user
export const DEMO_USER = {
  id: "u-you",
  name: "Sam Vega",
  role: "Product Engineer",
  squadId: "sq-nebula",
  spawnPlanetId: "p-riskara",
  xp: 40,
};

// ~20 seeded colleagues. Directory pull itself is faked — these are stubs.
export const COLLEAGUES = [
  { id: "u-01", name: "Priya Anand", role: "Underwriting Lead", avatar: "🦉", rarity: "Legendary", catchphrase: "Price the risk, not the fear.", stats: { insight: 9, energy: 5, collab: 6, craft: 4 } },
  { id: "u-02", name: "Marcus Boyd", role: "Platform Engineer", avatar: "🤖", rarity: "Epic", catchphrase: "It works on every machine.", stats: { insight: 6, energy: 4, collab: 5, craft: 9 } },
  { id: "u-03", name: "Elif Kaya", role: "Product Designer", avatar: "🦊", rarity: "Epic", catchphrase: "Ship the feeling, not the feature.", stats: { insight: 7, energy: 6, collab: 7, craft: 4 } },
  { id: "u-04", name: "Tom Whitfield", role: "Actuarial Analyst", avatar: "🔭", rarity: "Rare", catchphrase: "The tail risk always wags.", stats: { insight: 8, energy: 3, collab: 5, craft: 8 } },
  { id: "u-05", name: "Grace Osei", role: "Engineering Manager", avatar: "🌟", rarity: "Legendary", catchphrase: "Unblock before you build.", stats: { insight: 6, energy: 7, collab: 9, craft: 2 } },
  { id: "u-06", name: "Daniel Craven", role: "Data Scientist", avatar: "👾", rarity: "Rare", catchphrase: "In distributions we trust.", stats: { insight: 9, energy: 4, collab: 4, craft: 7 } },
  { id: "u-07", name: "Hannah Liu", role: "Frontend Engineer", avatar: "🐙", rarity: "Epic", catchphrase: "Eight hands, one branch.", stats: { insight: 5, energy: 7, collab: 6, craft: 6 } },
  { id: "u-08", name: "Olly Fenwick", role: "Sales Engineer", avatar: "🚀", rarity: "Common", catchphrase: "Demo gods, be kind.", stats: { insight: 5, energy: 9, collab: 7, craft: 3 } },
  { id: "u-09", name: "Ruth Bamford", role: "Claims Specialist", avatar: "🌙", rarity: "Rare", catchphrase: "Every claim tells a story.", stats: { insight: 7, energy: 4, collab: 8, craft: 5 } },
  { id: "u-10", name: "Kwame Mensah", role: "Backend Engineer", avatar: "🛰️", rarity: "Epic", catchphrase: "Latency is a choice.", stats: { insight: 6, energy: 5, collab: 4, craft: 9 } },
  { id: "u-11", name: "Sofia Marino", role: "Delivery Lead", avatar: "☄️", rarity: "Rare", catchphrase: "Scope is a verb.", stats: { insight: 5, energy: 8, collab: 8, craft: 3 } },
  { id: "u-12", name: "James Alcott", role: "Pricing Actuary", avatar: "🪐", rarity: "Epic", catchphrase: "Margins love the details.", stats: { insight: 9, energy: 3, collab: 4, craft: 8 } },
  { id: "u-13", name: "Nadia Rahman", role: "QA Engineer", avatar: "🦊", rarity: "Common", catchphrase: "Broken on purpose, fixed for good.", stats: { insight: 6, energy: 6, collab: 5, craft: 7 } },
  { id: "u-14", name: "Peter Straub", role: "Compliance Officer", avatar: "🦉", rarity: "Rare", catchphrase: "Regulated, not restricted.", stats: { insight: 8, energy: 3, collab: 6, craft: 7 } },
  { id: "u-15", name: "Amara Diallo", role: "People Partner", avatar: "🌟", rarity: "Epic", catchphrase: "Culture ships weekly too.", stats: { insight: 6, energy: 7, collab: 9, craft: 2 } },
  { id: "u-16", name: "Leo Turner", role: "DevOps Engineer", avatar: "🤖", rarity: "Rare", catchphrase: "If it hurts, automate it.", stats: { insight: 5, energy: 6, collab: 4, craft: 9 } },
  { id: "u-17", name: "Ingrid Solberg", role: "Underwriter", avatar: "👩‍🚀", rarity: "Common", catchphrase: "Trust, but verify the schedule.", stats: { insight: 7, energy: 5, collab: 6, craft: 6 } },
  { id: "u-18", name: "Ravi Chandra", role: "ML Engineer", avatar: "👾", rarity: "Legendary", catchphrase: "The model is never done.", stats: { insight: 9, energy: 4, collab: 5, craft: 6 } },
  { id: "u-19", name: "Beth Cartwright", role: "Ops Manager", avatar: "🐺", rarity: "Common", catchphrase: "Calm is a process.", stats: { insight: 5, energy: 7, collab: 8, craft: 4 } },
  { id: "u-20", name: "Yusuf Demir", role: "Solutions Architect", avatar: "🔭", rarity: "Rare", catchphrase: "Draw it before you build it.", stats: { insight: 8, energy: 5, collab: 6, craft: 5 } },
];

// Three learning planets. Riskara has the real quiz; others are visual.
export const PLANETS = [
  {
    id: "p-riskara",
    name: "Riskara",
    domain: "Insurance Fundamentals",
    order: 1,
    size: 150,
    color: "from-rose-400 via-orange-500 to-amber-700",
    ring: true,
    real: true,
    blurb: "Where every new joiner learns to speak insurance. Complete missions to earn XP for your squad.",
  },
  {
    id: "p-modelia",
    name: "Modelia",
    domain: "Data & Models",
    order: 2,
    size: 115,
    color: "from-cyan-400 via-blue-500 to-indigo-800",
    ring: false,
    real: false,
    blurb: "Pricing models, data pipelines and the ML that powers them.",
  },
  {
    id: "p-shipyard",
    name: "Shipyard",
    domain: "Engineering & Delivery",
    order: 3,
    size: 130,
    color: "from-emerald-400 via-teal-500 to-cyan-800",
    ring: true,
    real: false,
    blurb: "How we build, review and ship — from branch to production.",
  },
];

// ~15 hardcoded questions for Riskara (the one real-ish planet)
export const QUESTIONS = [
  { id: "q01", prompt: "What does 'underwriting' mean?", options: ["Signing documents in ink", "Assessing and pricing risk before offering cover", "Writing policy documents", "Auditing claims after they happen"], answerIdx: 1, xp: 10 },
  { id: "q02", prompt: "A 'premium' is…", options: ["The payout after a claim", "A top-tier customer", "The price the insured pays for cover", "An optional policy add-on"], answerIdx: 2, xp: 10 },
  { id: "q03", prompt: "What is an 'excess' (deductible)?", options: ["Extra cover beyond the policy limit", "The amount the insured pays before the insurer pays", "A penalty for late premiums", "Profit above the loss ratio"], answerIdx: 1, xp: 10 },
  { id: "q04", prompt: "The 'loss ratio' compares…", options: ["Claims paid to premiums earned", "Staff costs to revenue", "Policies lapsed to policies sold", "Reserves to reinsurance"], answerIdx: 0, xp: 10 },
  { id: "q05", prompt: "What is reinsurance?", options: ["Renewing a policy", "Insurance that insurers buy to spread their own risk", "Re-issuing a lost policy document", "A second opinion on a claim"], answerIdx: 1, xp: 10 },
  { id: "q06", prompt: "In the London Market, a 'syndicate' is…", options: ["A broker network", "A group underwriting risk together at Lloyd's", "An industry regulator", "A claims committee"], answerIdx: 1, xp: 10 },
  { id: "q07", prompt: "A broker's main job is to…", options: ["Pay claims", "Regulate insurers", "Match clients with insurers and negotiate cover", "Set industry-wide prices"], answerIdx: 2, xp: 10 },
  { id: "q08", prompt: "'Exposure' refers to…", options: ["Bad press about an insurer", "The extent of potential loss an insurer faces", "Publishing policy terms", "Sunlight damage claims"], answerIdx: 1, xp: 10 },
  { id: "q09", prompt: "What is a 'binder' (binding authority)?", options: ["A folder of policies", "Authority delegated to an agent to accept risks for an insurer", "A legally binding claim", "The cover note stapler"], answerIdx: 1, xp: 15 },
  { id: "q10", prompt: "An 'MGA' is a…", options: ["Managing General Agent", "Mutual Guarantee Association", "Major General Adjuster", "Minimum Guaranteed Amount"], answerIdx: 0, xp: 15 },
  { id: "q11", prompt: "'Aggregation' risk means…", options: ["Too many policies from one broker", "Many separate losses arising from a single event", "Combining premiums into one invoice", "Merging two insurers"], answerIdx: 1, xp: 15 },
  { id: "q12", prompt: "A 'slip' in specialty insurance is…", options: ["A pricing error", "The document setting out risk terms for underwriters", "A cancelled policy", "A wet floor claim"], answerIdx: 1, xp: 15 },
  { id: "q13", prompt: "'Capacity' in an insurance context is…", options: ["Office headcount", "The maximum risk an insurer can accept", "Server bandwidth", "Claims team workload"], answerIdx: 1, xp: 15 },
  { id: "q14", prompt: "What does 'parametric insurance' pay out on?", options: ["Proven financial loss only", "A pre-agreed trigger event, like wind speed above X", "Court judgements", "Annual review outcomes"], answerIdx: 1, xp: 20 },
  { id: "q15", prompt: "Why do insurers digitise underwriting (hint: it's why we exist)?", options: ["To print fewer slips", "Faster, more consistent, data-driven risk decisions", "To replace underwriters entirely", "Because paper is expensive"], answerIdx: 1, xp: 20 },
];

export const SQUAD = {
  id: "sq-nebula",
  name: "Squad Nebula",
  memberIds: ["u-you", "u-03", "u-07", "u-10", "u-13", "u-19"],
  goalXp: 600,
  baseXp: 210, // xp already contributed by other members (mock)
};

export const CREWS = [
  { id: "cr-01", name: "Crew Ignition", desc: "Engineers × Underwriters — shipping the new submission flow.", memberCount: 6 },
  { id: "cr-02", name: "Crew Deep Field", desc: "Data × Claims — anomaly detection for claims triage.", memberCount: 5 },
  { id: "cr-03", name: "Crew Starling", desc: "Design × Sales — the demo environment glow-up.", memberCount: 4 },
];

// Colleagues start locked except a couple, so the collection looks alive
export const INITIALLY_UNLOCKED = ["u-05", "u-08"];

// The scripted auto-detect prompt (painted door)
export const AUTO_DETECT_SUGGESTION = {
  colleagueId: "u-03",
  context: "Design Review — 25 min together, 2:00pm today",
};
