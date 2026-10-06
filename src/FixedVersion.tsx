import { useEffect, useState } from "react";
import { mockChannel } from "./mockRealtime";

/**
 * ✅ FIXED VERSION.
 *
 * The fix is a one-line change: use the functional form of the state setter
 * — `setEvents((prev) => [...prev, event])` — so the update always builds on
 * the LATEST state instead of the stale `events` array captured by the
 * closure. The subscription still runs once (`[]`), but it no longer depends
 * on a frozen snapshot of state.
 *
 * Alternative fixes (both valid): keep the events in a ref and sync it to
 * state, or re-subscribe when `events` changes (wasteful — re-creates the
 * channel on every event).
 */
export default function FixedVersion() {
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = mockChannel.onEvent((event) => {
      // FIX: functional update — `prev` is always the current state.
      setEvents((prev) => [...prev, event]);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="feed">
      <h3>
        <span className="badge badge-fixed">Fixed</span> Live order feed
      </h3>
      <p className="hint">
        Same subscription, one-line fix: every order now accumulates correctly.
      </p>
      <ul>
        {events.map((event, i) => (
          <li key={i}>{event}</li>
        ))}
      </ul>
      <p className="count">Showing {events.length} event(s)</p>
    </div>
  );
}
