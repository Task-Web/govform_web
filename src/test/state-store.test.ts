import { describe, it, expect, beforeEach } from "vitest";
import { createStateStore } from "@/lib/state-store";
import { getMemoryStorage } from "@/lib/storage/memory-storage";
import type { GovFormStateData, UserState } from "@/lib/types";

describe("state-store", () => {
  let store: ReturnType<typeof createStateStore>;

  beforeEach(async () => {
    const storage = getMemoryStorage<UserState<GovFormStateData>>();
    await storage.clear?.();
    store = createStateStore(storage);
  });

  it("creates default state for new user", async () => {
    const state = await store.getState("test-user-1");
    expect(state.meta.type).toBe("govform");
    expect(state.data).toBeDefined();
  });

  it("patches state with deep merge", async () => {
    await store.getState("test-user-2");
    const patched = await store.patchState("test-user-2", {
      form: {
        page1: {
          first_name: "John",
          last_name: "Doe",
        },
      },
    });
    const data = patched.data as GovFormStateData;
    expect(data.form.page1.first_name).toBe("John");
    expect(data.form.page1.last_name).toBe("Doe");
    // Other fields should remain
    expect(data.form.page1.date_of_birth).toBe("");
  });

  it("patches completed_pages array", async () => {
    await store.getState("test-user-3");
    const patched = await store.patchState("test-user-3", {
      completed_pages: ["page1"],
    });
    const data = patched.data as GovFormStateData;
    expect(data.completed_pages).toEqual(["page1"]);
  });

  it("replaces state entirely", async () => {
    await store.getState("test-user-4");
    const replaced = await store.replaceState("test-user-4", {
      data: {
        delay_seconds: 3,
        form: {
          page1: { first_name: "Jane", last_name: "Smith", date_of_birth: "1990-01-01", gender: "female", nationality: "US" },
          page2: { passport_number: "", visa_type: "", travel_purpose: "", arrival_date: "", departure_date: "" },
          page3: { email: "", phone: "", address: "", city: "", postal_code: "", country: "" },
        },
        completed_pages: ["page1"],
        uploads: [],
      },
    });
    const data = replaced.data as GovFormStateData;
    expect(data.delay_seconds).toBe(3);
    expect(data.form.page1.first_name).toBe("Jane");
  });

  it("resets state to defaults", async () => {
    await store.patchState("test-user-5", { delay_seconds: 5 });
    const reset = await store.resetState("test-user-5");
    const data = reset.data as GovFormStateData;
    expect(data.delay_seconds).toBe(0);
  });
});
