"use client";

import { useRef, useState } from "react";
import { MODULES, LEVELS } from "@/lib/ai-training/modules-data";
import { shuffle } from "@/lib/ai-training/shuffle";
import type {
  AnsweredItem,
  Participant,
  QuizItem,
  QuizResult,
  TestType,
} from "@/lib/ai-training/quiz-types";
import { ThemeToggle } from "@/components/ai-training/theme-toggle";
import { SetupScreen } from "@/components/ai-training/setup-screen";
import { QuizScreen } from "@/components/ai-training/quiz-screen";
import { ResultScreen } from "@/components/ai-training/result-screen";
import { ReportTemplate } from "@/components/ai-training/report-template";

type Screen = "setup" | "quiz" | "done";

const isMobile = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width:899px)").matches;

function buildItems(mod: string, testType: TestType): QuizItem[] {
  const m = MODULES[mod];
  const prep = (arr: typeof m.main, kind: "main" | "bonus"): AnsweredItem[] =>
    shuffle(
      arr.map((it) => ({
        kind,
        q: it.q,
        opts: shuffle(it.o.map((text, j) => ({ text, ok: j === it.a }))),
        pick: null as number | null,
      })),
    );

  const list: QuizItem[] = [...prep(m.main, "main")];
  if (testType === "post") {
    list.push(...prep(m.bonus, "bonus"));
    list.push({ kind: "essay" });
  }
  return list;
}

export default function AiTrainingPage() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [step, setStep] = useState(1);

  const [mod, setMod] = useState("m1");
  const [testType, setTestType] = useState<TestType>("pre");
  const [nama, setNama] = useState("");
  const [jab, setJab] = useState("");
  const [telp, setTelp] = useState("");
  const [preScoreInput, setPreScoreInput] = useState("");
  const [formErr, setFormErr] = useState(false);

  const [items, setItems] = useState<QuizItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [essay, setEssay] = useState("");
  const [preScore, setPreScore] = useState<number | null>(null);
  const [participant, setParticipant] = useState<Participant>({ nama: "", jab: "", telp: "" });

  const [result, setResult] = useState<QuizResult | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  function goToStep(n: number) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelectMod(key: string) {
    setMod(key);
  }
  function handleSelectType(type: TestType) {
    setTestType(type);
  }

  function handleWizBack() {
    if (step > 1) goToStep(step - 1);
  }
  function handleWizNext() {
    if (step < 3) goToStep(step + 1);
    else start();
  }

  function start() {
    const trimmedNama = nama.trim();
    const trimmedJab = jab.trim();
    const trimmedTelp = telp.trim();
    if (!trimmedNama || !trimmedJab || !trimmedTelp) {
      setFormErr(true);
      if (isMobile() && step !== 3) goToStep(3);
      return;
    }
    setFormErr(false);
    setParticipant({ nama: trimmedNama, jab: trimmedJab, telp: trimmedTelp });

    const pv = parseInt(preScoreInput, 10);
    setPreScore(testType === "post" && !isNaN(pv) && pv >= 0 && pv <= 100 ? pv : null);

    const built = buildItems(mod, testType);
    setItems(built);
    setIdx(0);
    setEssay("");
    setScreen("quiz");
    window.scrollTo(0, 0);
  }

  function handlePick(optionIndex: number) {
    const current = items[idx];
    if (current.kind === "essay") return;
    // Compute the updated array synchronously (not via a setState updater)
    // so the setTimeout below can pass the fresh snapshot straight into
    // finish() — reading `items` state again after the timeout would race
    // a stale closure and silently drop the very last answer.
    const updatedItems = items.map((it, i) =>
      i === idx && it.kind !== "essay" ? { ...it, pick: optionIndex } : it,
    );
    setItems(updatedItems);
    const pickedIdx = idx;
    setTimeout(() => {
      if (pickedIdx < updatedItems.length - 1) {
        setIdx(pickedIdx + 1);
      } else {
        finish(updatedItems);
      }
    }, 260);
  }

  function handleBack() {
    if (idx > 0) setIdx(idx - 1);
  }
  function handleNext() {
    if (idx < items.length - 1) setIdx(idx + 1);
    else finish(items);
  }
  function handleJump(i: number) {
    setIdx(i);
  }

  function finish(itemsSnapshot: QuizItem[]) {
    const main = itemsSnapshot.filter((i): i is AnsweredItem => i.kind === "main");
    const bonus = itemsSnapshot.filter((i): i is AnsweredItem => i.kind === "bonus");
    const correct = main.filter((i) => i.pick !== null && i.opts[i.pick].ok).length;
    const bCorrect = bonus.filter((i) => i.pick !== null && i.opts[i.pick].ok).length;
    const score = Math.round((correct / 15) * 100);
    const band = LEVELS[mod].find((l) => score >= l[0] && score <= l[1])!;
    const finalResult: QuizResult = {
      correct,
      bCorrect,
      bonusPts: bCorrect * 2,
      score,
      band,
      main,
      bonus,
      gain: preScore !== null ? score - preScore : null,
    };
    setResult(finalResult);
    setScreen("done");
    window.scrollTo(0, 0);

    fetch("/api/assessment/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        module_code: mod,
        module_name: MODULES[mod].name,
        test_type: testType,
        participant_nama: participant.nama,
        participant_jabatan: participant.jab,
        participant_telp: participant.telp,
        main_answers: main.map((it) => ({
          q: it.q,
          options: it.opts.map((o) => o.text),
          picked_index: it.pick,
          correct_index: it.opts.findIndex((o) => o.ok),
          is_correct: it.pick !== null && it.opts[it.pick].ok,
        })),
        bonus_answers: bonus.map((it) => ({
          q: it.q,
          options: it.opts.map((o) => o.text),
          picked_index: it.pick,
          correct_index: it.opts.findIndex((o) => o.ok),
          is_correct: it.pick !== null && it.opts[it.pick].ok,
        })),
        essay_text: essay || null,
        pre_score_ref: preScore,
        band_label: band[2],
      }),
    }).catch(() => {});
  }

  async function handleDownloadPdf() {
    if (!reportRef.current || !result) return;
    setPdfBusy(true);
    try {
      const { default: html2pdf } = await import("html2pdf.js");
      const fileName = `WIT_${MODULES[mod].name.replace(/\s+/g, "_")}_${
        testType === "pre" ? "PreTest" : "PostTest"
      }_${participant.nama.replace(/\s+/g, "_")}.pdf`;

      document.body.classList.add("exporting");
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      try {
        await html2pdf()
          .set({
            margin: 0,
            filename: fileName,
            image: { type: "jpeg", quality: 0.95 },
            html2canvas: {
              scale: 2,
              backgroundColor: "#ffffff",
              useCORS: true,
              logging: false,
              scrollX: 0,
              scrollY: 0,
              windowWidth: reportRef.current.scrollWidth,
              windowHeight: reportRef.current.scrollHeight,
            },
            jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait", hotfixes: ["px_scaling"] },
            pagebreak: { mode: ["css", "legacy"] },
          })
          .from(reportRef.current)
          .save();
      } finally {
        document.body.classList.remove("exporting");
      }
    } finally {
      setPdfBusy(false);
    }
  }

  function handleAgain() {
    setNama("");
    setJab("");
    setTelp("");
    setPreScoreInput("");
    setFormErr(false);
    setResult(null);
    goToStep(1);
    setScreen("setup");
  }

  return (
    <>
      <header className="top">
        <div className="top-in">
          <img className="logo logo-dark" src="/branding/wit-logo-dark.png" alt="WIT.ID" />
          <img className="logo logo-light" src="/branding/wit-logo-light.png" alt="WIT.ID" />
          <div className="tagline">Make IT Happen</div>
          <div className="spacer"></div>
          <ThemeToggle />
        </div>
      </header>

      <div className="wrap">
        <SetupScreen
          active={screen === "setup"}
          step={step}
          mod={mod}
          testType={testType}
          nama={nama}
          jab={jab}
          telp={telp}
          preScoreInput={preScoreInput}
          formErr={formErr}
          onSelectMod={handleSelectMod}
          onSelectType={handleSelectType}
          onChangeNama={setNama}
          onChangeJab={setJab}
          onChangeTelp={setTelp}
          onChangePreScore={setPreScoreInput}
          onWizBack={handleWizBack}
          onWizNext={handleWizNext}
          onStart={start}
        />

        <QuizScreen
          active={screen === "quiz"}
          mod={mod}
          testType={testType}
          items={items}
          idx={idx}
          essay={essay}
          onPick={handlePick}
          onEssayChange={setEssay}
          onBack={handleBack}
          onNext={handleNext}
          onJump={handleJump}
        />

        {result ? (
          <ResultScreen
            active={screen === "done"}
            moduleName={MODULES[mod].name}
            testType={testType}
            result={result}
            pdfBusy={pdfBusy}
            onDownloadPdf={handleDownloadPdf}
            onAgain={handleAgain}
          />
        ) : null}
      </div>

      <div ref={reportRef} style={{ position: "absolute", left: -10000, top: 0 }}>
        {result ? (
          <ReportTemplate
            mod={mod}
            testType={testType}
            participant={participant}
            result={result}
            essay={essay}
            generatedAt={new Date()}
          />
        ) : null}
      </div>
    </>
  );
}
