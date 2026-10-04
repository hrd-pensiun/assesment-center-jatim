import type { InsForgeClient } from "@insforge/sdk";
import type {
  AssessmentAttempt,
  AttemptFilters,
  EditableParticipantField,
  SubmitAttemptInput,
} from "@/lib/assessment/types";

const ATTEMPT_COLUMNS =
  "id, module_code, module_name, test_type, participant_nama, participant_jabatan, participant_telp, main_answers, bonus_answers, essay_text, correct_count, bonus_correct_count, bonus_points, score, band_label, is_passed, pre_score_ref, submitted_ip, created_at";

export interface InsertAttemptRow extends SubmitAttemptInput {
  id: string;
  correct_count: number;
  bonus_correct_count: number;
  bonus_points: number;
  score: number;
  band_label: string | null;
  is_passed: boolean;
  submitted_ip: string | null;
}

/**
 * Plain INSERT with no `.select()`/RETURNING on purpose: the caller is the
 * `anon` role, which by design has no SELECT grant/policy on
 * assessment_attempts (only assessment_admin can read rows back). The id
 * is generated client-side (see submit.service.ts) so the route can still
 * report it without needing RETURNING.
 */
export async function insertAttempt(client: InsForgeClient, row: InsertAttemptRow) {
  return client.database.from("assessment_attempts").insert([row]);
}

// Indonesian workshop: day boundaries are interpreted in WIB (UTC+7).
const WIB_OFFSET = "+07:00";

function applyAttemptFilters<
  T extends {
    eq: (c: string, v: unknown) => T;
    gte: (c: string, v: string) => T;
    lte: (c: string, v: string) => T;
    or: (f: string) => T;
  },
>(query: T, filters: AttemptFilters): T {
  let q = query;
  if (filters.module_code) q = q.eq("module_code", filters.module_code);
  if (filters.test_type) q = q.eq("test_type", filters.test_type);
  if (filters.is_passed !== undefined) {
    // Lulus / belum lulus only exists for post-tests.
    q = q.eq("test_type", "post").eq("is_passed", filters.is_passed);
  }
  if (filters.date_from) q = q.gte("created_at", `${filters.date_from}T00:00:00${WIB_OFFSET}`);
  if (filters.date_to) q = q.lte("created_at", `${filters.date_to}T23:59:59.999${WIB_OFFSET}`);
  if (filters.q) {
    // Strip characters that would break PostgREST's or() syntax / wildcards.
    const term = filters.q.replace(/[,()*%\\]/g, " ").trim();
    if (term) {
      q = q.or(
        `participant_nama.ilike.*${term}*,participant_jabatan.ilike.*${term}*,participant_telp.ilike.*${term}*`,
      );
    }
  }
  return q;
}

export async function listAttempts(
  client: InsForgeClient,
  filters: AttemptFilters,
  options: { withCount?: boolean } = {},
) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const query = client.database
    .from("assessment_attempts")
    .select(ATTEMPT_COLUMNS, options.withCount ? { count: "exact" } : undefined)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  return applyAttemptFilters(query, filters);
}

/** Lightweight rows (no answers JSON) for scorecards and the PDF summary, same filters as the list. */
export async function listAttemptStatRows(client: InsForgeClient, filters: AttemptFilters, from: number, to: number) {
  const query = client.database
    .from("assessment_attempts")
    .select("participant_nama, participant_jabatan, participant_telp, module_name, test_type, score, is_passed, created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  return applyAttemptFilters(query, filters);
}

export async function getAttemptById(client: InsForgeClient, id: string) {
  return client.database
    .from("assessment_attempts")
    .select(ATTEMPT_COLUMNS)
    .eq("id", id)
    .single();
}

export async function updateAttemptParticipant(
  client: InsForgeClient,
  id: string,
  fields: Partial<Record<EditableParticipantField, string>>,
) {
  return client.database
    .from("assessment_attempts")
    .update(fields)
    .eq("id", id)
    .select(ATTEMPT_COLUMNS);
}

export async function deleteAttempt(client: InsForgeClient, id: string) {
  return client.database.from("assessment_attempts").delete().eq("id", id);
}

export type { AssessmentAttempt };
