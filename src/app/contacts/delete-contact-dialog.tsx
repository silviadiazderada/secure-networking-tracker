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
import type { Contact } from "@/lib/types";

interface Props {
  contact: Contact | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => Promise<void>;
}

export function DeleteContactDialog({ contact, onOpenChange, onConfirm }: Props) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    if (!contact) return;
    setDeleting(true);
    try {
      await onConfirm(contact.id);
      toast.success("Contact deleted.");
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete contact.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={Boolean(contact)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete contact</DialogTitle>
          <DialogDescription>
            Delete <span className="font-medium text-foreground">{contact?.name}</span>?
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
