"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDownIcon, ArrowUpIcon, MoreHorizontalIcon } from "lucide-react";
import {
  PRIORITY_LABEL,
  type Contact,
  type ContactListControls,
  type SortKey,
} from "@/lib/types";

const PRIORITY_VARIANT: Record<
  Contact["priority"],
  "destructive" | "default" | "secondary"
> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface Props {
  contacts: Contact[];
  controls: ContactListControls;
  onToggleSort: (key: SortKey) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: ContactListControls["sortDir"];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 font-medium hover:text-foreground"
    >
      {label}
      {active ? (
        dir === "asc" ? (
          <ArrowUpIcon className="size-3.5" />
        ) : (
          <ArrowDownIcon className="size-3.5" />
        )
      ) : null}
    </button>
  );
}

function RowActions({
  contact,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  onEdit: (c: Contact) => void;
  onDelete: (c: Contact) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={`Actions for ${contact.name}`}>
            <MoreHorizontalIcon className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(contact)}>Edit</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(contact)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ContactList({
  contacts,
  controls,
  onToggleSort,
  onEdit,
  onDelete,
}: Props) {
  return (
    <>
      {/* Desktop / tablet: table */}
      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton
                  label="Name"
                  active={controls.sortKey === "name"}
                  dir={controls.sortDir}
                  onClick={() => onToggleSort("name")}
                />
              </TableHead>
              <TableHead>
                <SortButton
                  label="Company"
                  active={controls.sortKey === "company"}
                  dir={controls.sortDir}
                  onClick={() => onToggleSort("company")}
                />
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Where met</TableHead>
              <TableHead>
                <SortButton
                  label="Priority"
                  active={controls.sortKey === "priority"}
                  dir={controls.sortDir}
                  onClick={() => onToggleSort("priority")}
                />
              </TableHead>
              <TableHead>
                <SortButton
                  label="Added"
                  active={controls.sortKey === "created_at"}
                  dir={controls.sortDir}
                  onClick={() => onToggleSort("created_at")}
                />
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.company ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{c.role ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{c.where_met ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={PRIORITY_VARIANT[c.priority]}>
                    {PRIORITY_LABEL[c.priority]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDate(c.created_at)}
                </TableCell>
                <TableCell>
                  <RowActions contact={c} onEdit={onEdit} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
      <ul className="grid gap-3 md:hidden">
        {contacts.map((c) => (
          <li key={c.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{c.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {[c.role, c.company].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <RowActions contact={c} onEdit={onEdit} onDelete={onDelete} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={PRIORITY_VARIANT[c.priority]}>
                {PRIORITY_LABEL[c.priority]}
              </Badge>
              {c.where_met ? <span>Met: {c.where_met}</span> : null}
              <span>Added {formatDate(c.created_at)}</span>
            </div>
            {c.notes ? (
              <p className="mt-2 text-sm whitespace-pre-wrap">{c.notes}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}
