from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field

class Court(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    county: str = Field(index=True)
    court_name: str = Field(index=True)
    court_type: Optional[str] = None

    judge: Optional[str] = Field(default=None, index=True)
    judge_source: Optional[str] = None
    judge_profile_blurb: Optional[str] = None
    judge_political_blurb: Optional[str] = None

    coordinator: Optional[str] = None
    coordinator_source: Optional[str] = None
    bailiff: Optional[str] = None
    bailiff_source: Optional[str] = None

    public_info: Optional[str] = None
    last_verified: Optional[str] = None

class SourceRegister(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    county: str = Field(index=True)
    source_name: str
    source_url: str
    terms_notes: Optional[str] = None
    risk_rating: str = "medium"
    allowed_for_redistribution: bool = False
    last_reviewed: Optional[str] = None

class Feedback(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    court_id: int = Field(index=True)
    county: str = Field(index=True)
    court_name: str
    user_name: Optional[str] = None
    rating: Optional[int] = None
    body: str
    status: str = Field(default="pending", index=True)  # pending|approved|rejected
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    actor: str = Field(index=True)
    action: str
    target_type: str
    target_id: Optional[int] = None
    details: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
