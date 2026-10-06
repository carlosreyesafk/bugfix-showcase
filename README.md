# Bug-fix Showcase — Stale closure in a realtime subscription

A documented bug-fix case study: a React component subscribing to a realtime data source contains a realistic **stale closure** bug in `useEffect`, so the UI doesn't reflect subscription updates. The repo includes the broken version, the fixed version, a live side-by-side demo, and a professional write-up.

> Screenshots: add `screenshots/demo.png` here after deploying.

## What it demonstrates

- **Debugging methodology**: `BUGFIX.md` follows the full professional flow — Symptom → Reproduction → Root cause (with exact code lines) → Fix → Verification.
- **Deep React knowledge**: stale closures, effect dependency arrays, functional state updates, subscription cleanup.
- **Realtime patterns**: the subscription shape mirrors `supabase.channel(...).on("postgres_changes", ...).subscribe()`, so the fix transfers directly to Supabase Realtime work.
- **No backend needed**: `src/mockRealtime.ts` is a tiny event emitter that fakes database INSERT events every 1.5s — the demo runs anywhere.

## Run locally

```bash
npm install
npm run dev
```

Open the printed localhost URL. Watch the **Buggy** feed (stuck at 1 event) vs the **Fixed** feed (accumulates correctly). Click **Restart demo** to replay.

## Build

```bash
npm run build   # tsc (strict) + vite build
npm run preview # serve the production build locally
```

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In [Vercel](https://vercel.com): **Add New → Project** → import the repo.
3. Framework Preset: **Vite**. Build Command: `npm run build`. Output Directory: `dist`.
4. Click **Deploy** — done. No environment variables needed.

## Project structure

```
src/
  mockRealtime.ts   # fake realtime channel (event emitter, 1.5s cadence)
  BuggyVersion.tsx  # ❌ the broken code (stale closure)
  FixedVersion.tsx  # ✅ the one-line fix (functional state update)
  App.tsx           # side-by-side demo shell with restart button
  main.tsx / styles.css
BUGFIX.md           # the full case-study write-up
```

## The fix in one line

```diff
- setEvents([...events, event]);      // `events` is frozen at [] — stale closure
+ setEvents((prev) => [...prev, event]); // `prev` is always the latest state
```
