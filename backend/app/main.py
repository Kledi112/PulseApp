from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import (
    active_services,
    ai,
    auth,
    business_applications,
    claims,
    employees,
    manager,
    perk_pools,
    providers,
    quests,
    saved_perks,
    services,
)
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
app.include_router(business_applications.router)
app.include_router(employees.router)
app.include_router(providers.router)
app.include_router(services.router)
app.include_router(active_services.router)
app.include_router(quests.router)
app.include_router(ai.router)
app.include_router(manager.router)
app.include_router(claims.router)
app.include_router(saved_perks.router)
app.include_router(perk_pools.router)


@app.get("/health")
def health():
    return {"status": "ok"}
