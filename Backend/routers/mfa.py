from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User
from ..schemas import BasicOK, MFAEnrollOut, MFAVerifyIn
from ..utils.tokens import consume_token, make_token
from ..utils.totp import create_totp_secret, make_otpauth_uri, verify_totp

router = APIRouter(prefix="/auth/mfa/totp", tags=["MFA"])


@router.post("/enroll", response_model=MFAEnrollOut)
def enroll(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    secret = create_totp_secret()
    user.totp_secret = secret
    db.add(user)
    db.commit()
    token = make_token(db, user, "mfa", minutes=10)
    return MFAEnrollOut(
        secret=secret,
        otpauth=make_otpauth_uri(secret, user.email, "PolyLab"),
        mfa_token=token,
    )


@router.post("/verify", response_model=BasicOK)
def verify(body: MFAVerifyIn, db: Session = Depends(get_db)):
    if not body.mfa_token:
        raise HTTPException(status_code=400, detail="MFA token required")
    user = consume_token(db, body.mfa_token, "mfa")
    if not user:
        raise HTTPException(status_code=400, detail="Invalid MFA token")
    if not user.totp_secret or not verify_totp(user.totp_secret, body.code):
        raise HTTPException(status_code=400, detail="Invalid code")
    return {"ok": True}

