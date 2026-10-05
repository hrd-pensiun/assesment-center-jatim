"use client";

import { useEffect, useRef, useState } from "react";
import type { AnsweredItem, Participant, QuizItem, QuizResult, TestType } from "@/lib/ai-training/quiz-types";
import {
  MERGED_MODULE_CODE,
  buildMergedItems,
  buildSingleModuleItems,
  getLevelBands,
  getModuleMeta,
  type QuizVariant,
} from "@/lib/ai-training/quiz-variant";
import { ThemeToggle } from "@/components/ai-training/theme-toggle";
import { SetupScreen } from "@/components/ai-training/setup-screen";
import { QuizScreen } from "@/components/ai-training/quiz-screen";
import { ResultScreen } from "@/components/ai-training/result-screen";
import { ReportTemplate } from "@/components/ai-training/report-template";
import { UnansweredDialog } from "@/components/ai-training/unanswered-dialog";
import { flushPendingSubmissions, submitWithRetry } from "@/lib/ai-training/submit-queue";

type Screen = "setup" | "quiz" | "done";

const isMobile = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width:899px)").matches;

// Remembers the last participant's data on this device only (no login,
// no server round-trip) so someone doing Pre-Test then Post-Test back to
// back doesn't have to retype nama/jabatan/telp. Shared across all
// /ai-training links. There is deliberately no "start over" button on the
// result screen anymore: the setup form is editable, so a different person
// on the same device just types over the prefilled values.
const PARTICIPANT_STORAGE_KEY = "wit-ai-training-participant";

function readSavedParticipant(): Participant | null {
  try {
    const raw = window.localStorage.getItem(PARTICIPANT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.nama === "string" && typeof parsed?.jab === "string" && typeof parsed?.telp === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveParticipant(p: Participant) {
  try {
    window.localStorage.setItem(PARTICIPANT_STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore (private browsing, storage disabled, etc.)
  }
}

export function AiTrainingApp({ variant }: { variant: QuizVariant }) {
  const merged = variant.kind === "merged" ? variant : null;

  const [screen, setScreen] = useState<Screen>("setup");
  const [step, setStep] = useState(merged ? 3 : 1);

  const [mod, setMod] = useState(merged ? MERGED_MODULE_CODE : "m1");
  const [testType, setTestType] = useState<TestType>(merged ? merged.testType : "pre");
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

  const [quizStartedAt, setQuizStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const [result, setResult] = useState<QuizResult | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const meta = getModuleMeta(mod);

  useEffect(() => {
    const saved = readSavedParticipant();
    if (saved) {
      setNama(saved.nama);
      setJab(saved.jab);
      setTelp(saved.telp);
    }
    flushPendingSubmissions();
  }, []);

  useEffect(() => {
    if (!merged || screen !== "quiz") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [merged, screen]);

  const timeLeftSec =
    merged && quizStartedAt !== null
      ? Math.round((merged.durationMinutes * 60_000 - (now - quizStartedAt)) / 1000)
      : null;

  function goToStep(n: number) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    const p = { nama: trimmedNama, jab: trimmedJab, telp: trimmedTelp };
    setParticipant(p);
    saveParticipant(p);

    const pv = parseInt(preScoreInput, 10);
    setPreScore(testType === "post" && !isNaN(pv) && pv >= 0 && pv <= 100 ? pv : null);

    setItems(merged ? buildMergedItems(testType) : buildSingleModuleItems(mod, testType));
    setIdx(0);
    setEssay("");
    const startedAt = Date.now();
    setQuizStartedAt(startedAt);
    setNow(startedAt);
    setScreen("quiz");
    window.scrollTo(0, 0);
  }

  // Picking an option deliberately does NOT advance anymore: the participant
  // stays on the same question so they can re-read the stem and change their
  // answer. Re-picking just overwrites `pick`. Leaving the question is now an
  // explicit action ("Pertanyaan berikutnya" / "Lewati" / the number dots) —
  // and finish() can only ever be reached from handleNext on the last item, so
  // the old pick-timer that silently auto-submitted the last question is gone.
  function handlePick(optionIndex: number) {
    const current = items[idx];
    if (current.kind === "essay") return;
    setItems(items.map((it, i) =>
      i === idx && it.kind !== "essay" ? { ...it, pick: optionIndex } : it,
    ));
  }

  function handleBack() {
    if (idx > 0) setIdx(idx - 1);
  }
  function handleNext() {
    if (idx < items.length - 1) setIdx(idx + 1);
    else requestFinish();
  }

  // Same labels as the number dots under the question.
  function unansweredIndexes() {
    return items.flatMap((it, i) => (it.kind !== "essay" && it.pick === null ? [i] : []));
  }
  const mainCount = items.filter((it) => it.kind === "main").length;
  function itemLabel(i: number) {
    return items[i].kind === "bonus" ? `B${i - mainCount + 1}` : String(i + 1);
  }
  function requestFinish() {
    if (unansweredIndexes().length > 0) setConfirmOpen(true);
    else finish(items);
  }
  function handleReviewUnanswered() {
    const first = unansweredIndexes()[0];
    setConfirmOpen(false);
    if (first !== undefined) setIdx(first);
  }
  function handleConfirmFinish() {
    setConfirmOpen(false);
    finish(items);
  }
  function handleJump(i: number) {
    setIdx(i);
  }

  function finish(itemsSnapshot: QuizItem[]) {
    const main = itemsSnapshot.filter((i): i is AnsweredItem => i.kind === "main");
    const bonus = itemsSnapshot.filter((i): i is AnsweredItem => i.kind === "bonus");
    const correct = main.filter((i) => i.pick !== null && i.opts[i.pick].ok).length;
    const bCorrect = bonus.filter((i) => i.pick !== null && i.opts[i.pick].ok).length;
    const score = Math.round((correct / main.length) * 100);
    const band = getLevelBands(mod).find((l) => score >= l[0] && score <= l[1])!;
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

    submitWithRetry({
      module_code: mod,
      module_name: meta.name,
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
    });
  }

  async function handleDownloadPdf() {
    if (!reportRef.current || !result) return;
    setPdfBusy(true);
    try {
      const { default: html2pdf } = await import("html2pdf.js");
      const fileName = `WIT_${meta.name.replace(/\s+/g, "_")}_${
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
          merged={merged}
          step={step}
          mod={mod}
          testType={testType}
          nama={nama}
          jab={jab}
          telp={telp}
          preScoreInput={preScoreInput}
          formErr={formErr}
          onSelectMod={setMod}
          onSelectType={setTestType}
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
          meta={meta}
          testType={testType}
          items={items}
          idx={idx}
          essay={essay}
          timeLeftSec={timeLeftSec}
          onPick={handlePick}
          onEssayChange={setEssay}
          onBack={handleBack}
          onNext={handleNext}
          onJump={handleJump}
        />

        <UnansweredDialog
          open={confirmOpen}
          labels={unansweredIndexes().map(itemLabel)}
          onReview={handleReviewUnanswered}
          onConfirm={handleConfirmFinish}
        />

        {result ? (
          <ResultScreen
            active={screen === "done"}
            moduleName={meta.name}
            hasPractical={meta.practical !== null}
            testType={testType}
            result={result}
            pdfBusy={pdfBusy}
            onDownloadPdf={handleDownloadPdf}
          />
        ) : null}
      </div>

      <div ref={reportRef} style={{ position: "absolute", left: -10000, top: 0 }}>
        {result ? (
          <ReportTemplate
            meta={meta}
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
