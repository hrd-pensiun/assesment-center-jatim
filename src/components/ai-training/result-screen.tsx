"use client";

import type { QuizResult, TestType } from "@/lib/ai-training/quiz-types";

interface ResultScreenProps {
  active: boolean;
  moduleName: string;
  hasPractical: boolean;
  testType: TestType;
  result: QuizResult;
  pdfBusy: boolean;
  onDownloadPdf: () => void;
}

export function ResultScreen({ active, moduleName, hasPractical, testType, result, pdfBusy, onDownloadPdf }: ResultScreenProps) {
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
          {/* The "save this score" reminder lives up here, right under the
              level band, instead of at the very bottom of the page: on a
              pre-test the score is worthless later unless the participant
              keeps it, and people stop reading once they hit the download
              button. */}
          {!isPost ? (
            <div className="save-note">
              <b>Simpan nilai ini.</b> Unduh hasilnya sebagai PDF untuk arsip, lalu masukkan nilai ini saat
              mengerjakan Post-Test supaya learning gain Anda bisa dihitung.
            </div>
          ) : null}
        </div>

        <div className="stats">
          <div className="stat">
            <b>
              {result.correct}
              <span style={{ fontSize: 13, color: "var(--muted)" }}>/{result.main.length}</span>
            </b>
            <span>Jawaban benar</span>
          </div>
          {isPost ? (
            <>
              {result.bonus.length > 0 ? (
                <div className="stat">
                  <b>+{result.bCorrect * 2}</b>
                  <span>Poin bonus</span>
                </div>
              ) : null}
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
                <b>{result.main.length - result.correct}</b>
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

        {/* Pre-test used to repeat the save-score reminder here; it now sits
            under the level band so it is seen before the download button. */}
        {isPost ? (
          <div className="note">
            {hasPractical
              ? "Practical challenge dinilai terpisah oleh fasilitator (maks +10 poin). Nilai utama dan bonus dilaporkan terpisah agar learning gain tetap sebanding."
              : result.bonus.length > 0
                ? "Nilai utama dan bonus dilaporkan terpisah agar learning gain tetap sebanding."
                : "Learning gain dihitung dari selisih nilai Post-Test dan Pre-Test."}
          </div>
        ) : null}
      </div>
    </section>
  );
}
