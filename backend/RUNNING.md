# Running the backend

## First time only

```bash
cd backend
cp .env.example .env
```

## Every time

```bash
docker-compose up --build
```

This starts two containers: Postgres and the FastAPI server.

- API: http://localhost:8000
- Interactive docs (Swagger UI): http://localhost:8000/docs

## First run only (or after pulling new model changes)

In a second terminal, apply database migrations:

```bash
docker-compose exec api alembic upgrade head
```

## To stop

```bash
docker-compose down
```

Add `-v` only if you also want to wipe the database:

```bash
docker-compose down -v
```

See `DATABASE.md` for how the data model works and how to add migrations when you change a model.
