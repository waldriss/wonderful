Copilot Instructions for Full-Stack Boilerplate
USE ALWAYS TYPESCRIPT IN BOTH FRONT AND BACKEND
This guide defines operational rules and best practices for Copilot (or any AI assistant) when scaffolding, editing, and maintaining a full-stack web application using:

Frontend: Next.js + TypeScript, Tailwind CSS, shadcn/ui, Zod, Zustand, TanStack Query

Backend: Express + TypeScript, Prisma + PostgreSQL, better-auth, Zod, BullMQ, Redis, Pino

Adopt a modular (vertical-slice) architecture, SOLID principles, and clean code standards for maximum performance, maintainability, and developer experience.

1. PRIME DIRECTIVE

Provide clear, concise commentary explaining intent and rationale for every code suggestion.

Await explicit user guidance for structural or file organization; focus on logic and best practices rather than fixed file layouts.

2. GENERAL CODING STANDARDS

SOLID Principles: single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion (conceptual).

Clean Code: small functions, meaningful names, minimal side effects, clear error handling.

Documentation: use JSDoc/TSDoc for public interfaces; add inline comments for complex logic.

Naming Conventions: camelCase for variables/functions, PascalCase for types/components.

Pull Request Size: keep changes focused and under ~200 lines; one conceptual change per PR.

3. FRONTEND BEST PRACTICES (Next.js + TypeScript)

3.1 Data Layer & State Management

TanStack Query for server state: caching, background refetch, optimistic updates.

Zustand for client/global state with optional persistence.

Centralize API calls in reusable hooks or lib/api.ts, handling auth tokens and error mapping.

3.2 Forms & Validation

React Hook Form paired with Zod: define schemas once, infer types for form data, and validate on submission.

Display field-level errors and disable submit until valid.

3.3 UI & Styling

Tailwind CSS for utility-first styling; define design tokens in a shared config.

shadcn/ui or equivalent headless component library.

Extract repeated patterns into reusable components; keep components small and focused.

3.4 Routing & Layouts

Leverage Next.js App Router or Pages Router as appropriate; co-locate page code with related components.

Use nested layouts for shared UI (headers, footers, sidebars).

Lazy-load non-critical components with dynamic imports.

3.5 Accessibility & SEO

Integrate eslint-plugin-jsx-a11y and axe-core checks in CI.

Use semantic HTML, ARIA attributes, and manage focus for dialogs.

Manage metadata (<Head>) dynamically for SEO and social previews.

3.6 Performance Optimizations

Use next/image for optimized images; prioritize LCP images.

Prefetch routes and data where beneficial.

Minimize bundle size: tree shake, code-split, and vendor chunk splitting.

3.7 Testing

Unit Tests: Jest + React Testing Library for components, hooks, and utilities.

Integration Tests: mock network with MSW.

E2E Tests: Cypress or Playwright against a staging environment.

Enforce ≥80% coverage; fail builds on regressions.

4. BACKEND BEST PRACTICES (Express + TypeScript)

4.1 Modular Controllers & Services

Follow a vertical-slice pattern: each feature folder contains its controller, service, repository, DTO schemas, and types.

Controllers handle HTTP, services encapsulate business logic, repositories manage database access.

4.2 Validation & DTOs

Define Zod schemas for every request and response DTO.

Validate incoming data in route middleware; pass typed data to controllers.

4.3 Authentication & Authorization

Use better-auth for JWT-based auth, with access and refresh tokens in secure cookies.

Apply route guards as middleware; include role-based checks.

4.4 Database & Repositories

Use Prisma ORM with a clear schema, migrations, and type-safe client.

Encapsulate all database operations in repository classes, exposing only intention-revealing methods.

4.5 Error Handling

Use a custom AppError class with status codes and details.

Centralized error-handling middleware: differentiate operational errors vs. unexpected ones, log appropriately, and return consistent JSON error shapes.

4.6 Logging & Observability

Structured logging with Pino: include request IDs, timestamps, and context.

Middleware logs request method, URL, status, and latency.

Integrate Sentry for exception tracking.

Optionally expose Prometheus metrics and use OpenTelemetry for tracing.

4.7 Security Hardening

Use helmet, cors with explicit origins, rate limiting, hpp, and set body parser limits.

Sanitize inputs to prevent injections.

Enforce HTTPS in production.

4.8 Background Jobs & Caching

Use BullMQ + Redis for job queues (emails, reports); run workers separately.

Implement caching for read-heavy endpoints with Redis or in-memory caches.

4.9 Testing

Unit Tests for services and repositories, mocking Prisma.

Integration Tests with Supertest and a disposable test database.

Contract Tests for job processors.

Maintain ≥80% coverage.

4.10 API Documentation & Versioning

Generate OpenAPI/Swagger docs from your route definitions or annotations.

Serve docs on a protected /docs endpoint; use route versioning (e.g., /v1/users).

5. DEVEX & CI/CD

5.1 Linting & Formatting

ESLint and Prettier configurations; enforce via pre-commit hooks (husky + lint-staged).

Adopt Conventional Commits for clear changelogs.

5.2 CI Pipelines

Steps: install → lint → type-check → test → build → deploy.

Use GitHub Actions or similar; block merges on failure.

5.3 Containerization & Local Dev

Provide Dockerfiles and a docker-compose.yml for local services (API, DB, Redis).

Ensure containers use multi-stage builds for lean production images.

5.4 Monitoring & Alerts

Configure Sentry for errors, UptimeRobot or similar for availability.

Alert on high error rates or latency spikes.

This document evolves. Update as new best practices emerge or your stack changes.