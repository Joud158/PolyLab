import secrets

from fastapi import HTTPException, Request, Response, status

from .config import settings

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


from fastapi import Response
from .config import settings
import secrets

def issue_csrf(response: Response) -> str:
    token = secrets.token_urlsafe(32)

    cookie_kwargs = {
        "key": settings.CSRF_COOKIE_NAME,
        "value": token,
        "httponly": False,  # JS must read it
        "path": "/",
    }

    if settings.DEBUG:
        cookie_kwargs["secure"] = False
        cookie_kwargs["samesite"] = "lax"
    else:
        cookie_kwargs["secure"] = True
        cookie_kwargs["samesite"] = "none"

    response.set_cookie(**cookie_kwargs)
    return token



def csrf_protect(request: Request) -> None:
    if request.method in SAFE_METHODS:
        return

    cookie = request.cookies.get(settings.CSRF_COOKIE_NAME)
    header = request.headers.get("x-csrf-token")  # ⬅️ read header directly

    if not cookie or not header or cookie != header:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF check failed",
        )
