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
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Pirata+One&family=Oswald:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">';

/* ------------------------------------------------------------------ */
/* Shared brand CSS — gothic black death: void, blood, bone            */
/* ------------------------------------------------------------------ */
const CSS = `
:root{
  /* gothic black death — void, blood, bone */
  --void:#050308; --pit:#080510; --slab:#0d0912; --slab-2:#140d1a; --slab-3:#1a1122;
  --blood:#d4102c; --blood-deep:#7a0818; --ember:#ff3a52; --rust:#8c2f1a;
  --bone:#ece7ef; --ash:#a99fb2; --ash-mute:#6f6878; --iron:#3a3344;
  --line:rgba(236,231,239,.10); --line-blood:rgba(212,16,44,.28);
  --gothic:'Cinzel',Georgia,'Times New Roman',serif;
  --black-letter:'Pirata One',var(--gothic);
  --display:'Oswald',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --serif:'Newsreader',Georgia,'Times New Roman',serif;
  /* legacy aliases — older inline styles still resolve to the gothic palette */
  --navy:#0d0912; --navy-deep:#050308; --navy-soft:#140d1a;
  --red:#d4102c; --red-deep:#7a0818;
  --white:#ece7ef; --cream:#0d0912;
  --ink:#ece7ef; --ink-soft:#a99fb2; --ink-mute:#6f6878;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--void);color:var(--bone);font-family:var(--serif);font-size:18px;line-height:1.72;-webkit-font-smoothing:antialiased;overflow-x:hidden;position:relative}
::selection{background:var(--blood);color:#fff}
a{color:var(--ember);text-decoration:none}
a:hover{text-decoration:underline}
em{color:var(--ember);font-style:italic}
strong{color:var(--bone)}

/* vignette + film grain — the pall over everything */
body::before{content:"";position:fixed;inset:0;z-index:1;pointer-events:none;
  background:radial-gradient(125% 85% at 50% -10%,rgba(122,8,24,.22) 0%,transparent 45%),radial-gradient(100% 80% at 50% 100%,transparent 40%,rgba(0,0,0,.72) 100%)}
body::after{content:"";position:fixed;inset:-50%;z-index:2;pointer-events:none;opacity:.045;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}
.brand-bar,.hero,.wrap,footer,main{position:relative;z-index:5}

/* brand bar */
.brand-bar{background:rgba(5,3,8,.86);backdrop-filter:blur(10px);position:sticky;top:0;z-index:90;border-bottom:1px solid var(--line-blood)}
.brand-inner{max-width:1100px;margin:0 auto;padding:12px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.brand-mark{display:flex;align-items:center;gap:12px;text-decoration:none}
.brand-mark:hover{text-decoration:none}
.shield{width:44px;height:50px;flex-shrink:0;background:linear-gradient(165deg,var(--blood),var(--blood-deep));clip-path:polygon(50% 0,100% 14%,100% 60%,50% 100%,0 60%,0 14%);display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(212,16,44,.42)}
.shield span{font-family:var(--gothic);font-weight:900;font-size:13px;color:#fff;letter-spacing:.02em;margin-top:-3px}
.brand-name{font-family:var(--gothic);font-weight:800;font-size:20px;color:var(--bone);letter-spacing:.08em;line-height:1}
.brand-sub{font-family:var(--display);font-weight:400;font-size:9px;letter-spacing:.3em;color:var(--ash-mute);text-transform:uppercase;margin-top:4px}
.brand-nav{display:flex;gap:4px;flex-wrap:wrap}
.brand-nav a{font-family:var(--display);font-weight:500;font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ash);text-decoration:none;padding:8px 12px;border-radius:3px;transition:.15s}
.brand-nav a:hover,.brand-nav a.current{background:var(--blood);color:#fff;text-decoration:none;box-shadow:0 0 16px rgba(212,16,44,.4)}

/* hero */
.hero{background:linear-gradient(175deg,var(--slab-2) 0%,var(--pit) 55%,var(--void) 100%);color:var(--bone);padding:70px 28px 58px;border-bottom:1px solid var(--line-blood);overflow:hidden}
.hero::before{content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(236,231,239,.018) 60px,rgba(236,231,239,.018) 61px)}
.hero::after{content:"";position:absolute;left:50%;top:-30%;width:70vw;height:70vw;transform:translateX(-50%);pointer-events:none;
  background:radial-gradient(circle,rgba(212,16,44,.16),transparent 62%);filter:blur(60px)}
.hero-inner{max-width:1100px;margin:0 auto;position:relative;z-index:2}
.eyebrow{display:inline-flex;align-items:center;gap:10px;font-family:var(--display);font-weight:600;font-size:11.5px;letter-spacing:.26em;text-transform:uppercase;color:#fff;background:var(--blood-deep);border:1px solid var(--line-blood);padding:7px 14px;border-radius:2px;margin-bottom:22px}
.hero h1{font-family:var(--gothic);font-weight:900;font-size:clamp(34px,5vw,58px);line-height:1.06;letter-spacing:.01em;margin-bottom:16px;color:#fff;text-shadow:0 0 34px rgba(212,16,44,.45)}
.hero .subtitle{font-size:21px;color:var(--ash);max-width:760px;margin-bottom:18px}
.hero-tag{font-size:16px;color:var(--ash-mute);max-width:740px}
.meta-row{display:flex;flex-wrap:wrap;gap:14px;margin-top:30px}
.meta-card{background:rgba(236,231,239,.04);border:1px solid var(--line);border-left:3px solid var(--blood);padding:12px 18px;border-radius:4px;min-width:150px}
.meta-card .label{font-family:var(--display);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--ash-mute);margin-bottom:5px}
.meta-card .value{font-family:var(--display);font-weight:600;font-size:16px;color:var(--bone)}

/* progress rail */
.progress-rail{margin-top:32px;max-width:640px}
.progress-track{height:12px;background:rgba(236,231,239,.08);border:1px solid var(--line);border-radius:7px;overflow:hidden}
.progress-fill{height:100%;width:0;background:linear-gradient(90deg,var(--blood-deep),var(--ember));box-shadow:0 0 18px rgba(212,16,44,.55);transition:width .35s ease}
.progress-meta{display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-family:var(--display);font-size:13px;letter-spacing:.06em;color:var(--ash)}
.reset-btn{font-family:var(--display);font-size:11px;letter-spacing:.12em;text-transform:uppercase;background:transparent;border:1px solid var(--iron);color:var(--ash);padding:5px 12px;border-radius:3px;cursor:pointer}
.reset-btn:hover{background:var(--blood);border-color:var(--blood);color:#fff}

/* layout */
.wrap{max-width:880px;margin:0 auto;padding:54px 28px}
.section-title{font-family:var(--gothic);font-weight:800;font-size:30px;color:var(--bone);letter-spacing:.02em;margin:8px 0 8px}
.section-lede{color:var(--ash);margin-bottom:30px;max-width:720px}

/* lesson / step cards */
.lesson{background:linear-gradient(180deg,var(--slab-2),var(--slab));border:1px solid var(--line);border-top:3px solid var(--blood-deep);border-radius:8px;padding:30px 32px;margin-bottom:22px;box-shadow:0 10px 30px rgba(0,0,0,.55);scroll-margin-top:90px}
.lesson.done{border-top-color:var(--ember)}
.lesson-head{display:flex;align-items:center;gap:16px;margin-bottom:14px}
.lesson-num{font-family:var(--gothic);font-weight:800;font-size:18px;width:46px;height:46px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,var(--blood),var(--blood-deep));color:#fff;border-radius:6px;box-shadow:0 0 18px rgba(212,16,44,.35)}
.lesson.done .lesson-num{background:linear-gradient(160deg,var(--ember),var(--blood))}
.lesson-head h3{font-family:var(--gothic);font-weight:700;font-size:23px;color:var(--bone);line-height:1.18;letter-spacing:.01em}
.lesson-body p{margin-bottom:14px;color:var(--ash)}
.lesson-body ul{margin:0 0 16px 22px}
.lesson-body li{margin-bottom:6px;color:var(--ash)}

/* checklist */
.checklist{display:flex;flex-direction:column;gap:9px;margin-top:18px;padding-top:18px;border-top:1px dashed var(--iron)}
.check-item{display:flex;align-items:flex-start;gap:12px;background:var(--pit);border:1px solid var(--iron);border-radius:6px;padding:12px 15px;cursor:pointer;font-size:15px;color:var(--ash);transition:.15s}
.check-item:hover{border-color:var(--blood);box-shadow:0 0 14px rgba(212,16,44,.18)}
.check-item.checked{border-color:var(--ember);background:rgba(212,16,44,.09)}
.check-item.checked .ci-text{text-decoration:line-through;color:var(--ember)}
.check-item input{margin-top:3px;width:19px;height:19px;accent-color:var(--blood);cursor:pointer;flex-shrink:0}

/* faq */
.faq-wrap{margin-top:46px}
.faq-wrap h2{font-family:var(--gothic);font-weight:800;font-size:26px;color:var(--bone);margin-bottom:18px}
.faq{background:var(--slab);border:1px solid var(--line);border-left:3px solid var(--blood);border-radius:6px;padding:16px 20px;margin-bottom:12px}
.faq summary{font-family:var(--gothic);font-weight:700;font-size:17px;color:var(--bone);cursor:pointer}
.faq summary::marker{color:var(--blood)}
.faq p{margin-top:12px;color:var(--ash)}

/* article body */
.article-body{color:var(--ash)}
.article-body h2{font-family:var(--gothic);font-weight:800;font-size:27px;color:var(--bone);margin:34px 0 12px;letter-spacing:.01em}
.article-body h3{font-family:var(--gothic);font-weight:700;font-size:19px;color:var(--ember);margin:24px 0 10px}
.article-body p{margin-bottom:16px}
.article-body ul{margin:0 0 18px 24px}
.article-body li{margin-bottom:7px}
.article-body li::marker{color:var(--blood)}
.article-body table{width:100%;border-collapse:collapse;margin:0 0 22px;font-size:15px}
.article-body th,.article-body td{border:1px solid var(--iron);padding:10px 13px;text-align:left}
.article-body th{background:var(--slab-3);color:var(--bone);font-family:var(--display);font-weight:500;letter-spacing:.06em;text-transform:uppercase;font-size:13px}
.article-body tr:nth-child(even) td{background:rgba(236,231,239,.03)}
.article-disclaimer{margin-top:34px;padding:18px;background:var(--slab);border:1px dashed var(--line-blood);border-radius:6px;font-size:14px;color:var(--ash-mute)}
.campaign-tag{color:var(--ember);font-weight:700}

/* chips + cards */
.hashtags{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px}
.chip{font-family:var(--display);font-size:13px;letter-spacing:.04em;background:var(--slab-3);border:1px solid var(--line-blood);color:var(--ash);padding:6px 13px;border-radius:14px}
.intent{display:inline-block;font-family:var(--display);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:3px 10px;border-radius:10px}
.intent.informational{background:rgba(236,231,239,.07);color:var(--ash);border:1px solid var(--iron)}
.intent.commercial{background:rgba(212,16,44,.14);color:var(--ember);border:1px solid var(--line-blood)}

/* hub grid */
.hub-section{margin-bottom:54px}
.hub-section > h2{font-family:var(--gothic);font-weight:800;font-size:28px;color:var(--bone);margin-bottom:6px;border-bottom:2px solid var(--blood);padding-bottom:8px;display:inline-block;letter-spacing:.02em}
.hub-section > p.lede{color:var(--ash);margin:14px 0 24px;max-width:720px}
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
.card{display:block;background:linear-gradient(180deg,var(--slab-2),var(--slab));border:1px solid var(--line);border-top:3px solid var(--iron);border-radius:8px;padding:22px;text-decoration:none;color:inherit;transition:.18s;box-shadow:0 8px 24px rgba(0,0,0,.5)}
.card:hover{transform:translateY(-4px);border-top-color:var(--blood);box-shadow:0 14px 34px rgba(0,0,0,.7),0 0 22px rgba(212,16,44,.18);text-decoration:none}
.card .kicker{font-family:var(--display);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--ember);margin-bottom:10px}
.card h3{font-family:var(--gothic);font-weight:700;font-size:19px;color:var(--bone);line-height:1.22;margin-bottom:10px}
.card p{font-size:14px;color:var(--ash-mute);margin-bottom:14px}
.card .meta{font-family:var(--display);font-size:12px;color:var(--ash-mute);letter-spacing:.05em}

/* cta + footer */
.cta-band{background:linear-gradient(150deg,var(--blood-deep) 0%,#3d0410 55%,var(--pit) 100%);color:var(--bone);border:1px solid var(--line-blood);border-radius:10px;padding:36px;margin-top:48px;text-align:center;box-shadow:0 0 40px rgba(212,16,44,.16) inset}
.cta-band h2{font-family:var(--gothic);font-weight:800;font-size:28px;margin-bottom:10px;color:#fff}
.cta-band p{color:var(--ash);max-width:560px;margin:0 auto 18px}
.cta-band .tag{font-family:var(--display);font-weight:600;letter-spacing:.06em;color:var(--ember)}
footer{background:var(--pit);color:var(--ash-mute);text-align:center;padding:30px 28px;font-size:13px;font-family:var(--display);letter-spacing:.05em;border-top:1px solid var(--line-blood)}
footer a{color:var(--ash)}
.backlink{display:inline-block;font-family:var(--display);font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ember);text-decoration:none;margin-bottom:24px}
.backlink:hover{text-decoration:underline}

/* hero button + pulse */
.btn-hero{display:inline-block;font-family:var(--display);font-weight:600;font-size:14px;letter-spacing:.08em;text-transform:uppercase;background:var(--blood);color:#fff;text-decoration:none;padding:13px 24px;border-radius:4px;transition:.18s;box-shadow:0 0 22px rgba(212,16,44,.35)}
.btn-hero:hover{background:var(--ember);color:#0a0508;text-decoration:none;box-shadow:0 0 30px rgba(255,58,82,.55)}
.pulse{width:9px;height:9px;border-radius:50%;background:var(--ember);box-shadow:0 0 0 0 rgba(255,58,82,.7);animation:pulse 2s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(255,58,82,.6)}70%{box-shadow:0 0 0 9px rgba(255,58,82,0)}100%{box-shadow:0 0 0 0 rgba(255,58,82,0)}}

/* about story */
.story{max-width:720px}
.story .lead-para{font-size:22px;line-height:1.6;color:var(--bone);font-weight:500;margin-bottom:30px}
.story h2{font-family:var(--gothic);font-weight:800;font-size:25px;color:var(--bone);margin:34px 0 12px;padding-left:14px;border-left:3px solid var(--blood)}
.story p{margin-bottom:16px;color:var(--ash)}
.signoff{margin-top:40px;padding-top:22px;border-top:1px solid var(--iron)}
.signoff p{font-family:var(--gothic);font-weight:700;font-size:20px;color:var(--bone);margin:0}
.signoff .signoff-role{font-family:var(--display);font-weight:400;font-size:13px;letter-spacing:.06em;color:var(--ash-mute);text-transform:uppercase;margin-top:4px}

/* follow / 20 sites */
.site-list{display:flex;flex-direction:column;gap:14px;margin-bottom:20px}
.site-row{display:flex;gap:18px;background:linear-gradient(180deg,var(--slab-2),var(--slab));border:1px solid var(--line);border-left:3px solid var(--iron);border-radius:8px;padding:20px 22px;transition:.16s}
.site-row:hover{border-left-color:var(--blood);box-shadow:0 8px 24px rgba(0,0,0,.6)}
.site-rank{font-family:var(--gothic);font-weight:800;font-size:26px;color:var(--blood);min-width:44px;line-height:1.1}
.site-main{flex:1}
.site-name{font-family:var(--gothic);font-weight:700;font-size:20px;color:var(--bone);text-decoration:none}
.site-name:hover{color:var(--ember)}
.site-desc{margin:6px 0 10px;color:var(--ash);font-size:16px}
.site-tag{display:inline-block;font-family:var(--display);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;background:rgba(236,231,239,.06);border:1px solid var(--iron);color:var(--ash);padding:3px 11px;border-radius:10px}

/* share box (sharable snippets, no duplicate content) */
.share-box{margin-top:46px;background:linear-gradient(160deg,var(--slab-3) 0%,var(--pit) 100%);border:1px solid var(--line-blood);border-radius:12px;padding:30px;color:var(--bone);border-top:3px solid var(--blood)}
.share-box-head h3{font-family:var(--gothic);font-weight:800;font-size:24px;color:var(--bone);margin-bottom:8px}
.share-box-head p{font-size:14px;color:var(--ash-mute);max-width:620px;margin-bottom:22px}
.snippet-list{display:flex;flex-direction:column;gap:14px}
.snippet{background:rgba(236,231,239,.04);border:1px solid var(--line);border-radius:8px;padding:18px}
.snippet-text{font-size:15px;line-height:1.55;color:var(--bone);margin-bottom:14px}
.snippet-actions{display:flex;flex-wrap:wrap;gap:8px}
.snip-btn{font-family:var(--display);font-weight:600;font-size:12px;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;border:none;cursor:pointer;padding:9px 15px;border-radius:4px;transition:.15s;display:inline-flex;align-items:center;gap:6px}
.snip-btn:hover{text-decoration:none}
.snip-btn.copy{background:var(--bone);color:var(--void)}
.snip-btn.copy:hover{background:var(--blood);color:#fff}
.snip-btn.x{background:#000;color:#fff;border:1px solid var(--iron)}
.snip-btn.fb{background:#1877f2;color:#fff}
.snip-btn.li{background:#0a66c2;color:#fff}
.snip-btn.x:hover,.snip-btn.fb:hover,.snip-btn.li:hover{opacity:.82}

/* amplify tool */
.tool{background:linear-gradient(180deg,var(--slab-2),var(--slab));border:1px solid var(--line);border-top:3px solid var(--blood);border-radius:12px;padding:30px 32px;box-shadow:0 14px 40px rgba(0,0,0,.6)}
.tool-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:26px}
.field label{display:block;font-family:var(--display);font-weight:600;font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--ash-mute);margin-bottom:8px}
.field select{width:100%;font-family:var(--serif);font-size:16.5px;color:var(--bone);background-color:var(--pit);border:1px solid var(--iron);border-radius:7px;padding:13px 42px 13px 14px;cursor:pointer;transition:.15s;appearance:none;-webkit-appearance:none;background-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23d4102c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>');background-repeat:no-repeat;background-position:right 14px center}
.field select:hover{border-color:var(--line-blood)}
.field select:focus{outline:none;border-color:var(--blood);box-shadow:0 0 0 3px rgba(212,16,44,.18)}
.field select option{background:var(--pit);color:var(--bone)}
.out-block{margin-bottom:20px}
.out-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:8px}
.out-head h4{font-family:var(--display);font-weight:600;font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ash)}
.out-box{width:100%;font-family:var(--serif);font-size:17px;line-height:1.6;color:var(--bone);background:var(--pit);border:1px solid var(--iron);border-radius:8px;padding:16px;resize:vertical;min-height:118px;display:block}
.out-box:focus{outline:none;border-color:var(--blood);box-shadow:0 0 0 3px rgba(212,16,44,.18)}
.hash-box{min-height:60px;color:var(--ember);font-weight:500}
.char-count{font-family:var(--display);font-size:12px;letter-spacing:.08em;color:var(--ash-mute);white-space:nowrap}
.char-count.over{color:var(--ember);font-weight:700}
.tool-actions{display:flex;flex-wrap:wrap;gap:10px;margin:4px 0 6px}
.t-btn{font-family:var(--display);font-weight:600;font-size:13px;letter-spacing:.07em;text-transform:uppercase;border:none;cursor:pointer;padding:12px 18px;border-radius:6px;transition:.15s;display:inline-flex;align-items:center;gap:7px}
.t-btn.spin{background:var(--blood);color:#fff;box-shadow:0 0 20px rgba(212,16,44,.3)}
.t-btn.spin:hover{background:var(--ember);color:#0a0508}
.t-btn.copy{background:var(--slab-3);color:var(--bone);border:1px solid var(--iron)}
.t-btn.copy:hover{border-color:var(--blood);color:#fff}
.t-btn.ghost{background:transparent;color:var(--ash);border:1px solid var(--iron)}
.t-btn.ghost:hover{border-color:var(--blood);color:var(--bone)}
.t-btn.copied{background:var(--ember) !important;color:#0a0508 !important}
.share-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:6px}
.share-row .lbl{font-family:var(--display);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ash-mute);margin-right:2px}
.tool-note{font-size:13px;color:var(--ash-mute);margin-top:18px;padding-top:16px;border-top:1px dashed var(--iron)}
.locale-note{font-family:var(--display);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ash-mute);margin:-14px 0 22px}
.locale-note b{color:var(--ember);font-weight:600}

@media(max-width:860px){.tool-controls{grid-template-columns:1fr 1fr}}
@media(max-width:640px){.wrap{padding:36px 18px}.lesson{padding:22px 20px}.story .lead-para{font-size:19px}.site-rank{font-size:20px;min-width:32px}.share-box{padding:22px}.tool-controls{grid-template-columns:1fr}.tool{padding:22px 18px}}
@media (prefers-reduced-motion:reduce){.pulse{animation:none}}
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
    ${link('pledge.html', 'Pledge', 'pledge')}
    ${link('about.html', 'About', 'about')}
    ${link('amplify.html', 'Amplify', 'amplify')}
    ${link('index.html#guides', 'Guides', 'guides')}
    ${link('index.html#articles', 'Articles', 'articles')}
    ${link('best-drunk-driving-sites-to-follow.html', 'Follow', 'follow')}
  </nav>
</div></div>`;
}

function page({ title, description, schema, body, current, prefix = '' }) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#050308"><meta name="color-scheme" content="dark">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${FONTS}
${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ''}
<style>${CSS}</style></head>
<body>
${brandBar(current, prefix)}
${body}
<footer>© ${new Date().getFullYear()} Marketers Against Drunk Driving · Using marketing for good · <span style="color:var(--ember);font-weight:600">${CAMPAIGN}</span><br>Educational content only — not legal advice.</footer>
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

  <div class="hub-section" id="amplify">
    <h2>Post in 10 Seconds: The Amplify Tool</h2>
    <p class="lede">Care enough to say something, but never sure what to write? Pick your country, your state, and your platform and get a finished, copy-and-paste awareness post with the right hashtags — spun fresh every time so it's never duplicate content.</p>
    <a class="card" href="amplify.html" style="max-width:460px;border-top-color:var(--blood)">
      <div class="kicker">Free Tool</div>
      <h3>Amplify — Ready-to-Post DUI Awareness Copy</h3>
      <p>Choose a country + state + platform → copy → paste → post. Wording follows your country, hashtags follow your network, fresh on every spin.</p>
      <div class="meta">9 countries · 200+ states &amp; regions · 6 platforms · No sign-up</div>
    </a>
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

/* ---------------------------- AMPLIFY (post generator tool) ---------------------------- */
const AMPLIFY_DATA = {
  /**
   * Countries carry their own vocabulary. "Drunk driving" is American; the UK,
   * Ireland, Australia and New Zealand say "drink driving"; Canada's offence is
   * "impaired driving". Posting the wrong term reads foreign and kills the
   * share, so each country brings its own phrasing, subdivision label and
   * hashtag set.
   */
  countries: {
    us: {
      name: 'United States',
      regionLabel: 'State',
      term: '{drunk driving|impaired driving|driving under the influence}',
      plain: 'drunk driving',
      defaultRegion: 'California',
      hashtags: [
        '{#DUIAwareness|#StopDUI|#EndDrunkDriving}',
        '{#BuzzedDrivingIsDrunkDriving|#ThinkBeforeYouDrink|#PreventDrunkDriving}',
        '{#DesignatedDriver|#ArriveAlive|#PlanAheadForYourRide}',
      ],
      regions: [
        'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
        'District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
        'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota',
        'Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
        'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon',
        'Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah',
        'Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
      ],
    },
    ca: {
      name: 'Canada',
      regionLabel: 'Province or territory',
      term: '{impaired driving|drunk driving|driving while impaired}',
      plain: 'impaired driving',
      defaultRegion: 'Ontario',
      hashtags: [
        '{#ImpairedDriving|#StopImpairedDriving|#EndImpairedDriving}',
        '{#PlanYourRide|#ArriveAlive|#DesignatedDriver}',
        '{#RoadSafetyCanada|#SaferRoads|#ThinkBeforeYouDrink}',
      ],
      regions: [
        'Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador',
        'Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island',
        'Quebec','Saskatchewan','Yukon',
      ],
    },
    gb: {
      name: 'the United Kingdom',
      regionLabel: 'Nation',
      term: '{drink driving|drink-driving|driving over the limit}',
      plain: 'drink driving',
      defaultRegion: 'England',
      hashtags: [
        '{#DrinkDriving|#DontDrinkAndDrive|#StopDrinkDriving}',
        '{#NoneForTheRoad|#MorningAfter|#ThinkBeforeYouDrink}',
        '{#RoadSafety|#SaferRoads|#DriveSafe}',
      ],
      regions: ['England', 'Northern Ireland', 'Scotland', 'Wales'],
    },
    ie: {
      name: 'Ireland',
      regionLabel: 'County',
      term: '{drink driving|drink-driving|driving under the influence}',
      plain: 'drink driving',
      defaultRegion: 'Dublin',
      hashtags: [
        '{#DrinkDriving|#NeverEverDrinkAndDrive|#DontDrinkAndDrive}',
        '{#ArriveAlive|#SaferRoads|#RoadSafety}',
        '{#DesignatedDriver|#PlanTheRide|#ThinkBeforeYouDrink}',
      ],
      regions: [
        'Carlow','Cavan','Clare','Cork','Donegal','Dublin','Galway','Kerry','Kildare','Kilkenny',
        'Laois','Leitrim','Limerick','Longford','Louth','Mayo','Meath','Monaghan','Offaly',
        'Roscommon','Sligo','Tipperary','Waterford','Westmeath','Wexford','Wicklow',
      ],
    },
    au: {
      name: 'Australia',
      regionLabel: 'State or territory',
      term: '{drink driving|drink-driving|driving under the influence}',
      plain: 'drink driving',
      defaultRegion: 'New South Wales',
      hashtags: [
        '{#DrinkDriving|#DontDrinkAndDrive|#StopDrinkDriving}',
        '{#PlanBSavesLives|#DesignatedDriver|#PlanTheRide}',
        '{#RoadSafety|#ArriveAlive|#DriveSafe}',
      ],
      regions: [
        'Australian Capital Territory','New South Wales','Northern Territory','Queensland',
        'South Australia','Tasmania','Victoria','Western Australia',
      ],
    },
    nz: {
      name: 'New Zealand',
      regionLabel: 'Region',
      term: '{drink driving|drink-driving|driving under the influence}',
      plain: 'drink driving',
      defaultRegion: 'Auckland',
      hashtags: [
        '{#DrinkDriving|#DontDrinkAndDrive|#StopDrinkDriving}',
        '{#SoberDriver|#DesignatedDriver|#PlanTheRide}',
        '{#RoadSafety|#DriveSafe|#ArriveAlive}',
      ],
      regions: [
        'Auckland','Bay of Plenty','Canterbury','Gisborne',"Hawke's Bay",'Manawatu-Whanganui',
        'Marlborough','Nelson','Northland','Otago','Southland','Taranaki','Tasman','Waikato',
        'Wellington','West Coast',
      ],
    },
    za: {
      name: 'South Africa',
      regionLabel: 'Province',
      term: '{drunk driving|drinking and driving|driving under the influence}',
      plain: 'drunk driving',
      defaultRegion: 'Gauteng',
      hashtags: [
        '{#DrinkingAndDriving|#DontDrinkAndDrive|#StopDrunkDriving}',
        '{#ArriveAlive|#RoadSafety|#SaferRoads}',
        '{#DesignatedDriver|#PlanTheRide|#ThinkBeforeYouDrink}',
      ],
      regions: [
        'Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga',
        'North West','Northern Cape','Western Cape',
      ],
    },
    in: {
      name: 'India',
      regionLabel: 'State or union territory',
      term: '{drunk driving|drinking and driving|driving under the influence}',
      plain: 'drunk driving',
      defaultRegion: 'Maharashtra',
      hashtags: [
        '{#DrunkDriving|#DontDrinkAndDrive|#StopDrunkDriving}',
        '{#RoadSafety|#SaferRoads|#DriveSafe}',
        '{#DesignatedDriver|#ArriveAlive|#ThinkBeforeYouDrink}',
      ],
      regions: [
        'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
        'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
        'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
        'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
        'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
        'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
      ],
    },
    global: {
      name: 'your part of the world',
      regionLabel: 'Region',
      term: '{drunk driving|drink driving|impaired driving}',
      plain: 'drunk driving',
      defaultRegion: 'Europe',
      hashtags: [
        '{#DontDrinkAndDrive|#StopDrunkDriving|#EndDrunkDriving}',
        '{#RoadSafety|#SaferRoads|#DriveSafe}',
        '{#DesignatedDriver|#ArriveAlive|#PlanTheRide}',
      ],
      regions: [
        'Africa','Asia','Europe','Latin America','the Caribbean','the Middle East',
        'North America','Oceania',
      ],
    },
  },

  // Per-platform tone: how many hashtags feel native, a soft character budget,
  // and an optional spintax "lead" so posts read the way each network reads.
  platforms: {
    x: { name: 'X (Twitter)', hashtags: 2, limit: 280, lead: '' },
    instagram: { name: 'Instagram', hashtags: 5, limit: 2200, lead: '{📢 |🚗🖤 |🕯️ }' },
    facebook: { name: 'Facebook', hashtags: 2, limit: 2000, lead: '' },
    tiktok: { name: 'TikTok', hashtags: 3, limit: 2200, lead: '{👀 |🚦 |💯 }' },
    linkedin: { name: 'LinkedIn', hashtags: 2, limit: 3000, lead: '' },
    threads: { name: 'Threads', hashtags: 3, limit: 500, lead: '{🖤 |🚗 |}' },
  },

  /**
   * Templates are spintax. {{region}} takes the chosen state/province/county,
   * {{country}} the country name, and {{term}} the country's own word for the
   * offence — so the same template reads native in Ohio, Ontario and Oxford.
   * Keep {{term}} mid-sentence: it expands lowercase.
   */
  templates: [
    "{Every day|Every single day|Right now}, {{term}} {puts {{region}} families at risk|threatens someone on a {{region}} road|changes lives across {{region}}}. {We won't stay quiet.|We refuse to look away.|Not on our watch.} {Plan the ride.|Line up a sober driver.|Hand over the keys.}",
    '{To everyone driving in {{region}} tonight|{{region}}, this one is for you|If you are heading out in {{region}}}: {one drink too many can end a life|the safest ride is a sober one|no journey is worth a life}. {Call a ride|Text a friend|Make the responsible call} and {get home safe|protect the people you love|keep your community safe}.',
    '{Behind every {{region}} headline about {{term}} is a name|Every crash in {{region}} is preventable|These are not just {{region}} statistics — they are people}. {Help us turn awareness into action.|Share this and be the reason someone gets home tonight.|Be the friend who speaks up.}',
    '{Marketers are creative people|We build campaigns for a living|We know how to make a message travel} — {so we are aiming that reach at {{region}}|so we are pointing it straight at {{term}} in {{region}}|so we are using it to keep {{region}} roads safer}. {Join us.|Share the message.|Add your voice.}',
    '{A sober driver is a hero|A designated driver is a lifesaver|The best ride home is a sober one}. {{{region}}, tag the friend who always drives|Be that person for your crew in {{region}}|Make the plan before you head out in {{region}}} and {spread the word|help this reach further|keep everyone home}.',
    '{No text is worth it. No drink is worth it.|One decision protects everyone on the road.|Getting home safe starts before the first drink.} {Wherever you are going in {{region}}|On every {{region}} road|For every family in {{region}}}, {plan ahead and drive sober|choose the sober ride|make the call that gets everyone home}.',
    '{Someone in {{region}} is counting on you to get home safe|A whole {{region}} community is safer when you plan ahead|Your choice tonight ripples across {{region}}}. {Do not drink and drive.|Line up the ride first.|Keep the keys out of the wrong hands.} {It is that simple.|Every time.|No exceptions.}',
    '{{{region}} is not a statistic to us|We are not posting numbers, we are posting neighbours|Empty seats are the real cost of {{term}}}. {Across {{country}}|Everywhere in {{country}}|From one end of {{country}} to the other}, {the fix is the same|the answer has not changed|it comes down to one decision}: {plan the ride before the first drink|choose a sober driver|never get in the car with someone over the limit}.',
  ],

  // Hashtags every country shares, on top of its local set.
  sharedHashtags: [
    '{#DriveSober|#SoberDriving|#DriveSafe}',
    '{#RoadSafety|#SafeRoads|#EveryoneHomeSafe}',
  ],

  campaign: CAMPAIGN,
};

function renderAmplify() {
  const defaultCountry = 'us';
  const countryOptions = Object.entries(AMPLIFY_DATA.countries)
    .map(
      ([k, v]) =>
        `<option value="${k}"${k === defaultCountry ? ' selected' : ''}>${esc(
          k === 'global' ? 'Global / Other' : v.name.replace(/^the /, '')
        )}</option>`
    )
    .join('');
  const c0 = AMPLIFY_DATA.countries[defaultCountry];
  const regionOptions = c0.regions
    .map(
      (r) => `<option value="${esc(r)}"${r === c0.defaultRegion ? ' selected' : ''}>${esc(r)}</option>`
    )
    .join('');
  const platformOptions = Object.entries(AMPLIFY_DATA.platforms)
    .map(([k, v]) => `<option value="${k}">${esc(v.name)}</option>`)
    .join('');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'MADD Amplify — DUI Awareness Post Generator',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description:
      'Free tool: pick your country, state or region, and social platform to generate ready-to-post, copy-and-paste drunk-driving awareness posts with the right local wording and hashtags. Every post is spun for fresh, non-duplicate wording.',
  };

  const body = `
<header class="hero"><div class="hero-inner">
  <div class="eyebrow"><span class="pulse"></span>FREE TOOL · START POSTING</div>
  <h1>Amplify — <em>Ready-to-Post</em> Awareness Copy</h1>
  <div class="subtitle">Pick your country, your state, and your platform. Get a finished, copy-and-paste post with the right hashtags — spun fresh every time so nobody's posting duplicate content.</div>
  <p class="hero-tag">Care enough to say something? This does the writing for you. Choose, copy, paste, post. <span style="color:#fff;font-weight:600">${CAMPAIGN}</span></p>
</div></header>
<main class="wrap">
  <a class="backlink" href="index.html">← Back home</a>
  <p class="section-lede">The hardest part of speaking up is finding the words. So we wrote them. Choose where you are and the network you post on, and you'll get a native-sounding message plus a hashtag set built for that platform. The wording follows your country too — <em>drunk driving</em> in the States, <em>drink driving</em> in the UK, Ireland, Australia and New Zealand, <em>impaired driving</em> in Canada. Hit <em>Spin a fresh version</em> as many times as you like — the wording changes every time, so it never reads as copy-paste spam.</p>

  <div class="tool" id="amplify">
    <div class="tool-controls">
      <div class="field">
        <label for="countrySel">Country</label>
        <select id="countrySel">${countryOptions}</select>
      </div>
      <div class="field">
        <label for="regionSel" id="regionLabel">${esc(c0.regionLabel)}</label>
        <select id="regionSel">${regionOptions}</select>
      </div>
      <div class="field">
        <label for="platSel">Platform</label>
        <select id="platSel">${platformOptions}</select>
      </div>
    </div>

    <div class="out-block">
      <div class="out-head"><h4>Your post</h4><span class="char-count" id="charCount"></span></div>
      <textarea class="out-box" id="postBox" rows="5" spellcheck="false" aria-label="Generated post text"></textarea>
      <div class="tool-actions">
        <button class="t-btn spin" id="spinBtn" type="button">↻ Spin a fresh version</button>
        <button class="t-btn copy" id="copyPost" type="button">Copy post</button>
      </div>
    </div>

    <div class="out-block">
      <div class="out-head"><h4>Hashtags for this platform</h4></div>
      <textarea class="out-box hash-box" id="hashBox" rows="2" spellcheck="false" aria-label="Generated hashtags"></textarea>
      <div class="tool-actions">
        <button class="t-btn copy" id="copyHash" type="button">Copy hashtags</button>
        <button class="t-btn ghost" id="copyAll" type="button">Copy post + hashtags</button>
      </div>
      <div class="share-row">
        <span class="lbl">Or share now:</span>
        <a class="snip-btn x" id="shX" target="_blank" rel="noopener">Post on X</a>
        <a class="snip-btn fb" id="shFb" target="_blank" rel="noopener">Facebook</a>
        <a class="snip-btn li" id="shLi" target="_blank" rel="noopener">LinkedIn</a>
      </div>
    </div>

    <p class="tool-note" id="localeNote"></p>
    <p class="tool-note">Every post is generated in your browser and always carries <strong>${CAMPAIGN}</strong> so the message stays connected to the movement. Wording is educational and awareness-focused — always follow each platform's posting rules. This tool runs fully client-side, so it works anywhere this page is hosted.</p>
  </div>

  <div class="cta-band">
    <h2>One post is reach. A hundred posts is a movement.</h2>
    <p>Grab a fresh version, drop it in your feed, and pass this tool to a friend who cares as much as you do.</p>
    <span class="tag">${CAMPAIGN}</span>
  </div>
</main>
<script>
(function(){
  var DATA = ${JSON.stringify(AMPLIFY_DATA)};

  // Resolve spintax {a|b|c} groups, innermost first. Mirrors the backend engine.
  function spin(t){
    var re=/\\{([^{}]*)\\}/, out=t, guard=0;
    while(re.test(out)){
      out=out.replace(re,function(_m,body){
        var opts=body.split('|');
        return opts[Math.floor(Math.random()*opts.length)];
      });
      if(guard++>1000)break;
    }
    return out.replace(/\\s+/g,' ').trim();
  }

  var countrySel=document.getElementById('countrySel');
  var regionSel=document.getElementById('regionSel');
  var regionLabel=document.getElementById('regionLabel');
  var platSel=document.getElementById('platSel');
  var postBox=document.getElementById('postBox');
  var hashBox=document.getElementById('hashBox');
  var charCount=document.getElementById('charCount');
  var localeNote=document.getElementById('localeNote');

  function country(){ return DATA.countries[countrySel.value]; }

  function pickHashtags(n){
    // Local tags first so the post reads native, then the shared set.
    var pool=country().hashtags.concat(DATA.sharedHashtags);
    var seen={}, out=[], guard=0;
    while(out.length<n && guard<n*25){
      guard++;
      var tag=spin(pool[Math.floor(Math.random()*pool.length)]);
      if(!seen[tag.toLowerCase()]){ seen[tag.toLowerCase()]=1; out.push(tag); }
    }
    out.push(DATA.campaign);
    return out;
  }

  // Rebuild the state/province/region list whenever the country changes.
  function fillRegions(){
    var c=country();
    regionLabel.textContent=c.regionLabel;
    regionSel.innerHTML='';
    for(var i=0;i<c.regions.length;i++){
      var o=document.createElement('option');
      o.value=c.regions[i]; o.textContent=c.regions[i];
      if(c.regions[i]===c.defaultRegion) o.selected=true;
      regionSel.appendChild(o);
    }
  }

  function generate(){
    var c=country();
    var region=regionSel.value||c.defaultRegion;
    var plat=DATA.platforms[platSel.value];
    var tpl=DATA.templates[Math.floor(Math.random()*DATA.templates.length)];
    var lead=spin(plat.lead);
    var body=(lead?lead+' ':'')+tpl
      .split('{{region}}').join(region)
      .split('{{country}}').join(c.name)
      .split('{{term}}').join(c.term);
    postBox.value=spin(body);
    hashBox.value=pickHashtags(plat.hashtags).join(' ');
    localeNote.innerHTML='Tuned for <strong>'+c.name.replace(/^the /,'')+'</strong> — local wording ("'+c.plain+'") and hashtags people there actually use.';
    updateCount();
    updateShare();
  }

  function updateCount(){
    var full=postBox.value+' '+hashBox.value;
    var plat=DATA.platforms[platSel.value];
    var over=full.length>plat.limit;
    charCount.textContent=full.length+' / '+plat.limit+' chars';
    charCount.className='char-count'+(over?' over':'');
  }

  function updateShare(){
    var text=postBox.value+' '+hashBox.value;
    var url=location.origin+location.pathname.replace(/amplify\\.html$/,'');
    var enc=encodeURIComponent(text);
    var eu=encodeURIComponent(url);
    document.getElementById('shX').href='https://twitter.com/intent/tweet?text='+enc;
    document.getElementById('shFb').href='https://www.facebook.com/sharer/sharer.php?u='+eu+'&quote='+enc;
    document.getElementById('shLi').href='https://www.linkedin.com/sharing/share-offsite/?url='+eu;
  }

  function flash(btn,label){
    var orig=btn.textContent;
    btn.textContent=label||'Copied!';
    btn.classList.add('copied');
    setTimeout(function(){ btn.textContent=orig; btn.classList.remove('copied'); },1500);
  }
  function copy(txt,btn){
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(function(){flash(btn);},function(){legacy(txt,btn);});
    } else { legacy(txt,btn); }
  }
  function legacy(txt,btn){
    var ta=document.createElement('textarea');
    ta.value=txt; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); flash(btn); }catch(e){}
    document.body.removeChild(ta);
  }

  document.getElementById('spinBtn').addEventListener('click',generate);
  document.getElementById('copyPost').addEventListener('click',function(){copy(postBox.value,this);});
  document.getElementById('copyHash').addEventListener('click',function(){copy(hashBox.value,this);});
  document.getElementById('copyAll').addEventListener('click',function(){copy(postBox.value+'\\n\\n'+hashBox.value,this);});
  countrySel.addEventListener('change',function(){fillRegions();generate();});
  regionSel.addEventListener('change',generate);
  platSel.addEventListener('change',generate);
  postBox.addEventListener('input',function(){updateCount();updateShare();});
  hashBox.addEventListener('input',function(){updateCount();updateShare();});

  generate();
})();
</script>`;

  return page({
    title: 'Amplify — Ready-to-Post DUI Awareness Copy | MADD',
    description:
      'Free tool: pick your country, state or region, and social platform to get ready-to-post, copy-and-paste drunk-driving awareness posts with the right local wording and hashtags. Spun fresh every time — no duplicate content. #MarketersAgainstDrunkDriving',
    schema,
    body,
    current: 'amplify',
    prefix: '',
  });
}


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
writeFileSync(join(__dirname, 'amplify.html'), renderAmplify());
writeFileSync(join(__dirname, 'best-drunk-driving-sites-to-follow.html'), renderFollow());

/* ---------------------------- SITEMAP + ROBOTS ---------------------------- */
const BASE_URL = 'https://marketersagainstdrunkdriving.com';
const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: '', priority: '1.0', lastmod: today },
  { loc: 'pledge.html', priority: '0.9', lastmod: today },
  { loc: 'about.html', priority: '0.7', lastmod: today },
  { loc: 'amplify.html', priority: '0.9', lastmod: today },
  { loc: 'best-drunk-driving-sites-to-follow.html', priority: '0.8', lastmod: today },
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

## Tools
- [Amplify — Ready-to-Post DUI Awareness Copy](${BASE_URL}/amplify.html): Free client-side tool. Pick a country, a state or region, and a social platform to get copy-and-paste drunk-driving awareness posts with country-appropriate wording and platform-appropriate hashtags, spun fresh each time to avoid duplicate content.

## Resources
- [The 20 Best Drunk Driving Sites to Follow](${BASE_URL}/best-drunk-driving-sites-to-follow.html): A vetted list of reputable organizations, advocates, and data sources on drunk driving and road safety.
`;
writeFileSync(join(__dirname, 'llms.txt'), llms);

const total = guides.length + seoArticles.length + 4;
console.log(
  `✓ Built site: home + about + amplify + follow + ${guides.length} guides + ${seoArticles.length} articles = ${total} pages`
);
console.log(`✓ Wrote sitemap.xml (${urls.length} URLs) + robots.txt + llms.txt`);
