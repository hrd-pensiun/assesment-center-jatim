import { NextResponse, type NextRequest } from "next/server";
import { withAssessmentAdmin } from "@/lib/assessment/services/route-guard";
import {
  AttemptNotFoundError,
  AttemptValidationError,
  getAttemptDetail,
  removeAttempt,
  updateAttempt,
} from "@/lib/assessment/services/attempts.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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
    console.error("admin/assessment/attempts/[id] GET failed", err);
    return NextResponse.json({ error: "Gagal memuat detail peserta." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const guard = await withAssessmentAdmin();
  if ("response" in guard) return guard.response;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));

  try {
    const updated = await updateAttempt(guard.client, guard.userId, id, body);
    return NextResponse.json({ attempt: updated });
  } catch (err) {
    if (err instanceof AttemptNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof AttemptValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("admin/assessment/attempts/[id] PATCH failed", err);
    return NextResponse.json({ error: "Gagal memperbarui data peserta." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const guard = await withAssessmentAdmin();
  if ("response" in guard) return guard.response;
  const { id } = await params;

  try {
    await removeAttempt(guard.client, guard.userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AttemptNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error("admin/assessment/attempts/[id] DELETE failed", err);
    return NextResponse.json({ error: "Gagal menghapus data peserta." }, { status: 500 });
  }
}
