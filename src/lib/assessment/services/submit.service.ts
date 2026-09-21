import type { InsForgeClient } from "@insforge/sdk";
import { insertAttempt, type InsertAttemptRow } from "@/lib/assessment/repositories/attempts.repository";
import type { AnswerRecord, SubmitAttemptInput, TestType } from "@/lib/assessment/types";

export class SubmitValidationError extends Error {}

const PASSING_SCORE = 80;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAnswerRecord(value: unknown): value is AnswerRecord {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isNonEmptyString(v.q) &&
    Array.isArray(v.options) &&
    (typeof v.picked_index === "number" || v.picked_index === null) &&
    typeof v.correct_index === "number" &&
    typeof v.is_correct === "boolean"
  );
}

/**
 * Validates and normalizes the raw request body from POST /api/assessment/submit.
 * Throws SubmitValidationError with a user-facing (Indonesian) message on any
 * failure — the route handler maps that to HTTP 400.
 */
export function parseSubmitPayload(body: unknown): SubmitAttemptInput {
  if (typeof body !== "object" || body === null) {
    throw new SubmitValidationError("Payload tidak valid.");
  }
  const b = body as Record<string, unknown>;

  if (!isNonEmptyString(b.module_code)) throw new SubmitValidationError("module_code wajib diisi.");
  if (!isNonEmptyString(b.module_name)) throw new SubmitValidationError("module_name wajib diisi.");
  if (b.test_type !== "pre" && b.test_type !== "post") {
    throw new SubmitValidationError("test_type harus 'pre' atau 'post'.");
  }
  if (!isNonEmptyString(b.participant_nama)) throw new SubmitValidationError("Nama peserta wajib diisi.");
  if (!isNonEmptyString(b.participant_jabatan)) throw new SubmitValidationError("Jabatan peserta wajib diisi.");
  if (!isNonEmptyString(b.participant_telp)) throw new SubmitValidationError("No. telepon peserta wajib diisi.");
  if (!Array.isArray(b.main_answers) || b.main_answers.length === 0) {
    throw new SubmitValidationError("main_answers wajib berisi minimal satu soal.");
  }
  if (!b.main_answers.every(isAnswerRecord)) {
    throw new SubmitValidationError("Format main_answers tidak valid.");
  }
  const bonusAnswers = Array.isArray(b.bonus_answers) ? b.bonus_answers : [];
  if (!bonusAnswers.every(isAnswerRecord)) {
    throw new SubmitValidationError("Format bonus_answers tidak valid.");
  }

  return {
    module_code: b.module_code as string,
    module_name: b.module_name as string,
    test_type: b.test_type as TestType,
    participant_nama: (b.participant_nama as string).trim(),
    participant_jabatan: (b.participant_jabatan as string).trim(),
    participant_telp: (b.participant_telp as string).trim(),
    main_answers: b.main_answers as AnswerRecord[],
    bonus_answers: bonusAnswers as AnswerRecord[],
    essay_text: isNonEmptyString(b.essay_text) ? (b.essay_text as string) : null,
    pre_score_ref: typeof b.pre_score_ref === "number" ? b.pre_score_ref : null,
    band_label: isNonEmptyString(b.band_label) ? (b.band_label as string) : null,
  };
}

/**
 * Recomputes score/correct counts/pass-fail server-side from the answer
 * arrays — never trusts a score sent by the client. Mirrors the scoring
 * rule in wit-assessment.html's finish(): score = round(correct/total*100)
 * over the main questions only; post-test passes at score >= 80.
 */
export async function submitAttempt(client: InsForgeClient, input: SubmitAttemptInput, submittedIp: string | null) {
  const totalMain = input.main_answers.length;
  if (totalMain === 0) {
    throw new SubmitValidationError("Tidak ada soal utama untuk dinilai.");
  }

  const correctCount = input.main_answers.filter((a) => a.is_correct).length;
  const bonusCorrectCount = input.bonus_answers.filter((a) => a.is_correct).length;
  const bonusPoints = bonusCorrectCount * 2;
  const score = Math.round((correctCount / totalMain) * 100);
  const isPassed = input.test_type === "post" && score >= PASSING_SCORE;

  const row: InsertAttemptRow = {
    ...input,
    id: crypto.randomUUID(),
    correct_count: correctCount,
    bonus_correct_count: bonusCorrectCount,
    bonus_points: bonusPoints,
    score,
    is_passed: isPassed,
    submitted_ip: submittedIp,
  };

  const { error } = await insertAttempt(client, row);
  if (error) {
    throw new Error(error.message ?? "Gagal menyimpan hasil assessment.");
  }
  return { id: row.id };
}
