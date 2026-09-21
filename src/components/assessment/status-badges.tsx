import { Badge } from "@/components/ui/badge";
import type { AssessmentAttempt } from "@/lib/assessment/types";

export function TestTypeBadge({ testType }: { testType: AssessmentAttempt["test_type"] }) {
  return (
    <Badge variant="outline" className="rounded-full border-wit-border bg-surface-2 font-medium">
      {testType === "pre" ? "Pre-Test" : "Post-Test"}
    </Badge>
  );
}

export function PassBadge({ attempt }: { attempt: Pick<AssessmentAttempt, "test_type" | "is_passed"> }) {
  if (attempt.test_type === "pre") {
    return (
      <Badge variant="outline" className="rounded-full border-wit-border bg-surface-2 text-muted">
        -
      </Badge>
    );
  }
  return attempt.is_passed ? (
    <Badge className="rounded-full bg-success-soft text-success hover:bg-success-soft">Lulus</Badge>
  ) : (
    <Badge className="rounded-full bg-danger-soft text-danger hover:bg-danger-soft">Belum Lulus</Badge>
  );
}
