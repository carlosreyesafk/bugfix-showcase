import { useState } from "react";
import BuggyVersion from "./BuggyVersion";
import FixedVersion from "./FixedVersion";

/**
 * Demo shell: renders the buggy and fixed feeds side by side so the
 * difference is visible within seconds. "Restart demo" remounts both
 * components (fresh subscriptions, empty feeds).
 */
export default function App() {
  const [runId, setRunId] = useState(0);

  return (
    <div className="page">
      <header>
        <h1>Stale closure in a realtime subscription</h1>
        <p>
          Both feeds below subscribe to the same mocked realtime channel (a
          stand-in for{" "}
          <code>supabase.channel(...).on("postgres_changes", ...)</code>).
          New events arrive every 1.5&nbsp;seconds — compare what each version
          renders. Full write-up in <code>BUGFIX.md</code>.
        </p>
        <button onClick={() => setRunId((id) => id + 1)}>Restart demo</button>
      </header>

      <main className="grid" key={runId}>
        <BuggyVersion />
        <FixedVersion />
      </main>

      <footer>
        <p>
          <strong>The one-line fix:</strong>{" "}
          <code>setEvents((prev) =&gt; [...prev, event])</code> instead of{" "}
          <code>setEvents([...events, event])</code>.
        </p>
      </footer>
    </div>
  );
}
