# Project structure and editing map

This repository has one production application and one local analytics runtime.
Production is deployed as a Cloudflare Worker. Local development starts the
Vite frontend and the Python analytics backend together.

## Top-level map

```text
dsi-prototype-backup/
|-- cloudflare/        Cloudflare Worker API and D1 schema
|-- backend/           Local Python analytics, connectors, exports, and tests
|-- public/            Static assets and the public marketing website
|-- scripts/           Local development and documentation utilities
|-- src/               React workspace application
|-- docs/              Architecture, deployment, and setup guides
|-- index.html         Vite application entry document
|-- package.json       Commands and JavaScript dependencies
|-- vite.config.js     Frontend build configuration
`-- wrangler.jsonc     Cloudflare Worker, assets, and D1 binding configuration
```

Generated folders such as `dist/`, `.wrangler/`, `node_modules/`, `output/`,
Python `__pycache__/`, and `.venv/` are not source code. Do not edit them
manually; commands recreate them.

## React application: `src/`

| Location | What belongs here | Edit this when |
|---|---|---|
| `src/App.jsx` | Routes and authentication guards | Adding or changing a URL/page |
| `src/pages/` | Full application screens | Editing dashboard, login, signup, onboarding, reports, or connections |
| `src/components/` | Reusable workspace controls | A shared sidebar, top bar, uploader, chart, or dialog changes |
| `src/api/universalBackend.js` | Browser-to-backend API client | Adding an API call or changing API request handling |
| `src/api/stages/` | Browser file validation/parsing pipeline | Changing supported file parsing behavior |
| `src/context/` | Shared React state | Changing workspace data or theme state |
| `src/dashboard-engine/` | JSON-driven dashboard rendering | Changing generated dashboard layouts |
| `src/voice/` | Global voice assistant UI and tools | Changing voice behavior |
| `src/utils/` | Small shared browser helpers | Logic is reused by multiple screens |
| `src/index.css` | Workspace-wide styling | A style truly affects multiple authenticated screens |

Authentication page styling is intentionally scoped:

- `src/pages/PublicPages.css`: login/signup and public React page foundations
- `src/pages/SignupOverrides.css`: signup-only final overrides
- `src/pages/OnboardingOverrides.css`: all onboarding-step final overrides

## Public website: `public/landing/`

The marketing website is static HTML/CSS and is displayed by the React landing
route. Each page has its own content stylesheet, while shared behavior lives in:

- `public/landing/unified-nav.css`: canonical header and footer appearance
- `public/landing/script.js`: shared header actions, footer injection, modal, and page interactions
- `public/landing/style.css`: landing-home layout
- `public/landing/index.html`: landing-home content and canonical footer markup

When changing the header or footer, edit the shared files above rather than
copying new markup into every page. Login/signup links must stay internal:
`/login` and `/signup`. External legacy hosting URLs must not be introduced.

## Cloudflare production: `cloudflare/`

| File | Responsibility |
|---|---|
| `cloudflare/worker.js` | Production auth/session/onboarding API and static asset serving |
| `cloudflare/schema.sql` | Idempotent D1 tables and indexes |
| `wrangler.jsonc` | Worker name, entrypoint, assets, and `BIZON_DB` binding |

For a new Cloudflare account, update only the D1 `database_id` in
`wrangler.jsonc`, apply `cloudflare/schema.sql`, then deploy.

## Local Python backend: `backend/`

| Location | Responsibility |
|---|---|
| `backend/app.py` | Local ASGI API routing |
| `backend/account_store.py` | Local account/session lifecycle |
| `backend/analytics/` | Parsing, profiling, metrics, ML, dashboards, and reports |
| `backend/ai/` | Prompt construction, orchestration, and response validation |
| `backend/voice/` | Voice provider integration and memory |
| `backend/tests/` | Backend behavior and regression tests |

Do not move analytics modules merely to shorten the folder. They form a staged
pipeline and are imported through service/orchestrator modules.

## Common commands

```powershell
npm run dev           # Vite frontend + local Python backend
npm run lint          # JavaScript and JSX checks
npm run test:backend  # Python backend tests
npm run build         # Standard production frontend build
npm run cf:build      # Cloudflare frontend build
npm run cf:deploy     # Build and deploy the Cloudflare Worker
```

## Safe manual-change checklist

1. Edit source files only, never `dist/` or `.wrangler/`.
2. Keep production API calls same-origin; do not add external dashboard hosts.
3. Run `npm run lint`, `npm run test:backend`, and `npm run build`.
4. For auth or onboarding changes, also run the account lifecycle tests.
5. Review `git status` before committing so local secrets and generated files
   are not included.
