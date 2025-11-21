from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_instructor

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


@router.post("/", response_model=schemas.SubmissionOut)
def create_submission(
    payload: schemas.SubmissionCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    assignment = _get_assignment(db, payload.assignment_id)
    if assignment.due_date and datetime.utcnow() > assignment.due_date:
        raise HTTPException(status_code=400, detail="Past due date")
    _ensure_membership(db, assignment.classroom_id, user)
    submission = models.Submission(
        user_id=user.id, assignment_id=assignment.id, content=payload.content
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

