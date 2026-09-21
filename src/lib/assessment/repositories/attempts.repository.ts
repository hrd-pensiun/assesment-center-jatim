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

export async function listAttempts(client: InsForgeClient, filters: AttemptFilters) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = client.database
    .from("assessment_attempts")
    .select(ATTEMPT_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (filters.module_code) query = query.eq("module_code", filters.module_code);
  if (filters.test_type) query = query.eq("test_type", filters.test_type);
  if (filters.is_passed !== undefined) query = query.eq("is_passed", filters.is_passed);
  if (filters.q) query = query.ilike("participant_nama", `%${filters.q}%`);

  return query;
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
