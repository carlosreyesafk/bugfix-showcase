/**
 * A tiny in-memory stand-in for a Supabase Realtime channel.
 *
 * It mimics the shape of:
 *   supabase.channel("orders").on("postgres_changes", ...).subscribe()
 *
 * Every 1.5s it emits a fake "database insert" payload to all active
 * subscribers — just like INSERT events arriving over a realtime socket.
 * No network, no Supabase project required.
 */
export type RealtimeHandler = (payload: string) => void;

class MockRealtimeChannel {
  private handlers = new Set<RealtimeHandler>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private counter = 0;

  /** Subscribe to events. Returns an unsubscribe function. */
  onEvent(handler: RealtimeHandler): () => void {
    this.handlers.add(handler);

    if (!this.timer) {
      this.timer = setInterval(() => {
        this.counter += 1;
        const amount = (Math.random() * 90 + 10).toFixed(2);
        const payload = `Order #${1000 + this.counter} paid — $${amount}`;
        this.handlers.forEach((h) => h(payload));
      }, 1500);
    }

    return () => {
      this.handlers.delete(handler);
      if (this.handlers.size === 0 && this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    };
  }
}

export const mockChannel = new MockRealtimeChannel();
