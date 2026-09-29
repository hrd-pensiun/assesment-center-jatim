"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-card bg-card p-6 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/branding/wit-logo-black.png" alt="WIT.ID" className="mb-3 h-8 w-auto" />
          <p className="mt-1 text-sm text-muted">Masuk sebagai admin Back Office</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}
