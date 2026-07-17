type JobHandler = () => Promise<void>;

export interface RegisteredPluginJob {
  key: string;
  pluginKey: string;
  intervalMs: number;
  enabled: boolean;
  lastRunAt?: string;
  lastOutcome?: "SUCCESS" | "FAILED";
}

class PluginSchedulerService {
  private readonly jobs = new Map<string, RegisteredPluginJob>();
  private readonly handlers = new Map<string, JobHandler>();
  private readonly locks = new Set<string>();

  register(job: RegisteredPluginJob, handler: JobHandler): void {
    if (!job.key.startsWith(`${job.pluginKey}.`)) {
      throw new Error("Job key must be namespaced by pluginKey");
    }
    if (this.jobs.has(job.key)) throw new Error("Duplicate plugin job key");
    this.jobs.set(job.key, { ...job, enabled: false });
    this.handlers.set(job.key, handler);
  }

  list(): RegisteredPluginJob[] {
    return [...this.jobs.values()].map((job) => ({ ...job }));
  }

  async runNow(key: string): Promise<RegisteredPluginJob> {
    const job = this.jobs.get(key);
    const handler = this.handlers.get(key);
    if (!job || !handler) throw new Error("Plugin job not found");
    if (this.locks.has(key)) throw new Error("Plugin job is already running");
    this.locks.add(key);
    try {
      await handler();
      job.lastOutcome = "SUCCESS";
      return { ...job, lastRunAt: new Date().toISOString() };
    } catch (error) {
      job.lastOutcome = "FAILED";
      throw error;
    } finally {
      job.lastRunAt = new Date().toISOString();
      this.locks.delete(key);
    }
  }
}

export const pluginSchedulerService = new PluginSchedulerService();
