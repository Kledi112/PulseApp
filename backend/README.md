# Perx Backend

FastAPI + PostgreSQL backend for the Perx employer/employee perks platform.

## Local development

1. Copy the env template and adjust if needed:
   ```
   cp .env.example .env
   ```
2. Start Postgres + the API with Docker Compose:
   ```
   docker-compose up --build
   ```
3. Apply database migrations (first run, and after any model change):
   ```
   docker-compose exec api alembic upgrade head
   ```
4. Open the interactive API docs: http://localhost:8000/docs

## Creating a new migration

After changing a model in `app/models/`:
```
docker-compose exec api alembic revision --autogenerate -m "describe the change"
docker-compose exec api alembic upgrade head
```

## Running tests

```
docker-compose exec api pytest
```

## Project layout

- `app/core` — settings and JWT/password helpers
- `app/db` — SQLAlchemy engine/session setup
- `app/models` — SQLAlchemy ORM models (Employer, Employee, Perk, Redemption)
- `app/schemas` — Pydantic request/response models
- `app/api/routers` — FastAPI route handlers, grouped by resource
- `app/services/ai_service.py` — the one place that talks to an LLM provider; everything
  else calls into this module rather than an LLM client directly
- `alembic/` — database migrations

## Deploying for a live demo

The app reads all config from environment variables (`app/core/config.py`), so the same
Docker image runs unchanged on a managed host (Railway/Render/Fly.io) with a managed
Postgres add-on — set `DATABASE_URL`, `JWT_SECRET`, and `LLM_API_KEY` there instead of
running Docker Compose live during the demo.
