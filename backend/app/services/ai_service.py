"""Single integration point for LLM-backed features.

Uses Google Gemini's free tier (settings.gemini_api_key) when configured. If the
key is missing, or the Gemini call fails for any reason (rate limit, network,
bad response), every caller falls back to a keyword match against the perk
catalog so the assistant never hard-fails a request.
"""

import re

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.employee import Employee
from app.models.service import Service

KEYWORD_CATEGORY = [
    (["relax", "stress", "calm", "massage", "spa"], "wellness"),
    (["eat", "food", "dinner", "lunch", "restaurant", "hungry"], "food"),
    (["travel", "trip", "vacation", "holiday", "weekend away"], "travel"),
    (["fun", "movie", "entertainment", "weekend"], "fun"),
    (["phone", "data", "mobile", "internet"], "telecom"),
    (["health", "doctor", "checkup", "clinic"], "healthcare"),
]


def get_recommendations(db: Session, employee: Employee, limit: int = 5) -> list[Service]:
    return (
        db.query(Service)
        .filter(Service.active.is_(True))
        .group_by(Service.id)
        .order_by(func.random())
        .limit(limit)
        .all()
    )


def _keyword_fallback(db: Session, message: str) -> tuple[str, list[Service]]:
    lower = message.lower()
    category = next((cat for keywords, cat in KEYWORD_CATEGORY if any(k in lower for k in keywords)), None)
    perks = db.query(Service).filter(Service.active.is_(True), Service.category == category).limit(2).all() if category else []
    text = (
        f"Here's something that might fit. I found {len(perks)} option{'s' if len(perks) != 1 else ''} for you."
        if perks
        else "I'm not sure yet, but try asking about food, travel, wellness, or fun and I'll find a perk for you."
    )
    return text, perks


def _match_titles(text: str, catalog: list[Service]) -> list[Service]:
    lower = text.lower()
    return [service for service in catalog if service.title.lower() in lower][:3]


def ask_assistant(db: Session, employee: Employee, message: str) -> tuple[str, list[Service]]:
    if not settings.gemini_api_key:
        return _keyword_fallback(db, message)

    catalog = db.query(Service).filter(Service.active.is_(True)).limit(50).all()

    try:
        from google import genai

        client = genai.Client(api_key=settings.gemini_api_key)
        catalog_text = "\n".join(f"- {s.title} ({s.category}) at {s.provider_name}: {s.description or ''}" for s in catalog)
        prompt = (
            "You are a friendly assistant inside an employee perks app. "
            "Answer the employee's question and, if relevant, recommend up to 2 perks "
            "from the list below by their exact title. Keep the reply short (2-3 sentences).\n\n"
            f"Available perks:\n{catalog_text}\n\n"
            f"Employee asked: {message}"
        )
        response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        text = (response.text or "").strip()
        if not text:
            raise ValueError("empty response from Gemini")
        return text, _match_titles(text, catalog)
    except Exception:
        return _keyword_fallback(db, message)
