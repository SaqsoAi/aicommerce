export interface AiQueueJob<T = unknown> {
  id: string;
  name: string;
  payload: T;
  createdAt: string;
}

const jobs: AiQueueJob[] = [];

export const aiQueueLayer = {
  async add<T = unknown>(name: string, payload: T): Promise<AiQueueJob<T>> {
    const job: AiQueueJob<T> = {
      id: `ai_job_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      name,
      payload,
      createdAt: new Date().toISOString(),
    };
    jobs.push(job as AiQueueJob);
    return job;
  },
  async list(): Promise<AiQueueJob[]> {
    return [...jobs];
  },
};