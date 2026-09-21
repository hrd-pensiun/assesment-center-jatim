import { NextResponse } from "next/server";
import type { InsForgeClient } from "@insforge/sdk";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import { requireAssessmentAdmin, AssessmentAuthError } from "@/lib/assessment/services/auth.service";

/**
 * Shared entrypoint for every /api/admin/assessment/* route: resolves the
 * session-scoped client, confirms assessment_admin membership, and returns
 * both the client (to reuse for the actual RLS-scoped query) and the user.
 * On auth failure it returns a ready-to-send NextResponse instead.
 */
export async function withAssessmentAdmin(): Promise<
  | { client: InsForgeClient; userId: string }
  | { response: NextResponse }
> {
  const client = await createInsForgeServerClient();
  try {
    const user = await requireAssessmentAdmin(client);
    return { client, userId: user.id };
  } catch (err) {
    if (err instanceof AssessmentAuthError) {
      return { response: NextResponse.json({ error: err.message }, { status: err.status }) };
    }
    return { response: NextResponse.json({ error: "Terjadi kesalahan otorisasi." }, { status: 500 }) };
  }
}
