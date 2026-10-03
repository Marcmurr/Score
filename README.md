<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 40k Stream Scoreboard

A Warhammer 40,000 (11th edition) scoreboard for live streams. Keep score on a tablet or phone, and show the same board in OBS, updating in real time.

Live app: https://marcmurr.github.io/Score/

## Features

- Command Points, and Primary and Secondary VP for each battle round
- Each player's Force Disposition and Primary Mission
- Tactical secondaries (cards stay in hand until scored or discarded) or Fixed secondaries
- 11th edition caps: Primary and Secondary each max 15 VP per battle round and 45 VP per game, 20 VP per Fixed Secondary, plus 10 VP for a Battle Ready army
- End-of-game summary with per-round scores and every mission played
- The game is saved in the browser, so reloading the page keeps the scores

## Streaming to OBS

1. Open the app on the device you'll keep score on.
2. Press **Stream** and copy the link.
3. In OBS, add a **Browser Source** and paste the link.

The link stays the same when you reload the scoreboard, so you only need to add it to OBS once. The overlay reconnects on its own if the connection drops, and shows a notice while it's reconnecting. Keep only one scoreboard tab open: two tabs in the same browser share a stream link and will compete for it.

The connection uses the free public [PeerJS](https://peerjs.com/) server to find the scoreboard, then streams directly between the two browsers. Very strict networks that block direct connections can stop the overlay from connecting.

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`

`npm run build` type-checks and builds the site into `dist/`.

## Deploy

Every push to `main` builds the app and deploys it to GitHub Pages (`.github/workflows/deploy.yml`). The `base` in `vite.config.ts` must match the repository name.

This app was started in Google AI Studio: https://ai.studio/apps/drive/13pSEkm10M3yNAouPxoJVxN2fw9g-taDJ
