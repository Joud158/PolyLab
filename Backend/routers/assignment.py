from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_instructor

router = APIRouter(prefix="/assignments", tags=["Assignments"])


def _ensure_can_manage(classroom: models.Classroom, user: models.User):
    if user.role == models.UserRole.admin:
        return
    if classroom.instructor_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed for this classroom")


def _get_assignment(db: Session, assignment_id: int) -> models.Assignment:
    assignment = db.query(models.Assignment).filter_by(id=assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment


@router.post(
    "/",
    response_model=schemas.AssignmentOut,
)
def create_assignment(
    payload: schemas.AssignmentCreate,
    db: Session = Depends(get_db),
    user=Depends(require_instructor),
):
    classroom = db.query(models.Classroom).filter_by(id=payload.classroom_id).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    _ensure_can_manage(classroom, user)
    assignment = models.Assignment(**payload.dict())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.get("/{assignment_id}", response_model=schemas.AssignmentOut)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    assignment = _get_assignment(db, assignment_id)
    return assignment


@router.put(
    "/{assignment_id}",
    response_model=schemas.AssignmentOut,
)
def update_assignment(
    assignment_id: int,
    payload: schemas.AssignmentCreate,
    db: Session = Depends(get_db),
    user=Depends(require_instructor),
):
    assignment = _get_assignment(db, assignment_id)
    _ensure_can_manage(assignment.classroom, user)
    for key, value in payload.dict().items():
        setattr(assignment, key, value)
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.delete(
    "/{assignment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_instructor),
):
    assignment = _get_assignment(db, assignment_id)
    _ensure_can_manage(assignment.classroom, user)
    db.delete(assignment)
    db.commit()
    return None

