# CI workflows (activation pending)

These two GitHub Actions live here instead of `.github/workflows/` only because the
token used to push this branch lacks the `workflow` OAuth scope. To activate:

```bash
gh auth refresh -s workflow        # grant the scope (one time)
git mv ci-workflows/validate.yml   .github/workflows/validate.yml
git mv ci-workflows/link-check.yml .github/workflows/link-check.yml
git commit -m "ci: activate validate + link-check workflows"
git push
```

(Or paste them into `.github/workflows/` via the GitHub web UI.)

- `validate.yml` — runs `validate-data` + `detect-duplicates` on every push/PR.
- `link-check.yml` — weekly browser-grade link-health probe; fails if broken links exceed threshold.
