import type { InsForgeClient } from "@insforge/sdk";

export interface NewAuditLogEntry {
  attempt_id: string;
  action: "update" | "delete";
  admin_user_id: string;
  previous_values: Record<string, unknown>;
  changed_fields?: Record<string, unknown> | null;
}

const AUDIT_LOG_COLUMNS =
  "id, attempt_id, action, admin_user_id, previous_values, changed_fields, created_at";

/**
 * MUST be called with the admin/service client (createInsForgeAdminClient),
 * never the per-session server client — assessment_audit_log has no INSERT
 * policy for anon/authenticated on purpose.
 */
export async function insertAuditLogEntry(adminClient: InsForgeClient, entry: NewAuditLogEntry) {
  return adminClient.database.from("assessment_audit_log").insert([entry]).select(AUDIT_LOG_COLUMNS);
}

export async function listAuditLog(client: InsForgeClient, page = 1, pageSize = 30) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return client.database
    .from("assessment_audit_log")
    .select(AUDIT_LOG_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to);
}
