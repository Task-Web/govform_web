import { describe, it, expect } from "vitest";
import { createDefaultState, createDefaultFormData } from "@/lib/types";

describe("createDefaultFormData", () => {
  it("returns default form data with empty fields", () => {
    const data = createDefaultFormData();
    expect(data.delay_seconds).toBe(0);
    expect(data.form.page1.first_name).toBe("");
    expect(data.form.page2.passport_number).toBe("");
    expect(data.form.page3.email).toBe("");
    expect(data.completed_pages).toEqual([]);
    expect(data.uploads).toEqual([]);
  });
});

describe("createDefaultState", () => {
  it("returns a full state envelope with govform type", () => {
    const state = createDefaultState();
    expect(state.meta.type).toBe("govform");
    expect(state.meta.version).toBe(1);
    expect(state.data.delay_seconds).toBe(0);
    expect(state.note).toBeNull();
  });

  it("sets created_at and updated_at to current time", () => {
    const before = new Date().toISOString();
    const state = createDefaultState();
    const after = new Date().toISOString();
    expect(state.meta.created_at >= before).toBe(true);
    expect(state.meta.created_at <= after).toBe(true);
    expect(state.meta.updated_at).toBe(state.meta.created_at);
  });
});
