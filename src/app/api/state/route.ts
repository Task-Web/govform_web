import { NextRequest } from "next/server";
import { getUserId, createResponseWithCookie } from "@/lib/cookies";
import { stateStore } from "@/lib/state-store";
import { fileStore } from "@/lib/file-store";
import { applyDelay } from "@/lib/delay";
import { StateRequest, StatePatchRequest } from "@/lib/types";

// GET /api/state - Retrieve current user state (no delay on reads)
export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  const state = await stateStore.getState(userId);

  return createResponseWithCookie({ user_id: userId, state }, userId);
}

// PUT /api/state - Replace entire state
export async function PUT(request: NextRequest) {
  const userId = await getUserId(request);
  await applyDelay(userId);

  let payload: StateRequest;
  try {
    payload = await request.json();
  } catch {
    return createResponseWithCookie(
      { detail: "Invalid JSON body" },
      userId,
      400
    );
  }

  const nextState: {
    data: Record<string, unknown>;
    note: string | null;
    meta?: StateRequest["meta"];
  } = {
    data: payload.data || {},
    note: payload.note ?? null,
  };

  if (payload.meta) {
    nextState.meta = payload.meta;
  }

  const state = await stateStore.replaceState(userId, nextState);

  return createResponseWithCookie({ user_id: userId, state }, userId);
}

// PATCH /api/state - Merge into existing state
export async function PATCH(request: NextRequest) {
  const userId = await getUserId(request);
  await applyDelay(userId);

  let payload: StatePatchRequest;
  try {
    payload = await request.json();
  } catch {
    return createResponseWithCookie(
      { detail: "Invalid JSON body" },
      userId,
      400
    );
  }

  const state = await stateStore.patchState(
    userId,
    payload.data || {},
    payload.note
  );

  return createResponseWithCookie({ user_id: userId, state }, userId);
}

// DELETE /api/state - Reset and clear state
export async function DELETE(request: NextRequest) {
  const userId = await getUserId(request);

  await fileStore.deleteUserFiles(userId);
  const state = await stateStore.resetState(userId);

  return createResponseWithCookie({ user_id: userId, state }, userId);
}
