# Contributing to ALLEN Resource Hub

Thank you for helping keep this guide accurate and useful for students and parents.

> This is an independent, community-made directory. It links to ALLEN's **official** channels. It is not affiliated with or endorsed by ALLEN Career Institute.

## Project shape (rebuild in progress)

The project is migrating from one `index.html` to a clean static architecture:

- `data/catalogue.json` — the resources (one normalized object each; **source of truth**)
- `data/official-sources.json` — registry of recognised official ALLEN identities
- `data/taxonomies.json`, `data/regions.json` — controlled vocabularies
- `schemas/catalogue.schema.json` — the contract every resource must satisfy
- `scripts/*.mjs` — validation, duplicate detection, link health, catalogue build
- `assets/` — CSS/JS (app), `index.html` — shell
- `reports/` — generated audit / link-health / duplicate / stats output

The legacy single-file site still serves production on `main` until the rebuild passes acceptance (see `reports/migration-status.md`).

## Add or update a resource

1. Edit `data/catalogue.json`. Every resource needs (see schema):
   - a stable kebab-case `id` (never reuse or renumber),
   - `name` / `description` in **en, hi and ta**,
   - `url`, `canonicalUrl`, and a `sourceId` registered in `official-sources.json`,
   - `officialStatus`, `resourceType`, `purpose`, `audience`,
   - `verification` (status + `checkedAt` date) and `lifecycle` (status).
2. Never mark a resource `official` unless its `sourceId` is registered.
3. Never set verification `verified` without a real recent check date.
4. For intentional URL reuse (e.g. a Start-Here pointer), set `aliasOf` to the canonical resource id.
5. For an outdated/removed page, set `lifecycle.status` (`discontinued`/`historical`) and a `replacementId` if one exists — **do not delete silently**.

## Run the checks locally

```bash
npm run validate     # schema, ids, translations, sources, dates
npm run duplicates   # duplicate ids / URLs (aliasOf-aware)
npm run check-links  # browser-grade link-health probe -> reports/link-health.json
```

CI runs `validate` + `duplicates` on every push/PR and `link-check` weekly. PRs that fail validation cannot merge.

## Translations

- Keep brand/exam names (ALLEN, JEE, NEET, TALLENTEX) untranslated inside sentences.
- Use the glossary in `data/taxonomies.json` labels for consistent terms.
- Prefer simple, parent-friendly wording. Tamil is a primary audience.

## Report a problem

Open an issue using the **Broken link** or **New official resource** template. Include the resource `id`, the URL, and what's wrong.
