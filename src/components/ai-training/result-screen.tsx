"use client";

import type { QuizResult, TestType } from "@/lib/ai-training/quiz-types";

interface ResultScreenProps {
  active: boolean;
  moduleName: string;
  testType: TestType;
  result: QuizResult;
  pdfBusy: boolean;
  onDownloadPdf: () => void;
  onAgain: () => void;
}

export function ResultScreen({ active, moduleName, testType, result, pdfBusy, onDownloadPdf, onAgain }: ResultScreenProps) {
  const pass = result.score >= 80;
  const isPost = testType === "post";

  return (
    <section id="s-done" className={`screen${active ? " on" : ""}`}>
      <div className="quizwrap">
        <div className="eyebrow">
          {moduleName} · {isPost ? "Post-Test" : "Pre-Test"}
        </div>
        <div className="score-hero">
          <div className="score-num">
            {result.score}
            <small>/100</small>
          </div>
          <div className={`band ${pass ? "pass" : "fail"}`}>
            {result.band[2]}
            {isPost ? (pass ? " · LULUS" : " · BELUM LULUS") : ""}
          </div>
          <div className="small muted" style={{ marginTop: 10 }}>
            {result.band[3]}
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <b>
              {result.correct}
              <span style={{ fontSize: 13, color: "var(--muted)" }}>/15</span>
            </b>
            <span>Jawaban benar</span>
          </div>
          {isPost ? (
            <>
              <div className="stat">
                <b>+{result.bCorrect * 2}</b>
                <span>Poin bonus</span>
              </div>
              <div className="stat">
                <b>{result.gain !== null ? (result.gain >= 0 ? `+${result.gain}` : result.gain) : "—"}</b>
                <span>Learning gain</span>
              </div>
              <div className="stat">
                <b>{result.band[2].split(" ")[0]}</b>
                <span>Level</span>
              </div>
            </>
          ) : (
            <>
              <div className="stat">
                <b>{15 - result.correct}</b>
                <span>Belum tepat</span>
              </div>
              <div className="stat">
                <b>{result.band[2].split(" ")[0]}</b>
                <span>Level</span>
              </div>
            </>
          )}
        </div>

        <div style={{ display: "grid", gap: 9, margin: "16px 0 6px" }}>
          <button className="btn btn-primary" onClick={onDownloadPdf} disabled={pdfBusy}>
            {pdfBusy ? "Menyiapkan PDF…" : "Unduh hasil (PDF)"}
          </button>
          <button className="btn btn-ghost" onClick={onAgain}>
            Assessment peserta lain
          </button>
        </div>

        <details className="pack">
          <summary>
            Pembahasan jawaban<span></span>
          </summary>
          <div className="body">
            <div id="rReview">
              {[...result.main, ...result.bonus].map((it, i) => {
                const ok = it.pick !== null && it.opts[it.pick].ok;
                const key = it.opts.find((o) => o.ok)!.text;
                return (
                  <div key={i} className={`rev ${ok ? "ok" : "no"}`}>
                    <div className="rev-h">
                      <span className="ic">{ok ? "✓" : "✕"}</span>
                      <span className="rev-q">
                        {it.kind === "bonus" ? "Bonus · " : ""}
                        {it.q}
                      </span>
                    </div>
                    <div className="rev-a">
                      {ok ? (
                        <em>{key}</em>
                      ) : (
                        <>
                          <s>{it.pick === null ? "Tidak dijawab" : it.opts[it.pick].text}</s>
                          <br />
                          <em>Kunci: {key}</em>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </details>

        <div className="note">
          {isPost
            ? "Practical challenge dinilai terpisah oleh fasilitator (maks +10 poin). Nilai utama dan bonus dilaporkan terpisah agar learning gain tetap sebanding."
            : "Simpan nilai ini. Masukkan kembali saat mengerjakan Post-Test untuk menghitung learning gain."}
        </div>
      </div>
    </section>
  );
}
