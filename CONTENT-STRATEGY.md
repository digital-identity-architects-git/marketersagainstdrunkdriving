# Content Strategy — Service × Industry Architecture

## The blogs-vs-pages rule

One test decides it: **does the searcher want to hire someone, or understand something?**

| Signal | Build a **page** | Build a **blog post** |
|---|---|---|
| Query shape | "{service} for {industry}", "{service} near me" | "how do I…", "what does X cost", "X vs Y" |
| Intent | Commercial / transactional | Informational |
| Lifespan | Permanent, revised in place | Published, refreshed, sometimes retired |
| Lives in | `/services/` or `/industries/` | `/articles/` |
| Job | Convert | Earn trust, then hand off to a page |

Corollary: **anything that names a service and an audience is a page, not a post.** "Content marketing for architects" is a page. "What does an architect cost" is a post that links to it.

## What is built (857 pages)

| Layer | Count | Path |
|---|---|---|
| Service × industry pages | 747 | `/services/{service}-for-{industry}.html` |
| Industry hubs | 88 | `/industries/{industry}.html` |
| Service hubs | 10 | `/services/{service}.html` |
| Category hubs | 10 | `/industries/{category}.html` |
| Directories | 2 | `/services.html`, `/industries.html` |

### Services (10)

Core — generated for every industry: **SEO, Local SEO, Content Marketing, SEO Blogging, Web Design, Google Business Profile.**

Extended — generated only where the vertical warrants it: **Reputation Management, Social Media, Lead Generation, Email Marketing.**

That opt-in is deliberate. Email marketing on a nail salon page would be filler; on a hair restoration clinic with a twelve-month research cycle it is the core of the program.

### Industries (88, in 10 categories)

| Category | Count | Notes |
|---|---|---|
| Law Firms | 19 | Every practice area — PI, criminal, DUI, family, estate, immigration, employment, bankruptcy, business, IP, med-mal, workers comp, real estate, tax, SSDI, elder, mass tort, civil litigation, appellate |
| Home Services & Trades | 19 | Flooring broken into 6 sub-verticals: general, hardwood, epoxy, tile & stone, carpet, commercial |
| Aesthetics & Wellness | 12 | Med spa, injectables, laser, body contouring, weight loss, day spa, hair, nails, lash & brow, tattoo, IV, hair restoration |
| Agriculture & Agribusiness | 10 | Farms, agribusiness, ranches, vineyards, orchards, nurseries, equipment dealers, agronomy, agtech, irrigation |
| B2B / Professional / Automotive / Hospitality | 14 | SaaS, manufacturing, CNC, MSP, CPA, financial, insurance, real estate, property mgmt, staffing, auto repair, restaurants, gyms, venues |
| Healthcare & Dental | 8 | Dental, ortho, chiro, PT, veterinary, mental health, home health, plastic surgery |
| Architecture & Design | 6 | Architects, interior design, landscape architecture, engineering, home builders, design-build |

## Why these are not thin doorway pages

Each industry carries researched fields that drive the copy: buyer, customer, decision cycle, deal value, three specific pains, search behaviour, what constitutes proof, the objection they actually raise, compliance constraints, seasonality, and three vertical-specific FAQs.

Two pages for the same service in different verticals share a skeleton and almost no prose. Measured overlap between `seo-for-flooring-companies` and `seo-for-personal-injury-lawyers` is ~54% shared vocabulary — and most of that is English function words.

**The honest caveat:** these are programmatic pages. They are defensible because the underlying data is real and per-vertical, but they are not a substitute for hand-written flagship pages on your top ten money terms. Treat the matrix as coverage and depth-of-catalogue; hand-write the ten pages you most want to rank.

## Navigation

Recategorized into five nested top-level items:

```
Home
Mission ▾   About · Take the Pledge · Sites to Follow
Learn   ▾   Interactive Guides · Articles · Amplify Tool
Services ▾  10 service hubs + All services →
Industries ▾ 10 category hubs + All industries →
```

Every generated page and every hand-authored page (including `pledge.html`, which is
rewritten in place at build time) carries the identical menu.

## The blog program — pending your keyword sets

The three keyword sets referenced in the brief did not come through, so the blog layer
is specified but not populated. The structure it should follow:

1. **Per-industry informational cluster** — each industry's three FAQs are already the
   seed. Each becomes a post, linking up to its industry hub.
2. **Cost and comparison posts** — the highest-volume informational shape in every
   vertical here ("what does X cost", "X vs Y"). These feed the service pages directly.
3. **Regulatory and seasonal posts** — where a vertical has compliance or a season
   (aesthetics, agriculture, legal deadlines), those are recurring, defensible posts.

Paste the keyword sets and the mapping gets built against real volume and difficulty
rather than assumption.

## Open items

- Keyword sets → blog queue and difficulty-prioritized publishing order
- Hand-written flagship pages for the top ten commercial terms
- Location layer (`{service} for {industry} in {city}`) — deliberately not built, since
  it multiplies page count by market count and should follow proof of the current layer
