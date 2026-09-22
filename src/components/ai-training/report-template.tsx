import { MODULES } from "@/lib/ai-training/modules-data";
import type { Participant, QuizResult, TestType } from "@/lib/ai-training/quiz-types";

interface ReportTemplateProps {
  mod: string;
  testType: TestType;
  participant: Participant;
  result: QuizResult;
  essay: string;
  generatedAt: Date;
}

// Mirrors buildReport()'s #report/#reportBody markup from wit-assessment.html
// 1:1 (same classes from ai-training.css), so the exported PDF is identical.
export function ReportTemplate({ mod, testType, participant, result, essay, generatedAt }: ReportTemplateProps) {
  const m = MODULES[mod];
  const isPost = testType === "post";
  const d = generatedAt.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const rows = (arr: QuizResult["main"]) =>
    arr.map((it, i) => {
      const ok = it.pick !== null && it.opts[it.pick].ok;
      const key = it.opts.find((o) => o.ok)!.text;
      return (
        <div className="r-item" key={i}>
          <span className={`st ${ok ? "ok" : "no"}`}>{ok ? "BENAR" : "SALAH"}</span>
          <span className="n">{i + 1}.</span>
          {it.q}
          <small>
            Jawaban: {it.pick === null ? "—" : it.opts[it.pick].text}
            {ok ? "" : ` · Kunci: ${key}`}
          </small>
        </div>
      );
    });

  return (
    <div id="report">
      <div className="r-pad" id="reportBody">
        <div className="r-head">
          <div>
            <img className="r-logo" src="/branding/wit-logo-light.png" alt="WIT.ID" />
            <div className="r-sub">Make IT Happen</div>
          </div>
          <div className="r-kind">
            {m.code} · {isPost ? "Post-Test" : "Pre-Test"}
          </div>
        </div>

        <h2>{m.name}</h2>
        <div style={{ fontSize: 12, color: "#777", marginBottom: 20 }}>
          WIT Training Assessment · Laporan Hasil Peserta
        </div>

        <table>
          <tbody>
            <tr>
              <th>Nama</th>
              <td>{participant.nama}</td>
            </tr>
            <tr>
              <th>Jabatan</th>
              <td>{participant.jab}</td>
            </tr>
            <tr>
              <th>No. telepon</th>
              <td>{participant.telp}</td>
            </tr>
            <tr>
              <th>Waktu pengerjaan</th>
              <td>{d}</td>
            </tr>
          </tbody>
        </table>

        <div className="r-score">
          <div className="r-box hi">
            <b>{result.score}</b>
            <span>Nilai utama /100</span>
          </div>
          <div className="r-box">
            <b>{result.correct}/15</b>
            <span>Jawaban benar</span>
          </div>
          {isPost ? (
            <>
              <div className="r-box">
                <b>+{result.bonusPts}</b>
                <span>Bonus MC</span>
              </div>
              <div className="r-box">
                <b>{result.gain !== null ? (result.gain >= 0 ? `+${result.gain}` : result.gain) : "—"}</b>
                <span>Learning gain</span>
              </div>
            </>
          ) : null}
        </div>

        <table>
          <tbody>
            <tr>
              <th>Level</th>
              <td>
                <b>{result.band[2]}</b> — {result.band[3]}
              </td>
            </tr>
            {isPost ? (
              <tr>
                <th>Passing grade 80</th>
                <td>
                  <b style={{ color: result.score >= 80 ? "#0F9A5F" : "#ED1C24" }}>
                    {result.score >= 80 ? "LULUS" : "BELUM LULUS"}
                  </b>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <h3>Rincian Soal Utama</h3>
        {rows(result.main)}

        {isPost ? (
          <>
            <h3>Bonus (+2 poin per jawaban benar)</h3>
            {rows(result.bonus)}
            <h3>Super Bonus — {m.practical.title} (maks +10, dinilai fasilitator)</h3>
            <div className="r-essay">{essay.trim() ? essay : "(tidak diisi)"}</div>
            <table style={{ marginTop: 10 }}>
              <tbody>
                <tr>
                  <th style={{ width: "60%" }}>Komponen rubrik</th>
                  <th style={{ width: "20%" }}>Maks</th>
                  <th style={{ width: "20%" }}></th>
                </tr>
                {m.practical.rubric.map((x, i) => (
                  <tr key={i}>
                    <td>{x[0]}</td>
                    <td>{x[1]}</td>
                    <td></td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <b>Total</b>
                  </td>
                  <td>
                    <b>10</b>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <div className="r-sign">
              <div>
                <div className="line">Peserta — {participant.nama}</div>
              </div>
              <div>
                <div className="line">Fasilitator</div>
              </div>
            </div>
          </>
        ) : null}

        <div className="r-foot">
          <span>WIT.ID — Empowering Your Business with Smart Digital Solutions</span>
          <span>{d}</span>
        </div>
      </div>
    </div>
  );
}
