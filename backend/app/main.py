from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db
from app.routers.courts import router as courts_router
from app.routers.auth import router as auth_router
from app.routers.feedback import router as feedback_router
from app.routers.news import router as news_router
from app.routers.billing import router as billing_router

app = FastAPI(title="Texas Court Intel API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get('/api/health')
def health():
    return {"ok": True}

app.include_router(auth_router)
app.include_router(courts_router)
app.include_router(feedback_router)
app.include_router(news_router)
app.include_router(billing_router)
