# Airlines — Premium Travel Agency Website

A modern, dark-themed travel agency landing page with flight search, destination browsing, pricing packages, and a backend ready for real bookings and affiliate ticketing.

**Stack:** Single-page frontend + Express API + Supabase.

---

## Features

### Frontend
- Dark theme (`#0a0a0a`) with light-mode toggle (persisted in localStorage)
- Fully responsive (mobile, tablet, desktop)
- SEO: Open Graph, Twitter Cards, JSON-LD TravelAgency schema
- Semantic HTML + accessibility (ARIA, focus states, prefers-reduced-motion)
- Cookie consent banner
- Loading screen, scroll-reveal animations, animated counters
- Subtle parallax on hero video
- Destination grid with region filters (All / Asia / Europe / Tropical)
- Flight search UI (origin, destination, dates, cabin, passengers)
- Pricing tiers: Basic · Premium · Luxury
- FAQ accordion
- Photo gallery with lightbox
- Newsletter form + delayed popup
- Back-to-top button + lazy-loaded images

### Backend (`/api`)
- Express server (static site + JSON API)
- `POST /api/flights` — flight search (ready for fli-js / Google Flights)
- `POST /api/leads` — newsletter signups
- `POST /api/contact` — contact form
- `POST /api/bookings` — booking inquiries
- `GET /api/destinations` — public destination list
- Optional flight-result caching in Supabase

### Database (Supabase)
Tables:
- `destinations` (seeded with 6 popular destinations)
- `bookings`
- `leads`
- `contact_messages`
- `flight_cache`

---

## Project structure

```
.
├── index.html          # Full production frontend
├── robots.txt
├── sitemap.xml
├── README.md
└── api/
    ├── package.json
    ├── server.js
    └── .env.example
```

---

## Quick start

### Frontend only
Open `index.html` in a browser, or:

```bash
npx serve .
```

### Full stack

```bash
cd api
cp .env.example .env
# Add SUPABASE_URL and SUPABASE_ANON_KEY

npm install
# Optional for live flight data:
# npm install fli-js

npm run dev
```

Open http://localhost:3000

### Environment variables (`api/.env`)

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
PORT=3000
```

---

## Flight booking & monetization

Current state:
- Search UI is live
- Results use mock data until the API + fli-js are running
- Select button is ready for affiliate deep-links

Planned (flights only):
1. Travelpayouts — multiple flight brands
2. Skyscanner (via Impact) — CPC / revenue-share
3. Optional Expedia Group flight offers

---

## Tech stack

| Layer     | Tech                                   |
|-----------|----------------------------------------|
| Frontend  | HTML, Tailwind CSS (CDN), vanilla JS   |
| Backend   | Node.js, Express                       |
| Database  | Supabase (Postgres + RLS)              |
| Flights   | fli-js (Google Flights reverse API)    |
| Hosting   | Static host + Node (Vercel, Railway…)  |

---

## Roadmap

- [x] SEO & production polish
- [x] New sections (Pricing, FAQ, Gallery, Stats, Flight search)
- [x] Interactivity (theme, filters, lazy load, forms)
- [x] Supabase schema + seed data
- [x] Express API skeleton
- [ ] Wire live fli-js search results
- [ ] Affiliate deep-links (Travelpayouts → Skyscanner)
- [ ] Booking modal → Supabase bookings
- [ ] Optional Stripe deposit for packages

---

## License

Private project — All rights reserved.
