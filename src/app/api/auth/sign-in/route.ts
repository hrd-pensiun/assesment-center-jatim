import { NextResponse, type NextRequest } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Email dan password wajib diisi." },
      { status: 400 },
    );
  }

  const { data, error } = await auth.signInWithPassword({ email, password });
  if (error || !data?.user) {
    return NextResponse.json(
      {
        error: error?.error ?? "AUTH_UNAUTHORIZED",
        message: error?.message ?? "Email atau password salah.",
      },
      { status: error?.statusCode ?? 401 },
    );
  }

  return NextResponse.json({ user: data.user }, { headers: response.headers });
}
