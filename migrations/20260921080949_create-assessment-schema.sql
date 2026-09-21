-- WIT Training Assessment — Back Office Admin Dashboard
-- Schema: assessment_admin_users (role table), assessment_attempts, assessment_audit_log

-- Needed before the trigram index on assessment_attempts.participant_nama below.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================================
-- 1. Role table: assessment_admin_users
--    No built-in "assessment_admin" role in InsForge, so we model it as
--    a membership table keyed by auth.users(id). Only project_admin
--    (CLI / migrations) can write to this table — there is deliberately
--    no INSERT policy for anon/authenticated, so admins can only be
--    granted via `db query` / migrations, not self-service.
-- =====================================================================
CREATE TABLE public.assessment_admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.assessment_admin_users ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies granted to anon/authenticated: this table is
-- only readable/writable via project_admin (CLI) or SECURITY DEFINER helpers.
REVOKE ALL ON public.assessment_admin_users FROM anon, authenticated;

-- Helper used inside RLS policies below. SECURITY DEFINER so it can read
-- assessment_admin_users (RLS-enabled) without recursing through the
-- caller's own (nonexistent) privileges on that table.
CREATE OR REPLACE FUNCTION public.is_assessment_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.assessment_admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- =====================================================================
-- 2. assessment_attempts
--    One row per assessment submission. Append-only: participants never
--    update existing rows (retakes insert new rows). Only assessment_admin
--    may later correct participant_nama/jabatan/telp (enforced by column
--    grants below) or delete a row.
-- =====================================================================
CREATE TABLE public.assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code TEXT NOT NULL,
  module_name TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('pre', 'post')),
  participant_nama TEXT NOT NULL,
  participant_jabatan TEXT NOT NULL,
  participant_telp TEXT NOT NULL,
  main_answers JSONB NOT NULL,
  bonus_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  essay_text TEXT,
  correct_count INTEGER NOT NULL CHECK (correct_count >= 0),
  bonus_correct_count INTEGER NOT NULL DEFAULT 0 CHECK (bonus_correct_count >= 0),
  bonus_points INTEGER NOT NULL DEFAULT 0 CHECK (bonus_points >= 0),
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  band_label TEXT,
  is_passed BOOLEAN NOT NULL,
  pre_score_ref INTEGER,
  submitted_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessment_attempts_module_code ON public.assessment_attempts (module_code);
CREATE INDEX idx_assessment_attempts_test_type ON public.assessment_attempts (test_type);
CREATE INDEX idx_assessment_attempts_is_passed ON public.assessment_attempts (is_passed);
CREATE INDEX idx_assessment_attempts_created_at ON public.assessment_attempts (created_at DESC);
CREATE INDEX idx_assessment_attempts_nama_trgm ON public.assessment_attempts USING gin (participant_nama gin_trgm_ops);

ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;

-- Public, no-auth submission: the static wit-assessment.html page inserts
-- directly as `anon`. No SELECT/UPDATE/DELETE for anon at all.
CREATE POLICY "anyone can submit an attempt" ON public.assessment_attempts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "assessment_admin can read attempts" ON public.assessment_attempts
  FOR SELECT TO authenticated
  USING (public.is_assessment_admin());

CREATE POLICY "assessment_admin can correct attempts" ON public.assessment_attempts
  FOR UPDATE TO authenticated
  USING (public.is_assessment_admin())
  WITH CHECK (public.is_assessment_admin());

CREATE POLICY "assessment_admin can delete attempts" ON public.assessment_attempts
  FOR DELETE TO authenticated
  USING (public.is_assessment_admin());

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- anon: insert-only, never read/update/delete its own or anyone else's submission
GRANT INSERT ON public.assessment_attempts TO anon;
REVOKE SELECT, UPDATE, DELETE ON public.assessment_attempts FROM anon;

-- authenticated (assessment_admin accounts): full row visibility, delete,
-- but UPDATE is narrowed to the three correctable participant fields only —
-- score/answers/band are immutable once submitted, even for admins.
GRANT SELECT, INSERT, DELETE ON public.assessment_attempts TO authenticated;
REVOKE UPDATE ON public.assessment_attempts FROM authenticated;
GRANT UPDATE (participant_nama, participant_jabatan, participant_telp)
  ON public.assessment_attempts TO authenticated;

-- =====================================================================
-- 3. assessment_audit_log
--    Immutable trail of admin edits/deletes on assessment_attempts.
--    attempt_id is intentionally a plain UUID column with NO foreign key:
--    a real FK (even ON DELETE SET NULL, which can't apply since the
--    column is NOT NULL) would either block deleting the parent attempt
--    or cascade-remove the very log row that must survive the delete.
--    Inserts happen only from server-side service code running with the
--    project's API key (project_admin), which bypasses RLS — so there is
--    deliberately no INSERT policy for anon/authenticated.
-- =====================================================================
CREATE TABLE public.assessment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL, -- no FK by design, see comment above
  action TEXT NOT NULL CHECK (action IN ('update', 'delete')),
  admin_user_id UUID NOT NULL,
  previous_values JSONB NOT NULL,
  changed_fields JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessment_audit_log_attempt_id ON public.assessment_audit_log (attempt_id);
CREATE INDEX idx_assessment_audit_log_created_at ON public.assessment_audit_log (created_at DESC);

ALTER TABLE public.assessment_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessment_admin can read audit log" ON public.assessment_audit_log
  FOR SELECT TO authenticated
  USING (public.is_assessment_admin());

-- No INSERT/UPDATE/DELETE policies for anon/authenticated at all: writes
-- only happen server-side with the project API key (project_admin),
-- which is not subject to RLS. Revoke the default broad grants so this
-- is enforced even at the privilege level, not just by policy absence.
REVOKE INSERT, UPDATE, DELETE ON public.assessment_audit_log FROM anon, authenticated;
REVOKE ALL ON public.assessment_audit_log FROM anon;
GRANT SELECT ON public.assessment_audit_log TO authenticated;
