import secrets

from fastapi import Header, HTTPException, Request, Response, status

from .config import settings

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


def issue_csrf(response: Response) -> str:
    token = secrets.token_urlsafe(32)
    response.set_cookie(
        key=settings.CSRF_COOKIE_NAME,
        value=token,
        httponly=False,
        secure=not settings.DEBUG,
        samesite="lax",
        path="/",
    )
    return token


def csrf_protect(
    request: Request, x_csrf_token: str | None = Header(default=None)
) -> None:
    if request.method in SAFE_METHODS:
        return
    cookie = request.cookies.get(settings.CSRF_COOKIE_NAME)
    if not cookie or not x_csrf_token or cookie != x_csrf_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="CSRF check failed"
        )

