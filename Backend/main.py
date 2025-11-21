from pathlib import Path
import sys

if __package__ is None or __package__ == "":
    # Allow running `uvicorn main:app` from inside Backend/
    sys.path.append(str(Path(__file__).resolve().parent.parent))
    __package__ = "Backend"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.csrf import csrf_protect
from .core.ratelimit import rate_limit
from .database import Base, engine
from .middleware.security_headers import SecurityHeadersMiddleware
from .routers import (
    admin,
    assignment,
    auth,
    classrooms,
    instructor_requests,
    me,
    mfa,
    quiz,
    submission,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)


@app.middleware("http")
async def _rate_limit(request, call_next):
    await rate_limit(request)
    return await call_next(request)


@app.middleware("http")
async def _csrf(request, call_next):
    path = request.url.path
    if (
        request.method in ("GET", "HEAD", "OPTIONS")
        or path.endswith("/auth/csrf")
        or path.startswith("/auth/login")
        or path.startswith("/auth/signup")
        or path.startswith("/auth/verify-email")
        or path.startswith("/auth/reset")
        or path.startswith("/classrooms")
        or path.startswith("/admin")
        or path.startswith("/roles/requests")
    ):
        return await call_next(request)
    try:
        csrf_protect(request)
    except Exception as exc:  # return a clean 403 instead of crashing the middleware stack
        from fastapi.responses import JSONResponse
        from fastapi import HTTPException

        if isinstance(exc, HTTPException):
            return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
        return JSONResponse(status_code=403, content={"detail": "CSRF check failed"})
    return await call_next(request)


app.include_router(auth.router)
app.include_router(mfa.router)
app.include_router(me.router)
app.include_router(instructor_requests.router)
app.include_router(classrooms.router)
app.include_router(assignment.router)
app.include_router(quiz.router)
app.include_router(submission.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}
