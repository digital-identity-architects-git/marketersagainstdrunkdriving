# Deploying the dynamic app to Render

Render hosts the **Node API + managed PostgreSQL + static dashboard** together,
with git-push deploys. This is the simplest way to run the full dynamic
platform. (For just the public content site, use Cloudflare Pages — see
[CLOUDFLARE-DEPLOY.md](./CLOUDFLARE-DEPLOY.md).)

## Option A — One-click Blueprint (recommended)

This repo includes [`render.yaml`](./render.yaml), which defines all three
services.

1. Push the repo to GitHub.
2. In Render: **New → Blueprint** → select this repo → **Apply**.
3. When prompted, paste your secret keys (they're marked `sync: false`):
   - `ANTHROPIC_API_KEY` (blog generation)
   - `SERP_API_KEY` (news)
4. Render creates the database, builds the API, and builds the dashboard.
   Tables auto-create on the API's first boot.

You'll get:
- API at `https://madd-api.onrender.com`
- Dashboard at `https://madd-web.onrender.com`

If Render appends a suffix to the API name (because `madd-api` was taken),
update `VITE_API_BASE_URL` in `render.yaml` to match the real API URL and
redeploy.

## Option B — Manual (dashboard)

1. **New → PostgreSQL** → free plan → create. Copy the *Internal Database URL*.
2. **New → Web Service** → this repo:
   - Root directory: `backend`
   - Build: `npm install --include=dev && npm run build`
   - Start: `npm start`
   - Health check path: `/api/health`
   - Env vars: `DATABASE_URL` (internal URL), `ANTHROPIC_API_KEY`,
     `SERP_API_KEY`, `NODE_ENV=production`
3. **New → Static Site** → this repo:
   - Root directory: `frontend`
   - Build: `npm install --include=dev && npm run build`
   - Publish directory: `dist`
   - Env var: `VITE_API_BASE_URL=https://<your-api>.onrender.com`
   - Add a rewrite rule: `/*` → `/index.html` (SPA fallback)

## Scheduled news scans (optional)

Render **Cron Jobs** can run the 50-state scanner on a schedule:
- New → Cron Job → same repo, root `backend`
- Build: `npm install --include=dev && npm run build`
- Command: `node dist/listeners/orchestrator.js`
- Schedule: `0 6 * * *` (6 AM daily)
- Add the same env vars (`DATABASE_URL`, `ANTHROPIC_API_KEY`, `SERP_API_KEY`)

## Free-tier caveats

- Free web services **spin down after ~15 min idle** → first request after
  idle has a ~50s cold start.
- Free PostgreSQL databases **expire after ~30 days**. Use a paid instance
  ($7/mo tier) for anything you intend to keep.
- For production, bump the API and DB to paid plans so they stay warm and
  persistent.

## Custom domain

Render → the **madd-web** static site → **Settings → Custom Domains** → add
`marketersagainstdrunkdriving.com` and follow the DNS instructions.
