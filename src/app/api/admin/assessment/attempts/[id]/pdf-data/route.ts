import { NextResponse, type NextRequest } from "next/server";
import { withAssessmentAdmin } from "@/lib/assessment/services/route-guard";
import { AttemptNotFoundError, getAttemptDetail } from "@/lib/assessment/services/attempts.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Returns the raw attempt data the detail page needs to re-render the same
// #report markup wit-assessment.html uses, so the client can regenerate an
// identical-looking PDF with html2pdf.js. No PDF is generated server-side.
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const guard = await withAssessmentAdmin();
  if ("response" in guard) return guard.response;
  const { id } = await params;

  try {
    const attempt = await getAttemptDetail(guard.client, id);
    return NextResponse.json({ attempt });
  } catch (err) {
    if (err instanceof AttemptNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error("admin/assessment/attempts/[id]/pdf-data GET failed", err);
    return NextResponse.json({ error: "Gagal memuat data untuk PDF." }, { status: 500 });
  }
}
