# Airlines

Dark-themed flight search with **Duffel** via a separate API.

## Stack
- Frontend: Netlify (`index.html`)
- API: Render `https://flyio-xu16.onrender.com`
- This repo: `api/` Express proxy

## Local
```bash
cd api && cp .env.example .env && npm install && npm start
```

## Config
```html
<script>window.AIRLINES_API_BASE = "https://flyio-xu16.onrender.com";</script>
```

Never commit secrets. Token only on Render.
