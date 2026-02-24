from typing import Optional
from pydantic import BaseModel

class CourtCreate(BaseModel):
    county: str
    court_name: str
    court_type: Optional[str] = None

    judge: Optional[str] = None
    judge_source: Optional[str] = None
    judge_profile_blurb: Optional[str] = None
    judge_political_blurb: Optional[str] = None

    coordinator: Optional[str] = None
    coordinator_source: Optional[str] = None
    bailiff: Optional[str] = None
    bailiff_source: Optional[str] = None

    public_info: Optional[str] = None
    last_verified: Optional[str] = None

class CourtUpdate(CourtCreate):
    pass
