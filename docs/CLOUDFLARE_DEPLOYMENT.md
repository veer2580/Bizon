# Cloudflare Deployment

## Frontend: Cloudflare Pages

Create a Pages project from this repository with these settings:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`
- Node version: `22`

Add the variables from `.env.cloudflare.example` in the Pages project settings.
Set `VITE_ANALYTICS_API_BASE` to the public URL of the Python backend. Do not
put server secrets such as `STITCH_API_KEY`, `HF_API_KEY`, session secrets, or
database credentials in a `VITE_` variable.

The `public/_redirects` file keeps React Router routes working on refresh.
Static landing sub-pages remain available under `/landing/`.

## Backend: Render or another Python host

Cloudflare Pages does not run this Python ASGI backend. Deploy the backend
using the included `Dockerfile` and `render.yaml`, or another host that runs
Uvicorn and supports persistent PostgreSQL storage.

Set these backend values to the Cloudflare Pages URL:

```text
FRONTEND_URL=https://your-pages-domain.pages.dev/connections
FRONTEND_ORIGIN=https://your-pages-domain.pages.dev
FRONTEND_ORIGINS=https://your-pages-domain.pages.dev
OAUTH_CALLBACK_BASE=https://your-backend-domain.example.com
BYIZON_AUTH_DISABLED=false
```

Keep `DATABASE_URL`, `BYIZON_SESSION_SECRET`,
`BYIZON_CONNECTOR_ENCRYPTION_KEY`, and integration keys configured only on the
backend. Use PostgreSQL in production so accounts, onboarding data, analytics,
and shared dashboards survive redeploys.

## Deployment order

1. Deploy the backend and confirm `/api/health` responds successfully.
2. Add the backend URL as `VITE_ANALYTICS_API_BASE` in Cloudflare Pages.
3. Deploy the Pages frontend.
4. Update the backend CORS and OAuth variables with the final Pages domain.
5. Test signup, login, company onboarding, dashboard loading, and Stitch links.
