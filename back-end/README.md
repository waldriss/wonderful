# Comptabilite Backend

Backend API built with Express + TypeScript, following clean architecture principles.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: better-auth
- **Validation**: Zod
- **Logging**: Pino

## Project Structure

```
src/
├── config/          # Environment configuration
├── lib/             # Shared libraries (prisma, auth)
├── middlewares/     # Express middlewares
├── modules/         # Feature modules (vertical slice)
│   └── example/
│       ├── controllers/
│       ├── dto/
│       ├── repositories/
│       ├── routes/
│       └── services/
├── routes/          # Route aggregation
├── shared/          # Shared types and utilities
└── utils/           # Helper utilities
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm/npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## API Endpoints

### Health Check
- `GET /health` - Simple health check
- `GET /api/health` - Detailed health check
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

### Authentication (better-auth)
- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `DATABASE_URL` | PostgreSQL connection URL | Yes |
| `BETTER_AUTH_SECRET` | Auth secret (min 32 chars) | Yes |
| `BETTER_AUTH_BASE_URL` | Backend URL | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

## Adding a New Module

1. Create folder under `src/modules/your-module/`
2. Add subdirectories: `controllers/`, `dto/`, `repositories/`, `routes/`, `services/`
3. Define Zod schemas in `dto/`
4. Implement repository for data access
5. Implement service for business logic
6. Implement controller for HTTP handling
7. Define routes and register in `src/routes/index.ts`
