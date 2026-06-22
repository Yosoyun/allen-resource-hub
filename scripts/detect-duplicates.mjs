#!/usr/bin/env node
/**
 * detect-duplicates.mjs (brief §13). Flags duplicate IDs and duplicate normalized URLs.
 * A duplicate URL is allowed ONLY when one record declares `aliasOf` the other
 * (e.g. Start-Here guidance pointers that intentionally reuse a course/contact URL).
 * Writes reports/duplicates.json. Exits non-zero on unapproved duplicates.
 */
import { readFile, writeFile } from 'node:fs/promises';

const cat = JSON.parse(await readFile('data/catalogue.json', 'utf8'));
// Keep significant query params (e.g. Play Store ?id=); strip only fragments,
// trailing slash, and known tracking params (brief §13).
const TRACKING = /^(utm_|fbclid|gclid|igshid|si|feature)$/i;
const normUrl = (u) => {
  let s = (u || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/#.*$/, '');
  const qi = s.indexOf('?');
  if (qi >= 0) {
    const path = s.slice(0, qi).replace(/\/+$/, '');
    const kept = s.slice(qi + 1).split('&').filter(p => p && !TRACKING.test(p.split('=')[0])).sort();
    return kept.length ? `${path}?${kept.join('&')}` : path;
  }
  return s.replace(/\/+$/, '');
};

const byId = new Map();
const byUrl = new Map();
for (const r of cat.resources) {
  byId.set(r.id, (byId.get(r.id) || 0) + 1);
  const k = normUrl(r.url);
  if (!byUrl.has(k)) byUrl.set(k, []);
  byUrl.get(k).push(r);
}

const dupIds = [...byId.entries()].filter(([, n]) => n > 1).map(([id]) => id);
const urlClusters = [...byUrl.entries()].filter(([, rs]) => rs.length > 1)
  .map(([url, rs]) => ({ url, ids: rs.map(r => r.id), approved: rs.some(r => r.aliasOf) || allAliasLinked(rs) }));

function allAliasLinked(rs) {
  // approved if every record except one points (aliasOf) at a record in the cluster
  const ids = new Set(rs.map(r => r.id));
  const aliased = rs.filter(r => r.aliasOf && ids.has(r.aliasOf));
  return aliased.length >= rs.length - 1 && rs.length > 1;
}

const unapproved = urlClusters.filter(c => !c.approved);
const report = { checkedAt: cat.generatedAt, duplicateIds: dupIds, urlClusters, unapprovedUrlDuplicates: unapproved };
await writeFile('reports/duplicates.json', JSON.stringify(report, null, 2));

console.log(`Duplicate scan: ${dupIds.length} duplicate id(s), ${urlClusters.length} shared-URL cluster(s), ${unapproved.length} unapproved.`);
for (const c of urlClusters) console.log(`  ${c.approved ? '✓ alias' : '✗ DUP  '} ${c.url}  [${c.ids.join(', ')}]`);

if (dupIds.length || unapproved.length) {
  console.error(`\n✗ ${dupIds.length} duplicate ids, ${unapproved.length} unapproved URL duplicates. Mark intentional reuse with "aliasOf".`);
  process.exit(1);
}
console.log('\n✓ no unapproved duplicates');
