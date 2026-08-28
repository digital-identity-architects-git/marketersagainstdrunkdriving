/**
 * Service × industry matrix.
 *
 * SERVICES are what we sell. INDUSTRIES are who we sell it to. Every
 * industry names the services it should carry, so the matrix stays
 * deliberate instead of a cartesian blowout of thin pages.
 *
 * Each industry carries enough real detail (buyer, cycle, objection,
 * proof, FAQs) that a generated page reads like it was written for that
 * vertical and nothing else.
 */

export const CATEGORIES = [
  { slug: 'legal', name: 'Law Firms', blurb: 'Practice-area marketing for firms that live or die on signed cases.' },
  { slug: 'aesthetics', name: 'Aesthetics & Wellness', blurb: 'Med spas, clinics and studios selling elective, cash-pay treatments.' },
  { slug: 'design', name: 'Architecture & Design', blurb: 'Firms that win work on portfolio, reputation and long relationships.' },
  { slug: 'trades', name: 'Home Services & Trades', blurb: 'Contractors competing on the map pack and the phone call.' },
  { slug: 'agriculture', name: 'Agriculture & Agribusiness', blurb: 'Growers, ranchers, dealers and ag suppliers — an under-marketed vertical.' },
  { slug: 'healthcare', name: 'Healthcare & Dental', blurb: 'Practices balancing patient acquisition against compliance.' },
  { slug: 'b2b', name: 'B2B, Industrial & Tech', blurb: 'Long cycles, technical buyers, small search volume that converts hard.' },
  { slug: 'professional', name: 'Professional Services', blurb: 'Advisors and agencies sold on credibility, not price.' },
  { slug: 'automotive', name: 'Automotive', blurb: 'High-intent local search with brutal competition.' },
  { slug: 'hospitality', name: 'Hospitality & Local', blurb: 'Venues and operators that live on discovery and reviews.' },
];

/**
 * Services. `tier` decides how widely a service is rolled out:
 *   core     — generated for every industry
 *   extended — generated only for industries that opt in via `services`
 */
export const SERVICES = [
  {
    slug: 'seo',
    name: 'SEO',
    tier: 'core',
    label: (i) => `SEO for ${i.plural}`,
    promise: (i) => `Rank for the searches ${i.customer} actually run before they call anyone.`,
    deliverables: [
      'Keyword and intent map built around how buyers in your vertical actually search',
      'Technical audit and fixes — crawl, speed, indexation, schema',
      'Service and location page architecture that supports the whole practice',
      'Internal linking that concentrates authority on the pages that earn revenue',
      'Monthly reporting tied to leads, not vanity rank charts',
    ],
  },
  {
    slug: 'local-seo',
    name: 'Local SEO',
    tier: 'core',
    label: (i) => `Local SEO for ${i.plural}`,
    promise: (i) => `Own the map pack in every market you serve.`,
    deliverables: [
      'Google Business Profile setup, optimization and ongoing posting',
      'Citation cleanup and NAP consistency across the directories that matter',
      'Location pages built per market, not spun per zip code',
      'Review generation systems that keep a steady, credible flow',
      'Local rank tracking on a grid, not a single office pin',
    ],
  },
  {
    slug: 'content-marketing',
    name: 'Content Marketing',
    tier: 'core',
    label: (i) => `Content Marketing for ${i.plural}`,
    promise: (i) => `Answer the questions ${i.customer} ask before they are ready to buy.`,
    deliverables: [
      'Topical map covering the full decision journey in your vertical',
      'Editorial calendar with a publishing cadence you can actually sustain',
      'Long-form pieces written by someone who understands the subject matter',
      'Internal linking and content refresh cycles so old work keeps earning',
      'Conversion paths built into the content, not bolted on after',
    ],
  },
  {
    slug: 'seo-blogging',
    name: 'SEO Blogging',
    tier: 'core',
    label: (i) => `SEO Blogging Services for ${i.plural}`,
    promise: (i) => `A publishing engine that compounds instead of a blog nobody reads.`,
    deliverables: [
      'Keyword-mapped article queue, prioritized by difficulty against your authority',
      'Briefs that specify angle, entities, internal links and the intent being served',
      'Drafting, editing and on-page optimization',
      'Publishing, schema and indexation follow-through',
      'Quarterly refresh pass on decaying posts',
    ],
  },
  {
    slug: 'web-design',
    name: 'Web Design',
    tier: 'core',
    label: (i) => `Web Design for ${i.plural}`,
    promise: (i) => `A site that converts the traffic you already have.`,
    deliverables: [
      'Information architecture mapped to how your buyers evaluate you',
      'Fast, accessible builds that pass Core Web Vitals on real devices',
      'Conversion-focused service pages, not a brochure',
      'Tracking, call attribution and form analytics wired in from day one',
      'A CMS your team can actually update without breaking the layout',
    ],
  },
  {
    slug: 'google-business-profile',
    name: 'Google Business Profile',
    tier: 'core',
    label: (i) => `Google Business Profile Management for ${i.plural}`,
    promise: (i) => `The listing that earns the call, maintained weekly.`,
    deliverables: [
      'Full profile buildout — categories, services, attributes, products',
      'Weekly posting calendar tuned to your vertical',
      'Photo and video cadence that keeps the listing active',
      'Q&A seeding and review response in your voice',
      'Suspension prevention and reinstatement support if it happens',
    ],
  },
  {
    slug: 'reputation-management',
    name: 'Reputation Management',
    tier: 'extended',
    label: (i) => `Reputation Management for ${i.plural}`,
    promise: (i) => `Keep the star rating that decides whether the phone rings.`,
    deliverables: [
      'Review generation workflow built into your existing operations',
      'Response drafting for every review, good and bad',
      'Monitoring across Google, industry directories and social',
      'Negative-review triage and escalation playbook',
      'Review schema so the stars show up in search results',
    ],
  },
  {
    slug: 'social-media',
    name: 'Social Media',
    tier: 'extended',
    label: (i) => `Social Media Marketing for ${i.plural}`,
    promise: (i) => `Show the work in the places your buyers already scroll.`,
    deliverables: [
      'Channel strategy — the two platforms that matter, not all seven',
      'Content calendar built from work you are already doing',
      'Short-form video direction and editing',
      'Community management and DM-to-lead handoff',
      'Reporting on booked work, not impressions',
    ],
  },
  {
    slug: 'lead-generation',
    name: 'Lead Generation',
    tier: 'extended',
    label: (i) => `Lead Generation for ${i.plural}`,
    promise: (i) => `Qualified inbound, measured to the signed job.`,
    deliverables: [
      'ICP definition and offer positioning',
      'Landing pages built per campaign and per market',
      'Call tracking, form routing and CRM handoff',
      'Speed-to-lead automation so nothing sits in an inbox',
      'Cost-per-signed-job reporting, not cost-per-click',
    ],
  },
  {
    slug: 'email-marketing',
    name: 'Email Marketing',
    tier: 'extended',
    label: (i) => `Email Marketing for ${i.plural}`,
    promise: (i) => `Stay in front of the buyers who are not ready yet.`,
    deliverables: [
      'Lifecycle mapping across the full buying window',
      'Nurture sequences written for a long, considered decision',
      'Segmentation by service line, market and stage',
      'Reactivation campaigns against your dormant list',
      'Deliverability setup — SPF, DKIM, DMARC, warmup',
    ],
  },
];

export const SERVICE_BY_SLUG = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));
export const CORE_SERVICES = SERVICES.filter((s) => s.tier === 'core').map((s) => s.slug);
