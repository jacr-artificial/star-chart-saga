export type Planet = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  facts: {
    climate: string;
    inhabitants: string;
    factions: string;
    history: string;
  };
  // Position in galaxy-space (roughly -1..1 range)
  x: number;
  y: number;
  depth: number; // 0 (far) .. 1 (near) — affects parallax + size
  size: number; // base radius in px at zoom=1
  color: string; // main body color
  glow: string; // glow/atmosphere color
  hasRings?: boolean;
  ringColor?: string;
  moons?: number;
  orbitSpeed: number; // radians per second around galactic center
  spinSpeed: number; // self rotation (visual)
};

export const PLANETS: Planet[] = [
  {
    id: "riskara",
    name: "Riskara",
    tagline: "The World of Insurance Fundamentals",
    description:
      "The first stop for every new explorer. Riskara turns the language of insurance into practical missions covering risk, premiums, policies, and the decisions that hold the market together.",
    facts: {
      climate: "Balanced exposure with frequent learning fronts.",
      inhabitants: "New joiners, brokers, underwriters, and curious risk explorers.",
      factions: "The Policy Guild, the Broker Assembly, the Claims Corps.",
      history: "The founding world of the Orbit learning galaxy.",
    },
    x: -0.15,
    y: 0.05,
    depth: 0.9,
    size: 46,
    color: "#5fb8a2",
    glow: "#8ff0d0",
    hasRings: false,
    moons: 2,
    orbitSpeed: 0.012,
    spinSpeed: 0.15,
  },
  {
    id: "premia",
    name: "Premia",
    tagline: "The Market of Price and Value",
    description:
      "A bright trading world where every orbit has a price. Premia explains how insurers turn exposure, data, and appetite into sustainable cover for customers.",
    facts: {
      climate: "Fast-moving markets with periodic pricing cycles.",
      inhabitants: "Pricing actuaries, portfolio managers, and market analysts.",
      factions: "The Rate Makers, the Capacity Exchange, the Margin Council.",
      history: "Built around the first shared model for pricing specialty risk.",
    },
    x: 0.35,
    y: -0.22,
    depth: 0.85,
    size: 38,
    color: "#c9542f",
    glow: "#ffb27a",
    hasRings: true,
    ringColor: "#f4c17a",
    moons: 1,
    orbitSpeed: -0.008,
    spinSpeed: 0.22,
  },
  {
    id: "claimora",
    name: "Claimora",
    tagline: "Where Every Loss Tells a Story",
    description:
      "A deep blue world of incidents, evidence, and recovery. Claimora follows a loss from first notification through investigation, settlement, and lessons learned.",
    facts: {
      climate: "Calm service lanes interrupted by sudden event storms.",
      inhabitants: "Claims handlers, adjusters, experts, and customer advocates.",
      factions: "First Notice, the Adjustment Fleet, the Recovery Office.",
      history: "Its archives preserve the lessons behind every settled claim.",
    },
    x: -0.55,
    y: -0.35,
    depth: 0.7,
    size: 34,
    color: "#3a7bd5",
    glow: "#7ec8ff",
    moons: 3,
    orbitSpeed: 0.006,
    spinSpeed: 0.12,
  },
  {
    id: "syndicara",
    name: "Syndicara",
    tagline: "The Shared-Capacity Republic",
    description:
      "A ringed market where syndicates combine expertise and capital. Syndicara maps how brokers, managing agents, and underwriters collaborate across the London Market.",
    facts: {
      climate: "Layered placement systems with active subscription currents.",
      inhabitants: "Brokers, managing agents, coverholders, and market operators.",
      factions: "The Slip Exchange, the Syndicate Council, the Market Bureau.",
      history: "Capacity has been shared here across generations of complex risks.",
    },
    x: 0.6,
    y: 0.3,
    depth: 0.65,
    size: 52,
    color: "#d9a94a",
    glow: "#ffe0a0",
    hasRings: true,
    ringColor: "#a67c3a",
    moons: 4,
    orbitSpeed: -0.005,
    spinSpeed: 0.09,
  },
  {
    id: "actuaria",
    name: "Actuaria",
    tagline: "The Observatory of Probabilities",
    description:
      "A precise observatory world where uncertainty becomes a distribution. Actuaria explores reserves, loss ratios, trends, and the models used to see beyond limited data.",
    facts: {
      climate: "Mostly predictable, with carefully modelled tail events.",
      inhabitants: "Actuaries, data scientists, and forecasting specialists.",
      factions: "The Reserving Circle, the Ratio Keepers, the Model Observatory.",
      history: "Home of the galaxy's longest-running loss-development triangles.",
    },
    x: 0.1,
    y: 0.55,
    depth: 0.5,
    size: 30,
    color: "#a56fd6",
    glow: "#d8b0ff",
    moons: 1,
    orbitSpeed: 0.009,
    spinSpeed: 0.18,
  },
  {
    id: "parametra",
    name: "Parametra",
    tagline: "The World of Triggered Cover",
    description:
      "A remote sensor world where policies respond to measurable events. Parametra teaches how pre-agreed triggers can deliver rapid, transparent protection.",
    facts: {
      climate: "Instrumented winds, rainfall, temperature, and seismic activity.",
      inhabitants: "Product innovators, data providers, and trigger designers.",
      factions: "The Sensor Grid, the Trigger Council, the Payout Network.",
      history: "Its first policy paid automatically before the storm clouds cleared.",
    },
    x: -0.75,
    y: 0.5,
    depth: 0.4,
    size: 26,
    color: "#4a4f7a",
    glow: "#8895ff",
    moons: 0,
    orbitSpeed: 0.003,
    spinSpeed: 0.05,
  },
  {
    id: "reinsura",
    name: "Reinsura",
    tagline: "The Shield Behind the Shield",
    description:
      "A fortified amber world where insurers protect their own balance sheets. Reinsura shows how treaties, facultative placements, and layers spread major losses.",
    facts: {
      climate: "Stable layers designed to absorb catastrophe seasons.",
      inhabitants: "Reinsurance buyers, brokers, and treaty underwriters.",
      factions: "The Treaty Houses, the Facultative Guild, the Retrocession Guard.",
      history: "Its layered shields have protected the galaxy from its largest events.",
    },
    x: 0.45,
    y: -0.6,
    depth: 0.55,
    size: 36,
    color: "#e0a349",
    glow: "#ffd88a",
    moons: 2,
    orbitSpeed: -0.011,
    spinSpeed: 0.14,
  },
  {
    id: "aggregara",
    name: "Aggregara",
    tagline: "The Constellation of Connected Risk",
    description:
      "A linked world that reveals how separate policies can share one hidden cause. Aggregara teaches accumulation, concentration, catastrophe scenarios, and portfolio awareness.",
    facts: {
      climate: "Quiet until correlated events align across the system.",
      inhabitants: "Exposure managers, catastrophe modellers, and portfolio teams.",
      factions: "The Accumulation Watch, the Scenario Guild, the Exposure Map.",
      history: "First to prove that distant risks can move together as one event.",
    },
    x: -0.4,
    y: -0.05,
    depth: 0.75,
    size: 32,
    color: "#7fb5b5",
    glow: "#c0f0f0",
    hasRings: true,
    ringColor: "#9fd0d0",
    moons: 1,
    orbitSpeed: 0.007,
    spinSpeed: 0.11,
  },
];
