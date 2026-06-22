// search.js — lightweight multilingual search across en/hi/ta + romanised terms.
const norm = (s) => (s || '').toString().toLowerCase().trim();
const tokens = (s) => norm(s).split(/[\s,./|–—-]+/).filter(Boolean);

function editDistance1(a, b) {
  if (a === b) return true;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
  }
  return true;
}

let INDEX = [];
export function buildIndex(resources) {
  INDEX = resources.map(r => {
    const nameStr = [r.name?.en, r.name?.hi, r.name?.ta].filter(Boolean).join(' ');
    const descStr = [r.description?.en, r.description?.hi, r.description?.ta].filter(Boolean).join(' ');
    const st = r.searchTerms || {};
    const termList = [...(st.en || []), ...(st.hi || []), ...(st.hiLatin || []), ...(st.ta || []), ...(st.taLatin || []), ...(r.exams || []), ...(r.purpose || [])];
    return {
      id: r.id, priority: r.priority || 50,
      nameTok: new Set(tokens(nameStr)), nameStr: norm(nameStr),
      descStr: norm(descStr),
      termTok: new Set(termList.map(norm)), termStr: termList.map(norm).join(' '),
    };
  });
  return INDEX;
}

export function search(query) {
  const qs = tokens(query);
  if (!qs.length) return null;
  const scored = [];
  for (const e of INDEX) {
    let score = 0, hitAll = true;
    for (const q of qs) {
      let best = 0;
      if (e.nameTok.has(q)) best = 6;
      else if (e.termTok.has(q)) best = 5;
      else if (e.nameStr.includes(q)) best = 4;
      else if (e.termStr.includes(q)) best = 3;
      else if (e.descStr.includes(q)) best = 2;
      else if (q.length >= 4 && ([...e.nameTok, ...e.termTok].some(tk => editDistance1(tk, q)))) best = 1;
      if (best === 0) hitAll = false;
      score += best;
    }
    // single word: any match; multi-word: every word must match somewhere (precision)
    if (score > 0 && (qs.length === 1 || hitAll)) scored.push({ id: e.id, score: score + e.priority / 1000 });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.id);
}
