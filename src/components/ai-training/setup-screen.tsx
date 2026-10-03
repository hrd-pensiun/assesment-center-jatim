"use client";

import { MODULES } from "@/lib/ai-training/modules-data";
import type { TestType } from "@/lib/ai-training/quiz-types";
import type { QuizVariant } from "@/lib/ai-training/quiz-variant";

interface SetupScreenProps {
  active: boolean;
  merged: Extract<QuizVariant, { kind: "merged" }> | null;
  step: number;
  mod: string;
  testType: TestType;
  nama: string;
  jab: string;
  telp: string;
  preScoreInput: string;
  formErr: boolean;
  onSelectMod: (key: string) => void;
  onSelectType: (type: TestType) => void;
  onChangeNama: (v: string) => void;
  onChangeJab: (v: string) => void;
  onChangeTelp: (v: string) => void;
  onChangePreScore: (v: string) => void;
  onWizBack: () => void;
  onWizNext: () => void;
  onStart: () => void;
}

export function SetupScreen(props: SetupScreenProps) {
  const {
    active, merged, step, mod, testType, nama, jab, telp, preScoreInput, formErr,
    onSelectMod, onSelectType, onChangeNama, onChangeJab, onChangeTelp, onChangePreScore,
    onWizBack, onWizNext, onStart,
  } = props;

  const participantCard = (
    <div className="card">
      <div className="field">
        <label htmlFor="f-nama">Nama lengkap</label>
        <input
          id="f-nama"
          type="text"
          placeholder="Nama sesuai absensi"
          autoComplete="name"
          value={nama}
          onChange={(e) => onChangeNama(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="f-jab">Jabatan</label>
        <input
          id="f-jab"
          type="text"
          placeholder="Contoh: Staff Marketing"
          value={jab}
          onChange={(e) => onChangeJab(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="f-telp">No. telepon</label>
        <input
          id="f-telp"
          type="tel"
          inputMode="tel"
          placeholder="08xxxxxxxxxx"
          autoComplete="tel"
          value={telp}
          onChange={(e) => onChangeTelp(e.target.value)}
        />
      </div>
      {testType === "post" ? (
        <div className="field" id="wrap-pre">
          <label htmlFor="f-pre">Nilai Pre-Test (opsional — untuk learning gain)</label>
          <input
            id="f-pre"
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            placeholder="Contoh: 67"
            value={preScoreInput}
            onChange={(e) => onChangePreScore(e.target.value)}
          />
        </div>
      ) : null}
      <div className={`err${formErr ? " on" : ""}`}>Lengkapi nama, jabatan, dan nomor telepon dulu.</div>
    </div>
  );

  if (merged) {
    const isPre = merged.testType === "pre";
    const moduleNames = Object.values(MODULES).map((m) => m.name).join(", ");
    const mergedNote = isPre
      ? `15 soal pilihan ganda (5 per modul). Durasi ${merged.durationMinutes} menit. Kerjakan sebelum sesi dimulai.`
      : `15 soal utama (5 per modul) + 5 bonus studi kasus (+2 poin). Durasi ${merged.durationMinutes} menit. Passing grade 80.`;

    return (
      <section id="s-setup" className={`screen${active ? " on" : ""}`}>
        <div className="hero">
          <div className="eyebrow">WIT Training Assessment · {isPre ? "Pre-Test" : "Post-Test"}</div>
          <h1>
            {isPre ? "Pre-Test" : "Post-Test"} gabungan <span>semua modul.</span>
          </h1>
          <p>
            Soal diambil dari {moduleNames}. Isi data peserta lalu mulai. Soal dan urutan pilihan jawaban diacak untuk
            setiap peserta.
          </p>
        </div>

        <div className="steps" style={{ display: "block", maxWidth: 420 }}>
          <div className="step-panel active">
            <div className="step-head">
              <span className="step">01</span>
              <b>Data peserta</b>
            </div>
            {participantCard}
            <div className="note">{mergedNote}</div>
          </div>
        </div>

        <div className="wiznav">
          <button className="btn btn-primary" onClick={onStart}>
            Mulai assessment
          </button>
        </div>
        <div className="desk-start">
          <button className="btn btn-primary" onClick={onStart}>
            Mulai assessment
          </button>
        </div>
      </section>
    );
  }

  const m = MODULES[mod];
  const note =
    testType === "pre"
      ? `${m.name} · 15 soal. Durasi disarankan 10–15 menit. Kerjakan sebelum sesi dimulai.`
      : `${m.name} · 15 soal utama + 5 bonus (+2 poin) + practical challenge (+10 poin, dinilai fasilitator). Passing grade 80.`;

  return (
    <section id="s-setup" className={`screen${active ? " on" : ""}`}>
      <div className="hero">
        <div className="eyebrow">WIT Training Assessment</div>
        <h1>
          Ukur pemahaman sebelum &amp; sesudah <span>workshop.</span>
        </h1>
        <p>Pilih modul, tentukan jenis tes, lalu isi data peserta. Soal dan urutan pilihan jawaban diacak untuk setiap peserta.</p>
      </div>

      <div className="wizbar">
        <span className={step >= 1 ? "on" : ""}></span>
        <span className={step >= 2 ? "on" : ""}></span>
        <span className={step >= 3 ? "on" : ""}></span>
      </div>

      <div className="steps">
        <div className={`step-panel${step === 1 ? " active" : ""}`} data-p="1">
          <div className="step-head">
            <span className="step">01</span>
            <b>Pilih modul</b>
          </div>
          <div className="mod" id="modList">
            {Object.entries(MODULES).map(([key, def]) => (
              <button
                key={key}
                type="button"
                className={`mod-card${key === mod ? " sel" : ""}`}
                onClick={() => onSelectMod(key)}
              >
                <div className="mod-code">{def.code}</div>
                <div className="mod-name">{def.name}</div>
                <div className="mod-desc">{def.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className={`step-panel${step === 2 ? " active" : ""}`} data-p="2">
          <div className="step-head">
            <span className="step">02</span>
            <b>Jenis tes</b>
          </div>
          <div className="seg" id="segType">
            <button type="button" className={testType === "pre" ? "sel" : ""} onClick={() => onSelectType("pre")}>
              <span className="t">Pre-Test</span>
              <span className="s">15 soal pilihan ganda · baseline sebelum sesi</span>
            </button>
            <button type="button" className={testType === "post" ? "sel" : ""} onClick={() => onSelectType("post")}>
              <span className="t">Post-Test</span>
              <span className="s">15 soal + 5 bonus + practical challenge</span>
            </button>
          </div>
          <div className="note">{note}</div>
        </div>

        <div className={`step-panel${step === 3 ? " active" : ""}`} data-p="3">
          <div className="step-head">
            <span className="step">03</span>
            <b>Data peserta</b>
          </div>
          {participantCard}
        </div>
      </div>

      <div className="wiznav">
        <button className="btn btn-ghost back" style={{ visibility: step === 1 ? "hidden" : "visible" }} aria-label="Kembali" onClick={onWizBack}>
          ←
        </button>
        <button className="btn btn-primary" onClick={onWizNext}>
          {step === 3 ? "Mulai assessment" : "Lanjut"}
        </button>
      </div>
      <div className="desk-start">
        <button className="btn btn-primary" onClick={onStart}>
          Mulai assessment
        </button>
      </div>
    </section>
  );
}
