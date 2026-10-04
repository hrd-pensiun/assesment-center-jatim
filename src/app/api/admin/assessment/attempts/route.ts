import { NextResponse, type NextRequest } from "next/server";
import { withAssessmentAdmin } from "@/lib/assessment/services/route-guard";
import { getAttemptsList } from "@/lib/assessment/services/attempts.service";
import { parseAttemptFilters } from "@/lib/assessment/services/filters";

export async function GET(request: NextRequest) {
  const guard = await withAssessmentAdmin();
  if ("response" in guard) return guard.response;

  try {
    const { attempts, total } = await getAttemptsList(guard.client, parseAttemptFilters(request.nextUrl.searchParams));
    return NextResponse.json({ attempts, total });
  } catch (err) {
    console.error("admin/assessment/attempts GET failed", err);
    return NextResponse.json({ error: "Gagal memuat daftar peserta." }, { status: 500 });
  }
}
