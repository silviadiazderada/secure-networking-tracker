"use client";

import { neon } from "@/lib/neon";

export interface SessionState {
  status: "loading" | "authenticated" | "unauthenticated";
  user: { id: string; email: string; name?: string | null } | null;
}

/** Normalized wrapper over the Better Auth `useSession` hook. */
export function useSession(): SessionState {
  const { data, isPending } = neon.auth.useSession();

  if (isPending) return { status: "loading", user: null };
  if (!data?.user) return { status: "unauthenticated", user: null };

  return {
    status: "authenticated",
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
    },
  };
}
