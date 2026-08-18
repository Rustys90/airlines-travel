# Deploy

## API (Render)
- Root: `api`
- Build: `npm install`
- Start: `npm start`
- Env: `DUFFEL_ACCESS_TOKEN`
- Health: `/api/health`

## Frontend
Netlify: upload `index.html` with AIRLINES_API_BASE set to the Render URL.

## Keep awake
Cron every 10 min: `https://flyio-xu16.onrender.com/api/health`
