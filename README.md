# Pulse

Pulse is an employee engagement and benefits platform built for the **HackJunction Tirana — Perx Challenge**. It turns workplace perks into a personalized, gamified experience through team and individual quests, an AI-powered concierge, a perks marketplace, and social budgeting.

## Key Features

- **Quests** — Managers create individual, team, or open challenges with rewards and deadlines. Employees compete, climb monthly and quarterly leaderboards, and winners are selected directly from the dashboard.
- **AI Assistant** — A conversational concierge (powered by Gemini, with a keyword-matching fallback) that recommends perks based on natural-language requests and remaining budget.
- **Perks Marketplace** — Browse perks by category and take, save, bundle, or pool them.
- **Perk Pools** — Employees combine portions of their individual budgets to unlock perks they couldn't afford alone, then claim together with a single QR code.
- **Redemption** — Bundled perks generate a unique QR token, scanned at the venue to confirm the claim.
- **Manager Dashboard** — Create quests, manage the team, monitor leaderboards, and control the perk catalog and budgets.

## Tech Stack

**Frontend**
- React Native + Expo (Expo Router, file-based navigation)
- Zustand for state management
- React Native Reanimated

**Backend**
- FastAPI (Python)
- PostgreSQL with SQLAlchemy + Alembic migrations
- JWT authentication
- Google Gemini API for AI-powered recommendations

## Project Structure

```
PulseApp/
├── app/            # Expo Router screens (employee, manager, and auth flows)
├── components/     # Shared UI components
├── services/       # API clients
├── store/          # Zustand stores
├── types/          # Shared TypeScript types
├── theme/          # Design tokens
└── backend/        # FastAPI service, database models, and migrations
```

## Getting Started

### Prerequisites
- Node.js and npm
- Docker and Docker Compose (for the backend)

### Frontend

```bash
npm install
npx expo start
```

### Backend

```bash
cd backend
cp .env.example .env
docker-compose up --build
```

On first run, apply database migrations in a second terminal:

```bash
docker-compose exec api alembic upgrade head
```

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

See `backend/RUNNING.md` and `backend/DATABASE.md` for further details on running and extending the backend.

## Built For

[HackJunction Tirana — Perx Challenge](https://tirana.hackjunction.com/challenges/perx)
