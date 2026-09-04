"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createContact,
  deleteContact,
  listContacts,
  updateContact,
} from "@/lib/contacts";
import {
  PRIORITY_RANK,
  type Contact,
  type ContactListControls,
  type Priority,
} from "@/lib/types";
import type { NormalizedContact } from "@/lib/validation";

const DEFAULT_CONTROLS: ContactListControls = {
  sortKey: "created_at",
  sortDir: "desc",
  priorityFilter: "all",
  search: "",
};

type Status = "loading" | "ready" | "error";

/**
 * Owns the contact list state: fetching (with the priority filter + search
 * applied by the Data API), client-side sorting, and the create/update/delete
 * mutations. Every mutation refetches so the list always matches the database.
 */
export function useContacts() {
  const [controls, setControls] = useState<ContactListControls>(DEFAULT_CONTROLS);
  const [rows, setRows] = useState<Contact[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus((s) => (s === "ready" ? "ready" : "loading"));
    setError(null);
    try {
      const data = await listContacts({
        priorityFilter: controls.priorityFilter,
        search: controls.search,
      });
      setRows(data);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }, [controls.priorityFilter, controls.search]);

  // Debounce so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(load, controls.search ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, controls.search]);

  const contacts = useMemo(() => {
    const sorted = [...rows];
    const dir = controls.sortDir === "asc" ? 1 : -1;
    sorted.sort((a, b) => {
      let cmp: number;
      if (controls.sortKey === "priority") {
        cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      } else if (controls.sortKey === "created_at") {
        cmp = a.created_at.localeCompare(b.created_at);
      } else {
        cmp = (a[controls.sortKey] ?? "")
          .toLowerCase()
          .localeCompare((b[controls.sortKey] ?? "").toLowerCase());
      }
      return cmp !== 0 ? cmp * dir : a.name.localeCompare(b.name);
    });
    return sorted;
  }, [rows, controls.sortKey, controls.sortDir]);

  const setControl = useCallback(
    <K extends keyof ContactListControls>(
      key: K,
      value: ContactListControls[K],
    ) => setControls((c) => ({ ...c, [key]: value })),
    [],
  );

  const toggleSort = useCallback((key: ContactListControls["sortKey"]) => {
    setControls((c) =>
      c.sortKey === key
        ? { ...c, sortDir: c.sortDir === "asc" ? "desc" : "asc" }
        : { ...c, sortKey: key, sortDir: key === "created_at" ? "desc" : "asc" },
    );
  }, []);

  const create = useCallback(
    async (input: NormalizedContact) => {
      await createContact(input);
      await load();
    },
    [load],
  );

  const update = useCallback(
    async (id: string, input: NormalizedContact) => {
      await updateContact(id, input);
      await load();
    },
    [load],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteContact(id);
      await load();
    },
    [load],
  );

  const isFiltered =
    controls.priorityFilter !== "all" || controls.search.trim().length > 0;

  return {
    contacts,
    status,
    error,
    controls,
    setControl,
    toggleSort,
    isFiltered,
    refetch: load,
    create,
    update,
    remove,
  };
}

export type PriorityFilter = "all" | Priority;
