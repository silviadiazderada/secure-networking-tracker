import { PRIORITIES, type Priority, type ContactInput } from "@/lib/types";

/**
 * Trusted validation for a contact submission.
 *
 * This is the single source of truth for "what is a valid contact" on the
 * client. The database enforces the same rules independently via NOT NULL and
 * CHECK constraints (see db/migrations/0001_init.sql), so a request that
 * bypasses this function still cannot write invalid data.
 *
 * Rules:
 *  - name is required and cannot be blank or whitespace-only
 *  - name is capped at 200 characters
 *  - priority must be exactly one of "high", "medium", or "low"
 *  - optional text fields are trimmed and capped, empty strings become null
 */

export const MAX_NAME_LENGTH = 200;
export const MAX_TEXT_LENGTH = 2000;

export interface NormalizedContact {
  name: string;
  company: string | null;
  role: string | null;
  where_met: string | null;
  notes: string | null;
  priority: Priority;
}

export type ValidationResult =
  | { ok: true; value: NormalizedContact }
  | { ok: false; errors: Record<string, string> };

function cleanOptional(
  raw: string | null | undefined,
  max: number,
): { value: string | null; error?: string } {
  if (raw == null) return { value: null };
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { value: null };
  if (trimmed.length > max) {
    return { value: trimmed, error: `Must be ${max} characters or fewer.` };
  }
  return { value: trimmed };
}

export function isPriority(value: unknown): value is Priority {
  return (
    typeof value === "string" && (PRIORITIES as readonly string[]).includes(value)
  );
}

export function validateContact(input: ContactInput): ValidationResult {
  const errors: Record<string, string> = {};

  const name = (input.name ?? "").trim();
  if (name.length === 0) {
    errors.name = "Name is required.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (!isPriority(input.priority)) {
    errors.priority = "Priority must be high, medium, or low.";
  }

  const company = cleanOptional(input.company, MAX_TEXT_LENGTH);
  if (company.error) errors.company = company.error;

  const role = cleanOptional(input.role, MAX_TEXT_LENGTH);
  if (role.error) errors.role = role.error;

  const whereMet = cleanOptional(input.where_met, MAX_TEXT_LENGTH);
  if (whereMet.error) errors.where_met = whereMet.error;

  const notes = cleanOptional(input.notes, MAX_TEXT_LENGTH);
  if (notes.error) errors.notes = notes.error;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      company: company.value,
      role: role.value,
      where_met: whereMet.value,
      notes: notes.value,
      priority: input.priority as Priority,
    },
  };
}
