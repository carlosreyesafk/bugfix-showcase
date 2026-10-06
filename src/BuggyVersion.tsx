import { useEffect, useState } from "react";
import { mockChannel } from "./mockRealtime";

/**
 * ❌ BUGGY VERSION — do not copy this pattern.
 *
 * The subscription handler closes over the `events` array from the FIRST
 * render (a stale closure). Because the effect only runs once (`[]`),
 * every realtime event computes `[...events, event]` with `events === []`,
 * so the list is overwritten with a single item each time and previously
 * received events silently disappear from the UI.
 */
export default function BuggyVersion() {
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = mockChannel.onEvent((event) => {
      // BUG (line below): `events` here is ALWAYS the initial [] —
      // the closure captured it on mount and it never updates.
      setEvents([...events, event]);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="feed">
      <h3>
        <span className="badge badge-buggy">Buggy</span> Live order feed
      </h3>
      <p className="hint">
        Watch: new orders arrive every 1.5s, but the list never grows past one
        item.
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
