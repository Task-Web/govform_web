import { stateStore } from "./state-store";
import type { GovFormStateData, UserState } from "./types";

/**
 * Apply the configured delay for a user.
 * Reads delay_seconds from the user's state and sleeps.
 */
export async function applyDelay(userId: string): Promise<void> {
  const state = await stateStore.getState(userId) as UserState<GovFormStateData>;
  const delaySec = state.data?.delay_seconds || 0;
  if (delaySec > 0) {
    await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));
  }
}
