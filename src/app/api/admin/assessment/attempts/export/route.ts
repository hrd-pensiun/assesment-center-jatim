import { NextResponse, type NextRequest } from "next/server";
import { withAssessmentAdmin } from "@/lib/assessment/services/route-guard";
import { exportAttemptsToExcel } from "@/lib/assessment/services/export.service";
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
  };

  try {
    const buffer = await exportAttemptsToExcel(guard.client, filters);
    return new NextResponse(buffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="assessment-hasil-${Date.now()}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("admin/assessment/attempts/export GET failed", err);
    return NextResponse.json({ error: "Gagal membuat file Excel." }, { status: 500 });
  }
}
