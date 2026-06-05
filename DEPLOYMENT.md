# Deployment Guide — Dynamic App on SiteGround

This guide covers deploying the **full dynamic platform** (Node.js API +
React dashboard + database). If all you need is the public content site, see
[CLOUDFLARE-DEPLOY.md](./CLOUDFLARE-DEPLOY.md) — it is dramatically simpler
(static HTML, no server, no database, no API keys).

## ⚠️ Read this first — SiteGround specifics

1. **SiteGround does not offer PostgreSQL** — only MySQL/MariaDB. This app
   relies on Postgres-only features (`gen_random_uuid()`, `UUID[]`/`TEXT[]`
   array columns in `backend/src/db/connection.ts`), so it will **not** run on
   MySQL without a rewrite. Use a free managed Postgres instead — **Neon**
   (neon.tech) or **Supabase** — and point `DATABASE_URL` at it. The SiteGround
   Node app connects out to it. No code changes needed.

2. **You do not need to migrate by hand.** The server creates every table on
   startup via `initDatabase()`. `npm run db:migrate` is available to provision
   a fresh database before the first deploy, but a successful server boot also
   creates the schema.

3. **The Node app only serves `/api`** — it does not serve the React app. The
   frontend is a separate static build that calls the API. You connect the two
   either with a same-origin reverse proxy (the shipped `.htaccess`) or by
   pointing the frontend at an API subdomain via `VITE_API_BASE_URL`.

## Architecture

```
Browser → yourdomain.com
            ├── /         → static React build (public_html/)        [Apache]
            └── /api/*    → Node.js app (Passenger)                  [proxied]
                              └── connects out to → Neon/Supabase Postgres
```

## Prerequisites
- SiteGround hosting with Node.js support (Devtools → Node.js)
- A managed Postgres database (Neon/Supabase) — see note above
- Anthropic API key (blog generation) and SERP API key (news)
- Domain pointed at SiteGround

## 1. Provision the database (≈5 min, free)

Create a project on neon.tech (or supabase.com) and copy the connection
string. It looks like:

```
postgresql://user:pass@ep-xxxx.neon.tech/dbname?sslmode=require
```

Keep the `?sslmode=require` suffix — Neon requires SSL, and `pg` reads the SSL
mode from the URL.

## 2. Build locally

```bash
npm run install-all
npm run build          # builds frontend → frontend/dist, backend → backend/dist
```

Optionally provision the schema up front:

```bash
cd backend
DATABASE_URL="postgresql://...?sslmode=require" npm run db:migrate
```

## 3. Deploy the backend (Node app)

1. **Devtools → Node.js → Create Application**
   - Node version: **18+**
   - Application root: e.g. `madd-server`
   - Application startup file: `dist/index.js`
2. Upload to the app root (SFTP or Git):
   - `backend/dist/`
   - `backend/package.json`
   - `backend/package-lock.json`
3. SSH in and install production deps:
   ```bash
   cd ~/madd-server
   npm install --production
   ```
4. Set **environment variables** in the Node.js panel:
   ```
   DATABASE_URL=postgresql://...neon.tech/...?sslmode=require
   ANTHROPIC_API_KEY=your_key
   SERP_API_KEY=your_key
   NODE_ENV=production
   PORT=3000            # or whatever SiteGround assigns
   ```
5. **Restart Application.** On first boot the tables are created automatically.
   Verify: `curl http://127.0.0.1:<port>/api/health` from SSH.

## 4. Deploy the frontend (static build)

1. Upload the contents of `frontend/dist/` into `public_html/`.
2. Confirm `public_html/.htaccess` exists — Vite copies it from
   `frontend/public/.htaccess` into the build. It reverse-proxies `/api` to the
   Node app and adds the SPA fallback. **Edit the port** in the proxy rule to
   match the port SiteGround assigned your Node app.

### If the `[P]` proxy flag is not allowed on your plan

Some SiteGround plans don't permit `mod_proxy`. In that case:

1. Create a subdomain (e.g. `api.yourdomain.com`) and map it to the Node app.
2. Remove the `RewriteRule ^api/...` line from `.htaccess`.
3. Rebuild the frontend with the API base set:
   ```bash
   cd frontend
   echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env.production
   npm run build
   ```
   CORS is already enabled on the backend, so the cross-origin calls work.

## 5. SSL

Enable free Let's Encrypt SSL in Site Tools → Security → SSL Manager, then
force HTTPS.

## 6. Scheduled news scans (optional)

The app runs a daily social-post scheduler in-process. To also run the 50-state
news scanner on a schedule, add a SiteGround cron job:

```bash
# 6 AM daily — adjust path to your Node app root
0 6 * * * cd ~/madd-server && node dist/listeners/orchestrator.js
```

## Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| App won't start | Check `DATABASE_URL` (with `?sslmode=require`) and Node version in the Node.js panel logs |
| `/api` 404s in the browser | `.htaccess` proxy port doesn't match the Node app port, or `[P]` not allowed — use the subdomain approach |
| DB connection errors | Verify the Neon/Supabase string and that the suffix `?sslmode=require` is present |
| Dashboard loads but no data | The DB is empty until the listeners run — trigger `node dist/listeners/orchestrator.js` |

## Alternative hosts (simpler than SiteGround)

Because SiteGround forces an external Postgres and Passenger proxying, hosts
like **Render** or **Railway** are usually easier for this stack — they provide
Node + Postgres together with git-push deploys, skipping the external-DB and
`.htaccess` steps entirely.
