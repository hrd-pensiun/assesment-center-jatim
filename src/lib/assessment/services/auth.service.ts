import type { InsForgeClient } from "@insforge/sdk";

export class AssessmentAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Confirms the caller has an active session AND is a member of
 * assessment_admin_users (checked via the public.is_assessment_admin()
 * RPC, which is SECURITY DEFINER so `authenticated` can call it even
 * though it can't read assessment_admin_users directly). Throws
 * AssessmentAuthError(401) when unauthenticated, (403) when authenticated
 * but not an assessment_admin.
 *
 * Callers should keep using the SAME session-scoped client for the
 * actual CRUD that follows — RLS enforces the same membership check
 * independently at the database level.
 */
export async function requireAssessmentAdmin(client: InsForgeClient) {
  const { data: userData, error: userError } = await client.auth.getCurrentUser();
  if (userError || !userData?.user) {
    throw new AssessmentAuthError("Anda harus login untuk mengakses halaman ini.", 401);
  }

  const { data: isAdmin, error: rpcError } = await client.database.rpc("is_assessment_admin");
  if (rpcError || isAdmin !== true) {
    throw new AssessmentAuthError(
      "Akun Anda tidak memiliki akses assessment_admin.",
      403,
    );
  }

  return userData.user;
}
