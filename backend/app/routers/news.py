import os
from typing import Any
from urllib.parse import quote_plus
from xml.etree import ElementTree as ET

import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api", tags=["news"])


def _parse_google_news_rss(xml_text: str, limit: int = 8) -> list[dict[str, Any]]:
    root = ET.fromstring(xml_text)
    items = []
    for item in root.findall("./channel/item")[:limit]:
        items.append(
            {
                "title": item.findtext("title") or "",
                "link": item.findtext("link") or "",
                "pubDate": item.findtext("pubDate") or "",
                "source": (item.find("source").text if item.find("source") is not None else "Google News RSS"),
            }
        )
    return items


@router.get("/news/texas-courts")
def texas_courts_news(
    q: str = Query(default="Texas court judge civil district"),
    limit: int = Query(default=8, ge=1, le=20),
    provider: str = Query(default="google_rss"),
):
    provider = (provider or "google_rss").lower()

    with httpx.Client(timeout=15) as client:
        if provider == "google_rss":
            query = quote_plus(q)
            rss_url = f"https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"
            r = client.get(rss_url)
            r.raise_for_status()
            items = _parse_google_news_rss(r.text, limit=limit)
            return {"query": q, "provider": provider, "source": "Google News RSS", "count": len(items), "items": items}

        if provider == "newsapi":
            key = os.getenv("NEWSAPI_KEY", "").strip()
            if not key:
                raise HTTPException(status_code=400, detail="NEWSAPI_KEY is not configured on backend")
            r = client.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": q,
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": limit,
                    "apiKey": key,
                },
            )
            r.raise_for_status()
            payload = r.json()
            articles = payload.get("articles", [])[:limit]
            items = [
                {
                    "title": a.get("title") or "",
                    "link": a.get("url") or "",
                    "pubDate": a.get("publishedAt") or "",
                    "source": (a.get("source") or {}).get("name") or "NewsAPI",
                }
                for a in articles
            ]
            return {"query": q, "provider": provider, "source": "NewsAPI", "count": len(items), "items": items}

    raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
