/**
 * Airlines API — Express server
 * - Serves static frontend
 * - /api/flights  → flight search via fli-js (Google Flights)
 * - /api/leads    → newsletter signup → Supabase
 * - /api/contact  → contact form → Supabase
 * - /api/bookings → booking inquiries → Supabase
 *
 * Env vars required:
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY   (or service role for writes if RLS is tight)
 *   PORT (optional, default 3000)
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Static frontend (one level up = /artifacts)
app.use(express.static(path.join(__dirname, '..')));

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// ---------- Health ----------
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'airlines-api', ts: new Date().toISOString() });
});

// ---------- Flight search ----------
app.post('/api/flights', async (req, res) => {
  try {
    const {
      origin,
      destination,
      departDate,
      returnDate,
      passengers = 1,
      cabin = 'economy'
    } = req.body || {};

    if (!origin || !destination || !departDate) {
      return res.status(400).json({ error: 'origin, destination and departDate are required' });
    }

    const originCode = String(origin).toUpperCase().slice(0, 3);
    const destCode = String(destination).toUpperCase().slice(0, 3);

    const cacheKey = `${originCode}-${destCode}-${departDate}-${returnDate || 'ow'}-${passengers}-${cabin}`;
    try {
      const { data: cached } = await supabase
        .from('flight_cache')
        .select('results, expires_at')
        .eq('cache_key', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (cached?.results) {
        return res.json({ source: 'cache', flights: cached.results });
      }
    } catch (_) {}

    let flights = [];

    try {
      const fli = await import('fli-js');
      const {
        Airport,
        FlightSearchFilters,
        FlightSegment,
        MaxStops,
        SearchFlights,
        SeatType,
        SortBy
      } = fli;

      const seatMap = {
        economy: SeatType.ECONOMY,
        'premium-economy': SeatType.PREMIUM_ECONOMY,
        business: SeatType.BUSINESS,
        first: SeatType.FIRST
      };

      const segments = [
        new FlightSegment({
          departure_airport: [[[Airport[originCode] || originCode, 0]]],
          arrival_airport: [[[Airport[destCode] || destCode, 0]]],
          travel_date: departDate
        })
      ];

      if (returnDate) {
        segments.push(
          new FlightSegment({
            departure_airport: [[[Airport[destCode] || destCode, 0]]],
            arrival_airport: [[[Airport[originCode] || originCode, 0]]],
            travel_date: returnDate
          })
        );
      }

      const filters = new FlightSearchFilters({
        passenger_info: {
          adults: Number(passengers) || 1,
          children: 0,
          infants_in_seat: 0,
          infants_on_lap: 0
        },
        flight_segments: segments,
        seat_type: seatMap[cabin] || SeatType.ECONOMY,
        stops: MaxStops.ANY,
        sort_by: SortBy.CHEAPEST
      });

      const results = await new SearchFlights().search(filters, { currency: 'USD' });
      flights = (results || []).slice(0, 20).map((f) => ({
        price: f.price,
        duration: f.duration,
        stops: f.stops,
        airline: f.airline || f.airlines?.[0] || 'Airline',
        departure: f.departure_time || f.departure,
        arrival: f.arrival_time || f.arrival,
        raw: f
      }));
    } catch (fliErr) {
      console.warn('fli-js search failed or not installed:', fliErr.message);
      return res.status(503).json({
        error: 'Flight search temporarily unavailable. Install fli-js and ensure Google Flights access.',
        detail: fliErr.message
      });
    }

    try {
      await supabase.from('flight_cache').upsert({
        cache_key: cacheKey,
        origin: originCode,
        destination: destCode,
        departure_date: departDate,
        return_date: returnDate || null,
        passengers: Number(passengers) || 1,
        cabin,
        results: flights,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      });
    } catch (_) {}

    res.json({ source: 'live', flights });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------- Leads (newsletter) ----------
app.post('/api/leads', async (req, res) => {
  try {
    const { email, source = 'newsletter' } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    const { error } = await supabase.from('leads').upsert({ email, source }, { onConflict: 'email' });
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save lead' });
  }
});

// ---------- Contact ----------
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }
    const { error } = await supabase.from('contact_messages').insert({ name, email, subject, message });
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not send message' });
  }
});

// ---------- Bookings ----------
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      travelers = 1,
      departure_date,
      return_date,
      trip_type = 'one-way',
      cabin = 'economy',
      message,
      destination_id
    } = req.body || {};

    if (!full_name || !email) {
      return res.status(400).json({ error: 'full_name and email are required' });
    }

    const { error } = await supabase.from('bookings').insert({
      full_name,
      email,
      phone,
      travelers,
      departure_date,
      return_date,
      trip_type,
      cabin,
      message,
      destination_id
    });
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create booking inquiry' });
  }
});

// ---------- Destinations (public read) ----------
app.get('/api/destinations', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true)
      .order('featured', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load destinations' });
  }
});

// Fallback to index.html for SPA-style routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Airlines API running on http://localhost:${PORT}`);
});
