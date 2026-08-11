/**
 * MADD "Share to Care" — Live DUI Radar API (Cloudflare Pages Function)
 * ---------------------------------------------------------------------
 * Route:  POST /api/radar        Body: { "state": "Texas", "platform": "x" }
 *         GET  /api/radar        -> health check
 *
 * What it does, on demand, for ANY of the 50 states + DC:
 *   1. Pulls the latest drunk-driving news for that state from Google News
 *      (a free, no-key feed that already aggregates thousands of outlets).
 *   2. Filters + ranks incidents, worst first (fatalities > crashes > arrests).
 *   3. Sends the top headlines to OpenAI, which rewrites the lead incident into
 *      a FACTUAL, DE-IDENTIFIED, platform-native awareness post + hashtags.
 *
 * Secrets: set OPENAI_API_KEY (and optionally OPENAI_MODEL) as environment
 * variables in the Cloudflare Pages project (Settings -> Environment variables).
 * Nothing sensitive ever reaches the browser.
 */

const CAMPAIGN_TAG = '#MarketersAgainstDrunkDriving';

const HASHTAG_TARGETS = {
  x: 3, twitter: 3, instagram: 10, facebook: 3, tiktok: 5, linkedin: 4,
  tumblr: 12, blogger: 5, threads: 5, pinterest: 6, youtube: 5, reddit: 2,
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...CORS },
  });

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestGet() {
  return json({ ok: true, service: 'MADD DUI Radar', usage: 'POST { state, platform }' });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body = {};
  try { body = await request.json(); } catch (_) { /* tolerate empty body */ }

  const state = String(body.state || 'United States').trim();
  const platform = String(body.platform || 'x').trim().toLowerCase();
  const hashtagTarget = HASHTAG_TARGETS[platform] || 4;

  // 1. Pull free news for this state's DUI incidents (Google News + GDELT, merged).
  let incidents = [];
  try {
    incidents = await fetchIncidents(state);
  } catch (_) {
    incidents = [];
  }

  const lead = incidents[0] || null;
  const hasNews = incidents.length > 0;

  // 2. Rewrite with OpenAI (de-identified, factual). Falls back gracefully.
  let ai;
  try {
    ai = await rewriteWithOpenAI({ env, state, platform, hashtagTarget, incidents });
  } catch (err) {
    ai = fallbackPost({ state, platform, lead, reason: String(err && err.message || err) });
  }

  return json({
    ok: true,
    state,
    platform,
    hasNews,
    headline: lead ? lead.title : '',
    source: lead ? lead.source : '',
    url: lead ? lead.link : '',
    published: lead ? lead.pub : '',
    incidents: incidents.slice(0, 5).map((i) => ({ title: i.title, source: i.source, url: i.link, published: i.pub })),
    blurb: ai.blurb || '',
    post: ai.post || '',
    hashtags: normalizeHashtags(ai.hashtags),
    degraded: !!ai.degraded,
    generatedAt: new Date().toISOString(),
  });
}

/* --------------------------- news retrieval --------------------------- */

async function fetchIncidents(state) {
  // Query both free sources in parallel; either one alone is enough.
  const results = await Promise.allSettled([fetchGoogleNews(state), fetchGDELT(state)]);
  const raw = [];
  for (const r of results) if (r.status === 'fulfilled' && Array.isArray(r.value)) raw.push(...r.value);

  // Keep only DUI-relevant items, score by severity, de-dupe by title, sort worst+freshest first.
  const seen = new Set();
  const items = [];
  for (const it of raw) {
    const title = (it.title || '').trim();
    if (!title) continue;
    const low = title.toLowerCase();
    if (!/(dui|dwi|drunk|impaired|intoxicat)/.test(low)) continue;
    const key = low.replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    let score = 0;
    if (/(killed|dead|death|fatal|dies|died)/.test(low)) score += 5;
    if (/(crash|collision|wreck|head-on)/.test(low)) score += 2;
    if (/(charged|arrested|sentenced|guilty|convicted|pleads)/.test(low)) score += 2;
    items.push({ title, source: it.source || '', link: it.link || '', pub: it.pub || '', ts: it.ts || 0, score });
  }
  items.sort((a, b) => (b.score - a.score) || (b.ts - a.ts));
  return items;
}

async function fetchGoogleNews(state) {
  const q = encodeURIComponent(
    '("drunk driving" OR DUI OR DWI OR "impaired driving") (crash OR killed OR fatal OR charged OR arrested OR sentenced) "' + state + '"'
  );
  const rssUrl = 'https://news.google.com/rss/search?q=' + q + '&hl=en-US&gl=US&ceid=US:en';
  const xml = await fetchText(rssUrl, 12000, { 'User-Agent': 'Mozilla/5.0 (compatible; MADD-Radar/1.0; +https://marketersagainstdrunkdriving.com)' });
  const out = [];
  const blocks = xml.split('<item>').slice(1);
  for (const b of blocks) {
    const source = decodeEntities(matchSource(b));
    let title = decodeEntities(matchTag(b, 'title'));
    if (source && title.endsWith(' - ' + source)) title = title.slice(0, -(source.length + 3)).trim();
    const link = decodeEntities(matchTag(b, 'link'));
    const pub = decodeEntities(matchTag(b, 'pubDate'));
    out.push({ title, source, link, pub, ts: Date.parse(pub) || 0 });
  }
  return out;
}

async function fetchGDELT(state) {
  const q = encodeURIComponent('("drunk driving" OR DUI OR "impaired driving") sourcecountry:US "' + state + '"');
  const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=' + q + '&mode=ArtList&format=json&maxrecords=25&sort=DateDesc&timespan=14d';
  const text = await fetchText(url, 12000, { 'User-Agent': 'MADD-Radar/1.0' });
  let data;
  try { data = JSON.parse(text); } catch (_) { return []; }
  const arts = (data && data.articles) || [];
  return arts.map((a) => ({
    title: (a.title || '').trim(),
    source: a.domain || '',
    link: a.url || '',
    pub: gdeltDate(a.seendate),
    ts: gdeltTs(a.seendate),
  }));
}

function gdeltTs(s) {
  // GDELT seendate: 20260810T123000Z
  const m = String(s || '').match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return 0;
  return Date.parse(m[1] + '-' + m[2] + '-' + m[3] + 'T' + m[4] + ':' + m[5] + ':' + m[6] + 'Z') || 0;
}
function gdeltDate(s) {
  const ts = gdeltTs(s);
  return ts ? new Date(ts).toUTCString() : '';
}

async function fetchText(url, timeoutMs, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: headers || {} });
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function matchTag(block, tag) {
  const m = block.match(new RegExp('<' + tag + '>([\\s\\S]*?)</' + tag + '>'));
  return m ? m[1] : '';
}
function matchSource(block) {
  const m = block.match(/<source[^>]*>([\s\S]*?)<\/source>/);
  return m ? m[1] : '';
}
function decodeEntities(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '')
    .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, '').trim();
}

/* ----------------------------- AI rewrite ----------------------------- */

const SYSTEM_PROMPT =
  'You write short public-awareness social posts for Marketers Against Drunk Driving (MADD), a road-safety advocacy campaign. ' +
  'TONE: factual accountability. Direct and hard-hitting, but strictly grounded in what the headlines report. Never mocking or celebratory about death or injury. ' +
  'DE-IDENTIFY: never include any personal names of drivers, victims, or families. Refer to people only by role such as "a driver" or "the accused". City and state are allowed. ' +
  'PRE-CONVICTION: if someone is only charged or arrested, use "charged"/"alleged" language, never state guilt. ' +
  'Write for the given platform. Produce roughly the requested number of hashtags that fit that platform, and ALWAYS include ' + CAMPAIGN_TAG + ' as the final hashtag. ' +
  'If there are no recent incidents, write a general drunk-driving awareness post for that state instead. ' +
  'The "post" must be copy-paste ready and must NOT contain the hashtags inline (hashtags go only in the hashtags array). Keep X/Twitter posts under 240 characters. ' +
  'Respond ONLY with JSON: {"blurb": string, "post": string, "hashtags": string[]}.';

async function rewriteWithOpenAI({ env, state, platform, hashtagTarget, incidents }) {
  const apiKey = env && env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ...fallbackPost({ state, platform, lead: incidents[0] || null }), degraded: true };
  }
  const model = (env && env.OPENAI_MODEL) || 'gpt-4o-mini';

  const headlines = incidents.length
    ? incidents.slice(0, 5).map((it, i) => (i + 1) + '. ' + it.title + ' (' + (it.source || 'source') + ', ' + (it.pub || 'recent') + ')').join('\n')
    : 'NO_RECENT_INCIDENTS';

  const userMsg =
    'STATE: ' + state + '\n' +
    'PLATFORM: ' + platform + '\n' +
    'HASHTAG_TARGET: ' + hashtagTarget + '\n' +
    'RECENT_DUI_HEADLINES:\n' + headlines;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  let data;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMsg },
        ],
        temperature: 0.8,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error('OpenAI ' + res.status + ': ' + detail.slice(0, 200));
    }
    data = await res.json();
  } finally {
    clearTimeout(timer);
  }

  const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  let parsed = {};
  try { parsed = JSON.parse(content); } catch (_) { parsed = {}; }
  if (!parsed.post) throw new Error('Empty AI response');
  return { blurb: parsed.blurb || '', post: parsed.post || '', hashtags: parsed.hashtags || [] };
}

/* ----------------------------- fallbacks ----------------------------- */

function fallbackPost({ state, platform, lead }) {
  const base = lead
    ? 'Another impaired-driving headline out of ' + state + '. Behind every one of these is a person who did not have to be hurt. Plan the ride. Hand over the keys. Get everyone home.'
    : state + ', the safest ride home is always a sober one. Buzzed driving is drunk driving — line up a sober driver before the first drink and get everyone home.';
  const pool = ['#DriveSober', '#DUIAwareness', '#RoadSafety', '#DontDrinkAndDrive', '#ArriveAlive'];
  const n = Math.max(2, Math.min(HASHTAG_TARGETS[platform] || 3, pool.length));
  return { blurb: lead ? 'Recent drunk-driving news reported in ' + state + '.' : 'General awareness — no fresh incident pulled just now.', post: base, hashtags: pool.slice(0, n), degraded: true };
}

function normalizeHashtags(list) {
  let tags = Array.isArray(list) ? list.map((h) => String(h).trim()).filter(Boolean) : [];
  tags = tags.map((h) => (h.startsWith('#') ? h : '#' + h.replace(/^#+/, '')));
  if (!tags.some((h) => h.toLowerCase() === CAMPAIGN_TAG.toLowerCase())) tags.push(CAMPAIGN_TAG);
  return tags;
}
