import { LEVELS, MODULES, type LevelBand, type PracticalDef, type QuestionDef } from "@/lib/ai-training/modules-data";
import { shuffle } from "@/lib/ai-training/shuffle";
import type { AnsweredItem, QuizItem, TestType } from "@/lib/ai-training/quiz-types";

export type QuizVariant =
  | { kind: "single" }
  | { kind: "merged"; testType: TestType; durationMinutes: number };

export const MERGED_MODULE_CODE = "all";
type MergedModuleKey = "m1" | "m2" | "m3";

export interface ModuleMeta {
  code: string;
  name: string;
  practical: PracticalDef | null;
}

const MERGED_META: ModuleMeta = {
  code: "WORKSHOP 001–003",
  name: "Gabungan Semua Modul",
  practical: null,
};

const MERGED_LEVELS: LevelBand[] = [
  [0, 39, "Beginner", "Belum memahami konsep dasar Generative AI, prompting, dan Agentic AI"],
  [40, 59, "Basic Awareness", "Sudah mengenal Generative AI, prompting, dan Agentic AI, pemahaman masih terbatas"],
  [60, 79, "AI Ready", "Memahami konsep dan penggunaan dasar Generative AI, prompting, dan Agentic AI"],
  [80, 89, "AI Proficient", "Memahami Generative AI, prompting, dan Agentic AI serta mampu menerapkannya secara efektif"],
  [90, 100, "AI Champion", "Sangat memahami konsep, penerapan, dan risiko Generative AI dan Agentic AI"],
];

type QuestionRef = { mod: MergedModuleKey; pool: "main" | "bonus"; index: number };

function refs(mod: QuestionRef["mod"], pool: QuestionRef["pool"], indexes: number[]): QuestionRef[] {
  return indexes.map((index) => ({ mod, pool, index }));
}

// Fixed question sets: every participant gets the same questions (order and
// options are shuffled), and pre/post never share a question. 0-based
// indexes into MODULES[mod].main / .bonus.
const MERGED_QUESTION_SETS: Record<TestType, QuestionRef[]> = {
  pre: [
    ...refs("m1", "main", [0, 1, 2, 6, 8]),
    ...refs("m2", "main", [0, 1, 5, 7, 8]),
    ...refs("m3", "main", [0, 1, 4, 5, 8]),
  ],
  post: [
    ...refs("m1", "main", [3, 7, 9, 12, 13, 14]),
    ...refs("m1", "bonus", [0]),
    ...refs("m2", "main", [2, 6, 9, 10, 11, 12, 13]),
    ...refs("m3", "main", [3, 7, 9, 11, 12, 14]),
  ],
};

export function getModuleMeta(mod: string): ModuleMeta {
  if (mod === MERGED_MODULE_CODE) return MERGED_META;
  const m = MODULES[mod];
  return { code: m.code, name: m.name, practical: m.practical };
}

export function getLevelBands(mod: string): LevelBand[] {
  return mod === MERGED_MODULE_CODE ? MERGED_LEVELS : LEVELS[mod];
}

function toItem(q: QuestionDef, kind: "main" | "bonus"): AnsweredItem {
  return {
    kind,
    q: q.q,
    opts: shuffle(q.o.map((text, j) => ({ text, ok: j === q.a }))),
    pick: null,
  };
}

export function buildSingleModuleItems(mod: string, testType: TestType): QuizItem[] {
  const m = MODULES[mod];
  const list: QuizItem[] = shuffle(m.main.map((q) => toItem(q, "main")));
  if (testType === "post") {
    list.push(...shuffle(m.bonus.map((q) => toItem(q, "bonus"))));
    list.push({ kind: "essay" });
  }
  return list;
}

/** Pre-test: 15 fixed questions. Post-test: 20 fixed questions, no bonus/essay. */
export function buildMergedItems(testType: TestType): QuizItem[] {
  const items = MERGED_QUESTION_SETS[testType].map(({ mod, pool, index }) => toItem(MODULES[mod][pool][index], "main"));
  return shuffle(items);
}
