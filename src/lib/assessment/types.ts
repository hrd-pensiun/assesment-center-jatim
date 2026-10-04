export type TestType = "pre" | "post";

export interface AnswerRecord {
  q: string;
  options: string[];
  picked_index: number | null;
  correct_index: number;
  is_correct: boolean;
}

export interface AssessmentAttempt {
  id: string;
  module_code: string;
  module_name: string;
  test_type: TestType;
  participant_nama: string;
  participant_jabatan: string;
  participant_telp: string;
  main_answers: AnswerRecord[];
  bonus_answers: AnswerRecord[];
  essay_text: string | null;
  correct_count: number;
  bonus_correct_count: number;
  bonus_points: number;
  score: number;
  band_label: string | null;
  is_passed: boolean;
  pre_score_ref: number | null;
  submitted_ip: string | null;
  created_at: string;
}

export interface SubmitAttemptInput {
  module_code: string;
  module_name: string;
  test_type: TestType;
  participant_nama: string;
  participant_jabatan: string;
  participant_telp: string;
  main_answers: AnswerRecord[];
  bonus_answers: AnswerRecord[];
  essay_text: string | null;
  pre_score_ref: number | null;
  band_label: string | null;
}

export interface AttemptFilters {
  module_code?: string;
  test_type?: TestType;
  is_passed?: boolean;
  q?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogEntry {
  id: string;
  attempt_id: string;
  action: "update" | "delete";
  admin_user_id: string;
  previous_values: Record<string, unknown>;
  changed_fields: Record<string, unknown> | null;
  created_at: string;
}

export const EDITABLE_PARTICIPANT_FIELDS = [
  "participant_nama",
  "participant_jabatan",
  "participant_telp",
] as const;

export type EditableParticipantField = (typeof EDITABLE_PARTICIPANT_FIELDS)[number];
