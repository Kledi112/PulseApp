from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.active_service import ActiveService

router = APIRouter(tags=["claims"])


def _render(heading: str, body: str, success: bool) -> str:
    accent = "#14b8a6" if success else "#f87171"
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
</style>
</head>
<body>
  <div class="card">
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
        )
    )
