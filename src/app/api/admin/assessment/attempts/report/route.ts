import { NextResponse, type NextRequest } from "next/server";
import { withAssessmentAdmin } from "@/lib/assessment/services/route-guard";
import { getAttemptSummaryRows } from "@/lib/assessment/services/attempts.service";
import { parseAttemptFilters } from "@/lib/assessment/services/filters";

// All rows matching the current filters (no pagination), light columns only —
// the participant summary PDF is rendered client-side from this.
export async function GET(request: NextRequest) {
  const guard = await withAssessmentAdmin();
  if ("response" in guard) return guard.response;

  try {
    const { page: _page, pageSize: _pageSize, ...filters } = parseAttemptFilters(request.nextUrl.searchParams);
    return NextResponse.json({ rows: await getAttemptSummaryRows(guard.client, filters) });
  } catch (err) {
    console.error("admin/assessment/attempts/report GET failed", err);
    return NextResponse.json({ error: "Gagal memuat data laporan." }, { status: 500 });
  }
}
