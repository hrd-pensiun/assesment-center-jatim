"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileText,
  RotateCcw,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { AssessmentAttempt, AttemptSummaryRow } from "@/lib/assessment/types";

interface ModuleOption {
  module_code: string;
  module_name: string;
}

interface Stats {
  totalParticipants: number;
  totalAttempts: number;
  totalPre: number;
  totalPost: number;
  averageScore: number | null;
}

const ALL = "__all__";
const PAGE_SIZES = ["10", "25", "50"];
const HEAD = "text-xs font-semibold uppercase tracking-wide text-muted";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Users;
  loading: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-card bg-card p-5 shadow-card">
      <div className="min-w-0">
        <div className="text-[13px] font-semibold">{label}</div>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-16" />
        ) : (
          <div className="mt-1 font-mono text-[28px] font-extrabold leading-none tracking-tight tabular-nums">
            {value}
          </div>
        )}
        <div className="mt-1.5 text-xs text-muted">{hint}</div>
      </div>
      <span className="grid size-[42px] shrink-0 place-items-center rounded-[13px] bg-accent-soft text-accent">
        <Icon className="size-5" />
      </span>
    </div>
  );
}

function pageNumbers(current: number, last: number): (number | "…")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const pages = new Set([1, last, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function AssessmentListPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [total, setTotal] = useState(0);
  const [shownOffset, setShownOffset] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState(ALL);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [passFilter, setPassFilter] = useState(ALL);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");

  const [pdfBusy, setPdfBusy] = useState(false);

  const requestId = useRef(0);

  const filterQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (moduleFilter !== ALL) params.set("module_code", moduleFilter);
    if (typeFilter !== ALL) params.set("test_type", typeFilter);
    if (passFilter !== ALL) params.set("is_passed", passFilter);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    return params;
  }, [search, moduleFilter, typeFilter, passFilter, dateFrom, dateTo]);

  const hasFilters = filterQuery.size > 0;
  const lastPage = Math.max(1, Math.ceil(total / Number(pageSize)));

  const fetchData = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setStatsLoading(true);

    const listParams = new URLSearchParams(filterQuery);
    listParams.set("page", String(page));
    listParams.set("pageSize", pageSize);

    const [listRes, statsRes] = await Promise.all([
      fetch(`/api/admin/assessment/attempts?${listParams.toString()}`),
      fetch(`/api/admin/assessment/attempts/stats?${filterQuery.toString()}`),
    ]);
    const listBody = await listRes.json().catch(() => ({}));
    const statsBody = await statsRes.json().catch(() => ({}));
    if (id !== requestId.current) return;

    const newTotal: number = listRes.ok ? (listBody.total ?? 0) : 0;
    // A page past the end (e.g. filters narrowed after paging) snaps back.
    const maxPage = Math.max(1, Math.ceil(newTotal / Number(pageSize)));
    if (page > maxPage) {
      setPage(maxPage);
      return;
    }

    setAttempts(listRes.ok ? (listBody.attempts ?? []) : []);
    setTotal(newTotal);
    setShownOffset((page - 1) * Number(pageSize));
    setStats(statsRes.ok ? (statsBody.stats ?? null) : null);
    setLoading(false);
    setStatsLoading(false);
  }, [filterQuery, page, pageSize]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 250);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  useEffect(() => {
    fetch("/api/admin/assessment/modules")
      .then((res) => res.json())
      .then((body) => setModules(body.modules ?? []))
      .catch(() => setModules([]));
  }, []);

  function changeFilter<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function resetFilters() {
    setSearch("");
    setModuleFilter(ALL);
    setTypeFilter(ALL);
    setPassFilter(ALL);
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  async function handleExportPdf() {
    setPdfBusy(true);
    try {
      const res = await fetch(`/api/admin/assessment/attempts/report?${filterQuery.toString()}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Gagal memuat data laporan.");
      const rows: AttemptSummaryRow[] = body.rows ?? [];
      if (rows.length === 0) {
        toast.error("Tidak ada data untuk dibuat laporan.");
        return;
      }

      const filterLines: string[] = [];
      if (search.trim()) filterLines.push(`Cari: "${search.trim()}"`);
      if (moduleFilter !== ALL)
        filterLines.push(`Modul: ${modules.find((m) => m.module_code === moduleFilter)?.module_name ?? moduleFilter}`);
      if (typeFilter !== ALL) filterLines.push(`Tipe: ${typeFilter === "pre" ? "Pre-Test" : "Post-Test"}`);
      if (passFilter !== ALL) filterLines.push(`Status: ${passFilter === "true" ? "Lulus" : "Belum lulus"}`);
      if (dateFrom || dateTo) filterLines.push(`Tanggal: ${dateFrom || "..."} s/d ${dateTo || "..."}`);

      const { downloadSummaryReport } = await import("@/lib/assessment/summary-report");
      await downloadSummaryReport({ rows, filterLines });
      toast.success("Laporan PDF berhasil dibuat.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat laporan PDF.");
    } finally {
      setPdfBusy(false);
    }
  }

  const exportHref = `/api/admin/assessment/attempts/export?${filterQuery.toString()}`;
  const offset = (page - 1) * Number(pageSize);
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + Number(pageSize), total);

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-3 rounded-card bg-card p-5 shadow-card md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Peserta Assessment<span className="text-accent">.</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Semua hasil pre-test dan post-test yang masuk dari halaman assessment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={handleExportPdf}
            disabled={pdfBusy || loading || total === 0}
          >
            <FileText className="size-4" />
            {pdfBusy ? "Menyiapkan PDF..." : "Export PDF"}
          </Button>
          <a href={exportHref}>
            <Button variant="outline" className="rounded-full">
              <Download className="size-4" />
              Export Excel
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Peserta"
          value={String(stats?.totalParticipants ?? 0)}
          hint={`${stats?.totalAttempts ?? 0} pengerjaan tercatat`}
          icon={Users}
          loading={statsLoading}
        />
        <StatCard
          label="Total Pre-Test"
          value={String(stats?.totalPre ?? 0)}
          hint="pengerjaan pre-test"
          icon={ClipboardList}
          loading={statsLoading}
        />
        <StatCard
          label="Total Post-Test"
          value={String(stats?.totalPost ?? 0)}
          hint="pengerjaan post-test"
          icon={ClipboardCheck}
          loading={statsLoading}
        />
        <StatCard
          label="Rata-rata Skor"
          value={stats?.averageScore != null ? String(stats.averageScore) : "-"}
          hint="dari seluruh pengerjaan"
          icon={BarChart3}
          loading={statsLoading}
        />
      </div>

      <div className="rounded-card bg-card p-5 shadow-card">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3 xl:col-span-2">
            <Label className="text-xs text-muted">Cari</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                value={search}
                onChange={(e) => changeFilter(setSearch)(e.target.value)}
                placeholder="Nama, jabatan, atau no. telepon..."
                className="rounded-full border-0 bg-surface pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted">Modul</Label>
            <Select value={moduleFilter} onValueChange={(v) => changeFilter(setModuleFilter)(v ?? ALL)}>
              <SelectTrigger className="w-full rounded-full bg-surface">
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
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted">Tipe tes</Label>
            <Select value={typeFilter} onValueChange={(v) => changeFilter(setTypeFilter)(v ?? ALL)}>
              <SelectTrigger className="w-full rounded-full bg-surface">
                <SelectValue>
                  {(v: string) => (v === ALL ? "Semua tipe" : v === "pre" ? "Pre-Test" : "Post-Test")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Semua tipe</SelectItem>
                <SelectItem value="pre">Pre-Test</SelectItem>
                <SelectItem value="post">Post-Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted">Status (post-test)</Label>
            <Select value={passFilter} onValueChange={(v) => changeFilter(setPassFilter)(v ?? ALL)}>
              <SelectTrigger className="w-full rounded-full bg-surface">
                <SelectValue>
                  {(v: string) => (v === ALL ? "Semua status" : v === "true" ? "Lulus" : "Belum lulus")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Semua status</SelectItem>
                <SelectItem value="true">Lulus</SelectItem>
                <SelectItem value="false">Belum lulus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-3 xl:col-span-2">
            <div className="space-y-1.5">
              <Label htmlFor="date-from" className="text-xs text-muted">
                Dari tanggal
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => changeFilter(setDateFrom)(e.target.value)}
                className="rounded-full border-0 bg-surface"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date-to" className="text-xs text-muted">
                Sampai tanggal
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => changeFilter(setDateTo)(e.target.value)}
                className="rounded-full border-0 bg-surface"
              />
            </div>
          </div>
        </div>

        {hasFilters ? (
          <div className="mt-3">
            <Button variant="ghost" size="sm" className="rounded-full text-muted" onClick={resetFilters}>
              <RotateCcw className="size-3.5" />
              Reset filter
            </Button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-card bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={`${HEAD} w-14`}>No</TableHead>
              <TableHead className={HEAD}>Nama</TableHead>
              <TableHead className={HEAD}>Jabatan</TableHead>
              <TableHead className={HEAD}>No. Telepon</TableHead>
              <TableHead className={HEAD}>Tipe</TableHead>
              <TableHead className={HEAD}>Skor</TableHead>
              <TableHead className={HEAD}>Status</TableHead>
              <TableHead className={HEAD}>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : attempts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm text-muted">
                  Belum ada peserta yang cocok dengan filter ini.
                </TableCell>
              </TableRow>
            ) : (
              attempts.map((attempt, i) => (
                <TableRow
                  key={attempt.id}
                  className="cursor-pointer hover:bg-surface-2"
                  onClick={() => router.push(`/admin/assessment/${attempt.id}`)}
                >
                  <TableCell className="tabular-nums text-muted">{shownOffset + i + 1}</TableCell>
                  <TableCell className="font-medium">{attempt.participant_nama}</TableCell>
                  <TableCell className="text-muted">{attempt.participant_jabatan}</TableCell>
                  <TableCell className="tabular-nums">{attempt.participant_telp}</TableCell>
                  <TableCell>
                    <TestTypeBadge testType={attempt.test_type} />
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">{attempt.score}</TableCell>
                  <TableCell>
                    <PassBadge attempt={attempt} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted">
                    {new Date(attempt.created_at).toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-wit-border px-5 py-3.5 sm:flex-row">
          <div className="flex items-center gap-3 text-sm text-muted">
            <span>
              {total === 0 ? "Tidak ada data" : `Menampilkan ${from}–${to} dari ${total}`}
            </span>
            <Select
              value={pageSize}
              onValueChange={(v) => {
                setPageSize(v ?? "10");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[140px] rounded-full bg-surface">
                <SelectValue>{(v: string) => `${v} / halaman`}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s} / halaman
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-full"
              aria-label="Halaman sebelumnya"
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {pageNumbers(page, lastPage).map((p, i) =>
              p === "…" ? (
                <span key={`gap-${i}`} className="px-1 text-sm text-muted">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  size="icon"
                  className="size-9 rounded-full text-sm tabular-nums"
                  aria-current={p === page ? "page" : undefined}
                  disabled={loading}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-full"
              aria-label="Halaman berikutnya"
              disabled={page >= lastPage || loading}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
