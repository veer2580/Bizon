# Cloudflare-only deployment

This project can now run its frontend, authentication API, and onboarding data on one Cloudflare Worker with Cloudflare D1. No Railway URL or external database is required for this flow.

## One-time Cloudflare setup

1. In Cloudflare, open **Workers & Pages** and create a **D1 database** named `bizon-db`.
2. Copy its database ID.
3. Replace the all-zero `database_id` in `wrangler.jsonc` with that ID. The committed all-zero ID is intentionally a safe placeholder and cannot be deployed to production.
4. Authenticate Wrangler locally with `npx wrangler login`.
5. Create the database tables:

```powershell
npm run cf:d1:migrate
```

6. Deploy the complete app as a Worker:

```powershell
npm run cf:deploy
```

## What the Worker provides

- React frontend from `dist/`
- Persistent signup and password login with D1
- Secure HTTP-only session cookies
- Company, team, data source, and AI-workspace onboarding
- SPA fallback for direct links such as `/signup` and `/dashboard`
- Health check at `/api/health`

## Cloudflare dashboard deployment

Use a **Worker** project, not a Pages project. The build command is `npm run cf:build` and the deployment command is `npm run cf:deploy` when deploying from a local terminal. Do not use the old Pages `_redirects` deploy command or `npx wrangler deploy` without this repository's `wrangler.jsonc`.

For a GitHub build in the Cloudflare dashboard, use:

```text
Build command: npm run cf:build
Deploy command: npx wrangler deploy
Root directory: /
```

The Worker configuration in `wrangler.jsonc` supplies the static assets and API entry point.

## Important current boundary

The Cloudflare Worker migration covers account persistence and onboarding. The original Python-only server features, such as server-side Pandas analysis, OAuth integrations, and SMTP OTP delivery, are not part of this Worker yet. CSV/XLSX browser analytics remain in the frontend.
