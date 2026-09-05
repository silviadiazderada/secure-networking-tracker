"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { neon } from "@/lib/neon";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

export function AppHeader() {
  const { user } = useSession();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await neon.auth.signOut();
      toast.dismiss();
      router.replace("/sign-in");
    } catch {
      toast.error("Could not sign out. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <h1 className="text-base font-semibold">Networking Tracker</h1>
          {user?.email ? (
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          ) : null}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          disabled={signingOut}
        >
          <LogOutIcon className="size-4" />
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </header>
  );
}
