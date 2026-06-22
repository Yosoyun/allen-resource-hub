#!/usr/bin/env node
/**
 * build-catalogue.mjs — one-time/repeatable normaliser.
 * Transforms the legacy window.CATALOG (extracted to /tmp/cat_now.json or passed in)
 * into the normalized data/catalogue.json using the official-source registry and the
 * evidence-based link-health report. Deterministic; safe to re-run.
 *
 * Taxonomy fields (purpose/exams/classLevels/searchTerms…) are SEEDED here and refined
 * by the multilingual enrichment pass; verification is taken from real link-health data.
 */
import { readFile, writeFile } from 'node:fs/promises';

const SRC = process.argv[2] || '/tmp/cat_now.json';
const cat = JSON.parse(await readFile(SRC, 'utf8'));
const lh = JSON.parse(await readFile('reports/link-health.json', 'utf8'));
const sources = JSON.parse(await readFile('data/official-sources.json', 'utf8')).sources;
const lhByUrl = Object.fromEntries(lh.results.map(r => [r.url, r]));

const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const slug = (s) => s.toLowerCase().replace(/&amp;/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

// host -> sourceId
function sourceIdFor(url) {
  const h = host(url);
  if (url.startsWith('mailto:')) return 'email-allen';
  const map = {
    'allen.in': 'allen-in', 'news.allen.in': 'allen-news', 'astra.allen.in': 'allen-astra',
    'allen.ac.in': 'allen-ac-in', 'dlp.allen.ac.in': 'allen-dlp', 'estore.allen.ac.in': 'allen-estore',
    'myexam.allen.in': 'allen-myexam', 'student.allenbpms.in': 'allen-bpms',
    'allenchamp.com': 'allen-champ', 'allenglobalstudies.com': 'allen-global', 'acap.allenglobalstudies.com': 'allen-global',
    'allenoverseas.com': 'allen-overseas', 'digitalclass.allenoverseas.com': 'allen-overseas',
    'allenites.com': 'allenites', 'adhelp.myallendigital.com': 'allen-digital-help', 'myallendigital.com': 'allen-digital-help',
    'tallentex.com': 'tallentex', 'youtube.com': 'yt-allen', 'instagram.com': 'ig-allen', 'facebook.com': 'fb-allen',
    'x.com': 'x-allen', 'twitter.com': 'x-allen', 'linkedin.com': 'li-allen', 't.me': 'tg-allen',
    'threads.com': 'threads-allen', 'threads.net': 'threads-allen', 'pinterest.com': 'pinterest-allen', 'quora.com': 'quora-allen',
    'play.google.com': 'playstore-allen', 'apps.apple.com': 'appstore-allen', 'wa.me': 'wa-allen',
  };
  return map[h] || 'unknown';
}

function resourceTypeFor(sectionId, platform, name, url) {
  const n = name.toLowerCase();
  if (sectionId === 'start-here') return 'guidance-pointer';
  if (sectionId === 'youtube') return 'official-channel';
  if (sectionId === 'social') return 'official-channel';
  if (sectionId === 'programs') return 'course-page';
  if (platform === 'app') return 'mobile-app';
  if (/e-store/.test(n)) return 'store';
  if (/result|yesteryear/.test(n)) return 'result-page';
  if (/answer.?key/.test(n)) return 'result-page';
  if (/news|blog|exam news/.test(n)) return 'news';
  if (/login|control panel|status|bpms|astra|portal/.test(n)) return 'portal';
  if (/centre|center locator|centers/.test(n)) return 'centre-page';
  if (/contact|enquir|helpdesk|grievance|support|help center|whatsapp|email/.test(n)) return 'support-page';
  if (/career|job/.test(n)) return 'support-page';
  if (/tallentex|asat|scholarship|admission test|registration/.test(n)) return 'registration-page';
  if (sectionId === 'free-resources') return 'study-material';
  if (sectionId === 'support') return 'support-page';
  if (sectionId === 'scholarship') return 'registration-page';
  if (sectionId === 'official-web') return 'portal';
  return 'portal';
}

const SECTION_PURPOSE = {
  'start-here': ['course-discovery'],
  'official-web': ['login'],
  'programs': ['course-discovery', 'admission'],
  'youtube': ['study-material', 'social-channel'],
  'social': ['social-channel', 'official-news'],
  'free-resources': ['study-material'],
  'scholarship': ['scholarship-registration'],
  'support': ['support'],
};

function purposeFor(sectionId, rtype, name) {
  const n = name.toLowerCase();
  const out = new Set(SECTION_PURPOSE[sectionId] || ['course-discovery']);
  if (rtype === 'mobile-app') out.add('app-download');
  if (rtype === 'result-page') out.add('results');
  if (rtype === 'centre-page') out.add('centre-location');
  if (rtype === 'news') out.add('official-news');
  if (rtype === 'support-page') { out.add('support'); if (/technical|digital help/.test(n)) out.add('technical-help'); }
  if (/career|job/.test(n)) { out.clear(); out.add('careers'); }
  if (/alumni|allenites/.test(n)) { out.clear(); out.add('alumni'); }
  if (rtype === 'registration-page') out.add('scholarship-registration');
  if (rtype === 'portal' && /login|panel|status|bpms/.test(n)) { out.clear(); out.add('login'); }
  if (!out.size) out.add('support');
  return [...out];
}

function examsFor(streams, name) {
  const out = new Set();
  const n = name.toLowerCase();
  for (const s of (streams || [])) {
    if (s === 'jee') { out.add('jee-main'); if (/advanced/.test(n) || !/main\b/.test(n)) out.add('jee-advanced'); }
    else if (s === 'general') { /* skip from exams */ }
    else out.add(s);
  }
  return [...out];
}

function regionsFor(name) {
  const n = name.toLowerCase();
  if (/overseas|global|oman|gulf/.test(n)) return ['international'];
  if (/\bkota\b/.test(n)) return ['kota'];
  if (/jaipur/.test(n)) return ['jaipur'];
  if (/delhi/.test(n)) return ['delhi-ncr'];
  if (/bhopal/.test(n)) return ['bhopal'];
  if (/bengaluru|bangalore/.test(n)) return ['bengaluru'];
  return ['pan-india'];
}

function sessionsFor(name, url) {
  const t = (name + ' ' + url).toLowerCase();
  const out = [];
  if (/2025-26|apps2526/.test(t)) out.push('2025-26');
  if (/2026/.test(t) && !out.length) out.push('2026');
  return out;
}

function verificationFor(url, sourceStatus) {
  const r = lhByUrl[url];
  const base = { checkedAt: lh.checkedAt, method: 'automated-browser-get' };
  if (url.startsWith('mailto:')) return { status: 'verified', checkedAt: lh.checkedAt, method: 'n/a', notes: 'Email address; no HTTP check.' };
  if (!r) return { status: 'unverified', checkedAt: lh.checkedAt, method: 'none', notes: 'Not probed.' };
  base.httpStatus = r.httpStatus; base.finalUrl = r.finalUrl;
  if (r.class === 'ok') return { ...base, status: sourceStatus === 'legacy-official' ? 'verified-legacy' : 'verified' };
  if (r.class === 'redirect') return { ...base, status: 'redirected', notes: 'Redirects; review canonical.' };
  if (r.class === 'blocked') return { ...base, status: 'unverified', notes: 'Official source but host bot-blocks automated checks; manual review pending.' };
  if (r.class === 'broken') return { ...base, status: 'broken', notes: 'Returned 404 with a browser-grade request.' };
  if (r.class === 'server-error') return { ...base, status: 'temporarily-unavailable', notes: 'Server error at check time.' };
  if (r.class === 'unreachable') return { ...base, status: r.error && /ENOTFOUND/.test(r.error) ? 'broken' : 'temporarily-unavailable', notes: 'Network/TLS error: ' + (r.error || '') };
  return { ...base, status: 'unverified' };
}

const ids = new Set();
function uniqueId(base, platform) {
  let id = base; let i = 2;
  if (ids.has(id)) id = `${base}-${platform || ''}`.replace(/-$/, '');
  while (ids.has(id)) id = `${base}-${i++}`;
  ids.add(id); return id;
}

const PRIORITY = { 'start-here': 88, 'official-web': 82, 'programs': 86, 'youtube': 72, 'social': 52, 'free-resources': 80, 'scholarship': 76, 'support': 78 };

const resources = [];
for (const sec of cat.sections) {
  for (const it of sec.items) {
    const sid = sourceIdFor(it.url);
    const src = sources[sid];
    const sourceStatus = src ? src.status : 'unverified';
    const rtype = resourceTypeFor(sec.id, it.platform, it.name, it.url);
    const verification = verificationFor(it.url, sourceStatus);
    const sessions = sessionsFor(it.name, it.url);
    const lc = { status: 'active', validFrom: null, validUntil: null, replacementId: null, statusNote: '' };
    if (verification.status === 'broken') { lc.status = 'discontinued'; lc.statusNote = 'Link unavailable at last check; needs replacement.'; }
    else if (verification.status === 'temporarily-unavailable') { lc.status = 'paused'; lc.statusNote = verification.notes || ''; }
    else if (sessions.length || /tallentex|answer.?key/i.test(it.name)) { lc.status = 'seasonal'; lc.statusNote = 'Session/season-bound; re-verify each year.'; if (sessions.includes('2025-26')) lc.validUntil = '2026-03-31'; }

    const access = it.url.startsWith('mailto:') ? 'email'
      : /login|control panel|status|bpms|astra/i.test(it.name) ? 'login-required'
      : (rtype === 'registration-page') ? 'registration-required' : 'public';

    const audience = new Set(it.audience && it.audience.length ? it.audience : ['student', 'parent']);
    if (['course-page', 'guidance-pointer', 'registration-page'].includes(rtype)) audience.add('prospective-student');
    if (['portal'].includes(rtype) && access === 'login-required') audience.add('enrolled-student');

    const nameI18n = { en: it.name, hi: it.name_hi || it.name, ta: it.name_ta || it.name };
    const descI18n = { en: it.desc_en || it.name, hi: it.desc_hi || it.desc_en || it.name, ta: it.desc_ta || it.desc_en || it.name };
    const howI18n = (it.how_en || it.how_hi || it.how_ta) ? { en: it.how_en || '', hi: it.how_hi || it.how_en || '', ta: it.how_ta || it.how_en || '' } : undefined;

    const enTerms = [...new Set((it.name + ' ' + (it.desc_en || '')).toLowerCase().replace(/&amp;/g, ' ').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !['allen', 'the', 'for', 'and', 'with', 'official'].includes(w)))].slice(0, 8);

    const res = {
      id: uniqueId(slug(it.name), it.platform),
      name: nameI18n,
      description: descI18n,
      ...(howI18n ? { howToUse: howI18n } : {}),
      url: it.url,
      canonicalUrl: (verification.finalUrl && verification.finalUrl !== it.url && verification.status.startsWith('verified')) ? verification.finalUrl : it.url,
      sourceId: sid,
      officialStatus: src ? (sourceStatus === 'legacy-official' ? 'legacy-official' : 'official') : 'unverified',
      resourceType: rtype,
      purpose: purposeFor(sec.id, rtype, it.name),
      audience: [...audience],
      exams: examsFor(it.streams, it.name),
      classLevels: [],
      deliveryModes: /online|digital|dlp|ultimate/i.test(it.name) ? ['online'] : (sec.id === 'programs' ? ['classroom'] : []),
      regions: regionsFor(it.name),
      languagesAvailable: ['en'],
      academicSessions: sessions,
      access,
      platform: it.platform,
      aliasOf: null,
      ...(it.playlists_url ? { playlistsUrl: it.playlists_url } : {}),
      ...(it.playlists ? { playlists: it.playlists.map(p => ({ name: p.name, url: p.url, subject: p.subject || 'Other', verified: true, description: { en: p.desc_en || p.name, hi: p.desc_hi || p.desc_en || p.name, ta: p.desc_ta || p.desc_en || p.name } })) } : {}),
      searchTerms: { en: enTerms, hi: [], hiLatin: [], ta: [], taLatin: [] },
      verification,
      lifecycle: lc,
      featured: (['official-web', 'programs'].includes(sec.id) && /main website|jee|neet|pre-nurture/i.test(it.name)) || /tallentex/i.test(it.name),
      priority: PRIORITY[sec.id] || 50,
    };
    resources.push(res);
  }
}

// Link Start-Here guidance pointers to the canonical resource sharing their URL (aliasOf).
const normFull = (u) => (u || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/#.*$/, '').replace(/\/+$/, '');
const canonicalByUrl = new Map();
for (const r of resources) if (r.resourceType !== 'guidance-pointer') { const k = normFull(r.url); if (!canonicalByUrl.has(k)) canonicalByUrl.set(k, r.id); }
for (const r of resources) if (r.resourceType === 'guidance-pointer') { const t = canonicalByUrl.get(normFull(r.url)); if (t) r.aliasOf = t; }

// Apply known fixes for genuinely-broken links (brief: do not remove silently)
const fix = (idMatch, patch) => { const r = resources.find(x => idMatch(x)); if (r) Object.assign(r, patch); return r; };
fix(r => /@ALLENDigital$/.test(r.url), {
  lifecycle: { status: 'discontinued', validFrom: null, validUntil: null, replacementId: 'allen-digital', statusNote: 'YouTube handle @ALLENDigital returns 404 (renamed/removed). Use the ALLEN Digital website or ALLEN Online Official channel.' },
  verification: { status: 'broken', checkedAt: lh.checkedAt, httpStatus: 404, method: 'automated-browser-get', notes: 'Handle 404 on browser-grade GET 2026-06-22.' },
});
fix(r => /adhelp\.myallendigital\.com/.test(r.url), {
  lifecycle: { status: 'discontinued', validFrom: null, validUntil: null, replacementId: null, statusNote: 'Help-centre subdomain no longer resolves (DNS). Use ALLEN Digital website support.' },
});

const out = { version: '2.0.0-rebuild', generatedAt: lh.checkedAt, resources };
await writeFile('data/catalogue.json', JSON.stringify(out, null, 2));

const counts = {};
for (const r of resources) counts[r.verification.status] = (counts[r.verification.status] || 0) + 1;
process.stderr.write(`Wrote data/catalogue.json — ${resources.length} resources.\n`);
console.log(JSON.stringify({ resources: resources.length, verificationStatus: counts }, null, 2));
