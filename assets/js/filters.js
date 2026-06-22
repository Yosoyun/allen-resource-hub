// filters.js — filter state, URL <-> state sync, and resource matching.
export const FKEYS = ['q', 'audience', 'exam', 'purpose', 'region', 'mode', 'class', 'platform', 'verified', 'active', 'view'];
export const state = { q: '', audience: '', exam: '', purpose: '', region: '', mode: '', class: '', platform: '', verified: false, active: false, view: 'home' };

export function fromURL() {
  const p = new URLSearchParams(location.search);
  for (const k of FKEYS) {
    if (k === 'verified' || k === 'active') state[k] = p.get(k) === '1';
    else state[k] = p.get(k) || (k === 'view' ? 'home' : '');
  }
  return state;
}
export function toURL(replace = false) {
  const p = new URLSearchParams(location.search);
  const lang = p.get('lang');
  const np = new URLSearchParams();
  if (lang) np.set('lang', lang);
  for (const k of FKEYS) {
    const v = state[k];
    if (k === 'verified' || k === 'active') { if (v) np.set(k, '1'); }
    else if (v && !(k === 'view' && v === 'home')) np.set(k, v);
  }
  const url = location.pathname + (np.toString() ? '?' + np.toString() : '');
  history[replace ? 'replaceState' : 'pushState']({}, '', url);
}
export function anyStructured() {
  return !!(state.q || state.audience || state.exam || state.purpose || state.region || state.mode || state.class || state.platform || state.verified || state.active);
}
export function reset() {
  for (const k of FKEYS) state[k] = (k === 'verified' || k === 'active') ? false : (k === 'view' ? 'home' : '');
}

const isVerified = (r) => /^verified/.test(r.verification?.status || '');
const isActive = (r) => ['active', 'seasonal'].includes(r.lifecycle?.status || 'active');

export function matches(r) {
  if (r.aliasOf) return false; // pointers don't appear as separate results
  if (state.audience && !(r.audience || []).includes(state.audience)) return false;
  if (state.exam && !(r.exams || []).includes(state.exam)) return false;
  if (state.purpose && !(r.purpose || []).includes(state.purpose)) return false;
  if (state.platform && r.platform !== state.platform) return false;
  if (state.class && (r.classLevels || []).length && !(r.classLevels || []).includes(state.class)) return false;
  if (state.region) { const rg = r.regions || []; if (!rg.includes(state.region) && !rg.includes('pan-india')) return false; }
  if (state.mode && state.mode !== 'either') { const dm = r.deliveryModes || []; if (dm.length && !dm.includes(state.mode)) return false; }
  if (state.verified && !isVerified(r)) return false;
  if (state.active && !isActive(r)) return false;
  return true;
}
