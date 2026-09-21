import { createClient } from "@insforge/sdk";

/**
 * Unauthenticated client (the `anon` Postgres role). Used ONLY by the
 * public assessment submit endpoint — no cookies, no session, matches
 * exactly what the static wit-assessment.html page would get if it
 * talked to InsForge directly. RLS restricts it to INSERT on
 * assessment_attempts.
 */
export function createInsForgeAnonClient() {
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
  });
}
