# Airlines

<p align="center">
  <img src="docs/logo.svg" alt="Airlines logo" width="120" />
</p>

<p align="center">
  <strong>Premium dark-themed travel agency</strong><br/>
  Flight search · Destinations · Pricing packages · Ready for affiliate ticketing
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%2B%20Tailwind-38bdf8?style=for-the-badge" alt="Frontend" />
  <img src="https://img.shields.io/badge/Backend-Node%20%2B%20Express-339933?style=for-the-badge" alt="Backend" />
  <img src="https://img.shields.io/badge/Database-Supabase-3ecf8e?style=for-the-badge" alt="Supabase" />
  <img src="https://img.shields.io/badge/Flights-fli--js-violet?style=for-the-badge" alt="fli-js" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/languages/top/Rustys90/airlines-travel?style=flat-square" alt="Top language" />
  <img src="https://img.shields.io/github/last-commit/Rustys90/airlines-travel?style=flat-square" alt="Last commit" />
  <img src="https://img.shields.io/badge/license-Private-lightgrey?style=flat-square" alt="License" />
</p>

---

## Overview

Airlines is a production-style travel landing page with a polished dark UI, SEO, accessibility, and a small Express API wired for Supabase. Flight results can be powered by **fli-js** (Google Flights data) and monetized later via affiliate partners (Travelpayouts, Skyscanner, etc.).

**No API keys or secrets are stored in this repository.** Use `.env` locally (see `.env.example`).

---

## Features

| Area | Details |
|------|---------|
| **UI** | Dark theme + light toggle, glass navbar, scroll reveals, counters, gallery lightbox |
| **SEO** | Open Graph, Twitter Cards, JSON-LD `TravelAgency`, `robots.txt`, `sitemap.xml` |
| **A11y** | Semantic HTML, ARIA, focus styles, `prefers-reduced-motion` |
| **Flights** | Search form (origin / destination / dates / cabin) + results UI |
| **Commerce-ready** | Pricing tiers, booking inquiry endpoints, affiliate-ready Select button |
| **API** | Express routes for flights, leads, contact, bookings, destinations |

---

## Screenshots

> Add screenshots under `docs/screenshots/` and link them here after deploy.

```
docs/screenshots/hero.png
docs/screenshots/flights.png
docs/screenshots/pricing.png
```

---

## Project structure

```text
.
├── index.html              # Full production frontend
├── robots.txt
├── sitemap.xml
├── README.md
├── docs/
│   ├── logo.svg            # Brand mark
│   └── screenshots/        # Optional UI captures
└── api/
    ├── package.json
    ├── server.js           # Express API
    └── .env.example        # Placeholders only — no real keys
```

---

## Quick start

### Frontend only

```bash
npx serve .
# open http://localhost:3000
```

### Full stack

```bash
cd api
cp .env.example .env
# Fill SUPABASE_URL and SUPABASE_ANON_KEY from your Supabase project settings

npm install
# Optional — live Google Flights via fli-js:
# npm install fli-js

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment (`api/.env`)

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
PORT=3000
```

> **Security:** Never commit `.env` or real keys. Only `.env.example` with placeholders belongs in git.

---

## API routes

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/flights` | Flight search (fli-js when installed) |
| `GET` | `/api/destinations` | Active destinations |
| `POST` | `/api/leads` | Newsletter signup |
| `POST` | `/api/contact` | Contact form |
| `POST` | `/api/bookings` | Booking inquiry |

---

## Flight monetization (affiliate)

Flights-only commissions are typically low (about 1–2%). Recommended path:

1. **Travelpayouts** — multiple flight brands, one dashboard  
2. **Skyscanner** (via Impact) — CPC / revenue-share  
3. Optional: Expedia Group flight offers  

Wire partner tracking IDs into the **Select / Book** button when accounts are ready. No affiliate secrets should live in the repo.

---

## Tech stack

- **Frontend:** HTML, Tailwind CSS (CDN), vanilla JS  
- **Backend:** Node.js, Express  
- **Database:** Supabase (Postgres + RLS)  
- **Flight data:** [fli-js](https://github.com/punitarani/fli) (optional)  
- **Hosting:** Any static host + Node host (Vercel, Railway, Fly, etc.)

---

## Roadmap

- [x] SEO & production polish  
- [x] Sections: Pricing, FAQ, Gallery, Stats, Flight search  
- [x] Theme toggle, filters, lazy load, forms  
- [x] Supabase schema + Express API skeleton  
- [ ] Live fli-js results in production  
- [ ] Affiliate deep-links (Travelpayouts → Skyscanner)  
- [ ] Booking modal → Supabase `bookings`  
- [ ] Optional Stripe deposit for packages  

---

## License

Private project — all rights reserved.
