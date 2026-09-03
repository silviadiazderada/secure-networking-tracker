// Shared domain types for the networking tracker.

/** The only priority values the app and database accept. */
export const PRIORITIES = ["high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

/** A contact row as stored in Neon Postgres. */
export interface Contact {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  role: string | null;
  where_met: string | null;
  notes: string | null;
  priority: Priority;
  created_at: string;
  updated_at: string;
}

/** The editable fields a user submits from the contact form. */
export interface ContactInput {
  name: string;
  company?: string | null;
  role?: string | null;
  where_met?: string | null;
  notes?: string | null;
  priority: string;
}

/** Sort and filter controls for the contact list. */
export type SortKey = "name" | "company" | "priority" | "created_at";
export type SortDir = "asc" | "desc";

export interface ContactListControls {
  sortKey: SortKey;
  sortDir: SortDir;
  /** "all" or one of the PRIORITIES values. */
  priorityFilter: "all" | Priority;
  /** Free-text search across name and company. */
  search: string;
}
