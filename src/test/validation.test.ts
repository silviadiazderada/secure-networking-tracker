import { describe, it, expect } from "vitest";
import { validateContact } from "@/lib/validation";
import type { ContactInput } from "@/lib/types";

const base: ContactInput = {
  name: "Ada Lovelace",
  company: "Analytical Engines",
  role: "Mathematician",
  where_met: "Haas networking night",
  notes: "Follow up about the seminar",
  priority: "high",
};

describe("validateContact", () => {
  it("accepts a well-formed contact and normalizes it", () => {
    const result = validateContact(base);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Ada Lovelace");
      expect(result.value.priority).toBe("high");
    }
  });

  it("rejects an empty name", () => {
    const result = validateContact({ ...base, name: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.name).toBeDefined();
  });

  it("rejects a whitespace-only name", () => {
    const result = validateContact({ ...base, name: "   " });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.name).toBeDefined();
  });

  it("rejects a priority outside high | medium | low", () => {
    const result = validateContact({ ...base, priority: "urgent" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.priority).toBeDefined();
  });

  it("accepts each allowed priority value", () => {
    for (const priority of ["high", "medium", "low"]) {
      const result = validateContact({ ...base, priority });
      expect(result.ok).toBe(true);
    }
  });

  it("turns blank optional fields into null", () => {
    const result = validateContact({
      ...base,
      company: "   ",
      role: "",
      notes: undefined,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.company).toBeNull();
      expect(result.value.role).toBeNull();
      expect(result.value.notes).toBeNull();
    }
  });

  it("rejects an over-long name", () => {
    const result = validateContact({ ...base, name: "a".repeat(201) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.name).toBeDefined();
  });
});
