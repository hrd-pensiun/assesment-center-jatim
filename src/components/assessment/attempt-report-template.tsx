import type { AnswerRecord, AssessmentAttempt } from "@/lib/assessment/types";

// Mirrors the #report markup / inline styling from wit-assessment.html's
// buildReport() as closely as possible, so a PDF regenerated from the
// dashboard looks the same as the one a participant downloaded directly.
// One intentional gap: the per-criterion practical/essay rubric table
// (module.practical.rubric) lives only inside wit-assessment.html's
// hardcoded MODULES object, which this dashboard does not store or read
// (out of scope, see prompt file Section 8) — so the regenerated report
// shows the essay text without the rubric breakdown table.

function AnswerRows({ items }: { items: AnswerRecord[] }) {
  return (
    <>
      {items.map((it, i) => {
        const ok = it.is_correct;
        const pickedText = it.picked_index !== null ? it.options[it.picked_index] : null;
        const correctText = it.options[it.correct_index];
        return (
          <div
            key={i}
            style={{
              fontSize: 11.5,
              padding: "7px 9px",
              borderBottom: "1px solid #EEE",
              lineHeight: 1.45,
            }}
          >
            <span
              style={{
                float: "right",
                fontWeight: 700,
                fontSize: 10.5,
                color: ok ? "#0F9A5F" : "#ED1C24",
              }}
            >
              {ok ? "BENAR" : "SALAH"}
            </span>
            <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#999", marginRight: 6 }}>
              {i + 1}.
            </span>
            {it.q}
            <small style={{ display: "block", color: "#777", marginTop: 3 }}>
              Jawaban: {pickedText ?? "—"}
              {ok ? "" : ` · Kunci: ${correctText}`}
            </small>
          </div>
        );
      })}
    </>
  );
}

export function AttemptReportTemplate({ attempt }: { attempt: AssessmentAttempt }) {
  const tanggal = new Date(attempt.created_at).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const isPost = attempt.test_type === "post";
  const total = attempt.main_answers.length;

  const th: React.CSSProperties = { background: "#F5F6F7", fontWeight: 600, width: "34%", color: "#555", border: "1px solid #DDD", padding: "8px 10px", textAlign: "left" };
  const td: React.CSSProperties = { border: "1px solid #DDD", padding: "8px 10px", textAlign: "left" };

  return (
    <div style={{ width: 794, background: "#fff", color: "#111", fontFamily: "Inter, sans-serif", padding: "38px 44px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "3px solid #ED1C24", paddingBottom: 14, marginBottom: 22 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>WIT.ID</div>
          <div style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#888", fontWeight: 600, marginTop: 6 }}>
            Make IT Happen
          </div>
        </div>
        <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ED1C24", fontWeight: 700, textAlign: "right" }}>
          {attempt.module_code} · {isPost ? "Post-Test" : "Pre-Test"}
        </div>
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 3 }}>{attempt.module_name}</h2>
      <div style={{ fontSize: 12, color: "#777", marginBottom: 20 }}>
        WIT Training Assessment · Laporan Hasil Peserta (regenerasi dari Back Office)
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 18 }}>
        <tbody>
          <tr><th style={th}>Nama</th><td style={td}>{attempt.participant_nama}</td></tr>
          <tr><th style={th}>Jabatan</th><td style={td}>{attempt.participant_jabatan}</td></tr>
          <tr><th style={th}>No. telepon</th><td style={td}>{attempt.participant_telp}</td></tr>
          <tr><th style={th}>Waktu pengerjaan</th><td style={td}>{tanggal}</td></tr>
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, border: "1px solid #ED1C24", background: "#FEF2F2", borderRadius: 8, padding: 14, textAlign: "center" }}>
          <b style={{ fontSize: 30, display: "block", lineHeight: 1.1, color: "#ED1C24" }}>{attempt.score}</b>
          <span style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#777", fontWeight: 600 }}>Nilai utama /100</span>
        </div>
        <div style={{ flex: 1, border: "1px solid #DDD", borderRadius: 8, padding: 14, textAlign: "center" }}>
          <b style={{ fontSize: 30, display: "block", lineHeight: 1.1 }}>{attempt.correct_count}/{total}</b>
          <span style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#777", fontWeight: 600 }}>Jawaban benar</span>
        </div>
        {isPost ? (
          <div style={{ flex: 1, border: "1px solid #DDD", borderRadius: 8, padding: 14, textAlign: "center" }}>
            <b style={{ fontSize: 30, display: "block", lineHeight: 1.1 }}>+{attempt.bonus_points}</b>
            <span style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#777", fontWeight: 600 }}>Bonus MC</span>
          </div>
        ) : null}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 18 }}>
        <tbody>
          <tr><th style={th}>Level</th><td style={td}><b>{attempt.band_label ?? "-"}</b></td></tr>
          {isPost ? (
            <tr>
              <th style={th}>Passing grade 80</th>
              <td style={td}>
                <b style={{ color: attempt.is_passed ? "#0F9A5F" : "#ED1C24" }}>
                  {attempt.is_passed ? "LULUS" : "BELUM LULUS"}
                </b>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", margin: "20px 0 9px", color: "#333" }}>
        Rincian Soal Utama
      </h3>
      <AnswerRows items={attempt.main_answers} />

      {isPost && attempt.bonus_answers.length > 0 ? (
        <>
          <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", margin: "20px 0 9px", color: "#333" }}>
            Bonus (+2 poin per jawaban benar)
          </h3>
          <AnswerRows items={attempt.bonus_answers} />
        </>
      ) : null}

      {isPost ? (
        <>
          <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", margin: "20px 0 9px", color: "#333" }}>
            Jawaban Esai / Studi Kasus
          </h3>
          <div style={{ border: "1px solid #DDD", borderRadius: 8, padding: 12, fontSize: 11.5, whiteSpace: "pre-wrap", lineHeight: 1.6, background: "#FAFAFA", minHeight: 70 }}>
            {attempt.essay_text?.trim() || "(tidak diisi)"}
          </div>
          <div style={{ marginTop: 26, display: "flex", gap: 40, fontSize: 11, color: "#555" }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginTop: 46, borderTop: "1px solid #999", paddingTop: 5 }}>
                Peserta — {attempt.participant_nama}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginTop: 46, borderTop: "1px solid #999", paddingTop: 5 }}>Fasilitator</div>
            </div>
          </div>
        </>
      ) : null}

      <div style={{ marginTop: 26, paddingTop: 12, borderTop: "1px solid #DDD", fontSize: 10, color: "#888", display: "flex", justifyContent: "space-between" }}>
        <span>WIT.ID — Empowering Your Business with Smart Digital Solutions</span>
        <span>{tanggal}</span>
      </div>
    </div>
  );
}
