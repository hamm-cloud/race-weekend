# Deploy Race Weekend to Railway

This guide walks through deploying the Race Weekend backend to Railway and connecting the frontend.

## Prerequisites

- Railway account: https://railway.app (free tier available)
- GitHub repo with `race-weekend` pushed
- Git CLI installed locally

## Step 1: Create Railway Project & Connect Repo

1. Go to https://railway.app → Dashboard
2. Create new project → Select "Deploy from GitHub"
3. Connect your GitHub account (if not already)
4. Select the `race-weekend` repository
5. Authorize Railway to access the repo

## Step 2: Configure Root Directory

Railway will auto-detect Python + FastAPI, but we need to point it to the backend:

1. In Railway: Select the project → Settings tab
2. Find "Root Directory" setting
3. Set to: `backend` (or `/backend`)
4. Save

This tells Railway to run the Procfile from the `backend/` directory.

## Step 3: Set Environment Variables (Optional)

1. In Railway: Variables tab
2. Add:
   - `DEBUG`: `False` (optional, defaults to False)
   - `PYTHONUNBUFFERED`: `1` (recommended for logging)
3. Save — Railway will redeploy

## Step 4: Deploy

Railway auto-deploys on git push. To trigger manually:

1. In Railway dashboard → Deployments tab
2. Click "Trigger Deploy" button
3. Wait for build to complete (~2-3 min)
4. Check "Networking" tab for public URL (e.g., `https://race-weekend-backend-prod.railway.app`)

## Step 5: Test Backend

Once deployment completes:

```bash
# Replace with actual Railway URL
BACKEND_URL="https://race-weekend-backend-prod.railway.app"

# Test health
curl $BACKEND_URL/health

# Test session endpoint
curl "$BACKEND_URL/api/session/2026/Melbourne/R"

# Test telemetry
curl "$BACKEND_URL/api/telemetry/2026/Melbourne/R/63"
```

## Step 6: Update Frontend

Now connect the frontend to the deployed backend:

### Option A: Build with Environment Variable

```bash
cd race-weekend/
VITE_BACKEND_URL="https://race-weekend-backend-prod.railway.app" npm run build
# Deploy dist/ to Vercel as usual
```

### Option B: Hardcode in TelemetryPage.tsx (Not Recommended)

Edit `src/pages/TelemetryPage.tsx`:
```typescript
const BACKEND_URL = 'https://race-weekend-backend-prod.railway.app'
```

Then rebuild and deploy.

### Option C: Use .env.local (Development Only)

```bash
# .env.local
VITE_BACKEND_URL="https://race-weekend-backend-prod.railway.app"

npm run dev
```

## Step 7: Deploy Frontend

1. Frontend is already deployed to Vercel at https://race-weekend-ecru.vercel.app
2. Redeploy with updated VITE_BACKEND_URL:
   - Push changes to master, or
   - Manual redeploy in Vercel dashboard: Deployments → Redeploy

## Verification

Once both are deployed:

1. Open https://race-weekend-ecru.vercel.app
2. Navigate to "Activity" tab (Telemetry page)
3. Try loading telemetry for a past race (e.g., Melbourne 2026)
4. Confirm lap times display and no CORS errors in console

## Troubleshooting

### "Cannot POST /api/..." Error

**Cause:** Frontend URL doesn't match backend URL
**Fix:** Double-check VITE_BACKEND_URL is correct (no trailing slash)

### CORS Error in Console

**Cause:** Backend CORS headers not allowing your domain
**Fix:** Backend has `allow_origins=["*"]` — should allow anything. Check:
```bash
curl -i -H "Origin: https://race-weekend-ecru.vercel.app" \
  https://race-weekend-backend-prod.railway.app/health
```

Should include `Access-Control-Allow-Origin: *`

### 502 Bad Gateway / Backend Not Starting

**Cause:** Requirements not installed or Procfile issue
**Check:** Railway Logs tab → see error messages
**Fix:** Verify `backend/requirements.txt` exists and `backend/Procfile` has correct command

### Slow First Requests (5-10 seconds)

**Cause:** FastF1 library downloading F1 data for first time
**Expected:** Normal. Subsequent requests are cached and fast.

## Rollback

If deployment breaks:

1. Railway dashboard → Deployments tab
2. Find previous working deployment
3. Click "Redeploy" on that version
4. Takes ~1 minute

## Next Steps

- [ ] Monitor Railway logs for errors
- [ ] Test live during an actual F1 session
- [ ] Add WebSocket for real-time updates (future)
- [ ] Integrate OpenF1 for live timing (future)

---

**Questions?** Check the backend README: `backend/README.md`
