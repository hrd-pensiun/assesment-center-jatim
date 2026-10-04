"use client";

interface UnansweredDialogProps {
  open: boolean;
  labels: string[];
  onReview: () => void;
  onConfirm: () => void;
}

// Shown when the participant taps "Selesai" while some questions are still
// unanswered, so a skipped question can't be submitted by accident.
export function UnansweredDialog({ open, labels, onReview, onConfirm }: UnansweredDialogProps) {
  if (!open) return null;
  return (
    <div className="modal-back" role="presentation" onClick={onReview}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unanswered-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-ic">!</div>
        <h2 id="unanswered-title">Masih ada soal yang belum dijawab</h2>
        <p>
          {labels.length} soal belum dijawab (nomor <b>{labels.join(", ")}</b>). Soal yang kosong dihitung salah.
          Periksa dulu atau tetap selesaikan?
        </p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onReview}>
            Periksa lagi
          </button>
          <button className="btn btn-ghost" onClick={onConfirm}>
            Tetap selesai
          </button>
        </div>
      </div>
    </div>
  );
}
