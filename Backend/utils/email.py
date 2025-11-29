from sqlalchemy.orm import Session
import requests

from ..core.config import settings
from ..models import User
from .tokens import make_token

MAILJET_URL = "https://api.mailjet.com/v3.1/send"


def _send_mail(to: str, subject: str, body: str) -> None:
    """
    Send an email using Mailjet's HTTP API.
    Falls back to printing in dev if mail settings are not configured.
    """
    if not (
        settings.SMTP_USER
        and settings.SMTP_PASSWORD
        and settings.MAIL_FROM
    ):
        # Dev fallback: just print the email content
        print(f"[DEV] Would send email to {to}: {subject}\n{body}\n")
        return

    payload = {
        "Messages": [
            {
                "From": {
                    "Email": str(settings.MAIL_FROM),
                    "Name": "PolyLab",
                },
                "To": [{"Email": to}],
                "Subject": subject,
                "TextPart": body,
            }
        ]
    }

    try:
        resp = requests.post(
            MAILJET_URL,
            auth=(settings.SMTP_USER, settings.SMTP_PASSWORD),
            json=payload,
            timeout=10,
        )
        if resp.status_code >= 400:
            print(
                f"[ERROR] Mailjet API send failed: "
                f"status={resp.status_code}, body={resp.text}"
            )
        else:
            print(f"[MAIL] Sent email to {to}: {subject}")
    except Exception as exc:  # best-effort, don't break signup/reset
        print(f"[ERROR] Mailjet API send failed: {repr(exc)}")


def send_verification_email(db: Session, user: User) -> str:
    token = make_token(db, user, "verify", minutes=60)
    link = f"{settings.BACKEND_BASE_URL}/auth/verify-email?token={token}"
    body = (
        "Hi,\n\n"
        "Please verify your PolyLab account by clicking this link:\n"
        f"{link}\n\n"
        "If you did not create this account, you can ignore this email."
    )
    _send_mail(user.email, "Verify your PolyLab account", body)
    print(f"[DEV] Verify link for {user.email}: {link}")
    return token


def send_reset_email(db: Session, user: User) -> str:
    token = make_token(db, user, "reset", minutes=30)
    link = f"{settings.BACKEND_BASE_URL}/auth/reset/confirm?token={token}"
    body = (
        "Hi,\n\n"
        "To reset your PolyLab password, click this link:\n"
        f"{link}\n\n"
        "If you did not request a reset, you can ignore this email."
    )
    _send_mail(user.email, "Reset your PolyLab password", body)
    print(f"[DEV] Reset link for {user.email}: {link}")
    return token
