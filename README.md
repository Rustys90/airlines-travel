
# Airlines

Dark-themed travel site with **Duffel** flight search and test booking.

## Stack
- `index.html` — UI (Tailwind CDN, vanilla JS)
- `api/server.js` — Express proxy to Duffel (token stays on server)
- `404.html` — Not-found page
- `DEPLOY.md` — Hosting notes

## Done in code
- Duffel search (`POST /api/flights`) + place resolve
- Multi-passenger checkout → `POST /api/orders` (test: balance payment)
- Date validation, phone checks, escaped results
- Legal sections, cookie banner, disclosures, accessibility

## Local
```bash
cd api
cp .env.example .env
# DUFFEL_ACCESS_TOKEN=duffel_test_...
npm install
npm start
```
Open http://localhost:3000

## Netlify
Upload `index.html` (and optional `404.html`). Flight search needs a separate API host with the Duffel token — set `window.AIRLINES_API_BASE` when the API is live.

## Your checklist
1. Rotate any token shared in chat
2. Duffel business verification + live token when ready
3. Deploy API with `DUFFEL_ACCESS_TOKEN`
4. Never commit `.env` or real secrets
