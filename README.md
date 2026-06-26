# WINGSPRINT

WINGSPRINT is an original one-tap pixel arcade game designed first for the iPhone 17 portrait viewport. It runs as an installable PWA and can be hosted on GitHub Pages.

## TODO

- Add polished ready, gameplay, and results screenshots.

## Local development

```bash
pnpm install
pnpm dev
```

Run verification:

```bash
pnpm test
pnpm build
```

## Google Analytics

Google Analytics 4 is configured with measurement ID `G-RSVR6Y389R`. The game lifecycle events are `start_game`, `end_game`, and `try_again`; scoring, resume, and mute changes are also recorded.

## GitHub Pages

1. Push the repository to GitHub with `main` as the default branch.
2. Open Settings, then Pages.
3. Select GitHub Actions as the publishing source.
4. Push to `main` or run the workflow manually.

The Vite base path is calculated from `GITHUB_REPOSITORY`, so project Pages URLs work without editing source files.

## Install on iPhone

Open the Pages URL in Safari, use Share, select Add to Home Screen, and launch WINGSPRINT from its icon. After the first successful online load, the service worker caches the game for offline play.
