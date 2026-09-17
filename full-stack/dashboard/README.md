# Security Dashboard (static mock)

A Next.js UI sketch for a security-status dashboard — intended to eventually visualize real vulnerability-scan results per endpoint.

**This is not wired to a live API.** Every row in the tables (`src/components/ParentTable.tsx`) is hardcoded example data. There is no `fetch`/`axios` call anywhere in this app. Treat it as a UI mock of the intended feature, not a working integration.

## Running it
```bash
npm install
npm run dev
```
Open http://localhost:8000.

## What real integration would require
- A backend endpoint serving actual scan results (e.g. parsed OWASP ZAP JSON reports)
- Replacing the hardcoded arrays in `ParentTable.tsx` with a fetch against that endpoint
- Loading/error states for when the backend is unreachable
