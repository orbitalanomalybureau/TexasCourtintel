import json
from pathlib import Path
from sqlmodel import Session, select

from app.db import engine, init_db
from app.models.court import Court
from app.models.user import User
from app.security import hash_password

init_db()
seed_path = Path(__file__).resolve().parents[1] / 'data' / 'courts.json'
data = json.loads(seed_path.read_text(encoding='utf-8'))

with Session(engine) as session:
    admin = session.exec(select(User).where(User.username == 'scott_admin')).first()
    if not admin:
        admin = User(username='scott_admin', password_hash=hash_password('ChangeMe123!'), role='admin', is_active=True)
        session.add(admin)
        session.commit()
        print('Created default admin user: scott_admin / ChangeMe123! (change immediately)')

    existing = session.exec(select(Court)).first()
    if existing:
        print('Seed skipped: courts already exist.')
    else:
        for county in data.get('counties', []):
            for c in county.get('courts', []):
                def val(x):
                    return x.get('value') if isinstance(x, dict) else x
                def src(x):
                    return x.get('source') if isinstance(x, dict) else None
                court = Court(
                    county=county['name'],
                    court_name=c.get('name',''),
                    court_type=c.get('type'),
                    judge=val(c.get('judge')),
                    judge_source=src(c.get('judge')),
                    judge_profile_blurb=c.get('judgeProfileBlurb'),
                    judge_political_blurb=c.get('judgePoliticalBlurb'),
                    coordinator=val(c.get('coordinator')),
                    coordinator_source=src(c.get('coordinator')),
                    bailiff=val(c.get('bailiff')),
                    bailiff_source=src(c.get('bailiff')),
                    public_info=c.get('publicInfo'),
                    last_verified=c.get('lastReviewed')
                )
                session.add(court)
        session.commit()
        print('Seed complete.')
