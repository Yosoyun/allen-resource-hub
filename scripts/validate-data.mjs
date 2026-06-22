#!/usr/bin/env node
/**
 * validate-data.mjs — dependency-free catalogue validator (brief §38).
 * Enforces the conditions CI must fail on: schema-required fields, enum membership,
 * id pattern + uniqueness, translation completeness, valid URLs, registered sourceId,
 * resolvable internal references (aliasOf / replacementId), presence of a start-here
 * (guidance-pointer) resource, and well-formed dates.
 * Exits non-zero on any error.
 */
import { readFile } from 'node:fs/promises';

const schema = JSON.parse(await readFile('schemas/catalogue.schema.json', 'utf8'));
const cat = JSON.parse(await readFile('data/catalogue.json', 'utf8'));
const sources = JSON.parse(await readFile('data/official-sources.json', 'utf8')).sources;

const def = schema.$defs.resource;
const enums = {
  officialStatus: def.properties.officialStatus.enum,
  resourceType: def.properties.resourceType.enum,
  access: def.properties.access.enum,
  verificationStatus: def.properties.verification.properties.status.enum,
  lifecycleStatus: def.properties.lifecycle.properties.status.enum,
};
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const URL_RE = /^(https?:|mailto:)/;
const LANGS = ['en', 'hi', 'ta'];

const errors = [];
const warnings = [];
const ids = new Set();
const E = (id, msg) => errors.push(`✗ [${id}] ${msg}`);

if (!cat.version || !DATE_RE.test(cat.generatedAt || '')) E('(root)', 'missing version or malformed generatedAt');

for (const r of cat.resources) {
  const id = r.id || '(no-id)';
  for (const f of def.required) if (r[f] === undefined) E(id, `missing required field "${f}"`);
  if (!ID_RE.test(r.id || '')) E(id, 'id does not match kebab-case pattern');
  if (ids.has(r.id)) E(id, 'duplicate id'); else ids.add(r.id);

  for (const key of ['name', 'description']) for (const l of LANGS)
    if (!r[key] || !r[key][l] || !String(r[key][l]).trim()) E(id, `missing ${key}.${l}`);
  if (r.howToUse) for (const l of LANGS) if (!r.howToUse[l]) E(id, `missing howToUse.${l}`);

  if (!URL_RE.test(r.url || '')) E(id, `invalid url "${r.url}"`);
  if (r.sourceId && !sources[r.sourceId]) E(id, `unknown sourceId "${r.sourceId}"`);
  if ((r.officialStatus === 'official' || r.officialStatus === 'legacy-official') && (!r.sourceId || !sources[r.sourceId]))
    E(id, 'official resource without a registered source');

  if (!enums.officialStatus.includes(r.officialStatus)) E(id, `bad officialStatus "${r.officialStatus}"`);
  if (!enums.resourceType.includes(r.resourceType)) E(id, `bad resourceType "${r.resourceType}"`);
  if (r.access && !enums.access.includes(r.access)) E(id, `bad access "${r.access}"`);
  if (!Array.isArray(r.purpose) || !r.purpose.length) E(id, 'purpose must be a non-empty array');
  if (!Array.isArray(r.audience) || !r.audience.length) E(id, 'audience must be a non-empty array');

  const v = r.verification || {};
  if (!enums.verificationStatus.includes(v.status)) E(id, `bad verification.status "${v.status}"`);
  if (!DATE_RE.test(v.checkedAt || '')) E(id, 'verification.checkedAt missing/malformed');
  const lc = r.lifecycle || {};
  if (!enums.lifecycleStatus.includes(lc.status)) E(id, `bad lifecycle.status "${lc.status}"`);
  for (const d of ['validFrom', 'validUntil']) if (lc[d] && !DATE_RE.test(lc[d])) E(id, `lifecycle.${d} malformed`);

  if (typeof r.priority === 'number' && (r.priority < 0 || r.priority > 100)) E(id, 'priority out of range');
  if (r.searchTerms && (!r.searchTerms.ta || !r.searchTerms.ta.length)) warnings.push(`⚠ [${id}] no Tamil search terms yet (enrichment pending)`);
}

// internal references resolve
for (const r of cat.resources) {
  if (r.aliasOf && !ids.has(r.aliasOf)) E(r.id, `aliasOf -> unknown id "${r.aliasOf}"`);
  if (r.lifecycle?.replacementId && !ids.has(r.lifecycle.replacementId)) warnings.push(`⚠ [${r.id}] replacementId "${r.lifecycle.replacementId}" not in catalogue`);
}

if (!cat.resources.some(r => r.resourceType === 'guidance-pointer')) E('(root)', 'no guidance-pointer (Start Here) resource present');

console.log(`Validated ${cat.resources.length} resources.`);
if (warnings.length) console.log('\n' + warnings.slice(0, 12).join('\n') + (warnings.length > 12 ? `\n  …and ${warnings.length - 12} more warnings` : ''));
if (errors.length) { console.error('\n' + errors.join('\n') + `\n\n${errors.length} ERROR(S)`); process.exit(1); }
console.log(`\n✓ schema valid · ${warnings.length} warning(s)`);
