from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.active_service import ActiveService

router = APIRouter(tags=["claims"])


_CONFETTI_COLORS = ["#14b8a6", "#6ee7b7", "#2dd4bf", "#fbbf24", "#f472b6"]


def _confetti_html() -> str:
    import math

    spans = []
    count = 14
    for i in range(count):
        angle = (2 * math.pi / count) * i
        dx = round(math.cos(angle) * 90)
        dy = round(math.sin(angle) * 90)
        color = _CONFETTI_COLORS[i % len(_CONFETTI_COLORS)]
        delay = round((i % 5) * 0.04, 2)
        spans.append(
            f'<span class="confetti" style="--dx:{dx}px;--dy:{dy}px;'
            f'background:{color};animation-delay:{delay}s;"></span>'
        )
    return "".join(spans)


def _render(heading: str, body: str, success: bool, celebrate: bool = False) -> str:
    accent = "#14b8a6" if success else "#f87171"
    checkmark_html = (
        f'<div class="checkmark-wrap">{_confetti_html()}<div class="checkmark">'
        f'<svg viewBox="0 0 52 52" width="40" height="40"><path d="M14 27l8 8 16-16" '
        f'fill="none" stroke="#0d1117" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        f"</div></div>"
        if celebrate
        else ""
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{heading}</title>
<style>
  body {{ margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #0d1117; color: #f0f6fc; font-family: -apple-system, Segoe UI, Roboto, sans-serif; }}
  .card {{ max-width: 360px; padding: 32px; border-radius: 16px; background: #151b23;
    border: 1px solid #262e3a; text-align: center; }}
  h1 {{ font-size: 20px; color: {accent}; margin: 0 0 12px; }}
  p {{ font-size: 15px; color: #9aa7b6; margin: 0; }}
  .checkmark-wrap {{ position: relative; width: 64px; height: 64px; margin: 0 auto 16px; }}
  .checkmark {{ width: 64px; height: 64px; border-radius: 32px; background: #14b8a6;
    display: flex; align-items: center; justify-content: center;
    animation: pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both; }}
  .confetti {{ position: absolute; top: 50%; left: 50%; width: 7px; height: 7px; border-radius: 2px;
    opacity: 0; transform: translate(-50%, -50%);
    animation: confetti-burst 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both; }}
  @keyframes pop-in {{
    0% {{ transform: scale(0); opacity: 0; }}
    60% {{ transform: scale(1.15); opacity: 1; }}
    100% {{ transform: scale(1); opacity: 1; }}
  }}
  @keyframes confetti-burst {{
    0% {{ transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 1; }}
    100% {{ transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.4); opacity: 0; }}
  }}
</style>
</head>
<body>
  <div class="card">
    {checkmark_html}
    <h1>{heading}</h1>
    <p>{body}</p>
  </div>
</body>
</html>"""


@router.get("/c/{token}", response_class=HTMLResponse, include_in_schema=False)
def claim_perk(token: str, db: Session = Depends(get_db)):
    row = db.query(ActiveService).filter(ActiveService.token == token).first()

    if not row:
        return HTMLResponse(_render("Failed to claim perk", "This link is invalid.", success=False), status_code=404)

    if row.status == "claimed":
        return HTMLResponse(
            _render(
                "Already claimed",
                f"{row.title_snapshot} was already claimed on {row.claimed_at:%b %d, %Y at %H:%M}.",
                success=True,
            )
        )

    row.status = "claimed"
    row.claimed_at = datetime.now(timezone.utc)
    db.commit()

    return HTMLResponse(
        _render(
            "Perk claimed successfully",
            f"{row.title_snapshot} at {row.provider_name_snapshot} for {row.employee.name}.",
            success=True,
            celebrate=True,
        )
    )
