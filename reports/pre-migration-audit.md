# Pre-Migration Audit — ALLEN Resource Hub

**Date of audit:** 2026-06-22
**Audited artefact:** `index.html` (single self-contained file) @ branch `main`
**Live site:** https://yosoyun.github.io/allen-resource-hub/
**Method:** static inspection of `index.html` + automated browser-grade link-health probe of all 105 URLs (`scripts/check-links.mjs` → `reports/link-health.json`).

> This audit precedes any restructuring, per the transformation brief §3. Production stays on `main`; all rebuild work happens on branch `premium-rebuild`.

---

## 1. Current architecture

A **single 175–192 KB `index.html`** holds everything:

- **Markup** — header, hero, language chooser, controls/filters, `#sections` mount, footer.
- **CSS** — one large inline `<style>` block (design tokens, components, tooltips, responsive).
- **JavaScript** — inline `<script>` containing: `window.CATALOG` (all data), the `UI` i18n dictionary (en/hi/ta), an `ICONS`/`PLAT` map, and all logic (render, filter, search, language switch, share, tooltips).
- **Data** — `window.CATALOG` embedded between `/* === CATALOG START/END === */` markers.

**Data flow:** `window.CATALOG` (inline) → `renderSections()` builds DOM strings → injected via `innerHTML`. **Translation flow:** `state.lang` + `UI[lang]` for chrome, `item['desc_'+lang]` for content; `setLang()` re-renders everything. **Rendering flow:** filter (`matchItem`) → `cardHTML()` per item → `innerHTML`. No build step; deployed as-is to GitHub Pages.

**Assessment:** excellent for shipping fast; **not** maintainable or verifiable at scale. Data, presentation, logic, and translations are coupled in one file — exactly the structural weakness the brief (§2.2) says not to preserve.

---

## 2. Catalogue inventory (computed)

| Metric | Value |
|---|---|
| Sections | **8** |
| Resources (items) | **93** |
| Unique domains | **29** |
| Duplicate (normalised) URLs | **4** |
| Items flagged `verified:true` (old boolean) | 78 |
| Items flagged `verified:false` | 15 |
| Missing Hindi descriptions | **0** |
| Missing Tamil descriptions | **0** |
| Items missing any `how_*` translation | **0** |

**Top domains:** `allen.in` (24), `allen.ac.in` (14), `youtube.com` (10), `instagram.com` (9), `facebook.com` (4), `linkedin.com` (3), `t.me` (3), then a long tail (apps.apple.com, dlp.allen.ac.in, play.google.com, x.com, estore/astra/news/myexam.allen.in, allenites.com, allenchamp.com, allenglobalstudies.com, allenoverseas.com, pinterest, threads, quora, tallentex, wa.me, …).

**Two official domains in use:** `allen.in` (current primary) and `allen.ac.in` (legacy, still live). The new model must register both with distinct trust/status (`official` vs `legacy-official`) and prefer canonical `allen.in` where equivalents exist.

---

## 3. Link health (browser-grade probe, 2026-06-22)

| Class | Count | Meaning |
|---|---|---|
| `ok` (2xx) | **81** | Loads cleanly |
| `blocked` | **8** | Official social/messaging (Facebook, Telegram, Quora) that bot-block automated checks — **not broken**, needs manual confirm |
| `broken` (404) | **1** | Genuine dead link |
| `unreachable` | **2** | DNS/TLS failure |
| not checked | 1 | `mailto:` support email (no HTTP) |

### ⚠️ Real issues found (must fix in migration)

1. **`https://www.youtube.com/@ALLENDigital` → 404 (BROKEN).** The ALLEN Digital YouTube handle was renamed/removed. Replace with the live channel or remove. *(This is in addition to the already-fixed `@ALLENOnlinePrograms`.)*
2. **`https://adhelp.myallendigital.com/` → DNS does not resolve (ENOTFOUND).** The ALLEN Digital help-centre subdomain is dead. Replace with the current support URL or remove.
3. **`https://student.allenbpms.in/login` → TLS certificate name mismatch (`ERR_TLS_CERT_ALTNAME_INVALID`).** Browsers will show a security warning. Verify the correct BPMS login host before keeping.

### Methodology note (important)
The **first** probe (HEAD + `Accept: */*`) wrongly reported ~17 `allen.ac.in` links as 404 — these were **WAF false-positives**. Re-probing with **GET + browser `User-Agent` + `Accept: text/html`** returned 200 for all of them. `check-links.mjs` was corrected to use browser-grade GET. **Lesson for the brief's verification model:** status alone is not truth; method and host-awareness matter, and known bot-blocking hosts must never be marked "broken" on status alone.

---

## 4. Duplicates

4 normalised-duplicate URLs, all **intentional "Start Here" pointers** that reuse a Programs/Contact URL:
`allen.in/kota/jee-main-advanced`, `allen.in/kota/neet`, `allen.in/kota/pncf`, `allen.ac.in/contactus.asp`.

These are legitimate cross-references, not errors — but the current model can't express that. The new schema will mark them with `aliasOf` / a distinct `resourceType: "guidance-pointer"` so duplicate-detection CI can pass without hiding the relationship (brief §13).

---

## 5. Historical / session-bound references

Session- and campaign-bound resources that need `lifecycle` + `academicSessions` (brief §14, §25), so they aren't shown as perpetually current:

- `apps2526/ccp/Login`, `apps2526/formstatus/login` — **2025-26** session login portals.
- `kota/2025-26/About-ALLEN-Scholarship-Admission-Test.asp` — ASAT **2025-26**.
- `jee-main/answer-key-2026`, `neet/2026-answer-key-solutions` — **2026** exam-season pages.
- TALLENTEX — **seasonal** scholarship campaign.

None are wrong today, but all need explicit validity windows and auto-flagging when stale.

---

## 6. Trust-claim audit (brief §2.3)

Current UI says **"every official link"** / **"100% free"** / verified badges without dates. Issues:

- "Every official link" / "All of ALLEN" overclaims completeness → soften to *"a curated, regularly reviewed directory of important official ALLEN resources."*
- Green "✓ Verified · official" badge shows **no check date** and was applied to some social/search pages that can't be auto-verified → must show `Verified 22 Jun 2026` and never green-badge a bot-blocked/unclear URL.
- `verified: true/false` boolean is too coarse → replace with structured statuses (`verified`, `verified-legacy`, `blocked`/`registration-required`, `redirected`, `historical`, `unverified`, `broken`).

---

## 7. Accessibility concerns

- Cards are full `<a>` wrappers — generally OK, but **YouTube "ytcard" divs** contain nested links + `<details>`; keyboard/focus order needs testing.
- **Tooltips** are `:hover::after` only — **not keyboard/touch reachable** (added `:focus-visible` but unverified with a screen reader).
- No skip-link target verification, heading hierarchy not audited, focus-visible styles inconsistent on some chips.
- Colour-coded language/active states need a non-colour cue (the active chip now has a ✓ — good; verify elsewhere).
- Touch targets mostly ≥40px; filter chips on mobile need a 44px check.
- No automated Axe coverage.

## 8. Mobile concerns

- **Two stacked sticky bars** (header + controls) consume vertical space on small screens (brief §30 flags this).
- Filters are inline chips that wrap; no drawer — long on 320px.
- Otherwise responsive: single-column grid, language chooser wraps, no horizontal overflow observed at 375px.

## 9. Performance concerns

- **Anti-cache meta tags** (`no-store`) force a full re-download every visit (brief §27 says remove; use versioned assets instead). *(They were added to defeat stale GitHub Pages cache — the proper fix is content-hashed asset URLs.)*
- **Entire catalogue + both other languages' strings ship inline** on first paint, even though only one language renders.
- **Google Fonts** (3 families incl. Devanagari + Tamil) are render-blocking external requests; needs `font-display` + subset/self-host evaluation and a privacy review.
- No measured Lighthouse baseline yet (to capture before/after).

---

## 10. Migration readiness

**Strengths to preserve (brief §2.1):** trilingual content (100% coverage), student/parent orientation, simple cards, search, stream filters, official focus, easy sharing, mobile-first, GitHub Pages deploy.

**Blocking weaknesses to fix:** single-file coupling, coarse verification, no source registry, no lifecycle/session awareness, 3 dead links, unsupported trust claims, no automation/tests.

**Decision:** proceed to Phase 2 (data extraction + schema + source registry) on `premium-rebuild`. Do **not** touch `main`/production until the rebuild passes schema validation, link-health, accessibility, mobile, and e2e checks (brief §2.5, §44).

---

*Generated as part of Phase 1. Companion machine-readable data: `reports/link-health.json`, `reports/catalogue-stats.json`.*
