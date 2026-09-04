"use client";

import { useState } from "react";
import { useContacts } from "@/hooks/use-contacts";
import { PRIORITIES, PRIORITY_LABEL, type Contact } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContactList } from "./contact-list";
import { ContactDialog } from "./contact-dialog";
import { DeleteContactDialog } from "./delete-contact-dialog";
import { Loader2Icon, PlusIcon, SearchIcon, UsersIcon } from "lucide-react";

type DialogState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; contact: Contact };

export function ContactsView() {
  const {
    contacts,
    status,
    error,
    controls,
    setControl,
    toggleSort,
    isFiltered,
    refetch,
    create,
    update,
    remove,
  } = useContacts();

  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Contacts</h2>
          <p className="text-sm text-muted-foreground">
            {status === "ready"
              ? `${contacts.length} ${contacts.length === 1 ? "contact" : "contacts"}${
                  isFiltered ? " match your filters" : ""
                }`
              : " "}
          </p>
        </div>
        <Button onClick={() => setDialog({ kind: "create" })}>
          <PlusIcon className="size-4" />
          Add contact
        </Button>
      </div>

      {/* Filter + search controls */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={controls.search}
            onChange={(e) => setControl("search", e.target.value)}
            placeholder="Search name or company"
            className="pl-8"
            aria-label="Search contacts"
          />
        </div>
        <Select
          value={controls.priorityFilter}
          onValueChange={(v) =>
            setControl(
              "priorityFilter",
              (v as typeof controls.priorityFilter | null) ?? "all",
            )
          }
        >
          <SelectTrigger className="sm:w-44" aria-label="Filter by priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* States */}
      {status === "loading" ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
          <Loader2Icon className="size-5 animate-spin" />
          Loading contacts…
        </div>
      ) : status === "error" ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={refetch}>
            Try again
          </Button>
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <UsersIcon className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium">
            {isFiltered ? "No contacts match your filters" : "No contacts yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isFiltered
              ? "Try a different search or priority."
              : "Add the first person you want to stay connected with."}
          </p>
          {isFiltered ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setControl("search", "");
                setControl("priorityFilter", "all");
              }}
            >
              Clear filters
            </Button>
          ) : (
            <Button
              size="sm"
              className="mt-4"
              onClick={() => setDialog({ kind: "create" })}
            >
              <PlusIcon className="size-4" />
              Add contact
            </Button>
          )}
        </div>
      ) : (
        <ContactList
          contacts={contacts}
          controls={controls}
          onToggleSort={toggleSort}
          onEdit={(contact) => setDialog({ kind: "edit", contact })}
          onDelete={(contact) => setPendingDelete(contact)}
        />
      )}

      <ContactDialog
        open={dialog.kind !== "closed"}
        onOpenChange={(open) => !open && setDialog({ kind: "closed" })}
        contact={dialog.kind === "edit" ? dialog.contact : null}
        onSubmit={(value) =>
          dialog.kind === "edit"
            ? update(dialog.contact.id, value)
            : create(value)
        }
      />

      <DeleteContactDialog
        contact={pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={remove}
      />
    </main>
  );
}
