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
    id: "aelith",
    name: "Aelith Prime",
    tagline: "The Cradle of the Second Dawn",
    description:
      "A verdant world orbiting a binary star, Aelith Prime is remembered as the birthplace of the Second Dawn — the philosophical movement that redefined what it means to be conscious in the wake of the Silent War.",
    facts: {
      climate: "Temperate, twin-sunned. Perpetual golden hour along the equator.",
      inhabitants: "The Aelithan, a long-lived humanoid people with iridescent skin.",
      factions: "The Choral Assembly, the Verdant Order, exiled Sun-Wardens.",
      history: "Cradle world of interstellar diplomacy for over 4,000 cycles.",
    },
    x: -0.15, y: 0.05, depth: 0.9, size: 46,
    color: "#5fb8a2", glow: "#8ff0d0",
    hasRings: false, moons: 2,
    orbitSpeed: 0.012, spinSpeed: 0.15,
  },
  {
    id: "vharon",
    name: "Vharon",
    tagline: "The Iron Cathedral",
    description:
      "A tidally locked forge-world where entire continents have been hollowed into cathedrals of black steel. The Vharon Guild trades in weapons whispered to remember the hands that made them.",
    facts: {
      climate: "Perpetual dusk. Molten dayside, glacial nightside.",
      inhabitants: "The Ferroborn — ceramic-armored artisans and metallurgists.",
      factions: "The Anvil-Priesthood, House Karn, the Rustbound heretics.",
      history: "Founded by refugees fleeing the collapse of the Old Meridian.",
    },
    x: 0.35, y: -0.22, depth: 0.85, size: 38,
    color: "#c9542f", glow: "#ffb27a",
    hasRings: true, ringColor: "#f4c17a", moons: 1,
    orbitSpeed: -0.008, spinSpeed: 0.22,
  },
  {
    id: "myrrhal",
    name: "Myrrhal",
    tagline: "The Whispering Ocean",
    description:
      "A single sapphire sea covers Myrrhal from pole to pole. Beneath its surface, the Reef-Choirs sing in currents older than memory, and every song is said to be a prophecy already fulfilled.",
    facts: {
      climate: "Oceanic, storm-lashed, bioluminescent nights.",
      inhabitants: "The Choral Nautilids and the drifting Salt-Pilgrims.",
      factions: "The Deep Concord, the Tide-Readers, the Silent Fleet.",
      history: "Contacted only after its songs were heard from twelve systems away.",
    },
    x: -0.55, y: -0.35, depth: 0.7, size: 34,
    color: "#3a7bd5", glow: "#7ec8ff",
    moons: 3,
    orbitSpeed: 0.006, spinSpeed: 0.12,
  },
  {
    id: "kestrion",
    name: "Kestrion",
    tagline: "The Windborne Republic",
    description:
      "There is no ground on Kestrion — only sky. Vast floating cities ride perpetual jetstreams above a gas giant's crushing core, tethered by nothing but shared law and stubborn faith.",
    facts: {
      climate: "Layered atmosphere. Aerial gardens above, thunder below.",
      inhabitants: "The Skyfolk — long-limbed, hollow-boned aerialists.",
      factions: "The Republic of Twelve Winds, the Falconer Guilds.",
      history: "The first world to abolish the concept of borders.",
    },
    x: 0.6, y: 0.3, depth: 0.65, size: 52,
    color: "#d9a94a", glow: "#ffe0a0",
    hasRings: true, ringColor: "#a67c3a", moons: 4,
    orbitSpeed: -0.005, spinSpeed: 0.09,
  },
  {
    id: "solivane",
    name: "Solivane",
    tagline: "The Garden of Uncounted Names",
    description:
      "A world entirely cultivated. Every hill, river, and cloud on Solivane is the deliberate work of the Namers, a monastic order who believe reality is a poem being slowly, patiently rewritten.",
    facts: {
      climate: "Engineered. Seasons on a 40-day cycle.",
      inhabitants: "The Namers and their silent botanical familiars.",
      factions: "The Nine Verses, the Unwritten, the Gardener-Kings.",
      history: "Terraformed over 900 years by hand, without machines.",
    },
    x: 0.1, y: 0.55, depth: 0.5, size: 30,
    color: "#a56fd6", glow: "#d8b0ff",
    moons: 1,
    orbitSpeed: 0.009, spinSpeed: 0.18,
  },
  {
    id: "nyxara",
    name: "Nyxara",
    tagline: "The Widow of Stars",
    description:
      "A rogue world drifting through the dark between arms of the galaxy. Nyxara has no sun, only the cold light of distant nebulae — yet something in its ice sings back when spoken to.",
    facts: {
      climate: "Sub-zero. Diamond snow. Auroras from no known source.",
      inhabitants: "Unknown. Signals recorded. No contact confirmed.",
      factions: "The Listeners, the Nyx Expedition (presumed lost).",
      history: "First mapped by the doomed Halcyon survey, 812 A.C.",
    },
    x: -0.75, y: 0.5, depth: 0.4, size: 26,
    color: "#4a4f7a", glow: "#8895ff",
    moons: 0,
    orbitSpeed: 0.003, spinSpeed: 0.05,
  },
  {
    id: "orune",
    name: "Orune",
    tagline: "The Amber Archive",
    description:
      "Every living thing on Orune, upon dying, turns to amber. Over eons the planet has become a translucent museum of its own history, walked by scholars who read the dead like books.",
    facts: {
      climate: "Warm, arid, resin-scented winds.",
      inhabitants: "The Amberwrights and the Reader-Cartographers.",
      factions: "The Library-Perpetual, the Fossil Court.",
      history: "Every era of Orune is preserved, literally, underfoot.",
    },
    x: 0.45, y: -0.6, depth: 0.55, size: 36,
    color: "#e0a349", glow: "#ffd88a",
    moons: 2,
    orbitSpeed: -0.011, spinSpeed: 0.14,
  },
  {
    id: "threnody",
    name: "Threnody",
    tagline: "The World That Remembers",
    description:
      "Threnody's crust is laced with a mineral that records sound across centuries. Walk any street and the walls will replay the footsteps of everyone who ever passed — softly, patiently, forever.",
    facts: {
      climate: "Cool, misted, low ambient noise by law.",
      inhabitants: "The Threnodians, keepers of the Living Record.",
      factions: "The Quiet Order, the Echo-Guilds, the Forgetters.",
      history: "Colonized during the Silent War as a place of testimony.",
    },
    x: -0.4, y: -0.05, depth: 0.75, size: 32,
    color: "#7fb5b5", glow: "#c0f0f0",
    hasRings: true, ringColor: "#9fd0d0", moons: 1,
    orbitSpeed: 0.007, spinSpeed: 0.11,
  },
];
