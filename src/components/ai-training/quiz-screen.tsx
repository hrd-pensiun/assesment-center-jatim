"use client";

import type { QuizItem, TestType } from "@/lib/ai-training/quiz-types";
import type { ModuleMeta } from "@/lib/ai-training/quiz-variant";

const KEYS = ["A", "B", "C", "D"];
const TIMER_WARNING_SEC = 120;

interface QuizScreenProps {
  active: boolean;
  meta: ModuleMeta;
  testType: TestType;
  items: QuizItem[];
  idx: number;
  essay: string;
  timeLeftSec: number | null;
  onPick: (optionIndex: number) => void;
  onEssayChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
}

function formatClock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Reminder only: running out of time never auto-submits or locks answers.
// Always red and large so it is the most visible thing in the header; it
// replaces the "x / total" counter on timed tests (the number dots below
// already show progress).
function QuizTimer({ timeLeftSec }: { timeLeftSec: number }) {
  const expired = timeLeftSec <= 0;
  const urgent = expired || timeLeftSec <= TIMER_WARNING_SEC;
  return (
    <span
      aria-live="polite"
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 999,
        background: urgent ? "var(--red)" : "var(--red-soft)",
        color: urgent ? "#fff" : "var(--red)",
        border: "1px solid var(--red)",
        fontSize: 17,
        fontWeight: 800,
        letterSpacing: ".02em",
        whiteSpace: "nowrap",
      }}
    >
      {expired ? "Waktu habis" : `⏱ ${formatClock(timeLeftSec)}`}
    </span>
  );
}

export function QuizScreen(props: QuizScreenProps) {
  const { active, meta, testType, items, idx, essay, timeLeftSec, onPick, onEssayChange, onBack, onNext, onJump } = props;
  if (items.length === 0) return null;
  const mainCount = items.filter((it) => it.kind === "main").length;

  const it = items[idx];
  const m = meta;
  const total = items.length;
  const isLast = idx === total - 1;

  return (
    <section id="s-quiz" className={`screen${active ? " on" : ""}`}>
      <div className="quizwrap">
        <div className="qbar">
          <div className="qbar-top">
            <span className="who">
              {m.name} · {testType === "pre" ? "Pre-Test" : "Post-Test"}
            </span>
            <span className="cnt">
              {timeLeftSec !== null ? <QuizTimer timeLeftSec={timeLeftSec} /> : `${idx + 1} / ${total}`}
            </span>
          </div>
          <div className="rail">
            <i style={{ width: `${(idx / total) * 100}%` }}></i>
          </div>
        </div>

        <div id="qBody">
          {it.kind === "essay" ? (
            m.practical ? (
              <>
                <span className="qtag bonus">SUPER BONUS · +10 POIN</span>
                <div className="qtext">{m.practical.title}</div>
                <div className="brief">
                  <div className="small muted">{m.practical.scenario}</div>
                  <ol>
                    {m.practical.need.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ol>
                  {m.practical.extra ? <div className="small muted" style={{ marginTop: 10 }}>{m.practical.extra}</div> : null}
                </div>
                <textarea
                  id="essay"
                  placeholder="Tulis jawaban Anda di sini…"
                  value={essay}
                  onChange={(e) => onEssayChange(e.target.value)}
                />
                <div className="note">
                  Dinilai fasilitator dengan rubrik: {m.practical.rubric.map((r) => `${r[0]} (${r[1]})`).join(" · ")}.
                </div>
              </>
            ) : null
          ) : (
            <>
              <span className={`qtag ${it.kind === "bonus" ? "bonus" : "main"}`}>
                {it.kind === "bonus" ? `BONUS ${idx - mainCount + 1} · +2 POIN` : `SOAL ${idx + 1} DARI ${mainCount}`}
              </span>
              <div className="qtext">{it.q}</div>
              <div className="opts">
                {it.opts.map((o, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`opt${it.pick === i ? " sel" : ""}`}
                    aria-pressed={it.pick === i}
                    onClick={() => onPick(i)}
                  >
                    <span className="key">{KEYS[i]}</span>
                    <span className="val">{o.text}</span>
                  </button>
                ))}
              </div>
              {/* Stays on screen after picking: the participant can re-read
                  the question and change the answer before moving on. */}
              <div className={`pickhint${it.pick !== null ? " on" : ""}`} aria-live="polite">
                {it.pick !== null
                  ? `Jawaban ${KEYS[it.pick]} tersimpan — masih bisa diganti sebelum lanjut.`
                  : "Pilih A/B/C/D dulu. Halaman tidak pindah otomatis."}
              </div>
            </>
          )}
        </div>

        <div className="nav">
          <button className="btn btn-ghost back" style={{ visibility: idx === 0 ? "hidden" : "visible" }} aria-label="Soal sebelumnya" onClick={onBack}>
            ←
          </button>
          {/* Lewati keeps its previous meaning: move on without answering. */}
          {isLast ? null : (
            <button className="btn btn-ghost" onClick={onNext}>
              Lewati
            </button>
          )}
        </div>

        {/* Explicit forward action on its own row: picking an option no longer
            advances by itself, so this is how the participant leaves a question
            after checking (and re-checking) their answer. */}
        <div className="nav nav-next">
          <button className="btn btn-primary" onClick={onNext}>
            {isLast ? "Selesai & lihat hasil" : "Pertanyaan berikutnya →"}
          </button>
        </div>

        <div className="dots" id="qDots">
          {items.map((dotItem, i) => {
            const done = dotItem.kind === "essay" ? essay.trim().length > 0 : dotItem.pick !== null;
            const lbl = dotItem.kind === "essay" ? "★" : dotItem.kind === "bonus" ? `B${i - mainCount + 1}` : i + 1;
            return (
              <button
                key={i}
                type="button"
                className={`dot${done ? " done" : ""}${i === idx ? " now" : ""}`}
                onClick={() => onJump(i)}
              >
                {lbl}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
