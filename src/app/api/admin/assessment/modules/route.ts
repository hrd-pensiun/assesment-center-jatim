import { NextResponse } from "next/server";
import { withAssessmentAdmin } from "@/lib/assessment/services/route-guard";
import { listAttempts } from "@/lib/assessment/repositories/attempts.repository";

// Modules are hardcoded in wit-assessment.html's MODULES const (out of
// scope for this dashboard to manage). We derive the filter dropdown's
// options from modules that actually have at least one recorded attempt.
export async function GET() {
  const guard = await withAssessmentAdmin();
  if ("response" in guard) return guard.response;

  try {
    const { data, error } = await listAttempts(guard.client, { page: 1, pageSize: 500 });
    if (error) throw new Error(error.message ?? "Gagal memuat daftar modul.");

    const seen = new Map<string, string>();
    for (const attempt of data ?? []) {
      if (!seen.has(attempt.module_code)) seen.set(attempt.module_code, attempt.module_name);
    }
    const modules = Array.from(seen.entries()).map(([module_code, module_name]) => ({
      module_code,
      module_name,
    }));

    return NextResponse.json({ modules });
  } catch (err) {
    console.error("admin/assessment/modules GET failed", err);
    return NextResponse.json({ error: "Gagal memuat daftar modul." }, { status: 500 });
  }
}
