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
/* hero button + pulse */
.btn-hero{display:inline-block;font-family:var(--display);font-weight:600;font-size:14px;letter-spacing:.06em;text-transform:uppercase;background:var(--red);color:#fff;text-decoration:none;padding:13px 24px;border-radius:6px;transition:.18s}
.btn-hero:hover{background:#fff;color:var(--navy)}
.pulse{width:9px;height:9px;border-radius:50%;background:#fff;box-shadow:0 0 0 0 rgba(255,255,255,.7);animation:pulse 2s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(255,255,255,.6)}70%{box-shadow:0 0 0 9px rgba(255,255,255,0)}100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}}

/* about story */
.story{max-width:720px}
.story .lead-para{font-size:22px;line-height:1.6;color:var(--navy);font-weight:500;margin-bottom:30px}
.story h2{font-family:var(--display);font-weight:700;font-size:25px;color:var(--navy);margin:34px 0 12px;padding-left:14px;border-left:4px solid var(--red)}
.story p{margin-bottom:16px;color:var(--ink-soft)}
.signoff{margin-top:40px;padding-top:22px;border-top:2px solid var(--line)}
.signoff p{font-family:var(--display);font-weight:600;font-size:20px;color:var(--navy);margin:0}
.signoff .signoff-role{font-family:var(--display);font-weight:400;font-size:13px;letter-spacing:.04em;color:var(--ink-mute);text-transform:uppercase;margin-top:4px}

/* follow / 20 sites */
.site-list{display:flex;flex-direction:column;gap:14px;margin-bottom:20px}
.site-row{display:flex;gap:18px;background:#fff;border:1px solid var(--line);border-left:4px solid var(--navy);border-radius:10px;padding:20px 22px;transition:.16s}
.site-row:hover{border-left-color:var(--red);box-shadow:0 6px 18px rgba(10,42,102,.1)}
.site-rank{font-family:var(--display);font-weight:700;font-size:26px;color:var(--red);min-width:44px;line-height:1.1}
.site-main{flex:1}
.site-name{font-family:var(--display);font-weight:600;font-size:20px;color:var(--navy);text-decoration:none}
.site-name:hover{color:var(--red)}
.site-desc{margin:6px 0 10px;color:var(--ink-soft);font-size:16px}
.site-tag{display:inline-block;font-family:var(--display);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;background:#e3edff;color:var(--navy);padding:3px 11px;border-radius:11px}

/* share box (sharable snippets, no duplicate content) */
.share-box{margin-top:46px;background:linear-gradient(135deg,#0a2a66 0%,#06184a 100%);border-radius:14px;padding:30px;color:#fff;border-top:6px solid var(--red)}
.share-box-head h3{font-family:var(--display);font-weight:700;font-size:24px;color:#fff;margin-bottom:8px}
.share-box-head p{font-size:14px;color:#aebfe2;max-width:620px;margin-bottom:22px}
.snippet-list{display:flex;flex-direction:column;gap:14px}
.snippet{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:18px}
.snippet-text{font-size:15px;line-height:1.55;color:#eef3ff;margin-bottom:14px}
.snippet-actions{display:flex;flex-wrap:wrap;gap:8px}
.snip-btn{font-family:var(--display);font-weight:600;font-size:12px;letter-spacing:.04em;text-transform:uppercase;text-decoration:none;border:none;cursor:pointer;padding:9px 15px;border-radius:6px;transition:.15s;display:inline-flex;align-items:center;gap:6px}
.snip-btn.copy{background:#fff;color:var(--navy)}
.snip-btn.copy:hover{background:var(--red);color:#fff}
.snip-btn.x{background:#000;color:#fff}
.snip-btn.fb{background:#1877f2;color:#fff}
.snip-btn.li{background:#0a66c2;color:#fff}
.snip-btn.x:hover,.snip-btn.fb:hover,.snip-btn.li:hover{opacity:.85}

/* ===== web design services ===== */
.svc-lede{max-width:760px;color:var(--ink-soft);font-size:19px;margin-bottom:8px}
.price-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(265px,1fr));gap:22px;margin:26px 0 8px}
.price-card{position:relative;background:#fff;border:1px solid var(--line);border-top:5px solid var(--navy);border-radius:14px;padding:32px 28px 28px;box-shadow:0 2px 12px rgba(10,42,102,.06);display:flex;flex-direction:column;transition:.18s}
.price-card:hover{transform:translateY(-5px);box-shadow:0 14px 32px rgba(10,42,102,.14)}
.price-card.featured{border-top-color:var(--red);box-shadow:0 10px 30px rgba(200,16,46,.16)}
.price-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);font-family:var(--display);font-weight:600;font-size:11px;letter-spacing:.12em;text-transform:uppercase;background:var(--red);color:#fff;padding:5px 15px;border-radius:20px;white-space:nowrap}
.price-tier{font-family:var(--display);font-weight:600;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--red)}
.price-pages{font-family:var(--display);font-weight:700;font-size:21px;color:var(--navy);margin-top:6px}
.price-amount{font-family:var(--display);font-weight:700;font-size:46px;color:var(--navy);line-height:1;margin:16px 0 2px}
.price-amount span{font-size:22px;color:var(--ink-mute);vertical-align:super;margin-right:1px}
.price-note{font-size:14px;color:var(--ink-mute);margin-bottom:20px}
.price-feat{list-style:none;margin:0 0 26px;padding:0;display:flex;flex-direction:column;gap:11px}
.price-feat li{position:relative;padding-left:28px;font-size:15px;color:var(--ink-soft);line-height:1.4}
.price-feat li::before{content:"✓";position:absolute;left:0;top:1px;width:19px;height:19px;background:#e9f4ea;color:#2e7d32;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
.price-card .btn-hero{margin-top:auto;text-align:center;display:block}
.price-card.featured .btn-hero{background:var(--navy)}
.price-card.featured .btn-hero:hover{background:var(--red);color:#fff}

/* showcase gallery of pretty sites */
.showcase-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;margin-top:8px}
.showcase{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:0 3px 14px rgba(10,42,102,.07);transition:.2s}
.showcase:hover{transform:translateY(-6px);box-shadow:0 16px 38px rgba(10,42,102,.17)}
.bbar{display:flex;align-items:center;gap:6px;padding:9px 12px;background:#dde4f1;border-bottom:1px solid #cdd6e8}
.bdot{width:10px;height:10px;border-radius:50%}
.burl{font-family:var(--display);font-size:10.5px;color:#7a87a3;background:#fff;border-radius:5px;padding:3px 10px;flex:1;letter-spacing:.02em;margin-left:8px}
.bview{height:215px;position:relative;overflow:hidden}
.showcase-cap{padding:16px 18px}
.showcase-cap .tag{font-family:var(--display);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--red)}
.showcase-cap h3{font-family:var(--display);font-weight:600;font-size:18px;color:var(--navy);margin:4px 0 4px}
.showcase-cap p{font-size:13.5px;color:var(--ink-mute);line-height:1.5}
.mock{position:absolute;inset:0;font-family:var(--display);overflow:hidden}
.mock-nav{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;font-size:8px;font-weight:600;letter-spacing:.12em;text-transform:uppercase}
.mock-links{display:flex;gap:11px;opacity:.85;font-weight:500}
.mock-btn{display:inline-block;font-size:7.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:6px 13px;border-radius:20px;margin-top:10px}
.svc-incl{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:10px}
.svc-incl-item{background:#fff;border:1px solid var(--line);border-left:4px solid var(--navy);border-radius:9px;padding:18px 20px}
.svc-incl-item h4{font-family:var(--display);font-weight:600;font-size:16px;color:var(--navy);margin-bottom:6px}
.svc-incl-item p{font-size:14px;color:var(--ink-soft)}
.svc-step{display:flex;gap:16px;align-items:flex-start;margin-bottom:16px}
.svc-step .n{font-family:var(--display);font-weight:700;font-size:16px;width:38px;height:38px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--navy);color:#fff;border-radius:9px}
.svc-step h4{font-family:var(--display);font-weight:600;font-size:18px;color:var(--navy);margin-bottom:3px}
.svc-step p{font-size:15px;color:var(--ink-soft);margin:0}

@media(max-width:640px){.wrap{padding:36px 18px}.lesson{padding:22px 20px}.story .lead-para{font-size:19px}.site-rank{font-size:20px;min-width:32px}.share-box{padding:22px}.price-amount{font-size:42px}}
`;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Build a "share this" box with ready-made, ORIGINAL share snippets.
 *
 * Key point for SEO: these snippets are short, hand-framed micro-copy — NOT a
 * copy of the article body. People share the snippet + a link back, so the
 * canonical long-form content stays unique to this page (no duplicate content
 * scattered across the web). Share intents read the live URL at runtime via
 * location.href, so it works on any host without knowing the domain at build.
 */
function shareBox(title, keyword, type = 'article') {
  const noun = type === 'guide' ? 'guide' : 'read';
  const snippets = [
    {
      text: `⚠️ ${title} — the clear, no-nonsense breakdown. Read it, then send it to someone who needs it. 👇`,
      tags: ['#DriveSober', '#DUIAwareness', CAMPAIGN],
    },
    {
      text: `Not sure about ${keyword}? Most people aren't. We laid out the facts in plain English — because knowing keeps people safe. 🚗`,
      tags: ['#RoadSafety', '#KnowYourRights', CAMPAIGN],
    },
    {
      text: `${title}: a 2-minute ${noun} that could change a decision tonight. Plan the ride, know the facts, get everyone home. 🔗`,
      tags: ['#DontDrinkAndDrive', '#ArriveAlive', CAMPAIGN],
    },
  ];

  const rows = snippets
    .map((s) => {
      const full = `${s.text} ${s.tags.join(' ')}`;
      return `<div class="snippet" data-text="${esc(full)}">
      <p class="snippet-text">${esc(full)}</p>
      <div class="snippet-actions">
        <button class="snip-btn copy">Copy</button>
        <a class="snip-btn x" target="_blank" rel="noopener">Post to X</a>
        <a class="snip-btn fb" target="_blank" rel="noopener">Facebook</a>
        <a class="snip-btn li" target="_blank" rel="noopener">LinkedIn</a>
      </div>
    </div>`;
    })
    .join('\n');

  return `<div class="share-box">
  <div class="share-box-head">
    <h3>📣 Share this — snippets ready to go</h3>
    <p>Original share copy (not a paste of the article, so no duplicate-content issues). Pick one, copy or post it, and it links right back to this page.</p>
  </div>
  <div class="snippet-list">${rows}</div>
</div>
<script>
(function(){
  var url=encodeURIComponent(location.href);
  document.querySelectorAll('.snippet').forEach(function(s){
    var text=s.getAttribute('data-text'), enc=encodeURIComponent(text);
    var x=s.querySelector('.x'); if(x)x.href='https://twitter.com/intent/tweet?text='+enc+'&url='+url;
    var fb=s.querySelector('.fb'); if(fb)fb.href='https://www.facebook.com/sharer/sharer.php?u='+url+'&quote='+enc;
    var li=s.querySelector('.li'); if(li)li.href='https://www.linkedin.com/sharing/share-offsite/?url='+url;
    var c=s.querySelector('.copy'); if(c)c.addEventListener('click',function(){
      navigator.clipboard.writeText(text+' '+location.href).then(function(){
        c.textContent='Copied!';setTimeout(function(){c.textContent='Copy';},1500);
      });
    });
  });
})();
</script>`;
}

function brandBar(current, prefix = '') {
  const link = (href, label, key) =>
    `<a href="${prefix}${href}"${current === key ? ' class="current"' : ''}>${label}</a>`;
  return `<div class="brand-bar"><div class="brand-inner">
  <a class="brand-mark" href="${prefix}index.html">
    <span class="shield"><span>MADD</span></span>
    <span><span class="brand-name">MADD</span><br><span class="brand-sub">Marketers Against Drunk Driving</span></span>
  </a>
  <nav class="brand-nav">
    ${link('index.html', 'Home', 'home')}
    ${link('about.html', 'About', 'about')}
    ${link('index.html#guides', 'Guides', 'guides')}
    ${link('index.html#articles', 'Articles', 'articles')}
    ${link('best-drunk-driving-sites-to-follow.html', 'Follow', 'follow')}
    ${link('web-design-services.html', 'Web Design', 'services')}
  </nav>
</div></div>`;
}

function page({ title, description, schema, body, current, prefix = '' }) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${FONTS}
${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
<style>${CSS}</style></head>
<body>
${brandBar(current, prefix)}
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
  ${shareBox(g.title, g.targetKeyword, 'guide')}
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
    prefix: '../',
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
  ${shareBox(a.title, a.targetKeyword, 'article')}
</main>`;
  return page({ title: a.metaTitle, description: a.metaDescription, schema, body, current: 'articles', prefix: '../' });
}

/* ---------------------------- HOME ---------------------------- */
function renderHome() {
  const guideCards = guides
    .slice(0, 3)
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
  <div class="eyebrow"><span class="pulse"></span>USING MARKETING FOR GOOD</div>
  <h1>Marketers Against <em>Drunk Driving</em></h1>
  <div class="subtitle">A brand built by a marketer who decided to point real reach at a problem that takes someone every 39 minutes.</div>
  <p class="hero-tag">We meet people where they are — whether they're trying to understand the law, choose an attorney, or simply get home safe tonight. The mission is simple: get the right message in front of the right people, and get everyone home. <span style="color:#fff;font-weight:600">${CAMPAIGN}</span></p>
  <div class="meta-row">
    <div class="meta-card"><div class="label">Guides</div><div class="value">${guides.length} Interactive</div></div>
    <div class="meta-card"><div class="label">Articles</div><div class="value">${seoArticles.length} Published</div></div>
    <div class="meta-card"><div class="label">Mission</div><div class="value">Zero drunk driving</div></div>
  </div>
  <div style="margin-top:30px"><a class="btn-hero" href="about.html">Read how this started →</a></div>
</div></header>
<main class="wrap" style="max-width:1100px">

  <div class="hub-section">
    <h2>Why this exists</h2>
    <p class="lede">I'm an SEO and brand builder. I know how to make a message travel. After a wrong turn of my own, I decided the most responsible thing I could do with that skill was aim it at drunk driving — prevention, education, and getting people the help they need before anyone gets hurt. <a href="about.html">Here's the full story →</a></p>
  </div>

  <div class="hub-section" id="guides">
    <h2>Start Here: Interactive Guides</h2>
    <p class="lede">Work through these like mini-courses. Tick off each action item as you go — your progress saves automatically.</p>
    <div class="card-grid">${guideCards}</div>
  </div>

  <div class="hub-section" id="articles">
    <h2>Articles</h2>
    <p class="lede">Clear, factual answers to the questions people actually search — felony thresholds, state-by-state rules, and more.</p>
    <div class="card-grid">${articleCards}</div>
  </div>

  <div class="hub-section" id="follow">
    <h2>Want to help out?</h2>
    <p class="lede">The fastest way to start is to follow the people already doing the work. We rounded up the 20 best drunk-driving and road-safety sites to follow.</p>
    <a class="card" href="best-drunk-driving-sites-to-follow.html" style="max-width:420px">
      <div class="kicker">Resource</div>
      <h3>The 20 Best Drunk Driving Sites to Follow</h3>
      <p>Reputable organizations, advocates, and data sources to follow, share, and learn from.</p>
      <div class="meta">20 sites · Updated ${new Date().getFullYear()}</div>
    </a>
  </div>

  <div class="hub-section" id="services">
    <h2>Need a website?</h2>
    <p class="lede">This whole campaign is built on one skill: getting the right message in front of the right people. I do the same for small businesses — fast, beautiful, conversion-focused websites with simple flat pricing.</p>
    <a class="card" href="web-design-services.html" style="max-width:420px">
      <div class="kicker">Web Design &amp; Development</div>
      <h3>Custom Websites from $500</h3>
      <p>5-page sites $500 · 10-page $999 · 20-page $1500. Mobile-first, SEO-ready, and yours to keep.</p>
      <div class="meta">Flat pricing · See examples →</div>
    </a>
  </div>

  <div class="cta-band">
    <h2>Care for everyone. Get everyone home.</h2>
    <p>Our brand voice stays helpful as long as people are trying to do right. Plan the ride, hand over the keys, and share the message.</p>
    <span class="tag">${CAMPAIGN}</span>
  </div>
</main>`;

  return page({
    title: 'Marketers Against Drunk Driving — Using Marketing for Good',
    description:
      'Marketers Against Drunk Driving: helpful guides, articles, and resources on drunk driving law, prevention, and getting home safe. Built by an SEO turning reach into responsibility. #marketersagainstdrunkdriving',
    body,
    current: 'home',
    prefix: '',
  });
}

/* ---------------------------- ABOUT ---------------------------- */
function renderAbout() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Marketers Against Drunk Driving',
    description:
      'The story behind Marketers Against Drunk Driving — how a trip to pay a ticket turned into a recruit, and why an SEO decided brand-building was a form of social responsibility.',
    inLanguage: 'en',
  };

  const body = `
<header class="hero"><div class="hero-inner">
  <div class="eyebrow"><span class="pulse"></span>OUR STORY</div>
  <h1>I went to pay a ticket. I left a <em>recruit.</em></h1>
  <div class="subtitle">How a marketer ended up building a brand against drunk driving — and why I think that's exactly what my skills are for.</div>
</div></header>
<main class="wrap">
  <a class="backlink" href="index.html">← Back home</a>

  <div class="story">
    <p class="lead-para">I build brands for a living. As an SEO, my whole job is getting the right message in front of the right people at the exact moment they're looking — and making it stick. For years I pointed that skill wherever the work was. Then one ordinary errand changed what I pointed it at.</p>

    <h2>The errand</h2>
    <p>I went in to pay a ticket. Nothing dramatic — paperwork, a line, the kind of thing you forget by dinner. But while I was there, I got talking to people whose lives had been rearranged by a drunk driver. Not statistics. People. A name, a date, an empty chair. By the time I walked out, I wasn't a guy who'd paid a ticket. I was a recruit.</p>

    <h2>The realization</h2>
    <p>Here's what hit me on the drive home: the thing that takes someone in this country roughly every 39 minutes is <em>100% preventable</em>, and the gap isn't information — it's <strong>attention</strong>. The right message, in front of the right person, at the right moment. That is <em>literally my job.</em> I spend my days winning attention for brands. I had the exact skill the problem was starving for, and I'd never once aimed it here.</p>

    <h2>Why a marketer?</h2>
    <p>Awareness campaigns don't fail because the message is wrong. "Don't drive drunk" is not a controversial idea. They fail because they can't <em>travel</em> — they don't rank, they don't get shared, they don't show up where people already are. Building things that travel is the entire discipline of SEO and brand. So Marketers Against Drunk Driving is what happens when you treat a public-safety message like a brand that deserves to win: real content, real search visibility, real reach.</p>

    <h2>What we stand for</h2>
    <p>We're helpful first, and we mean it. If you're trying to understand the law, choose an attorney, support someone, or just get home safe tonight — we're on your side, no judgment. We care about everyone as a person, including people who've made mistakes. That's how you build a brand people actually trust, and trust is what makes a message spread.</p>

    <h2>This is social responsibility</h2>
    <p>I think anyone with the ability to move people owes it to the world to occasionally move them somewhere good. I can build brands that get in front of all the right people. So this one is mine to build — and it's the one I'm proudest of. If it gets even one person to hand over the keys, the whole thing was worth it.</p>

    <div class="signoff">
      <p>— Eric Brister</p>
      <p class="signoff-role">SEO &amp; Brand Builder · Founder, Marketers Against Drunk Driving</p>
    </div>
  </div>

  <div class="cta-band">
    <h2>You don't have to be a marketer to help.</h2>
    <p>Follow the people doing the work, share what's useful, and plan the ride. That's the whole job.</p>
    <span class="tag">${CAMPAIGN}</span>
    <div style="margin-top:18px"><a class="btn-hero" href="best-drunk-driving-sites-to-follow.html">See the 20 sites to follow →</a></div>
  </div>
</main>`;

  return page({
    title: 'About — Marketers Against Drunk Driving',
    description:
      'The story behind Marketers Against Drunk Driving: how paying a ticket turned a marketer into a recruit, and why building this brand is social responsibility. #marketersagainstdrunkdriving',
    schema,
    body,
    current: 'about',
    prefix: '',
  });
}

/* ---------------------------- FOLLOW (20 sites) ---------------------------- */
const bestSites = [
  ['MADD — Mothers Against Drunk Driving', 'https://www.madd.org', 'The original and largest victim-services and advocacy organization fighting drunk and drugged driving.', 'Advocacy & Victim Support'],
  ['NHTSA', 'https://www.nhtsa.gov/risky-driving/drunk-driving', 'The federal agency setting U.S. road-safety policy and running national impaired-driving campaigns.', 'Government / Data'],
  ['Responsibility.org', 'https://www.responsibility.org', 'Foundation for Advancing Alcohol Responsibility — research and programs to eliminate drunk driving and underage drinking.', 'Research & Programs'],
  ['SADD', 'https://www.sadd.org', 'Students Against Destructive Decisions — peer-to-peer prevention built for teens and young adults.', 'Youth Prevention'],
  ['We Save Lives', 'https://wesavelives.org', 'Founded by MADD founder Candace Lightner, focused on the "3 D\'s" — drunk, drugged, and distracted driving.', 'Advocacy'],
  ['IIHS', 'https://www.iihs.org', 'Insurance Institute for Highway Safety — independent crash research and hard data on what actually saves lives.', 'Research & Data'],
  ['GHSA', 'https://www.ghsa.org', 'Governors Highway Safety Association — the voice of state highway safety offices and their programs.', 'Policy / State'],
  ['National Safety Council', 'https://www.nsc.org', 'Century-old nonprofit working to eliminate preventable deaths, including impaired-driving fatalities.', 'Safety Education'],
  ['NTSB', 'https://www.ntsb.gov', 'National Transportation Safety Board — investigates crashes and issues the recommendations that change the law.', 'Government / Investigations'],
  ['CDC — Impaired Driving', 'https://www.cdc.gov/transportation-safety/impaired-driving/', 'The CDC\'s public-health view of impaired driving: data, risk factors, and what works to prevent it.', 'Public Health'],
  ['AAA Foundation for Traffic Safety', 'https://aaafoundation.org', 'Independent research arm dedicated to saving lives through traffic-safety research and education.', 'Research'],
  ['RADD', 'https://www.radd.org', 'The entertainment industry\'s road-safety nonprofit, using celebrity reach to promote safe, sober driving.', 'Awareness / Media'],
  ['Vision Zero Network', 'https://visionzeronetwork.org', 'The movement to eliminate all traffic fatalities and severe injuries through smarter street design and policy.', 'Movement / Policy'],
  ['Advocates for Highway & Auto Safety', 'https://saferoads.org', 'A coalition of consumer, safety, and insurance groups pushing for stronger federal safety laws.', 'Advocacy / Policy'],
  ['FARS / NHTSA Data', 'https://www-fars.nhtsa.dot.gov', 'The Fatality Analysis Reporting System — the authoritative U.S. database of fatal crash data.', 'Data Source'],
  ['NOYS', 'https://noys.org', 'National Organizations for Youth Safety — a coalition amplifying youth-led safety and prevention efforts.', 'Youth Coalition'],
  ['Brake (Road Safety Charity)', 'https://www.brake.org.uk', 'A leading international road-safety charity supporting victims and campaigning for safer roads.', 'International / Victim Support'],
  ['WHO — Road Safety', 'https://www.who.int/health-topics/road-safety', 'The World Health Organization\'s global view on road-traffic injury, including alcohol-impaired driving.', 'Global Health'],
  ['End DUI', 'https://www.enddui.com', 'Education and resources aimed at preventing DUIs and helping people understand the real consequences.', 'Education'],
  ['Your State Highway Safety Office', 'https://www.ghsa.org/about/shsos', 'Every state has one. Follow yours for local laws, checkpoints, grants, and campaigns where you actually drive.', 'Local / State'],
];

function renderFollow() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'The 20 Best Drunk Driving Sites to Follow',
    numberOfItems: bestSites.length,
    itemListElement: bestSites.map(([name, url], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url,
      name,
    })),
  };

  const rows = bestSites
    .map(
      ([name, url, desc, tag], i) => `<div class="site-row">
    <div class="site-rank">${String(i + 1).padStart(2, '0')}</div>
    <div class="site-main">
      <a class="site-name" href="${url}" target="_blank" rel="noopener nofollow">${esc(name)} ↗</a>
      <p class="site-desc">${esc(desc)}</p>
      <span class="site-tag">${esc(tag)}</span>
    </div>
  </div>`
    )
    .join('\n');

  const body = `
<header class="hero"><div class="hero-inner">
  <div class="eyebrow"><span class="pulse"></span>RESOURCE · START HELPING</div>
  <h1>The 20 Best Drunk Driving <em>Sites to Follow</em></h1>
  <div class="subtitle">Want to help out but not sure where to start? Follow the people already doing the work. Here are 20 reputable organizations, advocates, and data sources worth your attention.</div>
  <div class="meta-row">
    <div class="meta-card"><div class="label">Sites</div><div class="value">${bestSites.length} Vetted</div></div>
    <div class="meta-card"><div class="label">Best for</div><div class="value" style="font-size:14px">Following · Sharing · Learning</div></div>
    <div class="meta-card"><div class="label">Updated</div><div class="value">${new Date().getFullYear()}</div></div>
  </div>
</div></header>
<main class="wrap">
  <a class="backlink" href="index.html">← Back home</a>
  <p class="section-lede">Following these accounts does three things: it keeps you informed, it puts good information into your own feed where friends can see it, and every share helps these messages travel further. That last part is the whole point. Open the ones that resonate, hit follow, and share what's useful.</p>

  <div class="site-list">${rows}</div>

  <div class="cta-band">
    <h2>Following is step one. Sharing is step two.</h2>
    <p>Pick two of these, follow them today, and reshare the next thing they post. You just became part of the reach.</p>
    <span class="tag">${CAMPAIGN}</span>
  </div>
</main>`;

  return page({
    title: 'The 20 Best Drunk Driving Sites to Follow (2026) — MADD',
    description:
      'The 20 best drunk driving and road-safety sites to follow — MADD, NHTSA, IIHS, SADD, Responsibility.org and more. Reputable orgs, advocates, and data sources to follow and share.',
    schema,
    body,
    current: 'follow',
    prefix: '',
  });
}

/* ---------------------------- WEB DESIGN SERVICES ---------------------------- */
const CONTACT_EMAIL = 'bristereric713@gmail.com';

const pricingTiers = [
  {
    tier: 'Starter',
    pages: '5-Page Website',
    amount: '500',
    note: 'Perfect for a clean, credible presence that converts.',
    features: [
      'Up to 5 custom-designed pages',
      'Mobile-first, fully responsive build',
      'On-page SEO foundations baked in',
      'Contact form + click-to-call',
      'Fast, lightweight, no bloat',
      '1 round of revisions',
    ],
    featured: false,
  },
  {
    tier: 'Growth',
    pages: '10-Page Website',
    amount: '999',
    note: 'The sweet spot for most small businesses.',
    features: [
      'Up to 10 custom-designed pages',
      'Everything in Starter, plus:',
      'Blog or articles section set up',
      'Google Business + analytics wired in',
      'Lead-capture & basic automations',
      'Copy polish on every page',
      '2 rounds of revisions',
    ],
    featured: true,
  },
  {
    tier: 'Authority',
    pages: '20-Page Website',
    amount: '1500',
    note: 'A full content engine built to rank and scale.',
    features: [
      'Up to 20 custom-designed pages',
      'Everything in Growth, plus:',
      'Full SEO content architecture',
      'Custom interactive sections',
      'Conversion-focused landing pages',
      'Speed & Core Web Vitals tuning',
      '3 rounds of revisions + priority support',
    ],
    featured: false,
  },
];

/* Self-contained CSS "browser" mockups — pretty sites, zero external images. */
const showcaseSites = [
  {
    url: 'lumiere.restaurant',
    name: 'Lumière',
    tag: 'Fine Dining',
    desc: 'Moody, elegant, and built around the reservation — the kind of site that makes a table feel earned.',
    mock: `<div class="mock" style="background:radial-gradient(130% 90% at 50% -10%,#33281a 0%,#0d0a06 70%)">
      <div class="mock-nav" style="color:#e9d8a6"><span style="font-family:var(--serif);font-style:italic;font-size:12px;letter-spacing:.04em">Lumière</span><span class="mock-links"><span>Menu</span><span>Wine</span><span>Visit</span></span></div>
      <div style="text-align:center;padding:22px 16px 0">
        <div style="color:#caa75a;font-size:8px;letter-spacing:.34em;text-transform:uppercase">Est. 2014 · Prix Fixe</div>
        <div style="font-family:var(--serif);font-style:italic;color:#fbf3df;font-size:25px;line-height:1.05;margin-top:10px">A Tasting of<br>the Season</div>
        <span class="mock-btn" style="background:linear-gradient(#d9b878,#bb9145);color:#1a140b">Reserve a Table</span>
      </div>
    </div>`,
  },
  {
    url: 'nimbus.io',
    name: 'Nimbus',
    tag: 'SaaS / Tech',
    desc: 'A vivid gradient hero, crisp product UI, and a CTA you can\'t miss — modern SaaS done right.',
    mock: `<div class="mock" style="background:linear-gradient(135deg,#6d28d9 0%,#4f46e5 55%,#0ea5e9 100%)">
      <div class="mock-nav" style="color:#fff"><span style="font-weight:700;font-size:11px;letter-spacing:.02em">◇ Nimbus</span><span class="mock-links"><span>Product</span><span>Pricing</span><span>Docs</span></span></div>
      <div style="padding:18px 18px 0">
        <div style="color:#fff;font-size:21px;font-weight:700;line-height:1.1;max-width:78%">Ship faster.<br>Stress less.</div>
        <div style="color:#e9e2ff;font-size:8.5px;margin-top:7px;max-width:70%;font-weight:500">The all-in-one workspace for teams that move.</div>
        <span class="mock-btn" style="background:#fff;color:#4f46e5">Start free →</span>
      </div>
      <div style="position:absolute;right:-26px;bottom:-22px;width:130px;height:96px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.35);border-radius:12px 0 0 0;backdrop-filter:blur(2px)"></div>
    </div>`,
  },
  {
    url: 'verdant.co',
    name: 'Verdant Wellness',
    tag: 'Health & Spa',
    desc: 'Soft, organic, and calming — earthy tones and generous whitespace that breathe trust.',
    mock: `<div class="mock" style="background:linear-gradient(160deg,#f3f6ec 0%,#e3eed9 100%)">
      <div class="mock-nav" style="color:#3f5e3a"><span style="font-weight:700;font-size:11px">❧ Verdant</span><span class="mock-links"><span>Treatments</span><span>About</span><span>Book</span></span></div>
      <div style="padding:20px 18px 0">
        <div style="font-family:var(--serif);color:#2f4a2c;font-size:23px;line-height:1.08;max-width:80%">Rest is a<br><span style="font-style:italic;color:#6f8f4f">ritual.</span></div>
        <div style="color:#5d7257;font-size:8.5px;margin-top:7px;max-width:72%">Massage, sauna, and stillness, just outside the city.</div>
        <span class="mock-btn" style="background:#4f7a3f;color:#fff">Book a session</span>
      </div>
      <div style="position:absolute;right:14px;top:54px;width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#cfe3b6,#8fae6c)"></div>
    </div>`,
  },
  {
    url: 'atelier-nord.studio',
    name: 'Atelier Nord',
    tag: 'Design Studio',
    desc: 'Confident, editorial, monochrome. Oversized type and ruthless restraint — a portfolio that sells.',
    mock: `<div class="mock" style="background:#f4f4f2">
      <div class="mock-nav" style="color:#111"><span style="font-weight:700;font-size:11px;letter-spacing:.04em">ATELIER NORD</span><span class="mock-links"><span>Work</span><span>Studio</span><span>Contact</span></span></div>
      <div style="padding:16px 18px 0">
        <div style="color:#111;font-size:30px;font-weight:700;line-height:.95;letter-spacing:-.02em">Design<br>with<br>intent.</div>
        <div style="display:inline-block;margin-top:10px;border-bottom:2px solid #111;font-size:8px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;padding-bottom:2px">Selected Work ↘</div>
      </div>
      <div style="position:absolute;right:16px;bottom:16px;width:48px;height:48px;background:#c8102e"></div>
    </div>`,
  },
  {
    url: 'coastlinerealty.com',
    name: 'Coastline Realty',
    tag: 'Real Estate',
    desc: 'Big, aspirational imagery, a clean search bar, and listings that feel like a vacation.',
    mock: `<div class="mock" style="background:linear-gradient(180deg,#0c4a6e 0%,#0e7490 48%,#67c5d8 100%)">
      <div class="mock-nav" style="color:#fff"><span style="font-weight:700;font-size:11px">⌂ Coastline</span><span class="mock-links"><span>Buy</span><span>Sell</span><span>Agents</span></span></div>
      <div style="padding:18px 18px 0;text-align:center">
        <div style="color:#fff;font-size:20px;font-weight:700;line-height:1.1">Find your<br>place by the sea</div>
        <div style="background:#fff;border-radius:24px;margin:12px auto 0;width:78%;padding:7px 12px;display:flex;justify-content:space-between;align-items:center">
          <span style="color:#94a3b8;font-size:8px">City, ZIP, or address…</span>
          <span style="background:#0e7490;color:#fff;font-size:7px;font-weight:700;padding:4px 9px;border-radius:14px">Search</span>
        </div>
      </div>
    </div>`,
  },
  {
    url: 'bloomandco.shop',
    name: 'Bloom & Co.',
    tag: 'E-commerce',
    desc: 'Playful, warm, and built to sell — product-first layout with a checkout that never gets in the way.',
    mock: `<div class="mock" style="background:linear-gradient(150deg,#fff1f4 0%,#ffe1ec 100%)">
      <div class="mock-nav" style="color:#9d174d"><span style="font-weight:700;font-size:11px">✿ Bloom &amp; Co.</span><span class="mock-links"><span>Shop</span><span>Gifts</span><span>Cart (2)</span></span></div>
      <div style="padding:16px 18px 0">
        <div style="font-family:var(--serif);color:#831843;font-size:22px;line-height:1.05;max-width:74%">Fresh blooms,<br><span style="font-style:italic;color:#db2777">delivered.</span></div>
        <span class="mock-btn" style="background:#db2777;color:#fff">Shop bestsellers</span>
      </div>
      <div style="position:absolute;right:14px;top:48px;display:flex;gap:8px">
        <div style="width:46px;height:58px;background:#fff;border-radius:8px;box-shadow:0 4px 10px rgba(157,23,77,.18)"></div>
        <div style="width:46px;height:58px;background:#fff;border-radius:8px;box-shadow:0 4px 10px rgba(157,23,77,.18);margin-top:10px"></div>
      </div>
    </div>`,
  },
];

function renderServices() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Web design and development',
    provider: {
      '@type': 'Organization',
      name: 'Marketers Against Drunk Driving',
      founder: 'Eric Brister',
    },
    areaServed: 'US',
    description:
      'Custom, conversion-focused web design and development. Fast, mobile-first, SEO-ready websites in 5, 10, and 20-page packages.',
    offers: pricingTiers.map((t) => ({
      '@type': 'Offer',
      name: `${t.pages} — ${t.tier}`,
      price: t.amount,
      priceCurrency: 'USD',
    })),
  };

  const priceCards = pricingTiers
    .map(
      (t) => `<div class="price-card${t.featured ? ' featured' : ''}">
    ${t.featured ? '<div class="price-badge">Most Popular</div>' : ''}
    <div class="price-tier">${esc(t.tier)}</div>
    <div class="price-pages">${esc(t.pages)}</div>
    <div class="price-amount"><span>$</span>${esc(t.amount)}</div>
    <div class="price-note">${esc(t.note)}</div>
    <ul class="price-feat">${t.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
    <a class="btn-hero" href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        `Website project — ${t.pages}`
      )}">Get started</a>
  </div>`
    )
    .join('\n');

  const showcaseCards = showcaseSites
    .map(
      (s) => `<div class="showcase">
    <div class="bbar">
      <span class="bdot" style="background:#ff5f57"></span><span class="bdot" style="background:#febc2e"></span><span class="bdot" style="background:#28c840"></span>
      <span class="burl">${esc(s.url)}</span>
    </div>
    <div class="bview">${s.mock}</div>
    <div class="showcase-cap">
      <span class="tag">${esc(s.tag)}</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.desc)}</p>
    </div>
  </div>`
    )
    .join('\n');

  const included = [
    ['Mobile-first & responsive', 'Looks sharp on every phone, tablet, and desktop — designed small-screen first.'],
    ['SEO built in', 'Clean markup, fast load times, metadata, and a sitemap so Google can actually find you.'],
    ['Fast & secure', 'Lightweight builds that load in a blink, with HTTPS and modern best practices.'],
    ['You own it', 'No lock-in. The site is yours — hosting, domain, and files included in the handoff.'],
  ]
    .map(
      ([h, p]) => `<div class="svc-incl-item"><h4>${esc(h)}</h4><p>${esc(p)}</p></div>`
    )
    .join('\n');

  const steps = [
    ['Discovery', 'A quick call to learn your business, goals, and the look you\'re after. Flat quote, no surprises.'],
    ['Design', 'I design your pages around what makes people act — then you review and refine.'],
    ['Build', 'Your site is built fast, responsive, and SEO-ready, with the revisions in your package.'],
    ['Launch', 'We go live, connect analytics, and hand over everything. You\'re ready to grow.'],
  ]
    .map(
      ([h, p], i) => `<div class="svc-step"><div class="n">${i + 1}</div><div><h4>${esc(
        h
      )}</h4><p>${esc(p)}</p></div></div>`
    )
    .join('\n');

  const body = `
<header class="hero"><div class="hero-inner">
  <div class="eyebrow"><span class="pulse"></span>WEB DESIGN &amp; DEVELOPMENT</div>
  <h1>Websites that <em>work</em> as hard as you do.</h1>
  <div class="subtitle">I'm an SEO and brand builder — and I build fast, beautiful, conversion-focused websites for small businesses. Clear flat pricing, no monthly traps.</div>
  <p class="hero-tag">Same skill that powers this campaign, pointed at your business: get the right message in front of the right people, and turn visitors into customers.</p>
  <div style="margin-top:30px"><a class="btn-hero" href="#pricing">See pricing →</a></div>
</div></header>
<main class="wrap" style="max-width:1100px">
  <a class="backlink" href="index.html">← Back home</a>

  <div class="hub-section" id="pricing">
    <h2>Simple, flat pricing</h2>
    <p class="svc-lede">Pick the size that fits. Every package is a custom design — no templates phoned in, no surprise add-ons. One price, one beautiful site.</p>
    <div class="price-grid">${priceCards}</div>
    <p style="font-size:13.5px;color:var(--ink-mute);margin-top:14px">Need something bigger — e-commerce, a web app, or ongoing SEO? <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    'Custom website project'
  )}">Let\'s talk custom →</a></p>
  </div>

  <div class="hub-section">
    <h2>A few pretty sites for inspiration</h2>
    <p class="svc-lede">Here's the range of looks I build — from elegant and editorial to bold and modern. Yours is designed from scratch around your brand.</p>
    <div class="showcase-grid">${showcaseCards}</div>
  </div>

  <div class="hub-section">
    <h2>In every build</h2>
    <p class="svc-lede">No matter the package, these come standard.</p>
    <div class="svc-incl">${included}</div>
  </div>

  <div class="hub-section">
    <h2>How it works</h2>
    <p class="svc-lede">A simple, four-step process from idea to launch.</p>
    ${steps}
  </div>

  <div class="cta-band">
    <h2>Let's build something you're proud of.</h2>
    <p>Tell me about your business and what you need. I'll send back a clear, flat quote — usually within a day.</p>
    <div style="margin-top:18px"><a class="btn-hero" style="background:#fff;color:var(--navy)" href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    'Website project inquiry'
  )}">Start your project →</a></div>
    <p style="margin-top:16px;font-size:14px;color:#ffe2e6">Or email <strong>${CONTACT_EMAIL}</strong></p>
  </div>
</main>`;

  return page({
    title: 'Web Design Services — Custom Websites from $500 | MADD',
    description:
      'Custom, conversion-focused web design and development for small businesses. Flat pricing: 5-page site $500, 10-page $999, 20-page $1500. Fast, mobile-first, and SEO-ready.',
    schema,
    body,
    current: 'services',
    prefix: '',
  });
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
writeFileSync(join(__dirname, 'index.html'), renderHome());
writeFileSync(join(__dirname, 'about.html'), renderAbout());
writeFileSync(join(__dirname, 'best-drunk-driving-sites-to-follow.html'), renderFollow());
writeFileSync(join(__dirname, 'web-design-services.html'), renderServices());

/* ---------------------------- SITEMAP + ROBOTS ---------------------------- */
const BASE_URL = 'https://marketersagainstdrunkdriving.com';
const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: '', priority: '1.0', lastmod: today },
  { loc: 'about.html', priority: '0.7', lastmod: today },
  { loc: 'best-drunk-driving-sites-to-follow.html', priority: '0.8', lastmod: today },
  { loc: 'web-design-services.html', priority: '0.7', lastmod: today },
  ...guides.map((g) => ({ loc: `guides/${g.slug}.html`, priority: '0.8', lastmod: today })),
  ...seoArticles.map((a) => ({
    loc: `articles/${a.slug}.html`,
    priority: '0.9',
    lastmod: a.datePublished || today,
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${BASE_URL}/${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
writeFileSync(join(__dirname, 'sitemap.xml'), sitemap);

const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
writeFileSync(join(__dirname, 'robots.txt'), robots);

/* llms.txt — helps AI assistants understand and cite the site (llmstxt.org) */
const llms = `# Marketers Against Drunk Driving

> Using marketing for good. Helpful, plain-English guides, articles, and resources on drunk driving law (DUI/DWI), felony thresholds, choosing an attorney, prevention, and getting home safe. Built by an SEO who turned brand-building into social responsibility. Educational content only — not legal advice. Campaign hashtag: #marketersagainstdrunkdriving

## About
- [About — our story](${BASE_URL}/about.html): How paying a ticket turned a marketer into a recruit, and why building this brand is social responsibility.

## Articles
${seoArticles.map((a) => `- [${a.title}](${BASE_URL}/articles/${a.slug}.html): ${a.metaDescription}`).join('\n')}

## Guides
${guides.map((g) => `- [${g.title}](${BASE_URL}/guides/${g.slug}.html): ${g.metaDescription}`).join('\n')}

## Resources
- [The 20 Best Drunk Driving Sites to Follow](${BASE_URL}/best-drunk-driving-sites-to-follow.html): A vetted list of reputable organizations, advocates, and data sources on drunk driving and road safety.

## Services
- [Web Design Services](${BASE_URL}/web-design-services.html): Custom, conversion-focused web design and development for small businesses. Flat pricing — 5-page site $500, 10-page $999, 20-page $1500. Fast, mobile-first, SEO-ready.
`;
writeFileSync(join(__dirname, 'llms.txt'), llms);

const total = guides.length + seoArticles.length + 4;
console.log(
  `✓ Built site: home + about + follow + services + ${guides.length} guides + ${seoArticles.length} articles = ${total} pages`
);
console.log(`✓ Wrote sitemap.xml (${urls.length} URLs) + robots.txt + llms.txt`);
