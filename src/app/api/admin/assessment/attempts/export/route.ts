import { NextResponse, type NextRequest } from "next/server";
import { withAssessmentAdmin } from "@/lib/assessment/services/route-guard";
import { exportAttemptsToExcel } from "@/lib/assessment/services/export.service";
import { parseAttemptFilters } from "@/lib/assessment/services/filters";

export async function GET(request: NextRequest) {
  const guard = await withAssessmentAdmin();
  if ("response" in guard) return guard.response;

  const filters = parseAttemptFilters(request.nextUrl.searchParams);

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
