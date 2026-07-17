export interface PluginEvent<T = unknown> {
  name: string;
  sourcePluginKey: string;
  payload: T;
  occurredAt: string;
}

type Handler<T = unknown> = (event: PluginEvent<T>) => Promise<void>;

class PluginEventBus {
  private handlers = new Map<string, Array<{ pluginKey: string; priority: number; handler: Handler }>>();

  subscribe(eventName: string, pluginKey: string, priority: number, handler: Handler): void {
    const rows = this.handlers.get(eventName) || [];
    rows.push({ pluginKey, priority, handler });
    rows.sort((a, b) => a.priority - b.priority || a.pluginKey.localeCompare(b.pluginKey));
    this.handlers.set(eventName, rows);
  }

  async publish<T>(event: PluginEvent<T>): Promise<Array<{ pluginKey: string; outcome: string }>> {
    const results = [];
    for (const row of this.handlers.get(event.name) || []) {
      try {
        await row.handler(event);
        results.push({ pluginKey: row.pluginKey, outcome: "SUCCESS" });
      } catch {
        results.push({ pluginKey: row.pluginKey, outcome: "FAILED" });
      }
    }
    return results;
  }
}

export const pluginEventBus = new PluginEventBus();
