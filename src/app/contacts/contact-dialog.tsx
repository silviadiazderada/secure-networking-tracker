"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRIORITIES,
  PRIORITY_LABEL,
  type Contact,
  type Priority,
} from "@/lib/types";
import { validateContact, type NormalizedContact } from "@/lib/validation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing; absent when creating. */
  contact?: Contact | null;
  onSubmit: (value: NormalizedContact) => Promise<void>;
}

type FormState = {
  name: string;
  company: string;
  role: string;
  where_met: string;
  notes: string;
  priority: string;
};

const EMPTY: FormState = {
  name: "",
  company: "",
  role: "",
  where_met: "",
  notes: "",
  priority: "medium",
};

function fromContact(c: Contact): FormState {
  return {
    name: c.name,
    company: c.company ?? "",
    role: c.role ?? "",
    where_met: c.where_met ?? "",
    notes: c.notes ?? "",
    priority: c.priority,
  };
}

export function ContactDialog({ open, onOpenChange, contact, onSubmit }: Props) {
  const isEdit = Boolean(contact);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit contact" : "Add contact"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this contact."
              : "Add someone you want to stay connected with."}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <ContactForm
            key={contact?.id ?? "new"}
            contact={contact ?? null}
            onSubmit={onSubmit}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ContactForm({
  contact,
  onSubmit,
  onDone,
}: {
  contact: Contact | null;
  onSubmit: (value: NormalizedContact) => Promise<void>;
  onDone: () => void;
}) {
  const isEdit = Boolean(contact);
  const [form, setForm] = useState<FormState>(() =>
    contact ? fromContact(contact) : EMPTY,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validateContact(form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await onSubmit(result.value);
      toast.success(isEdit ? "Contact updated." : "Contact added.");
      onDone();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save contact.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          aria-invalid={Boolean(errors.name)}
          autoFocus
        />
        {errors.name ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="where_met">Where you met</Label>
          <Input
            id="where_met"
            value={form.where_met}
            onChange={(e) => set("where_met", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={form.priority}
            onValueChange={(v) => set("priority", v ?? "medium")}
          >
            <SelectTrigger id="priority" className="w-full">
              <SelectValue placeholder="Select priority">
                {(value: string | null) =>
                  value ? PRIORITY_LABEL[value as Priority] : "Select priority"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.priority ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.priority}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onDone}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add contact"}
        </Button>
      </DialogFooter>
    </form>
  );
}
