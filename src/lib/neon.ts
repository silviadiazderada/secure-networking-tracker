"use client";

import { createClient } from "@neondatabase/neon-js";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";
import type { Database } from "@/lib/database.types";

const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;
const dataApiUrl = process.env.NEXT_PUBLIC_NEON_DATA_API_URL;

if (!authUrl || !dataApiUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_NEON_AUTH_URL or NEXT_PUBLIC_NEON_DATA_API_URL. " +
      "Copy .env.example to .env.local and fill in the values from the Neon console.",
  );
}

/**
 * The single browser-side client.
 *
 * `auth`    -> Neon Managed Better Auth (sign up / in / out, useSession hook)
 * `dataApi` -> Neon Data API (PostgREST). The Better Auth session JWT is
 *              attached to every request automatically, so Postgres resolves
 *              `auth.user_id()` and RLS filters rows to the signed-in user.
 *
 * No database credentials live here — only the two public URLs.
 */
export const neon = createClient<Database>({
  auth: {
    adapter: BetterAuthReactAdapter(),
    url: authUrl,
  },
  dataApi: {
    url: dataApiUrl,
  },
});
