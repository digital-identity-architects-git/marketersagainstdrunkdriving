/**
 * Renders the service x industry matrix: individual service pages, industry
 * hubs, service hubs, category hubs and the top-level directory.
 *
 * Every page is assembled from real per-industry research (buyer, cycle,
 * objection, proof, FAQs), so two pages for the same service in different
 * verticals share a skeleton and almost no prose.
 */

import { SERVICES, SERVICE_BY_SLUG, CATEGORIES, CORE_SERVICES } from './services-data.mjs';
import { LEGAL } from './industries-legal.mjs';
import { AESTHETICS } from './industries-aesthetics.mjs';
import { DESIGN } from './industries-design.mjs';
import { TRADES } from './industries-trades.mjs';
import { AGRICULTURE } from './industries-agriculture.mjs';
import { HEALTHCARE } from './industries-healthcare.mjs';
import { BUSINESS } from './industries-business.mjs';

export const INDUSTRIES = [
  ...LEGAL, ...AESTHETICS, ...DESIGN, ...TRADES,
  ...AGRICULTURE, ...HEALTHCARE, ...BUSINESS,
];

export { SERVICES, CATEGORIES };

/** Services an industry carries: the core set plus whatever it opts into. */
export function servicesFor(industry) {
  const extra = industry.services || [];
  return [...CORE_SERVICES, ...extra]
    .filter((s, i, a) => a.indexOf(s) === i)
    .map((s) => SERVICE_BY_SLUG[s])
    .filter(Boolean);
}

export function industriesIn(categorySlug) {
  return INDUSTRIES.filter((i) => i.category === categorySlug);
}

export function industriesWith(serviceSlug) {
  return INDUSTRIES.filter((i) => servicesFor(i).some((s) => s.slug === serviceSlug));
}

export const servicePath = (s, i) => `services/${s.slug}-for-${i.slug}.html`;
export const industryPath = (i) => `industries/${i.slug}.html`;
export const serviceHubPath = (s) => `services/${s.slug}.html`;
export const categoryPath = (c) => `industries/${c.slug}.html`;

/* --------------------------------- utils -------------------------------- */

const e = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Stable pseudo-random pick so wording varies across the matrix but never
 *  changes between builds. */
function pick(list, ...seedParts) {
  const seed = seedParts.join('|');
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

/* ------------------------------ nav taxonomy ---------------------------- */

/**
 * The nested menu. Top-level items either link somewhere or open a panel of
 * grouped children.
 */
export function navTree() {
  return [
    { label: 'Home', href: 'index.html', key: 'home' },
    {
      label: 'Mission', key: 'mission',
      groups: [{ title: 'The Campaign', items: [
        { label: 'About', href: 'about.html' },
        { label: 'Take the Pledge', href: 'pledge.html' },
        { label: 'Sites to Follow', href: 'best-drunk-driving-sites-to-follow.html' },
      ]}],
    },
    {
      label: 'Learn', key: 'learn',
      groups: [{ title: 'Free Resources', items: [
        { label: 'Interactive Guides', href: 'index.html#guides' },
        { label: 'Articles', href: 'index.html#articles' },
        { label: 'Amplify Tool', href: 'amplify.html' },
      ]}],
    },
    {
      label: 'Services', key: 'services', href: 'services.html',
      groups: [
        { title: 'What We Do', items: SERVICES.map((s) => ({ label: s.name, href: serviceHubPath(s) })) },
        { title: 'Browse', items: [{ label: 'All services →', href: 'services.html' }] },
      ],
    },
    {
      label: 'Industries', key: 'industries', href: 'industries.html',
      groups: [
        { title: 'Verticals', items: CATEGORIES.map((c) => ({ label: c.name, href: categoryPath(c) })) },
        { title: 'Browse', items: [{ label: 'All industries →', href: 'industries.html' }] },
      ],
    },
  ];
}

export function renderNav(current, prefix = '') {
  const item = (n) => {
    if (!n.groups) {
      return `<div class="nav-item"><a href="${prefix}${n.href}"${current === n.key ? ' class="current"' : ''}>${e(n.label)}</a></div>`;
    }
    const panel = n.groups
      .map(
        (g) => `<div class="nav-col"><div class="nav-col-t">${e(g.title)}</div>${g.items
          .map((it) => `<a href="${prefix}${it.href}">${e(it.label)}</a>`)
          .join('')}</div>`
      )
      .join('');
    const top = n.href ? `${prefix}${n.href}` : '#';
    return `<div class="nav-item has-panel">
  <a href="${top}"${current === n.key ? ' class="current"' : ''} aria-haspopup="true">${e(n.label)}<span class="caret">▾</span></a>
  <div class="nav-panel"><div class="nav-panel-in">${panel}</div></div>
</div>`;
  };
  return `<nav class="brand-nav">${navTree().map(item).join('')}</nav>`;
}

/* ---------------------------------- CSS --------------------------------- */

export const SERVICES_CSS = `
.brand-nav{position:relative}
.nav-item{position:relative}
.nav-item > a{display:inline-flex;align-items:center;gap:5px}
.caret{font-size:9px;opacity:.6}
.nav-panel{position:absolute;top:100%;left:0;max-width:min(92vw,640px);z-index:60;min-width:250px;padding-top:8px;opacity:0;visibility:hidden;transform:translateY(-6px);transition:.16s}
.nav-item:nth-last-child(-n+2) .nav-panel{left:auto;right:0}
.nav-item.has-panel:hover .nav-panel,.nav-item.has-panel:focus-within .nav-panel{opacity:1;visibility:visible;transform:none}
.nav-panel-in{display:flex;gap:22px;background:var(--slab-2);border:1px solid var(--line-blood);border-radius:8px;padding:16px 18px;box-shadow:0 22px 50px rgba(0,0,0,.75)}
.nav-col{min-width:180px}
.nav-col-t{font-family:var(--display);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--ember);margin-bottom:9px}
.nav-panel a{display:block;font-family:var(--body);font-size:13.5px;letter-spacing:0;text-transform:none;color:var(--ash);padding:6px 8px;border-radius:3px}
.nav-panel a:hover{background:var(--blood);color:#fff;box-shadow:none}
.grid-3{display:grid;grid-template-columns:repeat(auto-fill,minmax(258px,1fr));gap:16px}
.mini{display:block;background:var(--slab);border:1px solid var(--line);border-left:3px solid var(--blood);border-radius:5px;padding:13px 15px;text-decoration:none;color:var(--bone);font-size:14.5px;transition:.15s}
.mini:hover{background:var(--slab-2);border-left-color:var(--ember);text-decoration:none;transform:translateX(2px)}
.mini span{display:block;color:var(--ash);font-size:12.5px;margin-top:3px}
.svc-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin:26px 0}
.svc-fact{background:var(--slab);border:1px solid var(--line);border-top:2px solid var(--blood);border-radius:6px;padding:15px 17px}
.svc-fact .t{font-family:var(--display);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ember);margin-bottom:7px}
.svc-fact .v{color:var(--bone);font-size:14.5px;line-height:1.55}
.deliver{list-style:none;padding:0;margin:18px 0}
.deliver li{position:relative;padding:11px 0 11px 30px;border-bottom:1px solid var(--line);color:var(--ash)}
.deliver li:before{content:"◆";position:absolute;left:6px;top:11px;color:var(--blood);font-size:11px}
.pain{background:var(--slab);border:1px solid var(--line);border-left:3px solid var(--ember);border-radius:6px;padding:16px 19px;margin-bottom:11px;color:var(--ash)}
.note{background:var(--slab-2);border:1px solid var(--line-blood);border-radius:6px;padding:17px 20px;margin:22px 0;color:var(--ash);font-size:14.5px}
.note b{color:var(--bone)}
.crumb{font-family:var(--display);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ash);margin-bottom:16px}
.crumb a{color:var(--ember);text-decoration:none}
@media(max-width:900px){
  .nav-panel{position:static;opacity:1;visibility:visible;transform:none;padding-top:0;display:none}
  .nav-item.has-panel:hover .nav-panel{display:block}
  .nav-panel-in{flex-direction:column;gap:12px;box-shadow:none}
}`;

/* ------------------------------ page bodies ----------------------------- */

function factGrid(i) {
  const facts = [
    ['Who buys', i.buyer],
    ['Decision cycle', i.cycle],
    ['Deal value', i.ticket],
    ['What proves you', i.proof],
  ];
  if (i.seasonality) facts.push(['Seasonality', i.seasonality]);
  if (i.compliance) facts.push(['Compliance', i.compliance]);
  return `<div class="svc-facts">${facts
    .map(([t, v]) => `<div class="svc-fact"><div class="t">${e(t)}</div><div class="v">${e(v)}</div></div>`)
    .join('')}</div>`;
}

function faqBlock(i) {
  return `<div class="faq-wrap"><h2>Questions ${e(i.plural)} ask us</h2>
${i.faqs.map((f) => `<details class="faq"><summary>${e(f.q)}</summary><p>${e(f.a)}</p></details>`).join('\n')}
</div>`;
}

/** Lowercase a service name without wrecking acronyms: "Local SEO" -> "local SEO". */
const lc = (name) =>
  name.split(' ').map((w) => (w === w.toUpperCase() && w.length > 1 ? w : w.toLowerCase())).join(' ');

const lcFirst = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const ucFirst = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/* The subtitle already carries the promise, so openers never repeat it. */
const OPENERS = [
  (s, i) => `${s.name} for ${lc(i.plural)} is a different job than ${lc(s.name)} for anyone else, because ${i.customer} do not behave like a general audience.`,
  (s, i) => `Most ${lc(s.name)} programs sold to ${lc(i.plural)} are a template with someone else's logo swapped out. This one starts from how ${i.customer} actually decide.`,
  (s, i) => `We scope ${lc(s.name)} around the constraint that defines your vertical — ${lcFirst(i.cycle)}`,
  (s, i) => `Built for ${i.buyer}. ${s.name} for ${lc(i.plural)} looks nothing like the generalist version, and it should not.`,
];

/** A single service × industry page. */
export function renderServicePage(service, industry, ctx) {
  const { page, prefix = '../' } = ctx;
  const title = service.label(industry);
  const others = servicesFor(industry).filter((s) => s.slug !== service.slug);
  const cat = CATEGORIES.find((c) => c.slug === industry.category);
  const opener = pick(OPENERS, service.slug, industry.slug)(service, industry);

  const description =
    `${title} built around how ${industry.customer} actually search and decide. ` +
    `${service.promise(industry)}`.slice(0, 130);

  const body = `
<header class="hero"><div class="hero-inner">
  <div class="eyebrow"><span class="pulse"></span>${e(service.name)} · ${e(cat ? cat.name : 'Industry')}</div>
  <h1>${e(service.name)} for <em>${e(industry.plural)}</em></h1>
  <div class="subtitle">${e(service.promise(industry))}</div>
  <p class="hero-tag">${e(opener)}</p>
  <div style="margin-top:28px"><a class="btn-hero" href="${prefix}about.html">Start a conversation →</a></div>
</div></header>
<main class="wrap" style="max-width:1040px">
  <div class="crumb"><a href="${prefix}services.html">Services</a> › <a href="${prefix}${serviceHubPath(service)}">${e(service.name)}</a> › ${e(industry.plural)}</div>

  <div class="hub-section">
    <h2>What actually gets in the way</h2>
    <p class="lede">Before the tactics, the constraints. These are the three that shape every ${e(lc(service.name))} decision for ${e(lc(industry.plural))}.</p>
    ${industry.pains.map((p) => `<div class="pain">${e(p)}</div>`).join('\n')}
    <div class="note"><b>The objection we hear most:</b> ${e(industry.objection)} It is a fair objection, and the program is built to answer it rather than talk around it.</div>
  </div>

  <div class="hub-section">
    <h2>How ${e(industry.customer)} search</h2>
    <p class="lede">${e(industry.searchBehavior)}</p>
    ${factGrid(industry)}
  </div>

  <div class="hub-section">
    <h2>What ${e(service.name)} includes</h2>
    <p class="lede">Scoped for ${e(lc(industry.plural))}, not lifted from a generic retainer.</p>
    <ul class="deliver">${service.deliverables.map((d) => `<li>${e(d)}</li>`).join('')}</ul>
    ${industry.compliance ? `<div class="note"><b>Compliance:</b> ${e(industry.compliance)}</div>` : ''}
  </div>

  ${faqBlock(industry)}

  <div class="hub-section" style="margin-top:52px">
    <h2>Other services for ${e(lc(industry.plural))}</h2>
    <div class="grid-3">${others
      .map((s) => `<a class="mini" href="${prefix}${servicePath(s, industry)}">${e(s.label(industry))}</a>`)
      .join('')}</div>
    <p class="lede" style="margin-top:20px"><a href="${prefix}${industryPath(industry)}" style="color:var(--ember)">See everything we do for ${e(lc(industry.plural))} →</a></p>
  </div>
</main>`;

  return page({
    title: `${title} | Marketers Against Drunk Driving`,
    description,
    current: 'services',
    prefix,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: title,
      serviceType: service.name,
      description,
      audience: { '@type': 'Audience', audienceType: industry.plural },
    },
    body,
  });
}

/** One industry, all of its services. */
export function renderIndustryHub(industry, ctx) {
  const { page, prefix = '../' } = ctx;
  const svcs = servicesFor(industry);
  const cat = CATEGORIES.find((c) => c.slug === industry.category);
  const siblings = industriesIn(industry.category).filter((i) => i.slug !== industry.slug);
  const description = `Marketing services for ${lc(industry.plural)} — ${svcs.length} programs built around ${industry.customer}.`;

  const body = `
<header class="hero"><div class="hero-inner">
  <div class="eyebrow"><span class="pulse"></span>${e(cat ? cat.name : 'Industry')}</div>
  <h1>Marketing for <em>${e(industry.plural)}</em></h1>
  <div class="subtitle">${e(industry.job.charAt(0).toUpperCase() + industry.job.slice(1))}.</div>
  <p class="hero-tag">${e(industry.searchBehavior)}</p>
</div></header>
<main class="wrap" style="max-width:1040px">
  <div class="crumb"><a href="${prefix}industries.html">Industries</a> › <a href="${prefix}${categoryPath(cat)}">${e(cat ? cat.name : '')}</a> › ${e(industry.plural)}</div>

  <div class="hub-section">
    <h2>The shape of the problem</h2>
    ${industry.pains.map((p) => `<div class="pain">${e(p)}</div>`).join('\n')}
    ${factGrid(industry)}
  </div>

  <div class="hub-section">
    <h2>Services for ${e(lc(industry.plural))}</h2>
    <p class="lede">Each of these is scoped specifically for this vertical.</p>
    <div class="grid-3">${svcs
      .map((s) => `<a class="mini" href="${prefix}${servicePath(s, industry)}">${e(s.label(industry))}<span>${e(s.promise(industry))}</span></a>`)
      .join('')}</div>
  </div>

  ${faqBlock(industry)}

  ${siblings.length ? `<div class="hub-section" style="margin-top:52px">
    <h2>Related verticals</h2>
    <div class="grid-3">${siblings.map((i) => `<a class="mini" href="${prefix}${industryPath(i)}">${e(i.plural)}</a>`).join('')}</div>
  </div>` : ''}
</main>`;

  return page({
    title: `Marketing for ${industry.plural} | Marketers Against Drunk Driving`,
    description, current: 'industries', prefix,
    schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `Marketing for ${industry.plural}`, description },
    body,
  });
}

/** One service, every industry that carries it. */
export function renderServiceHub(service, ctx) {
  const { page, prefix = '../' } = ctx;
  const inds = industriesWith(service.slug);
  const byCat = CATEGORIES.map((c) => ({ cat: c, list: inds.filter((i) => i.category === c.slug) })).filter((g) => g.list.length);
  const description = `${service.name} programs built per vertical — ${inds.length} industries, each scoped to how its buyers actually search.`;

  const body = `
<header class="hero"><div class="hero-inner">
  <div class="eyebrow"><span class="pulse"></span>Service</div>
  <h1>${e(service.name)}</h1>
  <div class="subtitle">Built per industry. ${inds.length} verticals and counting.</div>
  <p class="hero-tag">A ${e(lc(service.name))} program only works when it is scoped to how a specific kind of buyer searches and decides. Pick your vertical below.</p>
</div></header>
<main class="wrap" style="max-width:1040px">
  <div class="crumb"><a href="${prefix}services.html">Services</a> › ${e(service.name)}</div>
  <div class="hub-section">
    <h2>What every engagement includes</h2>
    <ul class="deliver">${service.deliverables.map((d) => `<li>${e(d)}</li>`).join('')}</ul>
  </div>
  ${byCat
    .map(
      (g) => `<div class="hub-section">
    <h2>${e(g.cat.name)}</h2>
    <p class="lede">${e(g.cat.blurb)}</p>
    <div class="grid-3">${g.list.map((i) => `<a class="mini" href="${prefix}${servicePath(service, i)}">${e(service.label(i))}</a>`).join('')}</div>
  </div>`
    )
    .join('\n')}
</main>`;

  return page({
    title: `${service.name} Services by Industry | Marketers Against Drunk Driving`,
    description, current: 'services', prefix,
    schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: service.name, description },
    body,
  });
}

/** One category, every industry inside it. */
export function renderCategoryHub(cat, ctx) {
  const { page, prefix = '../' } = ctx;
  const inds = industriesIn(cat.slug);
  const description = `${cat.name} marketing — ${inds.length} verticals, each with its own service set. ${cat.blurb}`;
  const body = `
<header class="hero"><div class="hero-inner">
  <div class="eyebrow"><span class="pulse"></span>Industry Group</div>
  <h1>${e(cat.name)}</h1>
  <div class="subtitle">${e(cat.blurb)}</div>
</div></header>
<main class="wrap" style="max-width:1040px">
  <div class="crumb"><a href="${prefix}industries.html">Industries</a> › ${e(cat.name)}</div>
  <div class="hub-section">
    <h2>${inds.length} verticals</h2>
    <div class="grid-3">${inds
      .map((i) => `<a class="mini" href="${prefix}${industryPath(i)}">${e(i.plural)}<span>${e(i.job)}</span></a>`)
      .join('')}</div>
  </div>
</main>`;
  return page({
    title: `${cat.name} Marketing | Marketers Against Drunk Driving`,
    description, current: 'industries', prefix,
    schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: cat.name, description },
    body,
  });
}

/** Top-level directories. */
export function renderServicesIndex(ctx) {
  const { page, prefix = '' } = ctx;
  const body = `
<header class="hero"><div class="hero-inner">
  <div class="eyebrow"><span class="pulse"></span>Directory</div>
  <h1>Services</h1>
  <div class="subtitle">${SERVICES.length} services, scoped per vertical.</div>
</div></header>
<main class="wrap" style="max-width:1040px">
  <div class="hub-section">
    <h2>Every service</h2>
    <div class="grid-3">${SERVICES.map(
      (s) => `<a class="mini" href="${prefix}${serviceHubPath(s)}">${e(s.name)}<span>${industriesWith(s.slug).length} industries</span></a>`
    ).join('')}</div>
  </div>
  <div class="hub-section">
    <h2>Or start from your industry</h2>
    <div class="grid-3">${CATEGORIES.map(
      (c) => `<a class="mini" href="${prefix}${categoryPath(c)}">${e(c.name)}<span>${industriesIn(c.slug).length} verticals</span></a>`
    ).join('')}</div>
  </div>
</main>`;
  return page({
    title: 'Services | Marketers Against Drunk Driving',
    description: `${SERVICES.length} marketing services across ${INDUSTRIES.length} industries.`,
    current: 'services', prefix,
    body,
  });
}

export function renderIndustriesIndex(ctx) {
  const { page, prefix = '' } = ctx;
  const body = `
<header class="hero"><div class="hero-inner">
  <div class="eyebrow"><span class="pulse"></span>Directory</div>
  <h1>Industries</h1>
  <div class="subtitle">${INDUSTRIES.length} verticals across ${CATEGORIES.length} groups.</div>
</div></header>
<main class="wrap" style="max-width:1040px">
${CATEGORIES.map(
  (c) => `  <div class="hub-section">
    <h2>${e(c.name)}</h2>
    <p class="lede">${e(c.blurb)}</p>
    <div class="grid-3">${industriesIn(c.slug)
      .map((i) => `<a class="mini" href="${prefix}${industryPath(i)}">${e(i.plural)}<span>${servicesFor(i).length} services</span></a>`)
      .join('')}</div>
  </div>`
).join('\n')}
</main>`;
  return page({
    title: 'Industries We Serve | Marketers Against Drunk Driving',
    description: `Marketing built per vertical across ${INDUSTRIES.length} industries.`,
    current: 'industries', prefix,
    body,
  });
}
