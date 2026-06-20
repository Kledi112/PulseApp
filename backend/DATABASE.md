# Database model & migrations

## How the model works

The database is Postgres, accessed through SQLAlchemy. Each table is a Python class in
`app/models/`, inheriting from `Base` (`app/db/base.py`). This schema is aligned
field-for-field with the frontend's mock data shapes (`types/*.ts`, `data/*.ts`,
`services/*.ts`) so it's a drop-in target once those services are wired to real HTTP
calls instead of local mock arrays.

- `app/models/business_application.py` — `BusinessApplication` — a company applying to
  bring Pulse to its employees (`types/business-application.ts`). This is a lead-gen
  submission for Pulse staff to review, **not a login account** - the registration
  screen collects no password.
- `app/models/team.py` — `Team` — a group employees belong to (e.g. "Engineering").
- `app/models/employee.py` — `Employee` — the app's actual user account
  (`types/user.ts` `User`). `role` (`"employee"` or `"manager"`) distinguishes a regular
  employee from a manager - **there is no separate business/manager login type.**
  Optional `business_id` / `team_id` FKs.
- `app/models/provider.py` — `Provider` — a perk's merchant (`types/provider.ts`).
- `app/models/service.py` — `Service` — the "Perk" shown in the marketplace
  (`types/perk.ts`), belongs to one `Provider`.
- `app/models/request.py` + `app/models/request_item.py` — `Request` /
  `RequestItem` — an employee's redemption request for one perk (`"single"`) or several
  bundled together (`"bundle"`), pending manager approval (`types/request.ts`).
  `RequestItem` snapshots `title`/`provider_name`/price at request time.
- `app/models/active_service.py` — `ActiveService` — a perk an employee requested that
  is `"pending"` manager approval or `"active"` (approved and in use).
- `app/models/redeemed_history.py` — `RedeemedHistory` — a perk an employee has fully
  claimed (`data/claimed-perks.ts` `ClaimedPerk`). Snapshots `title`/`provider_name`/price
  at claim time.
- `app/models/quest.py` + `app/models/quest_entry.py` — `Quest` / `QuestEntry` — a
  standalone challenge (not linked to a service) employees or teams compete in
  (`types/quest.ts`). A quest's winner and an entry's participant can be either an
  `Employee` (individual) or a `Team` - exactly one of `employee_id`/`team_id` is set,
  matching `mode`/`type`.

There is **no stored leaderboard table** - `GET /quests/leaderboard` computes it on the
fly from completed `Quest` rows. There is also no chat-message table yet - the
assistant chat is local-only in the frontend until real AI wiring happens.

Each column is declared with `Mapped[type]` + `mapped_column(...)`, e.g.:

```python
name: Mapped[str] = mapped_column(String(255), nullable=False)
```

Some response fields (e.g. `Service.provider_name`, `Employee.team_name`,
`Quest.winner_name`) are Python `@property` methods on the model, not real columns -
they're derived via the relationship at read time so the data isn't duplicated.

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

## Core workflows

### Adding providers/services (the static perk catalog)

`Provider` and `Service` aren't created through the API - add rows with a one-off SQL
`INSERT` (e.g. via `docker-compose exec db psql -U perx -d perx`) or a small seed script.

### Request → ActiveService → RedeemedHistory lifecycle

1. Employee submits a request: `POST /requests` with `type` (`"single"`/`"bundle"`) and
   `service_ids`. This creates a `Request` + one `RequestItem` per service (snapshotting
   price/title/provider), and one `ActiveService` row per service with
   `status: "pending"`.
2. Manager reviews pending requests: `GET /requests?status_filter=pending`.
3. Manager approves: `POST /requests/{id}/approve` with `payment_method`
   (`"card"`/`"paypal"`). This simultaneously:
   - flips the request's `ActiveService` rows to `status: "active"`, **and**
   - creates a `RedeemedHistory` row for each item.
   (Both happen together - matching the product behavior: paying for a perk both
   activates it for ongoing use *and* records it as claimed.)
4. Manager declines: `POST /requests/{id}/decline` — marks the request `"declined"` and
   deletes its `ActiveService` rows.

### Quests

1. Manager creates a quest: `POST /quests` (`title`, `description`, `reward`, `type`,
   `deadline`) → `status: "active"`.
2. Employees enter: `POST /quests/{id}/entries` with `mode` (`"individual"` enters the
   calling employee, `"team"` requires `team_id`).
3. Manager reviews entries (`GET /quests/{id}/entries`) and quests needing a decision
   (`GET /quests/awaiting-winner`), then picks a winner:
   `POST /quests/{id}/select-winner` with either `employee_id` or `team_id` →
   `status: "completed"`.
4. `GET /quests/leaderboard?period=month|quarter` computes completed-quest counts per
   winning employee/team for the given period - nothing is precomputed or stored.

## Auth

Single account type (`Employee`), distinguished by `role`. `POST /auth/register` /
`POST /auth/login` issue the same JWT shape regardless of role; endpoints that should
be manager-only depend on `get_current_manager` (in `app/api/deps.py`), which checks
`role == "manager"` on top of the normal `get_current_employee` check.
