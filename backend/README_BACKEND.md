# Texas Court Intel Backend (Phase B Starter)

## What this adds
- FastAPI backend
- SQLite database
- Courts CRUD endpoints
- Source register endpoints
- Seed script to import starter county/court data

## Setup
```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8010
```

## Endpoints
- `GET /api/health`
- `GET /api/courts?county=Bexar`
- `POST /api/courts`
- `PUT /api/courts/{id}`
- `GET /api/sources?county=Bexar`
- `POST /api/sources`

## Next
- Add authentication + RBAC
- Connect frontend admin panel to API
- Add audit log model + write hooks
- Add correction/dispute endpoint

## Auth (starter)
- Seed creates default admin:
  - username: `scott_admin`
  - password: `ChangeMe123!`
- Change password immediately after first login (next step).
- Write endpoints require admin token (Bearer JWT).

## Tested Smoke Checklist (2026-02-23)
- Health endpoint: PASS (/api/health)
- Auth login: PASS (/api/auth/login)
- Courts list/search: PASS (/api/courts, /api/courts?q=...)
- Courts update with admin token: PASS

## Fixes applied
- Fixed SQLite path bug in app/db.py (now uses ./data/tx_court_intel.db)
- Resolved passlib+bcrypt incompatibility by pinning bcrypt==3.2.2 in requirements.txt
