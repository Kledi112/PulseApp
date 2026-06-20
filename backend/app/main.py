from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import ai, auth, employees, employers, perks, redemptions
from app.core.config import settings

app = FastAPI(title="Perx API")

# Auth is via Bearer token in the Authorization header, not cookies, so credentials
# (cookies/sessions) aren't needed here - this also lets CORS_ORIGINS stay "*" for now
# without browsers rejecting the wildcard+credentials combination.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(employers.router)
app.include_router(employees.router)
app.include_router(perks.router)
app.include_router(redemptions.router)
app.include_router(ai.router)


@app.get("/health")
def health():
    return {"status": "ok"}
