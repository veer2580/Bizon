# Byizon production deployment

Byizon production runs as a Cloudflare Worker. The Worker serves the compiled
React application, authentication endpoints, onboarding endpoints, and static
landing pages from the same origin. Cloudflare D1 stores account and onboarding
data.

## Deploy from GitHub

1. Push the repository to GitHub.
2. In Cloudflare, create a Worker connected to that repository.
3. Use `npm run cf:build` as the build command.
4. Use `npx wrangler deploy` as the deploy command.
5. Keep the root directory set to `/`.

The Worker configuration is stored in `wrangler.jsonc`. Its `database_id` must
match the D1 database in the Cloudflare account performing the deployment.

## Prepare D1

Create the `bizon-db` D1 database, update `wrangler.jsonc` with its ID, then
apply the schema before the first deployment:

```powershell
npx wrangler login
npx wrangler d1 execute bizon-db --file=cloudflare/schema.sql --remote
```

The schema command is idempotent and can be run again after schema updates.

## Verification

After deployment:

1. Open `/api/health` and confirm the JSON response contains `"ok": true`.
2. Create a new account through `/signup`.
3. Complete company onboarding.
4. Log out and log in again.
5. Confirm the application opens the Cloudflare-hosted dashboard on the same
   domain and does not navigate to any external legacy host.

For full Worker details, see
[CLOUDFLARE_WORKER_DEPLOYMENT.md](CLOUDFLARE_WORKER_DEPLOYMENT.md).
