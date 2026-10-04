import { NextResponse, type NextRequest } from "next/server";
import { withAssessmentAdmin } from "@/lib/assessment/services/route-guard";
import { getAttemptStats } from "@/lib/assessment/services/attempts.service";
import { parseAttemptFilters } from "@/lib/assessment/services/filters";

export async function GET(request: NextRequest) {
  const guard = await withAssessmentAdmin();
  if ("response" in guard) return guard.response;

  try {
    const { page: _page, pageSize: _pageSize, ...filters } = parseAttemptFilters(request.nextUrl.searchParams);
    return NextResponse.json({ stats: await getAttemptStats(guard.client, filters) });
  } catch (err) {
    console.error("admin/assessment/attempts/stats GET failed", err);
    return NextResponse.json({ error: "Gagal memuat statistik." }, { status: 500 });
  }
}
