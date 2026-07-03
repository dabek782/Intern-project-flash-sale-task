# Flash Sale Ticketing

Turborepo monorepo with a NestJS backend, a Next.js frontend, PostgreSQL, and Redis. The backend uses Prisma as ORM.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm (only needed if running apps outside Docker)

## Environment variables

Create a `.env` file in the project root, used by `docker-compose.yaml`:

```
POSTGRES_DB=flashsale
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

If running the backend outside Docker, create `apps/backend/.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flashsale
REDIS_URL=redis://localhost:6379
SECRET_ACCESS_KEY=change-me
SECRET_REFRESH_KEY=change-me
JWT_ACCESS_TOKEN_SECRET=change-me
```

## Run with Docker

From the project root:

```
docker compose up --build
```

This starts PostgreSQL, Redis, the backend, and the frontend.

## Run the backend locally

1. Start PostgreSQL and Redis, e.g.:
   ```
   docker compose up postgres redis
   ```
2. From the project root:
   ```
   cd apps/backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run start:dev
   ```

## Run the frontend locally

```
cd apps/frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:3000` and frontend runs on `http://localhost:3001`
## Useful commands

Run from the project root (Turborepo will forward these to each app):

## Seeding
Seeding works by using command
```
npx ts-node prisma/seed.ts
```
in cd/apps/backend.
You need to Database url set in .env in backend

