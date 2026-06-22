# Migration Status — Premium Rebuild

Branch: `premium-rebuild` · Production (`main`) untouched and live.
Tracks the brief's 6-phase plan (§43). Updated 2026-06-22.

| Phase | Scope | Status |
|---|---|---|
| **1 — Audit & stabilization** | inventory, link validation, duplicates, historical, missing translations, preserve production | ✅ **Done** |
| **2 — Data extraction** | catalogue→JSON, translations structured, source registry, stable IDs, schema | ✅ **Done** |
| **3 — Application refactor** | split CSS/JS, render from JSON, preserve features, tests | ⏳ Not started |
| **4 — Premium UX** | task homepage, guided finder, filters, mobile drawer, bookmarks, reporting | ⏳ Not started |
| **5 — Trust automation** | link checking, verification dates, lifecycle, duplicate reports, Actions | 🟡 Partial (scripts + validate/link-check workflows done; deploy.yml + e2e/a11y tests pending) |
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

## Backlog (next phases)
1. **Phase 3** — `assets/css/styles.css` + `assets/js/{app,i18n,search,filters,storage}.js`; `index.html` shell that `fetch`es `data/catalogue.json`; preserve current features (3 languages, search, filters, share, YouTube playlists).
2. **Phase 4** — "What do you need help with today?" task grid + guided finder (audience→class→goal→mode→region→action), URL-param state, bookmarks (localStorage), per-resource "Report issue".
3. **Phase 5** — `deploy.yml` (deploy only after validate passes), Playwright e2e + Axe accessibility tests, dated verification badges in UI.
4. **Phase 6** — Lighthouse before/after, side-by-side compare, preview, then promote to `main`.
5. Multilingual search terms (hi/ta + transliteration) — enrichment pass running; merge into `data/catalogue.json`.
6. Remove anti-cache meta tags in favour of content-hashed asset URLs (Phase 3).
