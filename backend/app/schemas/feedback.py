from typing import Optional
from pydantic import BaseModel

class FeedbackCreate(BaseModel):
    court_id: int
    county: str
    court_name: str
    user_name: Optional[str] = None
    rating: Optional[int] = None
    body: str

class FeedbackStatusUpdate(BaseModel):
    status: str  # approved|rejected|pending
