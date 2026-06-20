# Database model & migrations

## How the model works

The database is Postgres, accessed through SQLAlchemy. Each table is a Python class in
`app/models/`, inheriting from `Base` (`app/db/base.py`):

- `app/models/business.py` — `Business` table (a company, e.g. "Acme Inc")
- `app/models/employee.py` — `Employee` table (FK `business_id` → `businesses`)
- `app/models/service.py` — `Service` table — a **global, hand-written catalog** of perks
  (e.g. "Gym Membership"). Not tied to any one business; rows are added by hand for now,
  not through the API.
- `app/models/active_service.py` — `ActiveService` table — a service currently
  pending/active for one specific employee (`employee_id`, `service_id`, `status`:
  `"pending"` or `"active"`). When the employee finishes/redeems it, the row is deleted
  from here and a row is created in `redeemed_history` instead — a service is either
  in-progress (`active_services`) or done (`redeemed_history`), never both.
- `app/models/redeemed_history.py` — `RedeemedHistory` table — a record of an employee
  having finished/redeemed a service (`service_id`, `employee_id`, `redeemed_at`,
  `status`, default `"finished"`).
- `app/models/quest.py` — `Quest` table — links an employee to a service they earned
  through a quest (`employee_id`, `service_id`).

Each column is declared with `Mapped[type]` + `mapped_column(...)`, e.g.:

```python
name: Mapped[str] = mapped_column(String(255), nullable=False)
```

Relationships between tables (e.g. a `Business` having many `Employee`s) are declared
with `relationship(...)` on both sides so you can do `business.employees` or
`employee.business` in Python without writing the join yourself.

SQLAlchemy never touches the actual Postgres schema on its own — it only describes what
the tables *should* look like in Python. **Alembic** is the tool that compares that
description against the real database and generates/applies the SQL to bring them in
sync. That's why every model change needs a migration step (below) — editing a model
file alone does not change the database.

`app/db/session.py` creates the SQLAlchemy engine/session from `DATABASE_URL` (set in
`.env`), and `get_db()` is the FastAPI dependency every router uses to get a session per
request.

## Starting the backend

From `backend/`:

```bash
cp .env.example .env        # first time only
docker-compose up --build
```

This starts two containers: `db` (Postgres) and `api` (FastAPI on
http://localhost:8000). Swagger UI is at http://localhost:8000/docs.

Stop everything with:

```bash
docker-compose down
```

## Opening the database in DBeaver

Postgres is exposed on the host at port **5434** (not the default 5432 — chosen to avoid
clashing with another Postgres already running directly on this machine):

- Host: `localhost`
- Port: `5434`
- Database: `perx`
- Username: `perx`
- Password: `perx`

## Changing the database (add/edit/remove fields or tables)

1. Edit the model(s) in `app/models/` — add/remove/rename a column, add a new model
   class, or delete one. If you add a brand-new model file, also import it in
   `app/models/__init__.py` and in `alembic/env.py` (both currently list every model
   explicitly so Alembic's metadata picks it up).
2. Generate a migration that captures the diff:
   ```bash
   docker-compose exec api alembic revision --autogenerate -m "describe the change"
   ```
   This writes a new file into `alembic/versions/` with the SQL changes Alembic
   detected. **Always open the generated file and check it** — autogenerate is good but
   not perfect (it won't detect plain column/table renames, for example; those show up
   as a drop + add unless you edit the migration by hand to use `op.alter_column` /
   `op.rename_table`).
3. Apply it to the running database:
   ```bash
   docker-compose exec api alembic upgrade head
   ```
4. Commit both the model change and the new migration file together.

### Other useful Alembic commands

```bash
docker-compose exec api alembic current        # which migration the db is currently at
docker-compose exec api alembic history         # list all migrations
docker-compose exec api alembic downgrade -1    # roll back the last migration
```

### Deleting a table

Delete the model class (and remove its import from `app/models/__init__.py` and
`alembic/env.py`), then run the same `alembic revision --autogenerate` +
`alembic upgrade head` steps — Alembic will generate a `DROP TABLE` for you.

### Adding new services

Since `Service` is a static, hand-written catalog (not created through the API), add
new rows either with a one-off SQL `INSERT` (e.g. via
`docker-compose exec db psql -U perx -d perx`) or a small seed script — employees then
request access to a service as described below.

### Active service → redeemed history lifecycle

1. Employee requests a service: `POST /active-services` (employee auth) creates a row
   with `status: "pending"`.
2. Business reviews pending requests at `GET /active-services/business`, and either:
   - `POST /active-services/{id}/approve` → flips `status` to `"active"`, or
   - `POST /active-services/{id}/reject` → deletes the row outright (denied).
3. While pending/active, the request shows up for that employee at
   `GET /active-services`. Redeeming via `POST /redeemed-history` only succeeds once
   `status` is `"active"` — a still-`"pending"` request can't be redeemed yet.
4. When redeemed: `POST /redeemed-history` with `service_id` deletes the matching
   `active_services` row and creates a `redeemed_history` row in its place. There is no
   "finished" status sitting in `active_services` — once redeemed, it only exists in
   `redeemed_history`.
