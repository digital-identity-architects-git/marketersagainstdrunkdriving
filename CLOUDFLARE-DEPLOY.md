# Deploying to Cloudflare Pages (recommended for scale)

The site is **statically generated** — `node site/build-site.mjs` reads the
content in `backend/dist/content/` and writes plain HTML into `site/`. A clean
clone builds every page with **no `npm install` and no compile step**, so
Cloudflare's build is fast and can't break on dependencies.

## One-time setup (about 5 minutes, all in the Cloudflare dashboard)

1. Go to **https://dash.cloudflare.com** → sign in (create a free account if needed).
2. Left sidebar → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**.
3. Authorize GitHub and pick the repo: **`digital-identity-architects-git/marketersagainstdrunkdriving`**.
4. On the build-settings screen, enter **exactly** these:

   | Field | Value |
   |-------|-------|
   | **Production branch** | `main` |
   | **Framework preset** | `None` |
   | **Build command** | `npm run build:pages` |
   | **Build output directory** | `site` |
   | **Root directory** | *(leave blank / `/`)* |

5. Click **Save and Deploy**.

That's it. Cloudflare clones the repo, runs the generator, and publishes the
`site/` folder to its global CDN. You'll get a live URL like
`https://marketersagainstdrunkdriving.pages.dev` within a minute or two.

## After that — it's automatic

Every time a change lands on `main`, Cloudflare rebuilds and redeploys on its
own. No uploads, no FTP. Add 500 articles and the workflow is identical.

## Live DUI Radar — one extra setting (the "Share to Care" tool)

The home page has a **Live DUI Radar**: pick a state + platform, and it pulls the
latest real drunk-driving news for that state and uses AI to write a factual,
de-identified, ready-to-post message with the right hashtags. This is powered by
a **Cloudflare Pages Function** at `functions/api/radar.js` (served at
`/api/radar`). Cloudflare auto-detects the `functions/` folder — no build config
needed — but the AI step needs one secret:

1. In the Pages project → **Settings** → **Environment variables** → **Add**:

   | Variable | Value |
   |----------|-------|
   | `OPENAI_API_KEY` | your OpenAI API key (`sk-...`) |
   | `OPENAI_MODEL` *(optional)* | e.g. `gpt-4o-mini` (default) or `gpt-4.1-mini` |

2. Add it for **Production** (and Preview if you want previews to work), then
   redeploy (Deployments → ⋯ → Retry deployment).

The key lives only on Cloudflare's servers — it is never sent to the browser.

**News sources are free and need no keys:** the function queries Google News and
GDELT and merges the results, so every state stays covered. Cost is only the
OpenAI call per generated post (fractions of a cent on `gpt-4o-mini`).

**Test after deploy:**

```bash
curl -s https://YOUR-SITE.pages.dev/api/radar \
  -H 'Content-Type: application/json' \
  -d '{"state":"Texas","platform":"x"}'
```

You should get JSON with `post`, `hashtags`, and the `headline` it was based on.

> Prefer to run it through n8n instead? A ready-built workflow
> ("MADD — DUI Radar (Live Webhook)") already exists in your n8n. Once your n8n
> plan is active, publish it and change `RADAR_API` in the home-page script
> (`renderRadarSection` in `site/build-site.mjs`) to its webhook URL.

## Connecting your custom domain

1. In the Pages project → **Custom domains** → **Set up a domain**.
2. Enter your domain (e.g. `marketersagainstdrunkdriving.com`).
3. Cloudflare shows the DNS record to add. If your domain's DNS is already on
   Cloudflare, it adds it for you in one click. If it's still at Siteground,
   either move the domain's nameservers to Cloudflare (recommended) or add the
   provided CNAME at your registrar.

## Notes

- **Node version:** Cloudflare defaults to a modern Node (18+), which is all the
  generator needs. To pin it, add a `NODE_VERSION` environment variable in the
  Pages project settings (e.g. `20`).
- **Build minutes:** The free plan includes 500 builds/month — far more than
  enough.
- **Bandwidth/requests:** Unlimited on the free plan.
- **Scaling past ~20k pages:** Cloudflare Pages allows up to 20,000 files per
  deployment. Well before that becomes a concern, we'd move to on-demand
  rendering — but the content layer in `backend/src/content/` carries straight
  over.
