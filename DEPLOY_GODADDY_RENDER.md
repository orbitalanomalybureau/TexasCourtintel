# TexasCourtIntel Deployment (GoDaddy DNS + Render)

## 1) Deploy Backend (Render)
1. Render -> New -> Web Service
2. Connect repo/folder containing `backend/`
3. Use settings:
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Env vars:
   - `SECRET_KEY` = strong random
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `120`
   - `NEWSAPI_KEY` = optional
5. Deploy and copy backend URL (example: `https://texas-court-intel-api.onrender.com`)

## 2) Deploy Frontend (Render Static Site)
1. Render -> New -> Static Site
2. Root: project root (contains `index.html`, `app.js`, `styles.css`)
3. Publish path: `.`
4. Deploy and copy URL (example: `https://texas-court-intel-app.onrender.com`)

## 3) GoDaddy DNS
Add CNAME records:
- `api` -> backend Render host (no https)
- `app` -> frontend Render host (no https)

Optional:
- Forward root `texascourtintel.com` -> `https://app.texascourtintel.com`

## 4) Verify
- `https://api.texascourtintel.com/api/health` should return `{ "ok": true }`
- Open `https://app.texascourtintel.com`
- Test login + search + feedback + moderation

## Notes
- Frontend `app.js` is already set to use local API on localhost, and production API at `https://api.texascourtintel.com/api`.
