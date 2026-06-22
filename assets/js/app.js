// app.js — ALLEN Resource Hub (task-oriented, renders from data/catalogue.json)
import { initLang, getLang, setLang, onLang, isFirstVisit, t, pick, label, setTaxonomies, LANGS, NATIVE } from './i18n.js';
import { Saved, Recent } from './storage.js';
import { buildIndex, search } from './search.js';
import * as F from './filters.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const REPO = 'https://github.com/Yosoyun/allen-resource-hub';

let DATA = { resources: [] }, BY = new Map(), TAX = null;

const TASKS = ['course-discovery', 'login', 'centre-location', 'app-download', 'study-material', 'scholarship-registration', 'results', 'support'];
const TASK_ICON = { 'course-discovery': '🎓', login: '🔐', 'centre-location': '📍', 'app-download': '📱', 'study-material': '📚', 'scholarship-registration': '🏆', results: '📊', support: '☎️' };
const EXAMS = ['jee-main', 'jee-advanced', 'neet', 'foundation', 'olympiad', 'ntse', 'abroad'];
const WHO = ['student', 'parent', 'enrolled-student', 'prospective-student', 'teacher'];

const BADGE = {
  verified: 'ok', 'verified-legacy': 'info', 'verified-regional': 'info', redirected: 'info',
  'registration-required': 'warn', 'temporarily-unavailable': 'danger', historical: 'muted', unverified: 'warn', broken: 'danger',
};
const fmtDate = (d) => { if (!d) return ''; const [y, m, day] = d.split('-'); const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][(+m) - 1] || m; return `${+day} ${mon} ${y}`; };

/* ---------------- boot ---------------- */
async function boot() {
  initLang();
  document.documentElement.lang = getLang();
  try {
    const [cat, tax] = await Promise.all([
      fetch('data/catalogue.json').then(r => r.json()),
      fetch('data/taxonomies.json').then(r => r.json()),
    ]);
    DATA = cat; TAX = tax; setTaxonomies(tax);
  } catch (e) {
    $('#app').innerHTML = `<div class="wrap" style="padding:60px 0"><p>Could not load resources. Please refresh.</p></div>`;
    return;
  }
  BY = new Map(DATA.resources.map(r => [r.id, r]));
  buildIndex(DATA.resources);
  F.fromURL();
  setLang(getLang()); // sets title/meta
  onLang(() => render());
  window.addEventListener('popstate', () => { F.fromURL(); render(); });
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  render();
}

/* ---------------- view router ---------------- */
function render() {
  const view = F.state.view;
  const main = $('#app');
  let html = header();
  if (view === 'saved') html += savedView();
  else if (F.anyStructured()) html += resultsView();
  else html += homeView();
  html += footer();
  main.innerHTML = html;
  // restore search box value
  const sb = $('#searchInput'); if (sb && F.state.q) sb.value = F.state.q;
  syncLangButtons();
}

/* ---------------- header ---------------- */
function header() {
  return `<a class="skip" href="#main">${esc(t('home'))}</a>
  <header class="site"><div class="wrap bar">
    <a class="brand" href="?" data-act="home" aria-label="${esc(t('brand'))}">
      <span class="logo">A</span><span class="name">${esc(t('brand'))}<small>${esc(t('brandSub'))}</small></span>
    </a>
    <span class="grow"></span>
    <button class="iconbtn tipdown" data-act="saved" data-tip="${esc(t('savedHeading'))}" aria-label="${esc(t('savedHeading'))}">★<span class="cnt" ${Saved.list().length ? '' : 'hidden'}>${Saved.list().length}</span></button>
    <button class="iconbtn tipdown" data-act="share" data-tip="${esc(t('share'))}" aria-label="${esc(t('share'))}">⤴</button>
    <div class="lang-switch" role="group" aria-label="Language">
      ${LANGS.map(l => `<button data-act="lang" data-val="${l}" data-lang="${l}" aria-pressed="${getLang() === l}">${l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'த'}</button>`).join('')}
    </div>
  </div></header>`;
}

/* ---------------- home ---------------- */
function homeView() {
  const featured = DATA.resources.filter(r => r.featured && !r.aliasOf).sort((a, b) => b.priority - a.priority).slice(0, 6);
  const recent = Recent.list().map(id => BY.get(id)).filter(Boolean).slice(0, 4);
  return `<main id="main"><div class="wrap">
    ${isFirstVisit() ? langChoose() : ''}
    <section class="hero">
      <h1>${esc(t('heroPrompt'))}</h1>
      <p class="sub">${esc(t('heroSub'))}</p>
      <div class="searchrow">
        <label class="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input id="searchInput" type="search" autocomplete="off" placeholder="${esc(t('searchPh'))}" aria-label="${esc(t('searchPh'))}"></label>
        <button class="btn primary" data-act="finder">✨ ${esc(t('guided'))}</button>
      </div>
    </section>

    <section class="block"><h2>${esc(t('tasksHeading'))}</h2>
      <div class="task-grid">
        ${TASKS.map(p => `<button class="task" data-act="task" data-val="${p}"><span class="ico">${TASK_ICON[p]}</span><span>${esc(t('tasks.' + p))}</span></button>`).join('')}
      </div>
    </section>

    ${recent.length ? `<section class="block"><h2>${esc(t('recently'))}</h2><div class="grid">${recent.map(card).join('')}</div></section>` : ''}

    <section class="block"><h2>${esc(t('browseFeatured'))}</h2><div class="grid">${featured.map(card).join('')}</div></section>

    <section class="block"><h2>${esc(t('browseByExam'))}</h2><div class="chips">
      ${EXAMS.map(e => `<button class="chip" data-act="exam" data-val="${e}">${esc(label('exam', e))}</button>`).join('')}
    </div></section>

    <section class="block"><h2>${esc(t('browseByUser'))}</h2><div class="chips">
      ${WHO.map(w => `<button class="chip" data-act="audience" data-val="${w}">${esc(t('who.' + w))}</button>`).join('')}
    </div></section>

    <section class="block"><h2>${esc(t('browsePurpose'))}</h2><div class="chips">
      ${TASKS.map(p => `<button class="chip" data-act="task" data-val="${p}">${esc(t('tasks.' + p))}</button>`).join('')}
    </div></section>

    ${trustNote()}
  </div></main>`;
}

function langChoose() {
  return `<div class="lang-choose"><span class="lc-label">🌐 English · हिन्दी · தமிழ் — ${esc(t('chooseLang'))}</span>
    <div class="lc-btns">${LANGS.map(l => `<button class="langbtn" data-act="lang" data-val="${l}" data-lang="${l}" aria-pressed="${getLang() === l}">${NATIVE[l]}</button>`).join('')}</div></div>`;
}

/* ---------------- results ---------------- */
function currentResults() {
  let ids;
  if (F.state.q) { const s = search(F.state.q); ids = s ? s.filter(id => F.matches(BY.get(id))) : []; }
  else ids = DATA.resources.filter(F.matches).sort((a, b) => b.priority - a.priority).map(r => r.id);
  return ids.map(id => BY.get(id)).filter(Boolean);
}

function resultsView() {
  const list = currentResults();
  const chips = activeChips();
  return `<main id="main"><div class="wrap results">
    <div class="rtoolbar">
      <button class="btn ghost" data-act="home">← ${esc(t('home'))}</button>
      <strong>${list.length} ${esc(t('results'))}</strong>
      ${chips.length ? `<span class="active-chips">${chips.join('')}</span><button class="btn link" data-act="clear">${esc(t('clear'))}</button>` : ''}
      <span class="grow"></span>
      <button class="btn ghost only-mobile" data-act="toggle-filters">⛃ ${esc(t('filters'))}</button>
    </div>
    <div class="rlayout">
      <aside class="filters-panel" id="filtersPanel">${filtersPanel()}</aside>
      <div class="grid rgrid">
        ${list.length ? list.map(card).join('') : emptyState()}
      </div>
    </div>
  </div></main>`;
}

function emptyState() {
  return `<div class="empty"><div class="e">🔍</div><h3>${esc(t('noResults'))}</h3><p>${esc(t('noResultsHint'))}</p><button class="btn" data-act="clear">${esc(t('clear'))}</button></div>`;
}

function activeChips() {
  const out = [];
  const add = (key, txt) => out.push(`<button class="achip" data-act="unset" data-key="${key}">${esc(txt)} ✕</button>`);
  if (F.state.q) add('q', `“${F.state.q}”`);
  if (F.state.audience) add('audience', t('who.' + F.state.audience) || F.state.audience);
  if (F.state.exam) add('exam', label('exam', F.state.exam));
  if (F.state.purpose) add('purpose', t('tasks.' + F.state.purpose) || F.state.purpose);
  if (F.state.region) add('region', regionLabel(F.state.region));
  if (F.state.mode) add('mode', label('deliveryMode', F.state.mode));
  if (F.state.class) add('class', t('cls.' + F.state.class) || F.state.class);
  if (F.state.verified) add('verified', t('verifiedOnly'));
  if (F.state.active) add('active', t('activeOnly'));
  return out;
}

function filtersPanel() {
  const grp = (title, key, vals, lbl) => `<div class="fg"><h4>${esc(title)}</h4><div class="chips sm">
    ${vals.map(v => `<button class="chip ${F.state[key] === v ? 'on' : ''}" data-act="set" data-key="${key}" data-val="${v}" aria-pressed="${F.state[key] === v}">${esc(lbl(v))}</button>`).join('')}</div></div>`;
  return `
    ${grp(t('q_who'), 'audience', WHO, v => t('who.' + v))}
    ${grp(t('examLabel'), 'exam', EXAMS, v => label('exam', v))}
    ${grp(t('purposeLabel'), 'purpose', TASKS, v => t('tasks.' + v))}
    ${grp(t('regionLabel'), 'region', regionIds(), v => regionLabel(v))}
    ${grp(t('modeLabel'), 'mode', ['classroom', 'online'], v => label('deliveryMode', v))}
    ${grp(t('q_class'), 'class', ['6', '7', '8', '9', '10', '11', '12', 'dropper'], v => t('cls.' + v) === ('cls.' + v) ? v : t('cls.' + v))}
    <div class="fg"><div class="chips sm">
      <button class="chip ${F.state.verified ? 'on' : ''}" data-act="bool" data-key="verified" aria-pressed="${F.state.verified}">✓ ${esc(t('verifiedOnly'))}</button>
      <button class="chip ${F.state.active ? 'on' : ''}" data-act="bool" data-key="active" aria-pressed="${F.state.active}">${esc(t('activeOnly'))}</button>
    </div></div>`;
}

let REGIONS = null;
function regionIds() { return ['pan-india', 'kota', 'tamil-nadu', 'bengaluru', 'delhi-ncr', 'international']; }
function regionLabel(id) {
  const m = { 'pan-india': { en: 'Online / Pan-India', hi: 'ऑनलाइन / पूरे भारत', ta: 'ஆன்லைன் / அகில இந்தியா' }, 'kota': { en: 'Kota', hi: 'कोटा', ta: 'கோட்டா' }, 'tamil-nadu': { en: 'Tamil Nadu', hi: 'तमिलनाडु', ta: 'தமிழ்நாடு' }, 'bengaluru': { en: 'Bengaluru', hi: 'बेंगलुरु', ta: 'பெங்களூரு' }, 'delhi-ncr': { en: 'Delhi NCR', hi: 'दिल्ली NCR', ta: 'டெல்லி NCR' }, 'international': { en: 'International', hi: 'अंतरराष्ट्रीय', ta: 'சர்வதேச' } };
  return pick(m[id]) || id;
}

/* ---------------- card ---------------- */
function metaRow(lbl, val) { return val ? `<div class="mrow"><span>${esc(lbl)}</span><b>${esc(val)}</b></div>` : ''; }

function card(r) {
  const L = getLang();
  const st = r.verification?.status || 'unverified';
  const bcls = BADGE[st] || 'muted';
  const showDate = /^verified|redirected/.test(st) && r.verification?.checkedAt;
  const badge = `<span class="badge ${bcls}">${st === 'verified' ? '✓ ' : ''}${esc(t('badge.' + st) || st)}${showDate ? ` · ${esc(fmtDate(r.verification.checkedAt))}` : ''}</span>`;
  const saved = Saved.has(r.id);
  const examTxt = (r.exams || []).slice(0, 3).map(e => label('exam', e)).join(' · ');
  const purpTxt = (r.purpose || []).slice(0, 2).map(p => t('tasks.' + p) === ('tasks.' + p) ? p : t('tasks.' + p)).join(' · ');
  const audTxt = (r.audience || []).slice(0, 3).map(a => t('who.' + a) === ('who.' + a) ? a : t('who.' + a)).join(' · ');
  const regionTxt = (r.regions || []).filter(x => x !== 'pan-india').map(regionLabel).join(' · ');
  const reportUrl = `${REPO}/issues/new?labels=link-health&title=${encodeURIComponent('[link] ' + r.name?.en + ' (' + r.id + ')')}`;
  const playlists = r.playlists && r.playlists.length ? `<details class="pl"><summary>${esc(t('badge.verified'))} · ${r.playlists.length} ${esc(t('results'))}</summary><div class="pl-list">
      ${r.playlists.map(p => `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer"><span class="sub">${esc(p.subject || '')}</span><span>${esc(pick(p.description) || p.name)}</span></a>`).join('')}
      ${r.playlistsUrl ? `<a href="${esc(r.playlistsUrl)}" target="_blank" rel="noopener noreferrer"><span class="sub">★</span><span>${esc(t('openShort'))}</span></a>` : ''}</div></details>` : '';

  return `<article class="rcard ${st === 'broken' || st === 'temporarily-unavailable' ? 'dim' : ''}">
    <div class="rc-top">${badge}</div>
    <h3>${esc(pick(r.name))}</h3>
    <p class="desc">${esc(pick(r.description))}</p>
    ${r.howToUse ? `<p class="how"><b>${esc(t('openShort'))}:</b> ${esc(pick(r.howToUse))}</p>` : ''}
    ${playlists}
    <div class="meta">
      ${metaRow(t('forLabel'), audTxt)}
      ${examTxt ? metaRow(t('examLabel'), examTxt) : ''}
      ${metaRow(t('purposeLabel'), purpTxt)}
      ${regionTxt ? metaRow(t('regionLabel'), regionTxt) : ''}
      ${r.academicSessions && r.academicSessions.length ? metaRow(t('session'), r.academicSessions.join(', ')) : ''}
    </div>
    <div class="rc-actions">
      <a class="btn primary sm" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" data-act="open" data-id="${esc(r.id)}">${esc(t('openShort'))} →</a>
      <button class="btn ghost sm" data-act="copy" data-id="${esc(r.id)}" title="${esc(t('copy'))}">⧉</button>
      <button class="btn ghost sm save ${saved ? 'on' : ''}" data-act="save" data-id="${esc(r.id)}" title="${esc(t('save'))}">${saved ? '★' : '☆'}</button>
      <a class="btn ghost sm" href="${esc(reportUrl)}" target="_blank" rel="noopener noreferrer" title="${esc(t('report'))}">⚑</a>
    </div>
  </article>`;
}

/* ---------------- saved ---------------- */
function savedView() {
  const list = Saved.list().map(id => BY.get(id)).filter(Boolean);
  return `<main id="main"><div class="wrap results">
    <div class="rtoolbar"><button class="btn ghost" data-act="home">← ${esc(t('home'))}</button><strong>${esc(t('savedHeading'))}</strong></div>
    ${list.length ? `<div class="grid rgrid">${list.map(card).join('')}</div>` : `<div class="empty"><div class="e">★</div><p>${esc(t('emptySaved'))}</p></div>`}
  </div></main>`;
}

/* ---------------- guided finder ---------------- */
const STEPS = [
  { key: 'who', q: 'q_who', opts: ['student', 'parent', 'teacher', 'enrolled-student', 'prospective-student'], lbl: v => t('who.' + v) },
  { key: 'class', q: 'q_class', opts: ['6-8', '9-10', '11', '12', 'dropper', 'college-other'], lbl: v => t('cls.' + v) },
  { key: 'goal', q: 'q_goal', opts: ['jee-main', 'jee-advanced', 'neet', 'foundation', 'olympiad', 'board', 'scholarship', 'abroad', 'general'], lbl: v => t('goal.' + v) },
  { key: 'mode', q: 'q_mode', opts: ['classroom', 'online', 'either'], lbl: v => t('mode.' + v) },
  { key: 'region', q: 'q_region', opts: ['pan-india', 'kota', 'tamil-nadu', 'bengaluru', 'delhi-ncr', 'international'], lbl: v => regionLabel(v) },
  { key: 'do', q: 'q_do', opts: ['course-discovery', 'admission', 'login', 'app-download', 'study-material', 'support'], lbl: v => t('doing.' + v) },
];
let finder = null;

function openFinder() { finder = { step: 0, ans: {} }; paintFinder(); }
function paintFinder() {
  let host = $('#finder'); if (!host) { host = document.createElement('div'); host.id = 'finder'; document.body.appendChild(host); }
  if (!finder) { host.innerHTML = ''; return; }
  if (finder.done) { host.innerHTML = finderResult(); return; }
  const s = STEPS[finder.step];
  host.innerHTML = `<div class="modal-bg" data-act="finder-close"></div>
    <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(t('finderTitle'))}">
      <div class="modal-h"><strong>${esc(t('finderTitle'))}</strong><span class="step">${esc(t('finderStep'))} ${finder.step + 1} ${esc(t('finderOf'))} ${STEPS.length}</span><button class="x" data-act="finder-close" aria-label="close">✕</button></div>
      <div class="prog"><i style="width:${((finder.step + 1) / STEPS.length) * 100}%"></i></div>
      <h3>${esc(t(s.q))}</h3>
      <div class="opts">${s.opts.map(o => `<button class="opt ${finder.ans[s.key] === o ? 'on' : ''}" data-act="finder-pick" data-val="${o}">${esc(s.lbl(o))}</button>`).join('')}</div>
      <div class="modal-f"><button class="btn link" data-act="finder-restart">${esc(t('restart'))}</button><span class="grow"></span>
        <button class="btn primary" data-act="finder-next" ${finder.ans[s.key] ? '' : 'disabled'}>${finder.step === STEPS.length - 1 ? esc(t('finish')) : esc(t('next'))}</button></div>
    </div>`;
}

function recommend(ans) {
  const clsMap = { '6-8': ['6', '7', '8'], '9-10': ['9', '10'], '11': ['11'], '12': ['12'], dropper: ['dropper'], 'college-other': ['college-other'] };
  const wantCls = clsMap[ans.class] || [];
  const exam = ans.goal && ans.goal !== 'general' ? ans.goal : null;
  const scored = DATA.resources.filter(r => !r.aliasOf && r.lifecycle?.status !== 'discontinued').map(r => {
    let s = (r.priority || 50) / 100;
    if (ans.who && (r.audience || []).includes(ans.who)) s += 3;
    if (exam && (r.exams || []).includes(exam)) s += 3;
    if (ans.do && (r.purpose || []).includes(ans.do)) s += 3;
    if (ans.mode && ans.mode !== 'either' && (r.deliveryModes || []).includes(ans.mode)) s += 2;
    if (ans.region && (r.regions || []).includes(ans.region)) s += 1;
    if (ans.region === 'pan-india' && (r.regions || []).includes('pan-india')) s += 1;
    if (wantCls.length && (r.classLevels || []).some(c => wantCls.includes(c))) s += 1;
    if (/^verified/.test(r.verification?.status || '')) s += 0.5;
    return { r, s };
  }).filter(x => x.s > 1).sort((a, b) => b.s - a.s);
  const top = scored.map(x => x.r);
  const primary = top[0];
  const alt = top.find(r => r !== primary);
  const app = top.find(r => r.resourceType === 'mobile-app');
  const support = top.find(r => (r.purpose || []).includes('support')) || DATA.resources.find(r => (r.purpose || []).includes('support'));
  const free = top.find(r => r.resourceType === 'study-material');
  return { primary, alt, app, support, free, count: top.length };
}

function finderResult() {
  const rec = recommend(finder.ans);
  const block = (lblKey, r) => r ? `<div class="reco-item"><span class="reco-lbl">${esc(t(lblKey))}</span>${card(r)}</div>` : '';
  return `<div class="modal-bg" data-act="finder-close"></div>
    <div class="modal wide" role="dialog" aria-modal="true">
      <div class="modal-h"><strong>${esc(t('recoTitle'))}</strong><button class="x" data-act="finder-close">✕</button></div>
      ${rec.primary ? '' : `<p class="muted">${esc(t('recoNone'))}</p>`}
      ${block('recoPrimary', rec.primary)}
      ${block('recoAlt', rec.alt)}
      ${rec.app && rec.app !== rec.primary && rec.app !== rec.alt ? block('tasks.app-download', rec.app) : ''}
      ${rec.free && rec.free !== rec.primary && rec.free !== rec.alt ? block('tasks.study-material', rec.free) : ''}
      ${rec.support ? block('tasks.support', rec.support) : ''}
      <div class="modal-f"><button class="btn link" data-act="finder-restart">${esc(t('restart'))}</button><span class="grow"></span>
        <button class="btn primary" data-act="finder-seeall" data-who="${esc(finder.ans.who || '')}" data-exam="${esc(finder.ans.goal && finder.ans.goal !== 'general' ? finder.ans.goal : '')}">${esc(t('finish'))} (${rec.count})</button></div>
    </div>`;
}

/* ---------------- footer ---------------- */
function trustNote() {
  return `<section class="trust"><h2>${esc(t('trustTitle'))}</h2><p>${esc(t('trustNote'))}</p></section>`;
}
function footer() {
  return `<footer class="site"><div class="wrap">
    <p class="disc">${esc(t('disclaimer'))}</p>
    <p class="meta-line">${esc(t('reviewed'))}: ${esc(fmtDate(DATA.generatedAt))} · v${esc(DATA.version || '')} · ${DATA.resources.length} ${esc(t('results'))}</p>
  </div></footer>`;
}

/* ---------------- events ---------------- */
function go(replace) { F.toURL(replace); render(); window.scrollTo({ top: 0, behavior: 'instant' }); }

function onInput(e) {
  if (e.target.id === 'searchInput') {
    F.state.q = e.target.value.trim();
    if (F.state.q && F.state.view === 'home') { /* live: switch to results */ }
    clearTimeout(onInput._t);
    onInput._t = setTimeout(() => { const pos = e.target.selectionStart; F.toURL(true); render(); const sb = $('#searchInput'); if (sb) { sb.focus(); try { sb.setSelectionRange(pos, pos); } catch {} } }, 220);
  }
}

function onClick(e) {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act, val = el.dataset.val, key = el.dataset.key, id = el.dataset.id;
  switch (act) {
    case 'home': e.preventDefault(); F.reset(); go(); break;
    case 'lang': e.preventDefault(); setLang(val); F.toURL(true); break;
    case 'task': F.reset(); F.state.purpose = val; go(); break;
    case 'exam': F.reset(); F.state.exam = val; go(); break;
    case 'audience': F.reset(); F.state.audience = val; go(); break;
    case 'set': F.state[key] = (F.state[key] === val ? '' : val); go(true); break;
    case 'bool': F.state[key] = !F.state[key]; go(true); break;
    case 'unset': F.state[key] = (key === 'verified' || key === 'active') ? false : ''; if (key === 'q') { const sb = $('#searchInput'); if (sb) sb.value = ''; } go(true); break;
    case 'clear': F.reset(); go(); break;
    case 'saved': F.reset(); F.state.view = 'saved'; go(); break;
    case 'toggle-filters': { const p = $('#filtersPanel'); if (p) p.classList.toggle('open'); break; }
    case 'share': doShare(); break;
    case 'open': if (id) Recent.push(id); break;
    case 'copy': e.preventDefault(); doCopy(id); break;
    case 'save': { const on = Saved.toggle(id); el.classList.toggle('on', on); el.textContent = on ? '★' : '☆'; const c = $('.iconbtn[data-act="saved"] .cnt'); if (c) { c.textContent = Saved.list().length; c.toggleAttribute('hidden', !Saved.list().length); } break; }
    case 'finder': openFinder(); break;
    case 'finder-close': finder = null; paintFinder(); break;
    case 'finder-pick': finder.ans[STEPS[finder.step].key] = val; paintFinder(); break;
    case 'finder-next': if (finder.step < STEPS.length - 1) finder.step++; else finder.done = true; paintFinder(); break;
    case 'finder-restart': finder = { step: 0, ans: {} }; paintFinder(); break;
    case 'finder-seeall': { F.reset(); if (el.dataset.who) F.state.audience = el.dataset.who; if (el.dataset.exam) F.state.exam = el.dataset.exam; finder = null; paintFinder(); go(); break; }
  }
}

function doShare() {
  const url = location.href;
  if (navigator.share) navigator.share({ title: t('brand'), text: t('heroSub'), url }).catch(() => {});
  else doCopyText(url, t('copied'));
}
function doCopy(id) {
  const r = BY.get(id); if (!r) return;
  const txt = `${pick(r.name)}\n${r.url}\n${t('badge.' + (r.verification?.status || 'unverified'))}${/^verified/.test(r.verification?.status || '') ? ' · ' + fmtDate(r.verification.checkedAt) : ''}`;
  doCopyText(txt, t('copied'));
}
function doCopyText(txt, msg) { (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(msg)).catch(() => toast(msg)); }
function toast(msg) { const e = document.createElement('div'); e.className = 'toast'; e.textContent = msg; document.body.appendChild(e); setTimeout(() => e.remove(), 2400); }

function syncLangButtons() { document.querySelectorAll('[data-lang]').forEach(b => { b.setAttribute('aria-pressed', getLang() === b.dataset.lang); if (b.closest('header')) b.classList.add('tipdown'); }); }

boot();
