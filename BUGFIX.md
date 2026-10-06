# Bug-fix case study: stale closure in a realtime subscription

**Stack:** React + TypeScript (Vite) · **Area:** realtime data flow (`useEffect` subscription)
**Files:** `src/BuggyVersion.tsx` (broken) · `src/FixedVersion.tsx` (fixed) · `src/mockRealtime.ts` (fake realtime channel)

---

## Symptom

A "live order feed" component subscribes to a realtime channel (the mock in `src/mockRealtime.ts` stands in for `supabase.channel("orders").on("postgres_changes", ...).subscribe()`). New order events arrive every 1.5 seconds and the handler appends each one to state — yet the UI only ever shows **one** event: the latest one. Previously received events silently vanish instead of accumulating.

## Reproduction

1. `npm install && npm run dev`, open the app.
2. Watch the **Buggy** feed for ~10 seconds.
3. Expected: the list grows (1, 2, 3… events). Actual: the list stays at exactly 1 event — each new arrival replaces the previous one.
4. The **Fixed** feed next to it behaves correctly, confirming the channel itself emits every event.

## Root cause

In `src/BuggyVersion.tsx`, the subscription is created once on mount:

```tsx
const [events, setEvents] = useState<string[]>([]);   // line 14

useEffect(() => {                                      // line 16
  const unsubscribe = mockChannel.onEvent((event) => {
    setEvents([...events, event]);                     // line 19 — THE BUG
  });
  return unsubscribe;
}, []);                                                // line 23 — runs once
```

Line 19 reads `events` from the closure created during the **first render**, when `events` was `[]`. Because the dependency array on line 23 is empty, the effect never re-runs, so the handler keeps referencing that frozen initial array forever. Every event therefore computes `[...[], event]` → `[event]` — a single-item array that overwrites the previous state. The state updates themselves work fine; the bug is that each update is built from stale data, so history is lost.

This is the classic **stale closure**: an effect that runs once captures state from mount time, and any handler it registers sees only that snapshot.

## Fix

One-line change in `src/FixedVersion.tsx` — use the **functional form** of the state setter so the update is computed from the latest state, not from the closed-over snapshot:

```tsx
useEffect(() => {
  const unsubscribe = mockChannel.onEvent((event) => {
    setEvents((prev) => [...prev, event]);  // `prev` is always current
  });
  return unsubscribe;
}, []);
```

`prev` is provided by React at update time, so it is never stale. The subscription still mounts once (no wasted re-subscriptions), and every event now appends correctly.

**Alternatives considered:** storing events in a `useRef` and syncing to state (works, but adds indirection), or adding `events` to the dependency array (re-subscribes on every event — wasteful and can duplicate handlers if cleanup is missed). The functional update is the idiomatic, minimal fix.

## Verification

- **Before:** Buggy feed shows exactly 1 event after any number of arrivals ("Showing 1 event(s)").
- **After:** Fixed feed accumulates every arrival ("Showing N event(s)"), newest at the bottom, no duplicates, no missed events.
- **No regressions:** the unsubscribe cleanup still runs on unmount (the mock channel stops its timer when the last listener leaves); `npm run build` (tsc + vite) passes with `strict` mode and `noUnusedLocals`.
- **Edge case checked:** React StrictMode double-mounts effects in dev — subscribe → cleanup → subscribe leaves exactly one active handler, verified by the steady 1.5s cadence (no doubled events).
