import { NextResponse, type NextRequest } from "next/server";
import { createInsForgeAnonClient } from "@/lib/insforge/anon";
import { parseSubmitPayload, submitAttempt, SubmitValidationError } from "@/lib/assessment/services/submit.service";

// Public, no-auth endpoint — called directly from the static
// wit-assessment.html page when a participant finishes a quiz.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
  }

  try {
    const input = parseSubmitPayload(body);
    const client = createInsForgeAnonClient();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const attempt = await submitAttempt(client, input, ip);
    return NextResponse.json({ id: attempt?.id }, { status: 201 });
  } catch (err) {
    if (err instanceof SubmitValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("assessment/submit failed", err);
    return NextResponse.json(
      { error: "Gagal menyimpan hasil assessment. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
