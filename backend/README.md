# Race Weekend FastAPI Backend

Provides real-time F1 telemetry, lap times, tyre strategy, and weather data for the Race Weekend React app.

## Setup (Local)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Server runs on `http://127.0.0.1:8000`

Health check: `curl http://127.0.0.1:8000/health`

## API Endpoints

### GET `/api/session/{year}/{gp}/{session_type}`

Fetch session metadata.

**Parameters:**
- `year`: F1 season (e.g., 2026)
- `gp`: Grand Prix name (e.g., "Melbourne", "Suzuka")
- `session_type`: FP1, FP2, FP3, Q, R

**Example:**
```bash
curl http://127.0.0.1:8000/api/session/2026/Melbourne/R
```

### GET `/api/telemetry/{year}/{gp}/{session_type}/{driver}`

Fetch driver telemetry for a session.

**Parameters:**
- `driver`: Driver number or abbreviation (e.g., "63" for Kimi Antonelli)

**Example:**
```bash
curl http://127.0.0.1:8000/api/telemetry/2026/Melbourne/R/63
```

Returns lap times, tyre compounds, tyre age for last 20 laps.

## Deployment (Railway)

### Prerequisites
- Railway account (https://railway.app)
- Git repo with `backend/` directory

### Steps

1. **Connect repository to Railway**
   - Create new Railway project
   - Connect your GitHub repo
   - Select `race-weekend` as root directory

2. **Set root directory**
   - In Railway: Settings → Root Directory → `/backend`

3. **Configure environment**
   - Variables: `PORT`, `DEBUG` (optional)
   - Railway automatically assigns PORT and injects it

4. **Deploy**
   - Railway detects `requirements.txt` → Python buildpack
   - Detects `Procfile` → runs `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Automatic deploys on git push

5. **Frontend configuration**
   - Update `src/pages/TelemetryPage.tsx` with deployed URL
   - Or set `VITE_BACKEND_URL` at build time:
     ```bash
     VITE_BACKEND_URL=https://race-weekend-backend.railway.app npm run build
     ```

## Known Limitations

- FastF1 library makes HTTP requests to fetch F1 data — first call to a new session may be slow (5-10s)
- Future races (e.g., Suzuka 2026 before race day) return no telemetry data
- No live timing API integration yet (depends on OpenF1)

## Architecture

```
Frontend (React, Vite)
    ↓ axios fetch
Backend (FastAPI, Uvicorn)
    ↓ py-fastf1 library
F1 Data Sources (FastF1 cache, FIA API)
```

- Backend serves historical race data
- Frontend manages state, UI, driver selection
- Separate repos for easier deployment (backend on Railway, frontend on Vercel)

## Next Steps

- [ ] Live timing integration (OpenF1 API)
- [ ] WebSocket for real-time updates during races
- [ ] Weather data endpoint
- [ ] Tyre strategy analysis endpoint
