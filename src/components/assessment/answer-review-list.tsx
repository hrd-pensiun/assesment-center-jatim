import { CheckCircle2, XCircle } from "lucide-react";
import type { AnswerRecord } from "@/lib/assessment/types";

export function AnswerReviewList({ items }: { items: AnswerRecord[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Tidak ada soal.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((it, i) => {
        const pickedText = it.picked_index !== null ? it.options[it.picked_index] : null;
        const correctText = it.options[it.correct_index];
        return (
          <div key={i} className="rounded-2xl border border-wit-border bg-card p-3.5">
            <div className="flex items-start gap-2.5">
              <span
                className={
                  it.is_correct
                    ? "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-success-soft text-success"
                    : "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-danger-soft text-danger"
                }
              >
                {it.is_correct ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
              </span>
              <p className="text-sm font-semibold leading-snug">
                {i + 1}. {it.q}
              </p>
            </div>
            <p className="mt-1.5 pl-[30px] text-[13px] text-muted">
              Jawaban: {pickedText ?? "—"}
              {!it.is_correct ? (
                <>
                  {" "}
                  · Kunci: <span className="font-medium text-success">{correctText}</span>
                </>
              ) : null}
            </p>
          </div>
        );
      })}
    </div>
  );
}
