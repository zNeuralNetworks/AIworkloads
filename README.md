# AIworkloads

This repository is organized as a single application repository with one product root:

- [ai-networking-education-center/README.md](/Users/theorajan/local%20builds/Aiworkloads/ai-networking-education-center/README.md)

If you are trying to run, test, review, or contribute to the app, start there.

## Repository shape

- `ai-networking-education-center/` is the only application root.
- `/.github/` is the only authoritative GitHub Actions location.
- `cloudbuild.yaml` remains at repo root because it orchestrates the app directory from the outer repo.
- `docs/archive/root-history/` contains historical planning, review, and backlog material that is no longer part of the main contributor path.
- `docs/internal/assistant/` contains assistant-specific metadata kept out of the public app surface.

## Standard local bootstrap

```bash
cd "/Users/theorajan/local builds/Aiworkloads"
git checkout main
git pull --ff-only origin main
cd ai-networking-education-center
```

## Primary commands

```bash
npm ci
npm run dev
npm run lint
npm run test
npm run build
```

## CI/CD

GitHub Actions:

- [ci.yml](/Users/theorajan/local%20builds/Aiworkloads/.github/workflows/ci.yml)

Cloud Build:

- [cloudbuild.yaml](/Users/theorajan/local%20builds/Aiworkloads/cloudbuild.yaml)
