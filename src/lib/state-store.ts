import type { UserState, ReplaceStateInput, GovFormStateData } from "./types";
import { createDefaultState } from "./types";
import type { StateStorage } from "./storage/types";
import { getMemoryStorage } from "./storage/memory-storage";

// Deep merge utility for PATCH operations
function deepMerge(
  dest: Record<string, unknown>,
  src: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...dest };
  for (const key of Object.keys(src)) {
    const srcValue = src[key];
    const destValue = result[key];
    if (
      typeof destValue === "object" &&
      destValue !== null &&
      !Array.isArray(destValue) &&
      typeof srcValue === "object" &&
      srcValue !== null &&
      !Array.isArray(srcValue)
    ) {
      result[key] = deepMerge(
        destValue as Record<string, unknown>,
        srcValue as Record<string, unknown>
      );
    } else {
      result[key] = structuredClone(srcValue);
    }
  }
  return result;
}

export function createStateStore<
  T extends Record<string, unknown> = GovFormStateData
>(storage: StateStorage<T>) {
  return {
    async getState(userId: string): Promise<UserState<T>> {
      const state = await storage.get(userId);
      if (state) {
        return state as unknown as UserState<T>;
      }
      const defaultState = createDefaultState() as unknown as UserState<T>;
      await storage.set(userId, defaultState as unknown as T);
      return defaultState;
    },

    async replaceState(
      userId: string,
      newState: ReplaceStateInput<Record<string, unknown>>
    ): Promise<UserState<T>> {
      const now = new Date().toISOString();
      const state: UserState<T> = {
        meta: newState.meta
          ? {
              created_at: newState.meta.created_at || now,
              updated_at: now,
              version: newState.meta.version || 1,
              type: newState.meta.type || "govform",
            }
          : {
              created_at: now,
              updated_at: now,
              version: 1,
              type: "govform",
            },
        data: (newState.data || createDefaultState().data) as T,
        note: newState.note ?? null,
      };
      await storage.set(userId, state as unknown as T);
      return structuredClone(state);
    },

    async patchState(
      userId: string,
      patch: Record<string, unknown>,
      note?: string | null
    ): Promise<UserState<T>> {
      let rawState = await storage.get(userId);
      let state: UserState<T>;
      if (!rawState) {
        state = createDefaultState() as unknown as UserState<T>;
      } else {
        state = rawState as unknown as UserState<T>;
      }

      const updatedData = deepMerge(
        state.data as Record<string, unknown>,
        patch
      ) as T;

      const updatedState: UserState<T> = {
        meta: {
          ...state.meta,
          updated_at: new Date().toISOString(),
          version: state.meta.version + 1,
        },
        data: updatedData,
        note: note !== undefined ? note : state.note,
      };

      await storage.set(userId, updatedState as unknown as T);
      return structuredClone(updatedState);
    },

    async resetState(userId: string): Promise<UserState<T>> {
      const state = createDefaultState() as unknown as UserState<T>;
      await storage.set(userId, state as unknown as T);
      return structuredClone(state);
    },

    async deleteState(userId: string): Promise<void> {
      await storage.delete(userId);
    },

    async hasState(userId: string): Promise<boolean> {
      return storage.has(userId);
    },

    getStorage(): StateStorage<T> {
      return storage;
    },
  };
}

export type StateStore<T extends Record<string, unknown> = GovFormStateData> =
  ReturnType<typeof createStateStore<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stateStore = createStateStore(getMemoryStorage<any>());
