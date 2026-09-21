import { redirect } from "next/navigation";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import { requireAssessmentAdmin, AssessmentAuthError } from "@/lib/assessment/services/auth.service";

/**
 * Server Component guard for the /admin/assessment/* route group.
 * Redirects to /login when there is no session or the user is not an
 * assessment_admin.
 */
export async function requireAssessmentAdminPage() {
  const client = await createInsForgeServerClient();
  try {
    const user = await requireAssessmentAdmin(client);
    return { user, client };
  } catch (err) {
    if (err instanceof AssessmentAuthError) {
      redirect("/login");
    }
    throw err;
  }
}
