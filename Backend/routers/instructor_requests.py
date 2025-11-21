import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..core.config import settings
from ..database import get_db
from ..deps import get_current_user, require_admin
from ..models import InstructorRequest, User, UserRole
from ..schemas import (
    BasicOK,
    InstructorRequestAdminOut,
    InstructorRequestOut,
)

router = APIRouter(tags=["Instructor Requests"])

UPLOAD_DIR = Path(settings.UPLOAD_DIR)


@router.post("/roles/requests", response_model=InstructorRequestOut)
def submit_request(
    note: str | None = Form(default=None),
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file")
    data = file.file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (10MB max)")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    ext = Path(file.filename).suffix or ".bin"
    dest = UPLOAD_DIR / f"{uuid.uuid4()}{ext}"
    dest.write_bytes(data)
    request_obj = InstructorRequest(
        user_id=user.id,
        note=note,
        file_path=str(dest),
        status="pending",
    )
    db.add(request_obj)
    db.commit()
    db.refresh(request_obj)
    return request_obj


@router.get(
    "/admin/roles/requests",
    response_model=list[InstructorRequestAdminOut],
)
def list_requests(
    status: str | None = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(InstructorRequest)
    if status in {"pending", "approved", "rejected"}:
        query = query.filter(InstructorRequest.status == status)
    return query.order_by(InstructorRequest.created_at.desc()).all()


@router.post(
    "/admin/roles/requests/{request_id}/approve",
    response_model=BasicOK,
)
def approve_request(
    request_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    req = db.query(InstructorRequest).filter(InstructorRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    req.status = "approved"
    req.decision_by = admin.id
    req.decided_at = datetime.utcnow()
    user = db.query(User).filter(User.id == req.user_id).first()
    if user:
        user.role = UserRole.instructor
        db.add(user)
    db.add(req)
    db.commit()
    return {"ok": True}


@router.post(
    "/admin/roles/requests/{request_id}/reject",
    response_model=BasicOK,
)
def reject_request(
    request_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    req = db.query(InstructorRequest).filter(InstructorRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    req.status = "rejected"
    req.decision_by = admin.id
    req.decided_at = datetime.utcnow()
    db.add(req)
    db.commit()
    return {"ok": True}

