export interface PluginHealthSchedulerAdapter {
  readonly key: string;
  readonly enabled: boolean;
  register(): Promise<void>;
  unregister(): Promise<void>;
}

export class DisabledPluginHealthSchedulerAdapter
  implements PluginHealthSchedulerAdapter
{
  readonly key = "host.scheduler.disabled";
  readonly enabled = false;

  async register(): Promise<void> {
    return;
  }

  async unregister(): Promise<void> {
    return;
  }
}

export const pluginHealthSchedulerAdapter =
  new DisabledPluginHealthSchedulerAdapter();
