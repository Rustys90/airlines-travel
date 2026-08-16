# Upload index.html

The production `index.html` (~125 KB) is the Netlify file.

1. Download from the project / Netlify deploy source
2. GitHub → Add file → Upload files → `index.html`
3. Or drag only `index.html` to Netlify

**API:** `api/server.js` must be hosted separately with `DUFFEL_ACCESS_TOKEN`. Set on the site:
```html
<script>window.AIRLINES_API_BASE = "https://YOUR-API-HOST";</script>
```

Never put Duffel tokens in index.html.
