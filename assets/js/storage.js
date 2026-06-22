// storage.js — local-only utilities (no accounts). Safe if localStorage is unavailable.
const KEY = { saved: 'arh_saved', recent: 'arh_recent' };
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const Saved = {
  list: () => read(KEY.saved),
  has: (id) => read(KEY.saved).includes(id),
  toggle(id) {
    const s = read(KEY.saved); const i = s.indexOf(id);
    if (i >= 0) s.splice(i, 1); else s.unshift(id);
    write(KEY.saved, s.slice(0, 100)); return s.includes(id);
  },
  clear: () => write(KEY.saved, []),
};
export const Recent = {
  list: () => read(KEY.recent),
  push(id) { const r = read(KEY.recent).filter(x => x !== id); r.unshift(id); write(KEY.recent, r.slice(0, 12)); },
};
