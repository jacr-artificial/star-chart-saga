# Orbit 🪐

Demo-grade build of the Orbit onboarding game, per the Team 10 build companion doc. One real loop (the card loop), convincing façade for everything else.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## What's real vs painted door

| Area | Status |
|---|---|
| My card editor (avatar, style, catchphrase, stat points) | ✅ Real |
| Collection grid — 20 seeded colleagues, locked silhouettes | ✅ Real (seeded) |
| Collect flow — mutual tap-to-confirm or QR, unlock animation | ✅ Real (the hero moment) |
| Squad progress bar over local state | ✅ Real-ish |
| Riskara quiz — 15 hardcoded questions, XP | ✅ Real-ish |
| CV drop → spawn planet reveal | 🚪 Painted door (file never read) |
| Modelia / Shipyard planets | 🚪 Painted door (visual only) |
| Auto-detect meetings toggle → "we noticed you met…" | 🚪 Painted door (scripted, 2.6s delay) |
| Crews | 🚪 Painted door (teased on Squad screen) |
| Auth / persistence | Faked — fixed demo user, all state in memory |

## Demo script pointers

1. Cold open on the CV drop → planet reveal → note the "we don't keep your CV" trust beat.
2. Galaxy map → The Galaxy collection: goal instantly legible.
3. My card: customise live (glow-up from Common stub to Legendary).
4. **Hero moment:** open a locked colleague → QR tab → Simulate scan → unlock flourish. (Tap-to-confirm tab shows the two-device version.)
5. Hop to Riskara, answer one question, show Squad Nebula's bar tick up.
6. Flip the auto-detect toggle on the Galaxy map and wait ~3s for the scripted prompt.

## Stack

React 18 + Vite + Tailwind v4 + Three.js. No backend, no router, no persistence — deliberately. The galaxy map is a 3D orrery (Three.js): planets orbit a central star on visible rings with orrery arms, linked by connection lines with travelling pulses. Drag to orbit, scroll to zoom, click a planet to land. Everything else is CSS animation (card flip, holo sweep, unlock burst, confetti).
