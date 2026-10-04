import type { AttemptFilters, TestType } from "@/lib/assessment/types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses the shared list/stats/export query string into validated filters. */
export function parseAttemptFilters(params: URLSearchParams): AttemptFilters {
  const testType = params.get("test_type");
  const isPassed = params.get("is_passed");
  const from = params.get("date_from");
  const to = params.get("date_to");
  const page = Number(params.get("page"));
  const pageSize = Number(params.get("pageSize"));

  return {
    module_code: params.get("module_code") || undefined,
    test_type: testType === "pre" || testType === "post" ? (testType as TestType) : undefined,
    is_passed: isPassed === "true" ? true : isPassed === "false" ? false : undefined,
    q: params.get("q")?.trim() || undefined,
    date_from: from && DATE_RE.test(from) ? from : undefined,
    date_to: to && DATE_RE.test(to) ? to : undefined,
    page: Number.isInteger(page) && page > 0 ? page : undefined,
    pageSize: Number.isInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : undefined,
  };
}
