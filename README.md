# API Security Shield

A NestJS/Prisma/PostgreSQL backend for a demo e-commerce API, built to demonstrate concrete mitigations for several OWASP API Top 10 risks — and to document the process of finding and closing real gaps in an already-"hardened" codebase.

---

## What's actually implemented (verified)

- **Deny-by-default authentication** — a global `JwtAuthGuard` (`src/auth`) requires a valid bearer token on every route unless explicitly marked `@Public()`. Previously there was no guard anywhere in the app; every ownership check below existed in code but was unreachable.
- **Broken Object Level Authorization (API1) protections** — user, cart, order, payment, and review endpoints verify the resource belongs to the authenticated caller (`requestingUserId` from the JWT, never from the request body/URL) and return `403` on mismatch. Covered by explicit regression tests: user A can never read/modify user B's cart, order, payment, or profile.
- **Mass assignment prevention (API3)** — a global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` strips any field not declared on a DTO before it reaches Prisma.
- **SQL injection prevention** — Prisma only, no raw queries anywhere in the codebase; injection is prevented structurally, not by input filtering.
- **No token-forgery surface** — JWTs are signed exclusively with a server-managed `JWT_SECRET` configured through `JwtModule`. An earlier design let the *client* supply the signing secret per request, which meant anyone could forge a token for any user; that code path has been removed along with the `User.secretKey` column.
- **Password storage** — bcrypt, cost factor 12.
- **Rate limiting (API4)** — Redis-backed, with a stricter bucket on `/auth/login` (5 requests/min, 5-minute block) than the global limit (100/min).
- **Security headers** — `helmet()` applied globally.
- **Fail-fast config** — the app refuses to start if `JWT_SECRET` is unset or still the documented insecure default, rather than silently signing tokens with a known key.
- **Previously-open admin endpoint closed** — `GET /gateway/_sessions` returned every active session, including raw JWTs, to anyone. It now requires authentication like everything else (closed simply by *not* exempting it from the global guard — no bespoke fix needed).

All of the above is exercised by **147 unit tests across 16 suites** plus **2 end-to-end tests** run against a real PostgreSQL instance (verifying the guard actually rejects unauthenticated HTTP requests, not just mocked calls). `npm run build`, `npm run test`, and `npm run test:e2e` all pass; see `.github/workflows/ci.yml`, which runs all three on every push/PR (it previously only ran `npm run test`, which is exactly how the codebase accumulated 58 unfixed compile errors before this pass).

The full Docker Compose stack (Postgres, Redis, backend, gateway) has been run and verified to reach a healthy state end-to-end, including a live smoke test of register → login → self-access (200) → cross-user access (403) → no token (401).

---

## Known gaps (not yet implemented — stated plainly, not hidden)

- **No role-based access control.** Any authenticated user can create/update/delete products and categories, or change an order's status. There's no `role` field or admin distinction yet.
- **No token revocation.** Logout does not invalidate the issued JWT; it remains valid until it expires. Redis is already in the stack and would be the natural place to store a revocation list.
- **Rate limiting keys on `x-user-id`, which is a self-reported header**, not a value derived from the verified JWT — a client can supply an arbitrary value here to dodge per-user limits (the global IP-based fallback still applies).
- **No dynamic (DAST) scanning integrated yet.** Static/structural mitigations above are verified by tests; an OWASP ZAP pass against a running instance has not yet been run, and no scan results are included in this repo. Treat the OWASP-alignment claims here as backend implementation choices, not as third-party-verified findings.
- **`nginx.ashukconf`** exists in the repo as a reference reverse-proxy config (rate limiting zones, TLS termination, security headers) but is **not** wired into `docker-compose.yml` — the containerized stack currently exposes the NestJS apps directly.
- **`.github/workflows/cd.yml` is not functional** — it targets a `main` branch that doesn't exist here, a path (`infoSec/grid6.0/...`) that doesn't exist in this repo, and a placeholder Docker Hub image name. It has never successfully run and is left as-is pending a real deployment target, rather than faked into looking functional.
- **No cloud deployment for the backend.** There is no AWS VPC, no CloudWatch integration, and no live hosted instance of the API at present — the dashboard's public deployment replays a recorded run against it instead (see below).

---

## Tech Stack

- **Backend**: NestJS (TypeScript), Prisma ORM, PostgreSQL, Redis
- **Auth**: JWT (`@nestjs/jwt`) with a global guard, bcrypt password hashing
- **Dashboard**: Next.js (`full-stack/`) — runs 24 live attacks against the backend, mapped to the OWASP API Top 10
- **Containerization**: Docker / Docker Compose

---

## Getting Started

### Prerequisites
- Node.js v20+
- Docker & Docker Compose

### Running with Docker (recommended)
```bash
cd backend/api-inventory
cp .env.example .env   # fill in JWT_SECRET at minimum — the app refuses to boot with the placeholder value
docker compose up --build
```
This starts Postgres, Redis, the backend (port 9000), and the gateway (port 8080), and runs `prisma migrate deploy` automatically on backend startup.

### Running locally without Docker
```bash
cd backend/api-inventory
npm install
npx prisma migrate dev
npm run start:dev
```

### Running the dashboard
```bash
cd full-stack
npm install
npm run dev
```
Opens on `localhost:8000`. Press **Run security test** to fire the 24 attacks at the backend on
`localhost:9000`. If the backend isn't reachable — which is the case on the public Vercel
deployment — it falls back to a recorded run instead of erroring, and says so on the page.

### Tests
```bash
npm run test        # unit tests
npm run test:e2e     # end-to-end tests (requires a reachable Postgres — see DATABASE_URL)
npm run build        # type-check + compile
```

---

## Acknowledgements
Inspired by the OWASP Top 10 API Security Risks.
