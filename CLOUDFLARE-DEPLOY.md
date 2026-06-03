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
