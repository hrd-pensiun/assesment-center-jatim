"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TestTypeBadge, PassBadge } from "@/components/assessment/status-badges";
import type { AssessmentAttempt } from "@/lib/assessment/types";

interface ModuleOption {
  module_code: string;
  module_name: string;
}

const ALL = "__all__";

export function AssessmentListPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState(ALL);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [passFilter, setPassFilter] = useState(ALL);

  const fetchAttempts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (moduleFilter !== ALL) params.set("module_code", moduleFilter);
    if (typeFilter !== ALL) params.set("test_type", typeFilter);
    if (passFilter !== ALL) params.set("is_passed", passFilter);
    params.set("pageSize", "100");

    const res = await fetch(`/api/admin/assessment/attempts?${params.toString()}`);
    const body = await res.json().catch(() => ({}));
    setAttempts(res.ok ? (body.attempts ?? []) : []);
    setLoading(false);
  }, [search, moduleFilter, typeFilter, passFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchAttempts, 250);
    return () => clearTimeout(timeout);
  }, [fetchAttempts]);

  useEffect(() => {
    fetch("/api/admin/assessment/modules")
      .then((res) => res.json())
      .then((body) => setModules(body.modules ?? []))
      .catch(() => setModules([]));
  }, []);

  function exportHref() {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (moduleFilter !== ALL) params.set("module_code", moduleFilter);
    if (typeFilter !== ALL) params.set("test_type", typeFilter);
    if (passFilter !== ALL) params.set("is_passed", passFilter);
    return `/api/admin/assessment/attempts/export?${params.toString()}`;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-card bg-card p-5 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Peserta Assessment<span className="text-accent">.</span>
            </h1>
            <p className="mt-1 text-sm text-muted">
              Semua hasil pre-test dan post-test yang masuk dari halaman assessment.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama peserta..."
                className="w-56 rounded-full border-0 bg-surface pl-9"
              />
            </div>
            <a href={exportHref()}>
              <Button variant="outline" className="rounded-full">
                <Download className="size-4" />
                Export Excel
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Select value={moduleFilter} onValueChange={(v) => setModuleFilter(v ?? ALL)}>
            <SelectTrigger className="w-[200px] rounded-full bg-surface">
              <SelectValue>
                {(v: string) =>
                  v === ALL ? "Semua modul" : (modules.find((m) => m.module_code === v)?.module_name ?? v)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua modul</SelectItem>
              {modules.map((m) => (
                <SelectItem key={m.module_code} value={m.module_code}>
                  {m.module_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? ALL)}>
            <SelectTrigger className="w-[160px] rounded-full bg-surface">
              <SelectValue>
                {(v: string) =>
                  v === ALL ? "Semua tipe tes" : v === "pre" ? "Pre-Test" : "Post-Test"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua tipe tes</SelectItem>
              <SelectItem value="pre">Pre-Test</SelectItem>
              <SelectItem value="post">Post-Test</SelectItem>
            </SelectContent>
          </Select>

          <Select value={passFilter} onValueChange={(v) => setPassFilter(v ?? ALL)}>
            <SelectTrigger className="w-[160px] rounded-full bg-surface">
              <SelectValue>
                {(v: string) =>
                  v === ALL ? "Semua status" : v === "true" ? "Lulus" : "Belum lulus"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua status</SelectItem>
              <SelectItem value="true">Lulus</SelectItem>
              <SelectItem value="false">Belum lulus</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-card bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted">Nama</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted">Jabatan</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted">Modul</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted">Tipe</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted">Skor</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted">Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : attempts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted">
                  Belum ada peserta yang cocok dengan filter ini.
                </TableCell>
              </TableRow>
            ) : (
              attempts.map((attempt) => (
                <TableRow
                  key={attempt.id}
                  className="cursor-pointer hover:bg-surface-2"
                  onClick={() => router.push(`/admin/assessment/${attempt.id}`)}
                >
                  <TableCell className="font-medium">{attempt.participant_nama}</TableCell>
                  <TableCell className="text-muted">{attempt.participant_jabatan}</TableCell>
                  <TableCell>{attempt.module_name}</TableCell>
                  <TableCell>
                    <TestTypeBadge testType={attempt.test_type} />
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">{attempt.score}</TableCell>
                  <TableCell>
                    <PassBadge attempt={attempt} />
                  </TableCell>
                  <TableCell className="text-muted">
                    {new Date(attempt.created_at).toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
