"use client";

import { MODULES } from "@/lib/ai-training/modules-data";
import type { QuizItem, TestType } from "@/lib/ai-training/quiz-types";

const KEYS = ["A", "B", "C", "D"];

interface QuizScreenProps {
  active: boolean;
  mod: string;
  testType: TestType;
  items: QuizItem[];
  idx: number;
  essay: string;
  onPick: (optionIndex: number) => void;
  onEssayChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
}

export function QuizScreen(props: QuizScreenProps) {
  const { active, mod, testType, items, idx, essay, onPick, onEssayChange, onBack, onNext, onJump } = props;
  if (items.length === 0) return null;

  const it = items[idx];
  const m = MODULES[mod];
  const total = items.length;

  return (
    <section id="s-quiz" className={`screen${active ? " on" : ""}`}>
      <div className="quizwrap">
        <div className="qbar">
          <div className="qbar-top">
            <span className="who">
              {m.name} · {testType === "pre" ? "Pre-Test" : "Post-Test"}
            </span>
            <span className="cnt">
              {idx + 1} / {total}
            </span>
          </div>
          <div className="rail">
            <i style={{ width: `${(idx / total) * 100}%` }}></i>
          </div>
        </div>

        <div id="qBody">
          {it.kind === "essay" ? (
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
          ) : (
            <>
              <span className={`qtag ${it.kind === "bonus" ? "bonus" : "main"}`}>
                {it.kind === "bonus" ? `BONUS ${idx - 14} · +2 POIN` : `SOAL ${idx + 1} DARI 15`}
              </span>
              <div className="qtext">{it.q}</div>
              <div className="opts">
                {it.opts.map((o, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`opt${it.pick === i ? " sel" : ""}`}
                    onClick={() => onPick(i)}
                  >
                    <span className="key">{KEYS[i]}</span>
                    <span className="val">{o.text}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="nav">
          <button className="btn btn-ghost back" style={{ visibility: idx === 0 ? "hidden" : "visible" }} aria-label="Soal sebelumnya" onClick={onBack}>
            ←
          </button>
          <button className="btn btn-primary" onClick={onNext}>
            {idx === total - 1 ? "Selesai & lihat hasil" : "Lewati"}
          </button>
        </div>

        <div className="dots" id="qDots">
          {items.map((dotItem, i) => {
            const done = dotItem.kind === "essay" ? essay.trim().length > 0 : dotItem.pick !== null;
            const lbl = dotItem.kind === "essay" ? "★" : dotItem.kind === "bonus" ? `B${i - 14}` : i + 1;
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
