/**
 * Daily drunk-driving ticker generator.
 *
 * Runs once each morning (via GitHub Action). For each of 50 states it pulls a
 * city-scoped local-news RSS feed, filters for serious drunk-driving crashes
 * (fatalities and near-fatal injuries), ranks the worst, and writes the top 10
 * as respectful, state-level, copy/paste social share boxes into
 * site/data/daily.json. No API keys, no database — pure RSS + spintax.
 *
 * Run: node scripts/daily-ticker.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Output path is configurable so the same script works in the repo (writes to
// site/data/daily.json) and on SiteGround (point TICKER_OUT_DIR at public_html/data).
const OUT_DIR = process.env.TICKER_OUT_DIR || join(__dirname, '..', 'site', 'data');
const OUT_FILE = join(OUT_DIR, 'daily.json');

const CAMPAIGN_HASHTAG = '#marketersagainstdrunkdriving';

/* One major city per state. Feeds are Google News RSS scoped to the city/state
 * and the drunk-driving topic — free, keyless, and easy to swap for a specific
 * local-outlet RSS URL later by editing the `feed` field. */
const STATES = [
  { code: 'AL', name: 'Alabama', city: 'Birmingham' },
  { code: 'AK', name: 'Alaska', city: 'Anchorage' },
  { code: 'AZ', name: 'Arizona', city: 'Phoenix' },
  { code: 'AR', name: 'Arkansas', city: 'Little Rock' },
  { code: 'CA', name: 'California', city: 'Los Angeles' },
  { code: 'CO', name: 'Colorado', city: 'Denver' },
  { code: 'CT', name: 'Connecticut', city: 'Bridgeport' },
  { code: 'DE', name: 'Delaware', city: 'Wilmington' },
  { code: 'FL', name: 'Florida', city: 'Miami' },
  { code: 'GA', name: 'Georgia', city: 'Atlanta' },
  { code: 'HI', name: 'Hawaii', city: 'Honolulu' },
  { code: 'ID', name: 'Idaho', city: 'Boise' },
  { code: 'IL', name: 'Illinois', city: 'Chicago' },
  { code: 'IN', name: 'Indiana', city: 'Indianapolis' },
  { code: 'IA', name: 'Iowa', city: 'Des Moines' },
  { code: 'KS', name: 'Kansas', city: 'Wichita' },
  { code: 'KY', name: 'Kentucky', city: 'Louisville' },
  { code: 'LA', name: 'Louisiana', city: 'New Orleans' },
  { code: 'ME', name: 'Maine', city: 'Portland' },
  { code: 'MD', name: 'Maryland', city: 'Baltimore' },
  { code: 'MA', name: 'Massachusetts', city: 'Boston' },
  { code: 'MI', name: 'Michigan', city: 'Detroit' },
  { code: 'MN', name: 'Minnesota', city: 'Minneapolis' },
  { code: 'MS', name: 'Mississippi', city: 'Jackson' },
  { code: 'MO', name: 'Missouri', city: 'Kansas City' },
  { code: 'MT', name: 'Montana', city: 'Billings' },
  { code: 'NE', name: 'Nebraska', city: 'Omaha' },
  { code: 'NV', name: 'Nevada', city: 'Las Vegas' },
  { code: 'NH', name: 'New Hampshire', city: 'Manchester' },
  { code: 'NJ', name: 'New Jersey', city: 'Newark' },
  { code: 'NM', name: 'New Mexico', city: 'Albuquerque' },
  { code: 'NY', name: 'New York', city: 'New York City' },
  { code: 'NC', name: 'North Carolina', city: 'Charlotte' },
  { code: 'ND', name: 'North Dakota', city: 'Fargo' },
  { code: 'OH', name: 'Ohio', city: 'Columbus' },
  { code: 'OK', name: 'Oklahoma', city: 'Oklahoma City' },
  { code: 'OR', name: 'Oregon', city: 'Portland' },
  { code: 'PA', name: 'Pennsylvania', city: 'Philadelphia' },
  { code: 'RI', name: 'Rhode Island', city: 'Providence' },
  { code: 'SC', name: 'South Carolina', city: 'Charleston' },
  { code: 'SD', name: 'South Dakota', city: 'Sioux Falls' },
  { code: 'TN', name: 'Tennessee', city: 'Nashville' },
  { code: 'TX', name: 'Texas', city: 'Houston' },
  { code: 'UT', name: 'Utah', city: 'Salt Lake City' },
  { code: 'VT', name: 'Vermont', city: 'Burlington' },
  { code: 'VA', name: 'Virginia', city: 'Virginia Beach' },
  { code: 'WA', name: 'Washington', city: 'Seattle' },
  { code: 'WV', name: 'West Virginia', city: 'Charleston' },
  { code: 'WI', name: 'Wisconsin', city: 'Milwaukee' },
  { code: 'WY', name: 'Wyoming', city: 'Cheyenne' },
];

function feedUrl(state) {
  const q = `("drunk driving" OR DUI OR "impaired driving" OR "drunk driver") ` +
    `(crash OR killed OR fatal OR dead OR collision OR injured) ` +
    `("${state.city}" OR "${state.name}") when:2d`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
}

/* ----------------------------- tiny spintax ----------------------------- */
function spin(template) {
  const group = /\{([^{}]*)\}/;
  let out = template, guard = 0;
  while (group.test(out)) {
    out = out.replace(group, (_m, body) => {
      const opts = body.split('|');
      return opts[Math.floor(Math.random() * opts.length)];
    });
    if (guard++ > 1000) break;
  }
  return out.replace(/\s+/g, ' ').trim();
}

/* --------------------------- RSS fetch + parse -------------------------- */
const UA = 'Mozilla/5.0 (compatible; MADDTickerBot/1.0; +https://marketersagainstdrunkdriving.com)';

async function fetchFeed(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: controller.signal });
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

function decode(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : '';
}

function parseItems(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const rawTitle = decode(tag(block, 'title'));
    let outlet = decode(tag(block, 'source'));
    let title = rawTitle;
    // Google News titles are "Headline - Outlet"; split the trailing outlet off.
    const dash = rawTitle.lastIndexOf(' - ');
    if (dash > 0) {
      title = rawTitle.slice(0, dash).trim();
      if (!outlet) outlet = rawTitle.slice(dash + 3).trim();
    }
    items.push({
      title,
      link: decode(tag(block, 'link')),
      desc: decode(tag(block, 'description')),
      pubDate: decode(tag(block, 'pubDate')),
      outlet: outlet || '',
    });
  }
  return items;
}

/* --------------------------- relevance + severity ---------------------- */
const ALCOHOL = /\b(dui|dwi|drunk[ -]?driv|impaired driv|intoxicat|drunk driver|alcohol|owi)\b/i;
const CRASH = /\b(crash|collision|wreck|killed|dead|dies|died|death|fatal|injur|critical|hospitaliz|struck|pedestrian)\b/i;
const WORD_NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 };

function deathCount(text) {
  const t = text.toLowerCase();
  let n = 0;
  const num = t.match(/(\d+)\s+(?:people|persons?|victims?|teens?|men|women|adults?|kids?|children|killed|dead|dies|died)\D{0,18}(?:killed|dead|dies|died|fatal)/);
  if (num) n = parseInt(num[1], 10);
  if (!n) {
    const word = t.match(/\b(one|two|three|four|five|six|seven|eight|nine)\b\D{0,18}(?:killed|dead|died|dies)/);
    if (word) n = WORD_NUM[word[1]] || 0;
  }
  if (!n && /\b(killed|dead|dies|died|fatal|claims? (?:a )?life|loses? (?:his|her|their) life)\b/.test(t)) n = 1;
  return n;
}

function classify(item) {
  const text = `${item.title} ${item.desc}`;
  if (!ALCOHOL.test(text) || !CRASH.test(text)) return null;
  const deaths = deathCount(text);
  const injured = /\b(injur|critical|hospitaliz|hurt|wounded)\b/i.test(text);
  let severity = 'incident', label = 'Crash', rank = 3;
  if (deaths > 0) { severity = 'fatality'; label = deaths > 1 ? `${deaths} Killed` : 'Fatal'; rank = 1; }
  else if (injured) { severity = 'serious-injury'; label = 'Serious Injury'; rank = 2; }
  else return null; // keep only fatalities / near-death
  return { ...item, deaths, severity, severityLabel: label, rank };
}

/* ------------------------------ share text ----------------------------- */
// Returns the un-spun spintax template ({a|b|c} groups intact) so the website
// can spin a fresh original variation in the browser on demand.
function shareTemplate(state, incident) {
  const intro = '{A drunk driving crash|An impaired-driving crash|A DUI crash|A drunk driver}';
  const place = `in ${state.name}`;
  const when = '{this week|in recent days|days ago}';
  const outcome = incident.deaths >= 2
    ? `{claimed|took} ${incident.deaths} lives`
    : incident.severity === 'fatality'
      ? '{claimed a life|ended a life|killed someone}'
      : '{left someone fighting for their life|critically hurt someone|nearly killed someone}';
  const truth = '{It was 100% preventable.|None of this had to happen.|Not one bit of it was an accident of fate.|This was preventable.}';
  const cta = '{Plan a sober ride.|Hand over the keys.|Call a ride tonight.|Be the reason someone gets home.}';
  const tail = '{Share this so the next one doesn’t happen.|Pass it on.|Let it travel.}';
  return `${intro} ${place} ${when} ${outcome}. ${truth} ${cta} ${tail} ${CAMPAIGN_HASHTAG}`;
}

/* -------------------------------- main --------------------------------- */
async function run() {
  console.log(`Scanning ${STATES.length} states for drunk-driving crashes...`);
  const found = [];

  // Process in small chunks to be polite to the source.
  for (let i = 0; i < STATES.length; i += 6) {
    const chunk = STATES.slice(i, i + 6);
    const results = await Promise.all(chunk.map(async (state) => {
      const xml = await fetchFeed(feedUrl(state));
      const items = parseItems(xml).map(classify).filter(Boolean);
      // Best single incident per state (worst severity, most deaths, newest).
      items.sort((a, b) => a.rank - b.rank || b.deaths - a.deaths);
      const best = items[0];
      return best ? { state, incident: best } : null;
    }));
    for (const r of results) if (r) found.push(r);
    await new Promise((res) => setTimeout(res, 800));
  }

  // Rank states by severity and pick the 10 worst.
  found.sort((a, b) => a.incident.rank - b.incident.rank || b.incident.deaths - a.incident.deaths);
  const top = found.slice(0, 10);

  const boxes = top.map(({ state, incident }) => {
    const spintaxTemplate = shareTemplate(state, incident);
    return {
      state: state.code,
      stateName: state.name,
      city: state.city,
      severity: incident.severity,
      severityLabel: incident.severityLabel,
      deaths: incident.deaths,
      headline: incident.title,
      sourceUrl: incident.link,
      sourceOutlet: incident.outlet,
      spintaxTemplate,
      shareText: spin(spintaxTemplate),
    };
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    statesScanned: STATES.length,
    statesWithReports: found.length,
    count: boxes.length,
    boxes,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${boxes.length} share boxes (${found.length} states had reports) -> ${OUT_FILE}`);
}

run().catch((err) => {
  console.error('Daily ticker failed:', err);
  process.exit(1);
});
