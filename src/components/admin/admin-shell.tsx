"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { ClipboardList, History, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/assessment", label: "Peserta", icon: ClipboardList },
  { href: "/admin/assessment/audit-log", label: "Audit Log", icon: History },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <div className="relative flex min-h-screen gap-4 bg-surface p-3 lg:p-4">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(600px 320px at 92% -6%, var(--color-accent-soft), transparent 62%), radial-gradient(500px 260px at 100% 0%, var(--color-accent-soft), transparent 55%)",
        }}
      />

      {/* Floating dark rail */}
      <aside className="hidden w-60 shrink-0 flex-col rounded-[28px] bg-ink p-3 text-on-ink shadow-float md:flex">
        <div className="flex items-center gap-2 px-2 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/branding/wit-logo-white.png" alt="WIT.ID" className="h-6 w-auto" />
          <div className="h-6 w-px bg-white/15" />
          <div className="text-[10px] font-semibold uppercase tracking-wider text-on-ink-muted">
            Back Office
          </div>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-white shadow-glow"
                    : "text-on-ink-muted hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-white/10 pt-3">
          <div className="rounded-2xl bg-ink-2 px-3 py-2.5 text-xs">
            <div className="text-on-ink-muted">Masuk sebagai</div>
            <div className="truncate font-semibold text-white">{email}</div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending}
            className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium text-on-ink-muted transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <LogOut className="size-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile top nav (no rail below md) */}
      <div className="fixed inset-x-3 top-3 z-40 flex items-center gap-2 rounded-2xl bg-ink px-3 py-2 text-on-ink shadow-float md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/branding/wit-logo-white.png" alt="WIT.ID" className="h-5 w-auto shrink-0 px-1" />
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs font-semibold",
                active ? "bg-accent text-white" : "text-on-ink-muted",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleSignOut}
          className="grid size-9 shrink-0 place-items-center rounded-xl text-on-ink-muted"
        >
          <LogOut className="size-4" />
        </button>
      </div>

      <main className="min-w-0 flex-1 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
