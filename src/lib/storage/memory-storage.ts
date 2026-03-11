import type { StateStorage } from "./types";

const globalKey = "__govform_memory_storage__";

function getGlobalStore<T extends Record<string, unknown>>(): Map<string, T> {
  const g = globalThis as Record<string, unknown>;
  if (!g[globalKey]) {
    g[globalKey] = new Map<string, T>();
  }
  return g[globalKey] as Map<string, T>;
}

export function getMemoryStorage<
  T extends Record<string, unknown> = Record<string, unknown>
>(): StateStorage<T> {
  const store = getGlobalStore<T>();

  return {
    async get(userId: string) {
      const state = store.get(userId);
      return state ? structuredClone(state) : undefined;
    },
    async set(userId: string, state: T) {
      store.set(userId, structuredClone(state));
    },
    async delete(userId: string) {
      store.delete(userId);
    },
    async has(userId: string) {
      return store.has(userId);
    },
    async keys() {
      return Array.from(store.keys());
    },
    async clear() {
      store.clear();
    },
  };
}
