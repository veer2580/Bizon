# Cloudflare Deployment

## Application: Cloudflare Worker

Connect this repository to a Cloudflare Worker with these settings:

- Framework preset: `Vite`
- Build command: `npm run cf:build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- Node version: `22`

The Worker serves the compiled frontend, authentication API, and D1-backed
onboarding routes from one origin. Do not set `VITE_ANALYTICS_API_BASE` to an
external legacy host.

The `public/_redirects` file keeps React Router routes working on refresh.
Static landing sub-pages remain available under `/landing/`.

Create the D1 database, put its real ID in `wrangler.jsonc`, and apply
`cloudflare/schema.sql` before the first production deployment.

## Deployment order

1. Apply the D1 schema.
2. Deploy the Worker from the connected GitHub repository.
3. Confirm `/api/health` responds successfully.
4. Test signup, login, company onboarding, and dashboard loading.
