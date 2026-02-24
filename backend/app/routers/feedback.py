from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db import get_session
from app.models.court import Feedback, AuditLog
from app.schemas.feedback import FeedbackCreate, FeedbackStatusUpdate
from app.routers.auth import require_admin, get_current_user

router = APIRouter(prefix="/api", tags=["feedback"])

@router.get('/feedback', response_model=List[Feedback])
def list_feedback(court_id: int | None = None, include_pending: bool = False, session: Session = Depends(get_session)):
    stmt = select(Feedback)
    if court_id is not None:
        stmt = stmt.where(Feedback.court_id == court_id)
    if not include_pending:
        stmt = stmt.where(Feedback.status == 'approved')
    return session.exec(stmt).all()

@router.post('/feedback', response_model=Feedback)
def create_feedback(payload: FeedbackCreate, session: Session = Depends(get_session)):
    fb = Feedback(**payload.model_dump())
    session.add(fb)
    session.add(AuditLog(actor=payload.user_name or 'anonymous', action='feedback_create', target_type='feedback'))
    session.commit()
    session.refresh(fb)
    return fb

@router.get('/feedback/moderation', response_model=List[Feedback])
def moderation_queue(session: Session = Depends(get_session), _=Depends(require_admin)):
    return session.exec(select(Feedback).where(Feedback.status == 'pending')).all()

@router.put('/feedback/{feedback_id}/status', response_model=Feedback)
def update_feedback_status(feedback_id: int, payload: FeedbackStatusUpdate, session: Session = Depends(get_session), user=Depends(get_current_user)):
    if payload.status not in {'approved','rejected','pending'}:
        raise HTTPException(status_code=400, detail='Invalid status')
    fb = session.get(Feedback, feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail='Feedback not found')
    fb.status = payload.status
    session.add(fb)
    session.add(AuditLog(actor=user.username, action='feedback_status_update', target_type='feedback', target_id=feedback_id, details=payload.status))
    session.commit()
    session.refresh(fb)
    return fb
