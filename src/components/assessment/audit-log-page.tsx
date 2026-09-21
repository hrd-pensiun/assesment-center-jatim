"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditLogEntry } from "@/lib/assessment/types";

export function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/assessment/audit-log")
      .then((res) => res.json())
      .then((body) => setEntries(body.entries ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-card bg-card p-5 shadow-card">
        <h1 className="text-2xl font-bold tracking-tight">
          Audit Log<span className="text-accent">.</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Jejak setiap koreksi dan penghapusan data peserta oleh admin.
        </p>
      </div>

      <div className="overflow-hidden rounded-card bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted">Aksi</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted">Percobaan</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted">Perubahan</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted">Admin</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted">Waktu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted">
                  Belum ada aktivitas koreksi/hapus.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => {
                const prev = entry.previous_values as Record<string, unknown>;
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge
                        className={
                          entry.action === "delete"
                            ? "rounded-full bg-danger-soft text-danger hover:bg-danger-soft"
                            : "rounded-full bg-info-soft text-info hover:bg-info-soft"
                        }
                      >
                        {entry.action === "delete" ? "Hapus" : "Koreksi"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/assessment/${entry.attempt_id}`}
                        className="font-medium hover:underline"
                      >
                        {String(prev.participant_nama ?? entry.attempt_id)}
                      </Link>
                      <div className="text-xs text-muted">{String(prev.module_name ?? "")}</div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted">
                      {entry.changed_fields ? JSON.stringify(entry.changed_fields) : "(seluruh data dihapus)"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted">{entry.admin_user_id}</TableCell>
                    <TableCell className="text-muted">
                      {new Date(entry.created_at).toLocaleString("id-ID")}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
