"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TestTypeBadge, PassBadge } from "@/components/assessment/status-badges";
import { AnswerReviewList } from "@/components/assessment/answer-review-list";
import { EditAttemptDialog } from "@/components/assessment/edit-attempt-dialog";
import { DeleteAttemptDialog } from "@/components/assessment/delete-attempt-dialog";
import { DownloadPdfButton } from "@/components/assessment/download-pdf-button";
import type { AssessmentAttempt } from "@/lib/assessment/types";

export function AttemptDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/assessment/attempts/${id}`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const body = await res.json();
        setAttempt(body.attempt);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    );
  }

  if (notFound || !attempt) {
    return (
      <div className="p-4">
        <div className="rounded-card bg-card p-8 text-center shadow-card">
          <p className="font-semibold">Data percobaan tidak ditemukan.</p>
          <Button variant="outline" className="mt-4 rounded-full" onClick={() => router.push("/admin/assessment")}>
            Kembali ke daftar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <button
        type="button"
        onClick={() => router.push("/admin/assessment")}
        className="flex items-center gap-2 text-sm font-medium text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar peserta
      </button>

      <div className="rounded-card bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{attempt.participant_nama}</h1>
              <TestTypeBadge testType={attempt.test_type} />
              <PassBadge attempt={attempt} />
            </div>
            <p className="mt-1 text-sm text-muted">
              {attempt.participant_jabatan} · {attempt.participant_telp}
            </p>
            <p className="mt-1 text-sm text-muted">
              {attempt.module_name} · {new Date(attempt.created_at).toLocaleString("id-ID")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Koreksi Data
            </Button>
            <DownloadPdfButton attempt={attempt} />
            <Button
              variant="outline"
              className="rounded-full text-destructive hover:bg-danger-soft hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Hapus
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Skor" value={attempt.score} />
          <StatTile label="Benar" value={`${attempt.correct_count}/${attempt.main_answers.length}`} />
          <StatTile label="Bonus" value={`+${attempt.bonus_points}`} />
          <StatTile label="Level" value={attempt.band_label ?? "-"} />
        </div>
      </div>

      <div className="rounded-card bg-card p-5 shadow-card">
        <h2 className="mb-3 text-base font-semibold">Rincian Soal Utama</h2>
        <AnswerReviewList items={attempt.main_answers} />
      </div>

      {attempt.bonus_answers.length > 0 ? (
        <div className="rounded-card bg-card p-5 shadow-card">
          <h2 className="mb-3 text-base font-semibold">Soal Bonus</h2>
          <AnswerReviewList items={attempt.bonus_answers} />
        </div>
      ) : null}

      {attempt.essay_text ? (
        <div className="rounded-card bg-card p-5 shadow-card">
          <h2 className="mb-3 text-base font-semibold">Jawaban Esai / Studi Kasus</h2>
          <p className="whitespace-pre-wrap rounded-2xl bg-surface-2 p-4 text-sm leading-relaxed">
            {attempt.essay_text}
          </p>
        </div>
      ) : null}

      <EditAttemptDialog
        attempt={attempt}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={(updated) => setAttempt(updated)}
      />
      <DeleteAttemptDialog
        attemptId={attempt.id}
        participantName={attempt.participant_nama}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => router.push("/admin/assessment")}
      />
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-3.5 text-center">
      <div className="font-mono text-2xl font-extrabold tabular-nums tracking-tight">{value}</div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
