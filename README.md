# Airlines

<p align="center">
  <img src="docs/logo.svg" alt="Airlines logo" width="120" />
</p>

<p align="center">
  <strong>Premium dark-themed travel site</strong><br/>
  Flight search · Destinations · Affiliate booking handoff
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%2B%20Tailwind-38bdf8?style=for-the-badge" alt="Frontend" />
  <img src="https://img.shields.io/badge/Backend-Node%20%2B%20Express-339933?style=for-the-badge" alt="Backend" />
  <img src="https://img.shields.io/badge/Database-Supabase-3ecf8e?style=for-the-badge" alt="Supabase" />
</p>

---

## Important

- **No API secrets in this repo.** Use `api/.env` locally (see `.env.example` placeholders only).
- On-page flight results are **sample UI**. Booking opens partner sites (affiliate links).
- Final prices and tickets are on the partner — never claimed as live inventory on this site.

## Files

| Path | Purpose |
|------|---------|
| `index.html` | Main production frontend |
| `404.html` | Not-found page (Netlify auto) |
| `robots.txt` / `sitemap.xml` | SEO |
| `api/` | Optional Express + Supabase skeleton |
| `docs/logo.svg` | Brand mark |

## Quick start

```bash
npx serve .
# or deploy index.html + 404.html to Netlify
```

## Legal on the site

Privacy, Cookies, Terms, Accessibility, Affiliate/advertising disclosure — sections on `index.html`.

## License

Private project — all rights reserved.
