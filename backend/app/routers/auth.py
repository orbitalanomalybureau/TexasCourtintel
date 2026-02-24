from fastapi import APIRouter, Depends, HTTPException, Header
from sqlmodel import Session, select

from app.db import get_session
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.security import verify_password, create_access_token, decode_token

router = APIRouter(prefix="/api", tags=["auth"])

@router.post('/auth/login', response_model=TokenResponse)
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == payload.username)).first()
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user.username, user.role)
    return TokenResponse(access_token=token, role=user.role)

def get_current_user(authorization: str | None = Header(default=None), session: Session = Depends(get_session)) -> User:
    if not authorization or not authorization.lower().startswith('bearer '):
        raise HTTPException(status_code=401, detail='Missing bearer token')
    token = authorization.split(' ',1)[1].strip()
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail='Invalid token')
    username = payload.get('sub')
    user = session.exec(select(User).where(User.username == username)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail='User not active')
    return user

def require_admin(user: User = Depends(get_current_user)):
    if user.role != 'admin':
        raise HTTPException(status_code=403, detail='Admin role required')
    return user
