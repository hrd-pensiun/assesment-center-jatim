import type { InsForgeClient } from "@insforge/sdk";
import {
  deleteAttempt,
  getAttemptById,
  listAttemptStatRows,
  listAttempts,
  updateAttemptParticipant,
} from "@/lib/assessment/repositories/attempts.repository";
import { insertAuditLogEntry } from "@/lib/assessment/repositories/audit-log.repository";
import { createInsForgeAdminClient } from "@/lib/insforge/admin";
import {
  EDITABLE_PARTICIPANT_FIELDS,
  type AttemptFilters,
  type AttemptSummaryRow,
  type EditableParticipantField,
} from "@/lib/assessment/types";

export class AttemptNotFoundError extends Error {}
export class AttemptValidationError extends Error {}

export async function getAttemptsList(client: InsForgeClient, filters: AttemptFilters) {
  const { data, error, count } = await listAttempts(client, filters, { withCount: true });
  if (error) throw new Error(error.message ?? "Gagal memuat daftar peserta.");
  return { attempts: data ?? [], total: count ?? 0 };
}

const STATS_PAGE_SIZE = 1000;

export interface AttemptStats {
  totalParticipants: number;
  totalAttempts: number;
  totalPre: number;
  totalPost: number;
  averageScore: number | null;
}

/**
 * Scorecard numbers for everything matching the filters (not just the
 * visible page). A participant is counted once by name + phone, so
 * someone who took both pre- and post-test is one participant.
 */
/** Every row matching the filters, light columns only, newest first. */
export async function getAttemptSummaryRows(
  client: InsForgeClient,
  filters: AttemptFilters,
): Promise<AttemptSummaryRow[]> {
  const all: AttemptSummaryRow[] = [];
  for (let from = 0; ; from += STATS_PAGE_SIZE) {
    const { data, error } = await listAttemptStatRows(client, filters, from, from + STATS_PAGE_SIZE - 1);
    if (error) throw new Error(error.message ?? "Gagal memuat data ringkasan.");
    const rows = (data ?? []) as AttemptSummaryRow[];
    all.push(...rows);
    if (rows.length < STATS_PAGE_SIZE) break;
  }
  return all;
}

export async function getAttemptStats(client: InsForgeClient, filters: AttemptFilters): Promise<AttemptStats> {
  const rows = await getAttemptSummaryRows(client, filters);
  const participants = new Set(
    rows.map((r) => `${r.participant_nama.trim().toLowerCase()}|${r.participant_telp.replace(/\D/g, "")}`),
  );
  const totalPre = rows.filter((r) => r.test_type === "pre").length;
  const scoreSum = rows.reduce((sum, r) => sum + r.score, 0);

  return {
    totalParticipants: participants.size,
    totalAttempts: rows.length,
    totalPre,
    totalPost: rows.length - totalPre,
    averageScore: rows.length > 0 ? Math.round((scoreSum / rows.length) * 10) / 10 : null,
  };
}

export async function getAttemptDetail(client: InsForgeClient, id: string) {
  const { data, error } = await getAttemptById(client, id);
  if (error || !data) throw new AttemptNotFoundError("Data percobaan tidak ditemukan.");
  return data;
}

function pickEditableFields(input: Record<string, unknown>): Partial<Record<EditableParticipantField, string>> {
  const changes: Partial<Record<EditableParticipantField, string>> = {};
  for (const field of EDITABLE_PARTICIPANT_FIELDS) {
    const value = input[field];
    if (typeof value === "string" && value.trim().length > 0) {
      changes[field] = value.trim();
    }
  }
  return changes;
}

/**
 * Edits participant_nama/jabatan/telp on an attempt. Writes an immutable
 * audit_log row (previous values + changed fields) BEFORE updating, using
 * the admin/service client since assessment_audit_log has no insert
 * policy for regular authenticated users.
 */
export async function updateAttempt(
  client: InsForgeClient,
  adminUserId: string,
  id: string,
  rawChanges: Record<string, unknown>,
) {
  const changes = pickEditableFields(rawChanges);
  if (Object.keys(changes).length === 0) {
    throw new AttemptValidationError("Tidak ada field yang berubah.");
  }

  const before = await getAttemptDetail(client, id);

  const adminClient = createInsForgeAdminClient();
  const { error: auditError } = await insertAuditLogEntry(adminClient, {
    attempt_id: id,
    action: "update",
    admin_user_id: adminUserId,
    previous_values: before,
    changed_fields: changes,
  });
  if (auditError) throw new Error(auditError.message ?? "Gagal mencatat audit log.");

  const { data, error } = await updateAttemptParticipant(client, id, changes);
  if (error) throw new Error(error.message ?? "Gagal memperbarui data peserta.");
  return data?.[0];
}

/**
 * Deletes an attempt. Writes an immutable audit_log row with the full
 * previous row snapshot BEFORE deleting, using the admin/service client.
 */
export async function removeAttempt(client: InsForgeClient, adminUserId: string, id: string) {
  const before = await getAttemptDetail(client, id);

  const adminClient = createInsForgeAdminClient();
  const { error: auditError } = await insertAuditLogEntry(adminClient, {
    attempt_id: id,
    action: "delete",
    admin_user_id: adminUserId,
    previous_values: before,
    changed_fields: null,
  });
  if (auditError) throw new Error(auditError.message ?? "Gagal mencatat audit log.");

  const { error } = await deleteAttempt(client, id);
  if (error) throw new Error(error.message ?? "Gagal menghapus data peserta.");
}
