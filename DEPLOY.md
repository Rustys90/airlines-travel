
# Deploy

## Netlify (frontend only)
- Publish `index.html` (optional `404.html` + `netlify.toml`).
- Flight API **cannot** run on static Netlify with a secret token.

## API host (Railway / Render / Fly)
```bash
cd api
npm install
npm start
```
Env: `DUFFEL_ACCESS_TOKEN=...`

Then on the site:
```html
<script>window.AIRLINES_API_BASE = "https://your-api.example.com";</script>
```
