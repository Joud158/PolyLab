from datetime import datetime, timezone
from pathlib import Path
import re

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import text

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_instructor
from ..core.config import settings

router = APIRouter(prefix="/submissions", tags=["Submissions"])


def _get_assignment(db: Session, assignment_id: int) -> models.Assignment:
    assignment = db.query(models.Assignment).filter_by(id=assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment


def _ensure_membership(
    db: Session, classroom_id: int, user: models.User, *, allow_instructor=True
):
    if user.role == models.UserRole.admin:
        return
    classroom = db.query(models.Classroom).filter_by(id=classroom_id).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    if allow_instructor and classroom.instructor_id == user.id:
        return
    member = (
        db.query(models.ClassroomMember)
        .filter_by(classroom_id=classroom_id, user_id=user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="You are not enrolled in this class")


def _ensure_submission_file_column(db: Session) -> None:
    """Add file_url column for submissions if DB was created before the field existed."""
    result = db.execute(text("PRAGMA table_info(submissions)")).fetchall()
    has_col = any(row[1] == "file_url" for row in result)
    if not has_col:
        db.execute(text("ALTER TABLE submissions ADD COLUMN file_url TEXT"))
        db.commit()


def _as_utc(dt: datetime) -> datetime:
    """Normalize naive datetimes to UTC to avoid tz-offset mistakes."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _resolve_file_url(submission: models.Submission) -> str | None:
    """
    Derive a downloadable URL for legacy rows where the file path was stored in content,
    and return an absolute URL using BACKEND_BASE_URL.
    """
    # If already stored as an absolute URL, just return it
    if submission.file_url:
        return submission.file_url

    content = (submission.content or "").strip()
    if not content:
        return None
    if "submissions" not in content:
        return None

    try:
        path = Path(content)
    except Exception:
        return None

    parts = [p for p in path.parts if p]
    static_rel: str | None = None

    if "uploads" in parts:
        # e.g. /var/www/uploads/submissions/... -> /uploads/submissions/...
        rel_parts = parts[parts.index("uploads") :]
        static_rel = "/" + "/".join(rel_parts)
    elif parts and parts[0] != "uploads":
        # handle relative paths like "submissions/assignment_1/file.ext"
        static_rel = "/".join(("/uploads", *parts))

    if not static_rel:
        return None

    return f"{settings.backend_base_public}{static_rel}"


@router.post("/", response_model=schemas.SubmissionOut)
def create_submission(
    payload: schemas.SubmissionCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    assignment = _get_assignment(db, payload.assignment_id)
    _ensure_submission_file_column(db)
    now = datetime.now(timezone.utc)
    if assignment.due_date and now > _as_utc(assignment.due_date):
        raise HTTPException(status_code=400, detail="Past due date")
    _ensure_membership(db, assignment.classroom_id, user)
    submission = models.Submission(
        user_id=user.id,
        assignment_id=assignment.id,
        content=payload.content,
        submitted_at=now,
        file_url=None,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.get("/assignment/{assignment_id}", response_model=list[schemas.SubmissionWithUser])
def list_submissions_for_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    _ensure_submission_file_column(db)
    assignment = _get_assignment(db, assignment_id)
    classroom = assignment.classroom
    if user.role == models.UserRole.admin or classroom.instructor_id == user.id:
        submissions = (
            db.query(models.Submission)
            .filter(models.Submission.assignment_id == assignment_id)
            .order_by(
                models.Submission.user_id,
                models.Submission.submitted_at.desc(),
                models.Submission.id.desc(),
            )
            .all()
        )
        latest: dict[int, models.Submission] = {}
        file_fallback: dict[int, str] = {}
        for sub in submissions:
            inferred_file = _resolve_file_url(sub)
            if inferred_file and sub.user_id not in file_fallback:
                file_fallback[sub.user_id] = inferred_file
            if sub.user_id not in latest:
                latest[sub.user_id] = sub
        for uid, sub in latest.items():
            if not getattr(sub, "file_url", None):
                sub.file_url = file_fallback.get(uid)
        return [
            schemas.SubmissionWithUser(
                **schemas.SubmissionOut.model_validate(sub, from_attributes=True).model_dump(),
                user_email=sub.user.email,
            )
            for sub in latest.values()
        ]
    _ensure_membership(db, assignment.classroom_id, user, allow_instructor=False)
    submissions = (
        db.query(models.Submission)
        .filter_by(assignment_id=assignment_id, user_id=user.id)
        .order_by(models.Submission.submitted_at.desc())
        .all()
    )
    for sub in submissions:
        if not getattr(sub, "file_url", None):
            sub.file_url = _resolve_file_url(sub)
    return [
        schemas.SubmissionWithUser(
            **schemas.SubmissionOut.model_validate(sub, from_attributes=True).model_dump(),
            user_email=sub.user.email,
        )
        for sub in submissions
    ]


@router.get("/classroom/{classroom_id}", response_model=list[schemas.SubmissionWithUser])
def list_submissions_for_classroom(
    classroom_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_instructor),
):
    _ensure_submission_file_column(db)
    _ensure_membership(db, classroom_id, user)
    submissions = (
        db.query(models.Submission)
        .join(models.Assignment, models.Submission.assignment_id == models.Assignment.id)
        .filter(models.Assignment.classroom_id == classroom_id)
        .order_by(
            models.Submission.assignment_id,
            models.Submission.user_id,
            models.Submission.submitted_at.desc(),
            models.Submission.id.desc(),
        )
        .all()
    )
    latest: dict[tuple[int, int], models.Submission] = {}
    file_fallback: dict[tuple[int, int], str] = {}
    for sub in submissions:
        key = (sub.assignment_id, sub.user_id)
        inferred_file = _resolve_file_url(sub)
        if inferred_file and key not in file_fallback:
            file_fallback[key] = inferred_file
        if key not in latest:
            latest[key] = sub
    for key, sub in latest.items():
        if not getattr(sub, "file_url", None):
            sub.file_url = file_fallback.get(key)
    return [
        schemas.SubmissionWithUser(
            **schemas.SubmissionOut.model_validate(sub, from_attributes=True).model_dump(),
            user_email=sub.user.email,
        )
        for sub in latest.values()
    ]


@router.post("/{assignment_id}/upload", response_model=schemas.SubmissionOut)
async def upload_submission_file(
    assignment_id: int,
    content: str | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    assignment = _get_assignment(db, assignment_id)
    _ensure_submission_file_column(db)
    now = datetime.now(timezone.utc)
    if assignment.due_date and now > _as_utc(assignment.due_date):
        raise HTTPException(status_code=400, detail="Past due date")
    _ensure_membership(db, assignment.classroom_id, user)

    safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", file.filename or "upload.bin")
    base_dir = Path(settings.UPLOAD_DIR) / "submissions" / f"assignment_{assignment_id}"
    base_dir.mkdir(parents=True, exist_ok=True)
    dest = base_dir / f"user{user.id}_{int(now.timestamp())}_{safe_name}"

    file_bytes = await file.read()
    dest.write_bytes(file_bytes)

    # Build absolute URL to the uploaded file
    static_rel = f"/uploads/submissions/assignment_{assignment_id}/{dest.name}"
    file_url = f"{settings.backend_base_public}{static_rel}"

    submission_content = content.strip() if content else f"File upload: {safe_name}"

    submission = models.Submission(
        user_id=user.id,
        assignment_id=assignment.id,
        content=submission_content,
        file_url=file_url,
        submitted_at=now,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.post("/{submission_id}/grade")
def grade_submission(
    submission_id: int,
    grade: float,
    db: Session = Depends(get_db),
    instructor=Depends(require_instructor),
):
    _ensure_submission_file_column(db)
    submission = (
        db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    )
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    assignment = submission.assignment
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    _ensure_membership(db, assignment.classroom_id, instructor, allow_instructor=True)
    submission.grade = grade
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return {"ok": True, "grade": submission.grade}
