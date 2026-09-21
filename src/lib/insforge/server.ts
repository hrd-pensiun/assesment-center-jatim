import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

/**
 * Per-request client scoped to the signed-in user's session (if any).
 * RLS applies exactly as it would for that user — this is what admin
 * CRUD on assessment_attempts / assessment_audit_log should run through,
 * so `assessment_admin` access is enforced by Postgres, not just by app code.
 */
export async function createInsForgeServerClient() {
  return createServerClient({
    cookies: await cookies(),
  });
}
