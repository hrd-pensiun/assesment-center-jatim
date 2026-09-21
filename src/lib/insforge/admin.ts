import "server-only";
import { createAdminClient } from "@insforge/sdk";

/**
 * Privileged, project-admin-equivalent client. SERVER-ONLY — bypasses RLS
 * entirely. Used exclusively for writing assessment_audit_log rows, which
 * have no INSERT policy for anon/authenticated by design (see migration
 * 20260921080949_create-assessment-schema.sql). Never use this client for
 * ordinary admin CRUD on assessment_attempts — that must go through the
 * per-request session client (`createInsForgeServerClient`) so RLS/
 * `assessment_admin` membership is actually enforced by Postgres.
 */
export function createInsForgeAdminClient() {
  const baseUrl = process.env.INSFORGE_URL;
  const apiKey = process.env.INSFORGE_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("INSFORGE_URL / INSFORGE_API_KEY belum diset di environment server.");
  }
  return createAdminClient({ baseUrl, apiKey });
}
