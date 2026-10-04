"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, History, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FEATURES = [
  { icon: ClipboardList, label: "Hasil pre-test & post-test seluruh peserta" },
  { icon: History, label: "Koreksi data peserta dengan audit log" },
  { icon: FileDown, label: "Export Excel dan unduh ulang laporan PDF" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(body.message ?? "Gagal login.");
      setLoading(false);
      return;
    }

    router.replace("/admin/assessment");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(700px 380px at 90% -5%, var(--color-accent-soft), transparent 62%), radial-gradient(500px 300px at 0% 100%, var(--color-accent-soft), transparent 60%)",
        }}
      />

      <div className="relative grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <section className="hidden lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">WIT Assessment</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight">
            Satu pintu untuk hasil assessment peserta<span className="text-accent">.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Pantau hasil pre-test dan post-test, koreksi data, dan unduh laporan dalam satu ruang kerja.
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3.5 shadow-card">
                <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-medium">{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="w-full max-w-md justify-self-center rounded-card bg-card p-7 shadow-float lg:justify-self-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/branding/wit-logo-black.png" alt="WIT.ID" className="h-8 w-auto" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Selamat datang<span className="text-accent">.</span>
          </h2>
          <p className="mt-1.5 text-sm text-muted">Masuk dengan akun admin Back Office Anda.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wit.id"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Kata sandi</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
              />
            </div>
            <p className="text-xs text-muted">Gunakan akun yang terdaftar di sistem.</p>

            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
