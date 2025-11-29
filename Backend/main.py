from pathlib import Path
import sys

# ---------------------------------------------------------------------------
# Package / import setup (so `uvicorn app:app` and `uvicorn Backend.main:app`
# both work correctly)
# ---------------------------------------------------------------------------
if __package__ is None or __package__ == "":
    # Allow running `uvicorn main:app` from inside Backend/
    sys.path.append(str(Path(__file__).resolve().parent.parent))
    __package__ = "Backend"

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.csrf import csrf_protect
from .core.ratelimit import rate_limit
from .core.security import hash_password, password_policy_ok
from .database import Base, SessionLocal, engine
from .middleware.security_headers import SecurityHeadersMiddleware
from .routers import (
    admin,
    assignment,
    auth,
    classrooms,
    materials,
    instructor_requests,
    me,
    mfa,
    quiz,
    submission,
)
from .models import User, UserRole

# ---------------------------------------------------------------------------
# Database schema + seed admin
# ---------------------------------------------------------------------------
Base.metadata.create_all(bind=engine)


def ensure_seed_admin() -> None:
    """Create / fix the seed admin user if ADMIN_EMAIL / ADMIN_PASSWORD are set."""
    email = settings.ADMIN_EMAIL
    password = settings.ADMIN_PASSWORD

    if not email or not password:
        return

    if not password_policy_ok(password):
        print("[WARN] Seed admin not created: ADMIN_PASSWORD fails password policy")
        return

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            # Ensure the seed admin has correct role and is verified
            changed = False
            if existing.role != UserRole.admin:
                existing.role = UserRole.admin
                changed = True
            if not existing.email_verified:
                existing.email_verified = True
                changed = True
            if changed:
                db.add(existing)
                db.commit()
            return

        admin_user = User(
            email=email,
            password_hash=hash_password(password),
            role=UserRole.admin,
            email_verified=True,
        )
        db.add(admin_user)
        db.commit()
        print(f"[INFO] Seed admin created: {email}")
    finally:
        db.close()


ensure_seed_admin()

# ---------------------------------------------------------------------------
# FastAPI app (docs explicitly enabled)
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    docs_url="/docs",             # Swagger UI
    redoc_url=None,               # disable ReDoc (optional)
    openapi_url="/openapi.json",  # JSON schema
)

# ---------------------------------------------------------------------------
# Middleware: CORS + Security headers
# ---------------------------------------------------------------------------
# We hard-code allowed origins so that Render + the deployed frontend work.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://polylab-website.onrender.com",
        "http://localhost:5173",  # keep local dev working
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers middleware (CSP etc.)
app.add_middleware(SecurityHeadersMiddleware)

# ---------------------------------------------------------------------------
# Static files (uploads)
# ---------------------------------------------------------------------------
# Make sure upload dir exists (important in Docker)
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ---------------------------------------------------------------------------
# Rate limiting middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def _rate_limit(request: Request, call_next):
    await rate_limit(request)
    return await call_next(request)

# ---------------------------------------------------------------------------
# CSRF middleware
# ---------------------------------------------------------------------------

# Paths that should be exempt from CSRF (login/signup/reset/etc.)
CSRF_EXACT_EXEMPT = {
    "/auth/csrf",
    "/api/auth/csrf",
}

CSRF_PREFIX_EXEMPT = [
    "/auth/login",
    "/auth/signup",
    "/auth/verify-email",
    "/auth/reset",
    "/auth/logout",
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/verify-email",
    "/api/auth/reset",
    "/api/auth/logout",
]


@app.middleware("http")
async def _csrf(request: Request, call_next):
    path = request.url.path

    # Safe methods or explicitly exempted routes
    if (
        request.method in ("GET", "HEAD", "OPTIONS")
        or path in CSRF_EXACT_EXEMPT
        or any(path.startswith(prefix) for prefix in CSRF_PREFIX_EXEMPT)
    ):
        return await call_next(request)

    try:
        csrf_protect(request)
    except Exception as exc:  # return a clean 403 instead of crashing the stack
        from fastapi.responses import JSONResponse
        from fastapi import HTTPException

        if isinstance(exc, HTTPException):
            return JSONResponse(
                status_code=exc.status_code,
                content={"detail": exc.detail},
            )
        return JSONResponse(status_code=403, content={"detail": "CSRF check failed"})

    return await call_next(request)

# ---------------------------------------------------------------------------
# Routers  (ALL under /api)
# ---------------------------------------------------------------------------
app.include_router(auth.router, prefix="/api")
app.include_router(mfa.router, prefix="/api")
app.include_router(me.router, prefix="/api")
app.include_router(instructor_requests.router, prefix="/api")
app.include_router(classrooms.router, prefix="/api")
app.include_router(assignment.router, prefix="/api")
app.include_router(materials.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")
app.include_router(submission.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

# ---------------------------------------------------------------------------
# Health / root
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def read_root():
    return {"status": "ok", "docs": "/docs"}
