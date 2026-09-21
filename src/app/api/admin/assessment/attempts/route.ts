import { NextResponse, type NextRequest } from "next/server";
import { withAssessmentAdmin } from "@/lib/assessment/services/route-guard";
import { getAttemptsList } from "@/lib/assessment/services/attempts.service";
import type { AttemptFilters, TestType } from "@/lib/assessment/types";

export async function GET(request: NextRequest) {
  const guard = await withAssessmentAdmin();
  if ("response" in guard) return guard.response;

  const params = request.nextUrl.searchParams;
  const filters: AttemptFilters = {
    module_code: params.get("module_code") ?? undefined,
    test_type: (params.get("test_type") as TestType | null) ?? undefined,
    is_passed:
      params.get("is_passed") === "true" ? true : params.get("is_passed") === "false" ? false : undefined,
    q: params.get("q") ?? undefined,
    page: params.get("page") ? Number(params.get("page")) : undefined,
    pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : undefined,
  };

  try {
    const attempts = await getAttemptsList(guard.client, filters);
    return NextResponse.json({ attempts });
  } catch (err) {
    console.error("admin/assessment/attempts GET failed", err);
    return NextResponse.json({ error: "Gagal memuat daftar peserta." }, { status: 500 });
  }
}
