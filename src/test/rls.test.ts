import { describe, it, expect, beforeAll } from "vitest";

/**
 * Automated two-account privacy test.
 *
 * Proves, end to end against the live Neon Data API, that Row Level Security
 * stops one signed-in user from reading or changing another user's contacts.
 *
 * Requires two pre-created test accounts and these env vars (see .env.example):
 *   NEON_AUTH_BASE_URL (or NEXT_PUBLIC_NEON_AUTH_URL)
 *   NEXT_PUBLIC_NEON_DATA_API_URL
 *   RLS_TEST_USER_A_EMAIL / RLS_TEST_USER_A_PASSWORD
 *   RLS_TEST_USER_B_EMAIL / RLS_TEST_USER_B_PASSWORD
 * If they are absent the whole suite is skipped so `npm test` still passes.
 */

const authBase =
  process.env.NEON_AUTH_BASE_URL ?? process.env.NEXT_PUBLIC_NEON_AUTH_URL;
const dataApi = process.env.NEXT_PUBLIC_NEON_DATA_API_URL;
const A = {
  email: process.env.RLS_TEST_USER_A_EMAIL,
  password: process.env.RLS_TEST_USER_A_PASSWORD,
};
const B = {
  email: process.env.RLS_TEST_USER_B_EMAIL,
  password: process.env.RLS_TEST_USER_B_PASSWORD,
};

const ready =
  Boolean(authBase && dataApi && A.email && A.password && B.email && B.password);

/** Sign in with Better Auth and exchange the session for a Data API JWT. */
async function getJwt(email: string, password: string): Promise<string> {
  // Better Auth requires an Origin header on POST (CSRF protection); a browser
  // sends one automatically.
  const origin = new URL(authBase!).origin;
  const signIn = await fetch(`${authBase}/sign-in/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify({ email, password }),
  });
  if (!signIn.ok) {
    throw new Error(`sign-in failed for ${email}: ${signIn.status}`);
  }
  const cookie = signIn.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .find((c) => c.startsWith("__Secure-neon-auth.session_token="));
  if (!cookie) throw new Error("no session cookie returned");

  const tokenRes = await fetch(`${authBase}/token`, { headers: { cookie } });
  if (!tokenRes.ok) {
    throw new Error(`token exchange failed for ${email}: ${tokenRes.status}`);
  }
  const { token } = (await tokenRes.json()) as { token: string };
  return token;
}

function api(jwt: string, path: string, init: RequestInit = {}) {
  return fetch(`${dataApi}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${jwt}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

describe.skipIf(!ready)("RLS: one user cannot touch another user's contacts", () => {
  let jwtA = "";
  let jwtB = "";
  let victimId = "";

  beforeAll(async () => {
    jwtA = await getJwt(A.email!, A.password!);
    jwtB = await getJwt(B.email!, B.password!);

    // User A creates a contact. Note: user_id is never sent — it defaults to
    // auth.user_id() from A's JWT.
    const res = await api(jwtA, "/contacts", {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({
        name: "RLS Victim (A)",
        priority: "high",
      }),
    });
    expect(res.status).toBe(201);
    const [row] = (await res.json()) as Array<{ id: string; user_id: string }>;
    victimId = row.id;
  });

  it("A can read its own new contact", async () => {
    const res = await api(jwtA, `/contacts?id=eq.${victimId}&select=id,name`);
    const rows = (await res.json()) as unknown[];
    expect(rows).toHaveLength(1);
  });

  it("B cannot read A's contact (RLS select policy)", async () => {
    const res = await api(jwtB, `/contacts?id=eq.${victimId}&select=id,name`);
    expect(res.ok).toBe(true);
    expect(await res.json()).toEqual([]);
  });

  it("B cannot update A's contact (RLS update policy)", async () => {
    const res = await api(jwtB, `/contacts?id=eq.${victimId}`, {
      method: "PATCH",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({ name: "hacked by B" }),
    });
    expect(await res.json()).toEqual([]); // zero rows matched

    const check = await api(
      jwtA,
      `/contacts?id=eq.${victimId}&select=name`,
    );
    const [row] = (await check.json()) as Array<{ name: string }>;
    expect(row.name).toBe("RLS Victim (A)");
  });

  it("B cannot delete A's contact (RLS delete policy)", async () => {
    await api(jwtB, `/contacts?id=eq.${victimId}`, { method: "DELETE" });
    const check = await api(jwtA, `/contacts?id=eq.${victimId}&select=id`);
    expect((await check.json()) as unknown[]).toHaveLength(1);
  });

  it("B cannot create a row owned by A (RLS insert WITH CHECK)", async () => {
    const aId = JSON.parse(
      Buffer.from(jwtA.split(".")[1], "base64").toString(),
    ).sub as string;
    const res = await api(jwtB, "/contacts", {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({
        name: "planted by B",
        priority: "low",
        user_id: aId,
      }),
    });
    expect(res.status).toBe(403);
  });

  it("cleanup: A deletes the test contact", async () => {
    const res = await api(jwtA, `/contacts?id=eq.${victimId}`, {
      method: "DELETE",
    });
    expect(res.ok).toBe(true);
  });
});
