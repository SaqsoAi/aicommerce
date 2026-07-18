type MemoryItem = {
  userId: string;
  style?: string;
  size?: string;
  data?: any;
};

const memoryStore: MemoryItem[] = [];

export const memoryAI = {
  save: (item: MemoryItem) => {
    memoryStore.push(item);
    return true;
  },

  getAll: () => {
    return memoryStore;
  },

  getByUser: (userId: string) => {
    return memoryStore.find((m) => m.userId === userId);
  },
};