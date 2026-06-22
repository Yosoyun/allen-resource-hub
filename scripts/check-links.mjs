#!/usr/bin/env node
/**
 * check-links.mjs — evidence-based link-health checker.
 *
 * Reads a catalogue JSON (new normalized shape: { resources:[{id,url,...}] }
 * OR legacy shape: { sections:[{ items:[{name,url,...}] }] }) and probes every
 * unique URL: HTTP status, redirect chain final URL, response time.
 *
 * Writes reports/link-health.json. Never mutates the catalogue.
 *
 * Usage: node scripts/check-links.mjs [path-to-catalogue.json]
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const SRC = process.argv[2] || 'data/catalogue.json';
const OUT = 'reports/link-health.json';
const CONCURRENCY = 10;
const TIMEOUT_MS = 12000;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 ALLENResourceHub-LinkCheck/1.0';

function collectUrls(data) {
  const urls = new Set();
  const push = (u) => { if (u && /^https?:/i.test(u)) urls.add(u); };
  if (Array.isArray(data.resources)) {
    for (const r of data.resources) { push(r.url); if (r.playlists_url) push(r.playlists_url); for (const p of (r.playlists || [])) push(p.url); }
  }
  if (Array.isArray(data.sections)) {
    for (const s of data.sections) for (const it of (s.items || [])) {
      push(it.url); if (it.playlists_url) push(it.playlists_url); for (const p of (it.playlists || [])) push(p.url);
    }
  }
  return [...urls];
}

// Domains that aggressively bot-block: a non-2xx here means "could not auto-verify",
// NOT "broken". We never call these broken on a status alone.
const BOT_BLOCKING = /(^|\.)(instagram\.com|facebook\.com|x\.com|twitter\.com|linkedin\.com|quora\.com|t\.me|threads\.com|threads\.net|pinterest\.com|wa\.me|whatsapp\.com|play\.google\.com|apps\.apple\.com)$/i;
function hostOf(u) { try { return new URL(u).hostname; } catch { return ''; } }

function classify(url, httpStatus, error) {
  const blocked = BOT_BLOCKING.test(hostOf(url));
  if (httpStatus >= 200 && httpStatus < 300) return 'ok';
  if (httpStatus >= 300 && httpStatus < 400) return 'redirect';
  if (error || httpStatus === 0) return blocked ? 'blocked' : 'unreachable';
  if ([401, 403, 429, 999, 400, 406].includes(httpStatus)) return 'blocked';
  if ([404, 410].includes(httpStatus)) return blocked ? 'blocked' : 'broken';
  if (httpStatus >= 500) return blocked ? 'blocked' : 'server-error';
  return 'other';
}

async function probe(url) {
  const t0 = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // Browser-grade GET: many official sites (e.g. allen.ac.in WAF) 404 on HEAD or
    // non-text Accept. We GET, then cancel the body so we don't download full pages.
    const res = await fetch(url, {
      method: 'GET', redirect: 'follow', signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.9' },
    });
    try { await res.body?.cancel(); } catch { /* ignore */ }
    const ms = Date.now() - t0;
    const finalUrl = res.url || url;
    const redirected = res.redirected || finalUrl.replace(/\/$/, '') !== url.replace(/\/$/, '');
    return { url, httpStatus: res.status, finalUrl, redirected, ms, class: classify(url, res.status, null), error: null };
  } catch (e) {
    const err = e.name === 'AbortError' ? 'timeout' : (e.cause?.code || e.message || String(e));
    return { url, httpStatus: 0, finalUrl: url, redirected: false, ms: Date.now() - t0, class: classify(url, 0, err), error: err };
  } finally { clearTimeout(timer); }
}

async function pool(items, n, fn) {
  const out = []; let i = 0;
  const workers = Array.from({ length: n }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx); }
  });
  await Promise.all(workers);
  return out;
}

const data = JSON.parse(await readFile(SRC, 'utf8'));
const urls = collectUrls(data);
process.stderr.write(`Probing ${urls.length} URLs (concurrency ${CONCURRENCY})...\n`);
const results = await pool(urls, CONCURRENCY, async (u, idx) => {
  const r = await probe(u);
  process.stderr.write(`  [${idx + 1}/${urls.length}] ${r.httpStatus || 'ERR'} ${u}${r.error ? ' (' + r.error + ')' : ''}\n`);
  return r;
});

const by = (c) => results.filter(r => r.class === c).length;
const summary = {
  total: results.length,
  ok: by('ok'),
  redirect: by('redirect'),
  blocked: by('blocked'),          // official but bot-blocks automated checks — needs manual confirm
  broken: by('broken'),            // genuine 404/410 on a non-blocking host
  serverError: by('server-error'),
  unreachable: by('unreachable'),
  other: by('other'),
};
await mkdir('reports', { recursive: true });
await writeFile(OUT, JSON.stringify({ checkedAt: new Date().toISOString().slice(0, 10), source: SRC, summary, results }, null, 2));
process.stderr.write(`\nWrote ${OUT}\n`);
console.log(JSON.stringify(summary, null, 2));
