import { NextResponse, type NextRequest } from "next/server";
import { withAssessmentAdmin } from "@/lib/assessment/services/route-guard";
import { listAuditLog } from "@/lib/assessment/repositories/audit-log.repository";

export async function GET(request: NextRequest) {
  const guard = await withAssessmentAdmin();
  if ("response" in guard) return guard.response;

  const params = request.nextUrl.searchParams;
  const page = params.get("page") ? Number(params.get("page")) : 1;

  try {
    const { data, error } = await listAuditLog(guard.client, page);
    if (error) throw new Error(error.message ?? "Gagal memuat audit log.");
    return NextResponse.json({ entries: data ?? [] });
  } catch (err) {
    console.error("admin/assessment/audit-log GET failed", err);
    return NextResponse.json({ error: "Gagal memuat audit log." }, { status: 500 });
  }
}
