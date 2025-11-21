from fastapi import APIRouter, Depends

from ..deps import get_current_user
from ..models import User
from ..schemas import UserOut

router = APIRouter(prefix="/me", tags=["Me"])


@router.get("", response_model=UserOut)
def read_profile(user: User = Depends(get_current_user)):
    return user

