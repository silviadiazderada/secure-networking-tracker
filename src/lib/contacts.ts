import { neon } from "@/lib/neon";
import type { Contact, Priority } from "@/lib/types";
import type { NormalizedContact } from "@/lib/validation";

/**
 * Data-access helpers for the `contacts` table via the Neon Data API.
 *
 * Every call runs as the signed-in user (the Better Auth JWT is attached by
 * the client), so RLS restricts all reads and writes to that user's own rows.
 * We never send `user_id` — the column defaults to `auth.user_id()`.
 */

const TABLE = "contacts";

function fail(context: string, error: { message?: string } | null): never {
  throw new Error(
    error?.message ? `${context}: ${error.message}` : `${context}.`,
  );
}

/** Strip PostgREST filter metacharacters from a user search string. */
function sanitizeSearch(raw: string): string {
  return raw.replace(/[,()*\\]/g, " ").trim();
}

export interface ListOptions {
  priorityFilter: "all" | Priority;
  search: string;
}

export async function listContacts(opts: ListOptions): Promise<Contact[]> {
  let query = neon
    .from(TABLE)
    .select(
      "id, user_id, name, company, role, where_met, notes, priority, created_at, updated_at",
    );

  if (opts.priorityFilter !== "all") {
    query = query.eq("priority", opts.priorityFilter);
  }

  const term = sanitizeSearch(opts.search);
  if (term.length > 0) {
    query = query.or(`name.ilike.*${term}*,company.ilike.*${term}*`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) fail("Could not load contacts", error);
  return (data ?? []) as Contact[];
}

export async function createContact(
  input: NormalizedContact,
): Promise<Contact> {
  const { data, error } = await neon
    .from(TABLE)
    .insert(input)
    .select()
    .single();
  if (error) fail("Could not save contact", error);
  return data as Contact;
}

export async function updateContact(
  id: string,
  input: NormalizedContact,
): Promise<Contact> {
  const { data, error } = await neon
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) fail("Could not update contact", error);
  return data as Contact;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await neon.from(TABLE).delete().eq("id", id);
  if (error) fail("Could not delete contact", error);
}
