/**
 * Airlines API — Express + Duffel (test/live)
 * POST /api/flights  — search offers via Duffel
 * GET  /api/health
 * POST /api/orders  — create order (test: balance)
 *
 * Env: DUFFEL_ACCESS_TOKEN (required for flights)
 * Never expose the token to the browser.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const DUFFEL_TOKEN = process.env.DUFFEL_ACCESS_TOKEN || '';
const DUFFEL_VERSION = 'v2';
const DUFFEL_BASE = 'https://api.duffel.com';

const allowed = (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim());
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowed.includes('*') || allowed.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..')));

function duffelHeaders() {
  return {
    Authorization: `Bearer ${DUFFEL_TOKEN}`,
    'Duffel-Version': DUFFEL_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function resolvePlace(query) {
  const q = String(query || '').trim();
  if (!q) return null;
  if (/^[A-Za-z]{3}$/.test(q)) return q.toUpperCase();
  if (!DUFFEL_TOKEN) return null;
  const url = `${DUFFEL_BASE}/places/suggestions?query=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: duffelHeaders() });
  if (!res.ok) return null;
  const body = await res.json();
  const places = body.data || [];
  const first = places[0];
  if (!first) return null;
  return first.iata_code || first.iata_city_code || null;
}

function formatDuration(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  const h = m[1] ? `${m[1]}h` : '';
  const min = m[2] ? `${m[2]}m` : '';
  return `${h} ${min}`.trim() || iso;
}

function mapOffer(offer) {
  const slice = (offer.slices && offer.slices[0]) || {};
  const segments = slice.segments || [];
  const first = segments[0] || {};
  const last = segments[segments.length - 1] || first;
  const marketing = first.marketing_carrier || first.operating_carrier || {};
  const stops = Math.max(0, segments.length - 1);
  const paxIds = (offer.passengers || []).map((p) => p.id).filter(Boolean);
  return {
    id: offer.id,
    airline: marketing.name || marketing.iata_code || 'Airline',
    flight:
      (first.marketing_carrier_flight_number &&
        `${marketing.iata_code || ''} ${first.marketing_carrier_flight_number}`.trim()) ||
      first.operating_carrier_flight_number ||
      '—',
    depart: (first.departing_at || '').slice(11, 16) || (first.departing_at || ''),
    arrive: (last.arriving_at || '').slice(11, 16) || (last.arriving_at || ''),
    duration: formatDuration(slice.duration || offer.total_duration),
    stops: stops === 0 ? 'Nonstop' : stops === 1 ? '1 stop' : `${stops} stops`,
    price: offer.total_amount,
    currency: offer.total_currency || 'USD',
    cabin: offer.cabin_class || '',
    owner: (offer.owner && offer.owner.name) || '',
    passenger_ids: paxIds,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'airlines-api',
    duffel: DUFFEL_TOKEN ? (DUFFEL_TOKEN.startsWith('duffel_test') ? 'test' : 'configured') : 'missing',
    ts: new Date().toISOString(),
  });
});

app.post('/api/flights', async (req, res) => {
  try {
    if (!DUFFEL_TOKEN) {
      return res.status(503).json({
        error: 'Flight search is not configured (missing DUFFEL_ACCESS_TOKEN on server).',
      });
    }
    const {
      origin,
      destination,
      departDate,
      returnDate,
      passengers = 1,
      cabin = 'economy',
    } = req.body || {};
    if (!origin || !destination || !departDate) {
      return res.status(400).json({
        error: 'origin, destination and departDate are required',
      });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dep = new Date(departDate + 'T00:00:00');
    if (Number.isNaN(dep.getTime()) || dep < today) {
      return res.status(400).json({ error: 'Departure date must be today or in the future.' });
    }
    if (returnDate) {
      const ret = new Date(returnDate + 'T00:00:00');
      if (Number.isNaN(ret.getTime()) || ret < dep) {
        return res.status(400).json({ error: 'Return date must be on or after departure.' });
      }
    }
    const originCode = await resolvePlace(origin);
    const destCode = await resolvePlace(destination);
    if (!originCode || !destCode) {
      return res.status(400).json({
        error:
          'Could not resolve From/To to an airport or city code. Try IATA codes (e.g. JFK, LHR, NYC) or a clearer city name.',
      });
    }
    const paxCount = Math.min(Math.max(Number(passengers) || 1, 1), 9);
    const passengersPayload = Array.from({ length: paxCount }, () => ({ type: 'adult' }));
    const cabinMap = {
      economy: 'economy',
      'premium-economy': 'premium_economy',
      business: 'business',
      first: 'first',
    };
    const slices = [
      { origin: originCode, destination: destCode, departure_date: departDate },
    ];
    if (returnDate) {
      slices.push({
        origin: destCode,
        destination: originCode,
        departure_date: returnDate,
      });
    }
    const payload = {
      data: {
        slices,
        passengers: passengersPayload,
        cabin_class: cabinMap[cabin] || 'economy',
      },
    };
    const url = `${DUFFEL_BASE}/air/offer_requests?return_offers=true`;
    const duffelRes = await fetch(url, {
      method: 'POST',
      headers: duffelHeaders(),
      body: JSON.stringify(payload),
    });
    const body = await duffelRes.json().catch(() => ({}));
    if (!duffelRes.ok) {
      const msg =
        body?.errors?.[0]?.message ||
        body?.error ||
        `Duffel error (${duffelRes.status})`;
      console.warn('Duffel search failed:', duffelRes.status, msg);
      return res.status(502).json({ error: msg, source: 'duffel' });
    }
    const offers = body?.data?.offers || [];
    const flights = offers.slice(0, 25).map(mapOffer);
    res.json({
      source: 'duffel',
      mode: DUFFEL_TOKEN.startsWith('duffel_test') ? 'test' : 'live',
      origin: originCode,
      destination: destCode,
      offer_request_id: body?.data?.id,
      flights,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    if (!DUFFEL_TOKEN) {
      return res.status(503).json({ error: 'Duffel is not configured on the server.' });
    }
    const { offerId, amount, currency, passengers } = req.body || {};
    if (!offerId || !amount || !currency || !Array.isArray(passengers) || !passengers.length) {
      return res.status(400).json({
        error: 'offerId, amount, currency and passengers[] are required',
      });
    }
    for (const p of passengers) {
      if (!p.id || !p.given_name || !p.family_name || !p.email || !p.born_on || !p.phone_number) {
        return res.status(400).json({
          error:
            'Each passenger needs id, given_name, family_name, email, phone_number, born_on (YYYY-MM-DD)',
        });
      }
      const ph = String(p.phone_number).replace(/[\s-]/g, '');
      if (!ph.startsWith('+') || ph.length < 8) {
        return res.status(400).json({
          error: 'Phone numbers must include country code, e.g. +14155552671',
        });
      }
    }
    const orderPassengers = passengers.map((p) => ({
      id: p.id,
      given_name: String(p.given_name).trim(),
      family_name: String(p.family_name).trim(),
      email: String(p.email).trim(),
      phone_number: String(p.phone_number).replace(/[\s-]/g, '').trim(),
      born_on: String(p.born_on).trim(),
      title: p.title || 'mr',
      gender: p.gender === 'f' ? 'f' : 'm',
    }));
    const payload = {
      data: {
        type: 'instant',
        selected_offers: [offerId],
        passengers: orderPassengers,
        payments: [
          {
            type: 'balance',
            amount: String(amount),
            currency: String(currency).toUpperCase(),
          },
        ],
      },
    };
    const duffelRes = await fetch(`${DUFFEL_BASE}/air/orders`, {
      method: 'POST',
      headers: duffelHeaders(),
      body: JSON.stringify(payload),
    });
    const body = await duffelRes.json().catch(() => ({}));
    if (!duffelRes.ok) {
      const msg =
        body?.errors?.[0]?.message ||
        body?.errors?.[0]?.title ||
        body?.error ||
        `Duffel order failed (${duffelRes.status})`;
      console.warn('Duffel order error:', duffelRes.status, msg);
      return res.status(502).json({ error: msg, details: body.errors || null });
    }
    const order = body.data || {};
    res.status(201).json({
      ok: true,
      mode: DUFFEL_TOKEN.startsWith('duffel_test') ? 'test' : 'live',
      order: {
        id: order.id,
        booking_reference: order.booking_reference,
        total_amount: order.total_amount,
        total_currency: order.total_currency,
        live_mode: order.live_mode,
        created_at: order.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Airlines API on http://localhost:${PORT}`);
  console.log(
    `Duffel: ${
      DUFFEL_TOKEN
        ? DUFFEL_TOKEN.startsWith('duffel_test')
          ? 'test token loaded'
          : 'token loaded'
        : 'NOT SET'
    }`
  );
});
