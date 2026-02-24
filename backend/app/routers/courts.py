from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, or_

from app.db import get_session
from app.models.court import Court, SourceRegister, AuditLog
from app.schemas.court import CourtCreate, CourtUpdate
from app.routers.auth import require_admin, get_current_user

router = APIRouter(prefix="/api", tags=["courts"])

@router.get("/courts", response_model=List[Court])
def list_courts(
    county: str | None = None,
    q: str | None = Query(default=None, description="Search judge/county/court"),
    session: Session = Depends(get_session)
):
    stmt = select(Court)
    if county:
        stmt = stmt.where(Court.county == county)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Court.county.like(like), Court.court_name.like(like), Court.judge.like(like)))
    return session.exec(stmt).all()

@router.post("/courts", response_model=Court)
def create_court(payload: CourtCreate, session: Session = Depends(get_session), user=Depends(get_current_user), _=Depends(require_admin)):
    court = Court(**payload.model_dump())
    session.add(court)
    session.commit()
    session.refresh(court)
    session.add(AuditLog(actor=user.username, action='court_create', target_type='court', target_id=court.id))
    session.commit()
    return court

@router.put("/courts/{court_id}", response_model=Court)
def update_court(court_id: int, payload: CourtUpdate, session: Session = Depends(get_session), user=Depends(get_current_user), _=Depends(require_admin)):
    court = session.get(Court, court_id)
    if not court:
        raise HTTPException(status_code=404, detail="Court not found")
    for k, v in payload.model_dump().items():
        setattr(court, k, v)
    session.add(court)
    session.add(AuditLog(actor=user.username, action='court_update', target_type='court', target_id=court_id))
    session.commit()
    session.refresh(court)
    return court

@router.get('/sources', response_model=List[SourceRegister])
def list_sources(county: str | None = None, session: Session = Depends(get_session)):
    q = select(SourceRegister)
    if county:
        q = q.where(SourceRegister.county == county)
    return session.exec(q).all()

@router.post('/sources', response_model=SourceRegister)
def create_source(payload: SourceRegister, session: Session = Depends(get_session), _=Depends(require_admin)):
    obj = SourceRegister(**payload.model_dump(exclude={'id'}))
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj
