# Migration Status — Premium Rebuild

Branch: `premium-rebuild` · Production (`main`) untouched and live.
Tracks the brief's 6-phase plan (§43). Updated 2026-06-22.

| Phase | Scope | Status |
|---|---|---|
| **1 — Audit & stabilization** | inventory, link validation, duplicates, historical, missing translations, preserve production | ✅ **Done** |
| **2 — Data extraction** | catalogue→JSON, translations structured, source registry, stable IDs, schema | ✅ **Done** |
| **3 — Application refactor** | split CSS/JS, render from JSON, preserve features | ✅ **Done** |
| **4 — Premium UX** | task homepage, guided finder, filters, mobile drawer, bookmarks, reporting | ✅ **Done** |
| **5 — Trust automation** | link checking, verification dates, lifecycle, duplicate reports, Actions | 🟡 Partial (scripts + validate/link-check workflows done; dated badges live in UI; deploy.yml + Playwright/Axe tests pending) |
| **6 — Launch** | full audit, compare, preview, verify, switch production after acceptance | ⏳ Not started |

## Delivered so far
- `reports/pre-migration-audit.md` — full Phase-1 audit.
- `scripts/check-links.mjs` — browser-grade link-health checker → `reports/link-health.json`.
- `scripts/build-catalogue.mjs` — legacy → normalized transform.
- `scripts/validate-data.mjs`, `scripts/detect-duplicates.mjs` — CI-grade validators (passing).
- `data/catalogue.json` — **93 resources normalized**, evidence-based verification.
- `data/official-sources.json`, `data/taxonomies.json`, `data/regions.json`, `schemas/catalogue.schema.json`.
- `.github/workflows/validate.yml`, `link-check.yml`; issue/PR templates; `CONTRIBUTING.md`.

## Key findings carried forward
- 3 genuinely broken/unreachable links flagged (`@ALLENDigital` 404, `adhelp.myallendigital.com` DNS-dead, `allenbpms.in` TLS-mismatch) — marked in catalogue `lifecycle`/`verification`, not deleted.
- 8 official social/Telegram handles bot-block automated checks → `unverified` (manual review), never green-badged.
- 14 resources on legacy `allen.ac.in` → `verified-legacy`; prefer `allen.in` canonical where equivalents exist.
- Trust copy ("every official link", undated green badges) to be softened in the new UI (Phase 4).

## Verification snapshot (2026-06-22)
verified 68 · verified-legacy 14 · unverified (bot-blocked) 8 · temporarily-unavailable 1 · broken 2

## Phase 3 + 4 delivered (new app on branch)
- `index.html` — lean shell (SEO/OG/canonical, `?v=` versioned assets, no anti-cache hack), `fetch`es `data/catalogue.json`. Legacy single-file preserved as `legacy.html`.
- `assets/css/styles.css`; `assets/js/{i18n,storage,search,filters,app}.js` (ES modules).
- **Task homepage** ("What do you need help with today?" + 8-task grid), **guided finder** (who→class→goal→mode→region→do → primary + alternative + app + free material + support), **multilingual search** (en/hi/ta + romanised + typo-tolerant, all-words precision), **filters** (audience/exam/purpose/region/mode/class + verified/active) with **URL state** + mobile drawer, **dated trust badges** (status-aware, e.g. "Verified · 22 Jun 2026"), structured card meta, **Save/Recently-viewed** (localStorage), **Copy** + **Report issue** (prefilled GitHub issue).
- Verified working: 3 languages, finder, search precision, task/region/exam filters, mobile drawer, zero console errors.

## Backlog (remaining)
1. **Phase 5 (rest)** — `deploy.yml` (build→validate→deploy main on merge), Playwright e2e + Axe accessibility automation, optional PWA.
2. **Phase 6** — Lighthouse before/after, side-by-side compare vs `legacy.html`, then **promote branch to `main`** (the only step that changes the live site).
3. Add a persistent search box in the results toolbar; consider self-hosting font subsets; CSP headers.
4. 2 resources still lack Tamil search terms (validator warnings) — re-run enrichment for them.
