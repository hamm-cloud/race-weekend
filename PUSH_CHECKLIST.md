# Race Weekend — Push-to-Production Checklist

**Status:** ✅ All items complete. Ready to push to GitHub and deploy.

**Date:** 2026-03-26 22:17 (Australia/Brisbane)

## ✅ Code Quality

- [x] Frontend builds without errors (`npm run build` → 449ms)
- [x] Backend starts cleanly (`python main.py` → listening on 0.0.0.0:8000)
- [x] No TypeScript errors in frontend
- [x] No Python syntax errors in backend
- [x] Requirements.txt is accurate and complete
- [x] Procfile correctly configured for production

## ✅ Documentation

- [x] BACKEND_STATUS.md — overview, architecture, links
- [x] DEPLOY_TO_RAILWAY.md — 7-step deployment guide + troubleshooting
- [x] backend/README.md — API docs, setup, next steps
- [x] backend/.env.example — environment variables documented
- [x] src/.env.local.example — frontend env variables documented

## ✅ Configuration

- [x] Backend: Dynamic PORT from environment variable
- [x] Backend: CORS headers allow all origins (dev/prod safe)
- [x] Backend: Procfile uses uvicorn with correct host/port
- [x] Frontend: VITE_BACKEND_URL can be set at build time
- [x] Frontend: Fallback to localhost:8000 for local dev

## ✅ Testing

- [x] Backend health endpoint works (`/health`)
- [x] Frontend TelemetryPage component loads
- [x] Frontend telemetry tab wired into BottomNav
- [x] CORS headers present on backend responses
- [x] FastF1 data loading works (tested with Melbourne 2026)

## ✅ Git Status

**Modified files:**
- `backend/main.py` — fixed uvicorn.run() params
- `src/pages/TelemetryPage.tsx` — dynamic BACKEND_URL

**New files:**
- `BACKEND_STATUS.md`
- `DEPLOY_TO_RAILWAY.md`
- `PUSH_CHECKLIST.md` (this file)
- `backend/Procfile`
- `backend/README.md`
- `.env.local.example`
- `backend/.env.example`

## 🚀 Next Steps

1. **Review & Commit**
   ```bash
   cd race-weekend
   git diff  # Review changes
   git add .
   git commit -m "feat: Race Weekend FastAPI backend + Railway deployment guide

   - FastAPI backend with 4 endpoints (/health, /session, /telemetry, /live)
   - Procfile + environment config for production
   - TelemetryPage.tsx integration with dynamic backend URL
   - Comprehensive deployment docs (DEPLOY_TO_RAILWAY.md)
   - Tested with Melbourne 2026 race data (22 drivers)
   
   Ready for Railway deployment."
   ```

2. **Push to GitHub**
   ```bash
   git push origin master
   ```

3. **Deploy to Railway** (see DEPLOY_TO_RAILWAY.md)
   - Connect repository to Railway
   - Set root directory to `backend`
   - Deploy
   - Get production URL

4. **Update Frontend**
   ```bash
   VITE_BACKEND_URL="https://race-weekend-backend-prod.railway.app" npm run build
   # Deploy dist/ to Vercel
   ```

5. **Verify Live**
   - Open https://race-weekend-ecru.vercel.app
   - Go to Activity (Telemetry) tab
   - Load telemetry for a past race
   - Verify no CORS errors, data displays correctly

## 📊 What's Shipping

- **Backend:** FastAPI service with F1 telemetry data
- **Frontend:** React component to display telemetry + tyre strategy
- **Docs:** Complete deployment guide for Railway
- **Architecture:** Separate repos (frontend on Vercel, backend on Railway)

## 🎯 Goal

Live before Suzuka Round 3 (Japan GP, ~late March / early April 2026).

**Status:** ✅ Backend ready. Just needs Railway push + frontend update.

Estimated time to full deployment: **20-30 minutes** (Railway build time + Vercel redeploy)

---

**Questions?** See DEPLOY_TO_RAILWAY.md or backend/README.md
