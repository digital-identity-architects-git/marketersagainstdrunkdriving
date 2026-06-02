/**
 * Static site generator for Marketers Against Drunk Driving.
 *
 * Produces standalone, self-contained, red/white/blue branded HTML pages:
 *   - site/index.html                  (hub)
 *   - site/guides/<slug>.html          (interactive "course"-style guides)
 *   - site/articles/<slug>.html        (SEO articles)
 *
 * Content is sourced from the compiled backend so there is a single source of
 * truth. Each page is fully self-contained (inline CSS + JS) and hostable as
 * plain static HTML on any host (Siteground, Netlify, GitHub Pages, etc.).
 *
 * Run: node site/build-site.mjs   (after `npm --prefix backend run build`)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const { seoArticles } = await import(join(root, 'backend/dist/content/seoArticles.js'));
const { guides } = await import(join(root, 'backend/dist/content/guides.js'));

const CAMPAIGN = '#marketersagainstdrunkdriving';
const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">';

/* ------------------------------------------------------------------ */
/* Shared brand CSS — Old Glory red, navy blue, white                  */
/* ------------------------------------------------------------------ */
const CSS = `
:root{
  --navy:#0a2a66; --navy-deep:#06184a; --navy-soft:#13316f;
  --red:#c8102e; --red-deep:#a00d26;
  --white:#ffffff; --cream:#f4f7fc; --line:#d8e0f0;
  --ink:#13213f; --ink-soft:#43506e; --ink-mute:#6c7891;
  --display:'Oswald',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --serif:'Newsreader',Georgia,'Times New Roman',serif;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--cream);color:var(--ink);font-family:var(--serif);font-size:18px;line-height:1.7;-webkit-font-smoothing:antialiased}
::selection{background:var(--red);color:#fff}
a{color:var(--navy)}
em{color:var(--red);font-style:italic}

/* brand bar */
.brand-bar{background:var(--navy);position:sticky;top:0;z-index:90;border-bottom:4px solid var(--red)}
.brand-inner{max-width:1100px;margin:0 auto;padding:12px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.brand-mark{display:flex;align-items:center;gap:12px;text-decoration:none}
.shield{width:44px;height:50px;flex-shrink:0;background:var(--white);clip-path:polygon(50% 0,100% 14%,100% 60%,50% 100%,0 60%,0 14%);display:flex;align-items:center;justify-content:center;border:0}
.shield span{font-family:var(--display);font-weight:700;font-size:15px;color:var(--navy);letter-spacing:.02em;margin-top:-4px}
.brand-name{font-family:var(--display);font-weight:700;font-size:20px;color:#fff;letter-spacing:.02em;line-height:1}
.brand-sub{font-family:var(--display);font-weight:400;font-size:9.5px;letter-spacing:.28em;color:#9fb4e0;text-transform:uppercase;margin-top:4px}
.brand-nav{display:flex;gap:6px;flex-wrap:wrap}
.brand-nav a{font-family:var(--display);font-weight:500;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#cdd9f2;text-decoration:none;padding:8px 12px;border-radius:4px;transition:.15s}
.brand-nav a:hover,.brand-nav a.current{background:var(--red);color:#fff}

/* hero */
.hero{background:linear-gradient(135deg,var(--navy) 0%,var(--navy-deep) 100%);color:#fff;padding:64px 28px 52px;border-bottom:6px solid var(--red);position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(255,255,255,.025) 60px,rgba(255,255,255,.025) 61px);pointer-events:none}
.hero-inner{max-width:1100px;margin:0 auto;position:relative}
.eyebrow{display:inline-flex;align-items:center;gap:10px;font-family:var(--display);font-weight:600;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:#fff;background:var(--red);padding:7px 14px;border-radius:3px;margin-bottom:22px}
.hero h1{font-family:var(--display);font-weight:700;font-size:clamp(34px,5vw,56px);line-height:1.05;letter-spacing:-.01em;margin-bottom:16px}
.hero .subtitle{font-size:21px;color:#cdd9f2;max-width:760px;margin-bottom:18px}
.hero-tag{font-size:16px;color:#aebfe2;max-width:740px}
.meta-row{display:flex;flex-wrap:wrap;gap:14px;margin-top:30px}
.meta-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-left:3px solid var(--red);padding:12px 18px;border-radius:5px;min-width:150px}
.meta-card .label{font-family:var(--display);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#8fa5d4;margin-bottom:5px}
.meta-card .value{font-family:var(--display);font-weight:600;font-size:16px;color:#fff}

/* progress rail */
.progress-rail{margin-top:32px;max-width:640px}
.progress-track{height:12px;background:rgba(255,255,255,.14);border-radius:7px;overflow:hidden}
.progress-fill{height:100%;width:0;background:linear-gradient(90deg,#fff,var(--red));transition:width .35s ease}
.progress-meta{display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-family:var(--display);font-size:13px;letter-spacing:.04em;color:#cdd9f2}
.reset-btn{font-family:var(--display);font-size:11px;letter-spacing:.1em;text-transform:uppercase;background:transparent;border:1px solid rgba(255,255,255,.3);color:#cdd9f2;padding:5px 12px;border-radius:4px;cursor:pointer}
.reset-btn:hover{background:var(--red);border-color:var(--red);color:#fff}

/* layout */
.wrap{max-width:880px;margin:0 auto;padding:54px 28px}
.section-title{font-family:var(--display);font-weight:700;font-size:30px;color:var(--navy);margin:8px 0 8px}
.section-lede{color:var(--ink-soft);margin-bottom:30px;max-width:720px}

/* lesson / step cards */
.lesson{background:#fff;border:1px solid var(--line);border-top:4px solid var(--navy);border-radius:10px;padding:30px 32px;margin-bottom:22px;box-shadow:0 2px 10px rgba(10,42,102,.05);scroll-margin-top:90px}
.lesson.done{border-top-color:#2e7d32}
.lesson-head{display:flex;align-items:center;gap:16px;margin-bottom:14px}
.lesson-num{font-family:var(--display);font-weight:700;font-size:18px;width:46px;height:46px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--navy);color:#fff;border-radius:8px}
.lesson.done .lesson-num{background:#2e7d32}
.lesson-head h3{font-family:var(--display);font-weight:600;font-size:23px;color:var(--navy);line-height:1.15}
.lesson-body p{margin-bottom:14px}
.lesson-body ul{margin:0 0 16px 22px}
.lesson-body li{margin-bottom:6px}

/* checklist */
.checklist{display:flex;flex-direction:column;gap:9px;margin-top:18px;padding-top:18px;border-top:1px dashed var(--line)}
.check-item{display:flex;align-items:flex-start;gap:12px;background:var(--cream);border:2px solid var(--line);border-radius:8px;padding:12px 15px;cursor:pointer;font-size:15px;transition:.15s}
.check-item:hover{border-color:var(--navy)}
.check-item.checked{border-color:#2e7d32;background:#f1faf1}
.check-item.checked .ci-text{text-decoration:line-through;color:#2e7d32}
.check-item input{margin-top:3px;width:19px;height:19px;accent-color:var(--red);cursor:pointer;flex-shrink:0}

/* faq */
.faq-wrap{margin-top:46px}
.faq-wrap h2{font-family:var(--display);font-weight:700;font-size:26px;color:var(--navy);margin-bottom:18px}
.faq{background:#fff;border:1px solid var(--line);border-left:4px solid var(--red);border-radius:8px;padding:16px 20px;margin-bottom:12px}
.faq summary{font-family:var(--display);font-weight:600;font-size:17px;color:var(--navy);cursor:pointer}
.faq p{margin-top:12px;color:var(--ink-soft)}

/* article body */
.article-body h2{font-family:var(--display);font-weight:700;font-size:26px;color:var(--navy);margin:34px 0 12px}
.article-body h3{font-family:var(--display);font-weight:600;font-size:19px;color:var(--red);margin:24px 0 10px}
.article-body p{margin-bottom:16px}
.article-body ul{margin:0 0 18px 24px}
.article-body li{margin-bottom:7px}
.article-body table{width:100%;border-collapse:collapse;margin:0 0 22px;font-size:15px}
.article-body th,.article-body td{border:1px solid var(--line);padding:10px 13px;text-align:left}
.article-body th{background:var(--navy);color:#fff;font-family:var(--display);font-weight:500}
.article-body tr:nth-child(even) td{background:var(--cream)}
.article-disclaimer{margin-top:34px;padding:18px;background:var(--cream);border:1px dashed var(--red);border-radius:8px;font-size:14px;color:var(--ink-soft)}
.campaign-tag{color:var(--red);font-weight:700}

/* chips + cards */
.hashtags{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px}
.chip{font-family:var(--display);font-size:13px;letter-spacing:.02em;background:var(--navy);color:#fff;padding:6px 13px;border-radius:16px}
.intent{display:inline-block;font-family:var(--display);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:3px 10px;border-radius:11px}
.intent.informational{background:#e3edff;color:var(--navy)}
.intent.commercial{background:#ffe0e4;color:var(--red)}

/* hub grid */
.hub-section{margin-bottom:54px}
.hub-section > h2{font-family:var(--display);font-weight:700;font-size:28px;color:var(--navy);margin-bottom:6px;border-bottom:3px solid var(--red);padding-bottom:8px;display:inline-block}
.hub-section > p.lede{color:var(--ink-soft);margin:14px 0 24px;max-width:720px}
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
.card{display:block;background:#fff;border:1px solid var(--line);border-top:4px solid var(--navy);border-radius:10px;padding:22px;text-decoration:none;color:inherit;transition:.18s;box-shadow:0 2px 8px rgba(10,42,102,.05)}
.card:hover{transform:translateY(-4px);border-top-color:var(--red);box-shadow:0 8px 22px rgba(10,42,102,.12)}
.card .kicker{font-family:var(--display);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--red);margin-bottom:10px}
.card h3{font-family:var(--display);font-weight:600;font-size:19px;color:var(--navy);line-height:1.2;margin-bottom:10px}
.card p{font-size:14px;color:var(--ink-mute);margin-bottom:14px}
.card .meta{font-family:var(--display);font-size:12px;color:var(--ink-mute);letter-spacing:.03em}

/* cta + footer */
.cta-band{background:linear-gradient(135deg,var(--red) 0%,var(--red-deep) 100%);color:#fff;border-radius:12px;padding:36px;margin-top:48px;text-align:center}
.cta-band h2{font-family:var(--display);font-weight:700;font-size:28px;margin-bottom:10px}
.cta-band p{color:#ffe2e6;max-width:560px;margin:0 auto 18px}
.cta-band .tag{font-family:var(--display);font-weight:600;letter-spacing:.04em}
footer{background:var(--navy-deep);color:#9fb4e0;text-align:center;padding:30px 28px;font-size:13px;font-family:var(--display);letter-spacing:.03em}
footer a{color:#cdd9f2}
.backlink{display:inline-block;font-family:var(--display);font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--red);text-decoration:none;margin-bottom:24px}
.backlink:hover{text-decoration:underline}
@media(max-width:640px){.wrap{padding:36px 18px}.lesson{padding:22px 20px}}
`;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function brandBar(current) {
  const link = (href, label, key) =>
    `<a href="${href}"${current === key ? ' class="current"' : ''}>${label}</a>`;
  return `<div class="brand-bar"><div class="brand-inner">
  <a class="brand-mark" href="../index.html">
    <span class="shield"><span>MADD</span></span>
    <span><span class="brand-name">MADD</span><br><span class="brand-sub">Marketers Against Drunk Driving</span></span>
  </a>
  <nav class="brand-nav">
    ${link('../index.html', 'Home', 'home')}
    ${link('../index.html#guides', 'Guides', 'guides')}
    ${link('../index.html#articles', 'Articles', 'articles')}
  </nav>
</div></div>`;
}

function page({ title, description, schema, body, current }) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${FONTS}
${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
<style>${CSS}</style></head>
<body>
${brandBar(current)}
${body}
<footer>© ${new Date().getFullYear()} Marketers Against Drunk Driving · Using marketing for good · <span style="color:#c8102e;font-weight:600">${CAMPAIGN}</span><br>Educational content only — not legal advice.</footer>
</body></html>`;
}

/* ---------------------------- GUIDE (course) ---------------------------- */
function renderGuide(g) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: g.title,
    description: g.metaDescription,
    inLanguage: 'en',
    provider: { '@type': 'Organization', name: 'Marketers Against Drunk Driving' },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online' },
    about: g.targetKeyword,
  };

  const lessons = g.steps
    .map((s, i) => {
      const checks = (s.checklist || [])
        .map(
          (item, ci) =>
            `<label class="check-item" data-key="${g.slug}-${i}-${ci}"><input type="checkbox"><span class="ci-text">${esc(
              item
            )}</span></label>`
        )
        .join('');
      return `<section class="lesson" id="step-${i}" data-step="${i}">
  <div class="lesson-head"><div class="lesson-num">${i + 1}</div><h3>${esc(s.title.replace(/^\d+\.\s*/, ''))}</h3></div>
  <div class="lesson-body">${s.body}</div>
  ${checks ? `<div class="checklist">${checks}</div>` : ''}
</section>`;
    })
    .join('\n');

  const faqs = g.faqs
    .map((f) => `<details class="faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
    .join('\n');

  const totalChecks = g.steps.reduce((n, s) => n + (s.checklist ? s.checklist.length : 0), 0);
  const chips = g.hashtags.map((h) => `<span class="chip">${esc(h)}</span>`).join('');

  const body = `
<header class="hero"><div class="hero-inner">
  <div class="eyebrow">[ INTERACTIVE GUIDE ]&nbsp; ${g.intent.toUpperCase()}</div>
  <h1>${esc(g.title)}</h1>
  <div class="subtitle">A free, step-by-step course you can work through at your own pace.</div>
  <div class="meta-row">
    <div class="meta-card"><div class="label">Format</div><div class="value">${g.steps.length} Steps</div></div>
    <div class="meta-card"><div class="label">Access</div><div class="value">Free · Self-paced</div></div>
    <div class="meta-card"><div class="label">Checklist</div><div class="value">${totalChecks} Action Items</div></div>
    <div class="meta-card"><div class="label">Target Topic</div><div class="value" style="font-size:13px">${esc(g.targetKeyword)}</div></div>
  </div>
  <div class="progress-rail">
    <div class="progress-track"><div class="progress-fill" id="pfill"></div></div>
    <div class="progress-meta"><span><span id="pcount">0</span> / ${totalChecks} action items complete</span>
      <button class="reset-btn" id="preset">Reset</button></div>
  </div>
</div></header>
<main class="wrap">
  <a class="backlink" href="../index.html#guides">← All guides</a>
  <div class="lesson-body" style="margin-bottom:30px">${g.intro}</div>
  ${lessons}
  <div class="faq-wrap"><h2>Frequently Asked Questions</h2>${faqs}</div>
  <div class="hashtags">${chips}</div>
  <div class="cta-band">
    <h2>The best case is the one that never happens.</h2>
    <p>We're here to help at every step — but the safest road is a planned, sober ride, every single time.</p>
    <span class="tag">${CAMPAIGN}</span>
  </div>
</main>
<script>
(function(){
  var KEY='madd-guide-${g.slug}';
  var saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  var items=[].slice.call(document.querySelectorAll('.check-item'));
  var total=items.length, fill=document.getElementById('pfill'), count=document.getElementById('pcount');
  function refresh(){
    var done=0;
    items.forEach(function(el){
      var k=el.getAttribute('data-key'), on=!!saved[k];
      el.querySelector('input').checked=on;
      el.classList.toggle('checked',on);
      var lesson=el.closest('.lesson');
      if(on)done++;
      if(lesson){var all=[].slice.call(lesson.querySelectorAll('.check-item'));
        lesson.classList.toggle('done',all.length>0&&all.every(function(x){return !!saved[x.getAttribute('data-key')]}));}
    });
    if(count)count.textContent=done;
    if(fill)fill.style.width=(total?Math.round(done/total*100):0)+'%';
  }
  items.forEach(function(el){el.addEventListener('click',function(e){
    if(e.target.tagName!=='INPUT')el.querySelector('input').checked=!el.querySelector('input').checked;
    var k=el.getAttribute('data-key');
    saved[k]=el.querySelector('input').checked;
    localStorage.setItem(KEY,JSON.stringify(saved));refresh();
  });});
  var reset=document.getElementById('preset');
  if(reset)reset.addEventListener('click',function(){saved={};localStorage.removeItem(KEY);refresh();});
  refresh();
})();
</script>`;

  return page({
    title: g.metaTitle,
    description: g.metaDescription,
    schema,
    body,
    current: 'guides',
  });
}

/* ---------------------------- ARTICLE ---------------------------- */
function renderArticle(a) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.metaDescription,
    keywords: a.targetKeyword,
    datePublished: a.datePublished,
    inLanguage: 'en',
    author: { '@type': 'Organization', name: 'Marketers Against Drunk Driving' },
    publisher: { '@type': 'Organization', name: 'Marketers Against Drunk Driving' },
  };
  const chips = a.hashtags.map((h) => `<span class="chip">${esc(h)}</span>`).join('');
  const body = `
<header class="hero"><div class="hero-inner">
  <div class="eyebrow">[ ARTICLE ]&nbsp; ${a.intent.toUpperCase()}</div>
  <h1>${esc(a.title)}</h1>
  <div class="subtitle">${esc(a.metaDescription)}</div>
  <div class="meta-row">
    <div class="meta-card"><div class="label">Target Keyword</div><div class="value" style="font-size:14px">${esc(a.targetKeyword)}</div></div>
    <div class="meta-card"><div class="label">Published</div><div class="value" style="font-size:14px">${esc(a.datePublished)}</div></div>
  </div>
</div></header>
<main class="wrap">
  <a class="backlink" href="../index.html#articles">← All articles</a>
  <div class="article-body">${a.html}</div>
  <div class="hashtags">${chips}</div>
</main>`;
  return page({ title: a.metaTitle, description: a.metaDescription, schema, body, current: 'articles' });
}

/* ---------------------------- HUB ---------------------------- */
function renderHub() {
  const guideCards = guides
    .map(
      (g) => `<a class="card" href="guides/${g.slug}.html">
    <div class="kicker">Interactive Guide</div>
    <h3>${esc(g.title)}</h3>
    <p>${esc(g.metaDescription)}</p>
    <div class="meta">${g.steps.length} steps · <span class="intent ${g.intent.toLowerCase()}">${g.intent}</span></div>
  </a>`
    )
    .join('\n');

  const articleCards = seoArticles
    .map(
      (a) => `<a class="card" href="articles/${a.slug}.html">
    <div class="kicker">${esc(a.targetKeyword)}</div>
    <h3>${esc(a.title)}</h3>
    <p>${esc(a.metaDescription)}</p>
    <div class="meta"><span class="intent ${a.intent.toLowerCase()}">${a.intent}</span></div>
  </a>`
    )
    .join('\n');

  const body = `
<header class="hero"><div class="hero-inner">
  <div class="eyebrow"><span></span>USING MARKETING FOR GOOD</div>
  <h1>Marketers Against <em>Drunk Driving</em></h1>
  <div class="subtitle">Helpful, no-nonsense guides and articles on drunk driving law, your rights, and finding the right help — for everyone, before anyone gets hurt.</div>
  <p class="hero-tag">We meet people where they are. Whether you're trying to understand the law, choose an attorney, or simply get home safe tonight, we're here to help. The safest road is always a planned, sober ride. <span style="color:#fff;font-weight:600">${CAMPAIGN}</span></p>
  <div class="meta-row">
    <div class="meta-card"><div class="label">Guides</div><div class="value">${guides.length} Interactive</div></div>
    <div class="meta-card"><div class="label">Articles</div><div class="value">${seoArticles.length} Published</div></div>
    <div class="meta-card"><div class="label">Mission</div><div class="value">Zero drunk driving</div></div>
  </div>
</div></header>
<main class="wrap" style="max-width:1100px">
  <div class="hub-section" id="guides">
    <h2>Interactive Guides</h2>
    <p class="lede">Work through these like mini-courses. Tick off each action item as you go — your progress saves automatically.</p>
    <div class="card-grid">${guideCards}</div>
  </div>
  <div class="hub-section" id="articles">
    <h2>Articles</h2>
    <p class="lede">Clear, factual answers to the questions people actually search — felony thresholds, state-by-state rules, and more.</p>
    <div class="card-grid">${articleCards}</div>
  </div>
  <div class="cta-band">
    <h2>Care for everyone. Get everyone home.</h2>
    <p>Our brand voice stays helpful as long as people are trying to do right. Plan the ride, hand over the keys, and share the message.</p>
    <span class="tag">${CAMPAIGN}</span>
  </div>
</main>`;

  // Hub lives at site root, so its brand-bar links shouldn't use ../
  return page({
    title: 'Marketers Against Drunk Driving — Guides & Articles',
    description:
      'Helpful guides and articles on drunk driving law, felony DUI, choosing an attorney, and staying safe. Using marketing for good. #marketersagainstdrunkdriving',
    body,
    current: 'home',
  })
    .replace(/href="\.\.\/index\.html/g, 'href="index.html')
    .replace(/href="guides\//g, 'href="guides/')
    .replace(/class="brand-mark" href="index\.html"/, 'class="brand-mark" href="index.html"');
}

/* ---------------------------- WRITE ---------------------------- */
mkdirSync(join(__dirname, 'guides'), { recursive: true });
mkdirSync(join(__dirname, 'articles'), { recursive: true });

for (const g of guides) {
  writeFileSync(join(__dirname, 'guides', `${g.slug}.html`), renderGuide(g));
}
for (const a of seoArticles) {
  writeFileSync(join(__dirname, 'articles', `${a.slug}.html`), renderArticle(a));
}
writeFileSync(join(__dirname, 'index.html'), renderHub());

console.log(
  `✓ Built site: 1 hub + ${guides.length} guides + ${seoArticles.length} articles = ${
    guides.length + seoArticles.length + 1
  } pages`
);
