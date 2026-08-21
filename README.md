# SiteOps

SiteOps is a Vite + React + TypeScript frontend with an Express + Prisma backend for a B2B website maintenance workflow.

## Stack

- Frontend: Vite, React, TypeScript, React Router, Axios, TanStack Query
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, Zod
- Storage: Supabase Storage private bucket with signed URLs

## Environment

Copy `.env.example` to `.env` and `server/.env.example` to `server/.env`, then fill the values locally.

Required variables:

```env
DATABASE_URL=
DIRECT_URL=
DATABASE_URL_TRANSACTION=

SUPABASE_URL=
SUPABASE_SECRET_KEY=

JWT_SECRET=
CORS_ORIGIN=http://localhost:5173
PORT=3000
```

Do not expose `SUPABASE_SECRET_KEY`, `JWT_SECRET`, or database URLs to frontend code.

## Commands

Frontend:

```bash
npm install
npm run dev
npm run build
npm run lint
```

Backend:

```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

For deployment migrations, use:

```bash
cd server
npm run prisma:deploy
```

## Demo Accounts

Seed creates these demo users:

- `admin@siteops.demo`
- `worker@siteops.demo`
- `client@siteops.demo`

Use the seed credentials configured in `server/prisma/seed.ts`.

## API Prefix

All backend endpoints are under:

```text
/api/v1
```

Implemented groups:

- `/auth`
- `/projects`
- `/requests`
- `/uploads`
- `/dashboard`
- `/notifications`
- `/users`
- `/health`

Storage bucket setup:

```bash
cd server
npm run storage:ensure
```
