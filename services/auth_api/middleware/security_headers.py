from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from ..core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        resp: Response = await call_next(request)

        # ---------------------------------------------
        # 🟦 ALLOW SWAGGER/REDOC/OPENAPI TO WORK
        # ---------------------------------------------
        if request.url.path.startswith(("/docs", "/redoc", "/openapi.json")):
            # Swagger needs to load CDN JS/CSS
            resp.headers["X-Frame-Options"] = "DENY"
            resp.headers["X-Content-Type-Options"] = "nosniff"
            resp.headers["Referrer-Policy"] = "no-referrer"
            resp.headers["Content-Security-Policy"] = (
                "default-src 'self' https://cdn.jsdelivr.net; "
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "img-src 'self' data: blob:; "
                "connect-src 'self' https://cdn.jsdelivr.net; "
                "frame-ancestors 'none';"
            )
            return resp

        # ---------------------------------------------
        # 🟩 NORMAL STRICT SECURITY HEADERS
        # ---------------------------------------------
        fe = settings.FRONTEND_ORIGIN

        resp.headers["X-Frame-Options"] = "DENY"
        resp.headers["X-Content-Type-Options"] = "nosniff"
        resp.headers["Referrer-Policy"] = "no-referrer"

        resp.headers["Content-Security-Policy"] = (
            f"default-src 'self'; "
            f"script-src 'self' 'unsafe-inline'; "
            f"style-src 'self' 'unsafe-inline'; "
            f"img-src 'self' data: blob:; "
            f"connect-src 'self' {fe}; "
            f"frame-ancestors 'none';"
        )

        if settings.HSTS_ENABLED:
            resp.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"

        return resp
