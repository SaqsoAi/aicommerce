# Server (API)

This folder contains the API server, Prisma schema, and backend services.

Quick start (development):

```
cd server
npm install
cp .env .env.local # or create from .env.example
npx prisma generate
npm run dev
```

Prisma schema: `server/prisma/schema.prisma`

Common scripts (check `package.json`): `dev`, `build`, `start`, `migrate`.
