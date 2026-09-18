# API Security Shield — Dashboard

Next.js dashboard that runs 24 live attacks against the backend in `backend/api-inventory`,
mapped to the OWASP API Top 10, and reports the real status codes it gets back.

## Running it
```bash
npm install
npm run dev
```
Open http://localhost:8000. Press **Run security test** — it registers two throwaway accounts
against the backend on `localhost:9000`, crosses their tokens, and fires the attacks for real.

## If the backend isn't reachable
`src/pages/api/scan.ts` falls back to a recorded run (`src/lib/snapshot.ts`) instead of erroring.
The page labels this clearly — this is what the public Vercel deployment shows, since the backend
only runs locally. Set `SCAN_TARGET` as an env var to point it at a hosted backend instead.

## Structure
- `src/lib/catalog.ts` — the 24 attack definitions and their OWASP category copy
- `src/lib/runner.ts` — the attack logic itself (runs server-side)
- `src/lib/snapshot.ts` — a real recorded run, used as the offline fallback
- `src/pages/api/scan.ts` — orchestrates a run, live or recorded
- `src/pages/index.tsx` — the page
