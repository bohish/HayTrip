# HayTrip — AI Travel Agent (iPhone Prototype)

HayTrip is an AI-powered travel agent concept: the user describes the trip they want in natural Arabic, and HayTrip searches, compares, recommends (with an explanation), and builds a complete shareable itinerary.

## Project structure

```
index.html
vite.config.js
package.json
capacitor.config.json
src/
  main.jsx            React entry point
  App.jsx              HayTrip app (iPhone-framed, RTL Arabic) — the whole prototype
  index.css
brand/
  HayTrip-Brand-System.html   Brand system reference sheet
docs/
  Architecture-Phase1.md              Product architecture, screen map, 4-phase roadmap
  Phase1-Review-Phase2-Plan.md        Phase 1 acceptance review + Phase 2 plan + provider research
```

## Run it locally

```bash
npm install
npm run dev
```
Opens at http://localhost:5173 — resize the browser or use device toolbar to see it as an iPhone; the app renders its own phone frame either way.

## Build

```bash
npm run build
```
Outputs to `dist/`.

## Wrap for iOS (Capacitor)

This isn't wired up with `@capacitor/ios` yet (no `ios/` folder committed). To add it:

```bash
npm install
npx cap add ios
npm run build
npx cap sync ios
npx cap open ios     # opens Xcode
```

Then build/run from Xcode as usual with your Apple Developer Team ID.

`capacitor.config.json` has a placeholder `appId` (`com.hisham.haytrip`) — change it to match whatever you register in App Store Connect before archiving.

## Status

Phase 1 (product foundation + UI system): **PASS WITH FIXES** — see `docs/Phase1-Review-Phase2-Plan.md`.
Phase 2 (AI travel agent logic — real parsing, reasoning, recommendation engine) not yet implemented — all data is mocked, shaped to match the normalized models Phase 3 will need.

## Brand

Navy `#0B1523` · Green `#16C784` · Deep Teal `#0F766E` · Off White `#F2F4F7` · Warm Cream `#FFF3E0`
Logo: H + integrated green travel path + airplane. AI states use the same travel-path motif instead of generic sparkle icons — see `brand/HayTrip-Brand-System.html`.
