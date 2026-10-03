import { LEVELS, MODULES, type LevelBand, type PracticalDef, type QuestionDef } from "@/lib/ai-training/modules-data";
import { shuffle } from "@/lib/ai-training/shuffle";
import type { AnsweredItem, QuizItem, TestType } from "@/lib/ai-training/quiz-types";

export type QuizVariant =
  | { kind: "single" }
  | { kind: "merged"; testType: TestType; durationMinutes: number };

export const MERGED_MODULE_CODE = "all";
const MERGED_MODULE_KEYS = ["m1", "m2", "m3"] as const;

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
  [0, 39, "Beginner", "Belum memahami konsep dasar AI, RAG, dan Agentic AI"],
  [40, 59, "Basic Awareness", "Sudah mengenal AI, RAG, dan Agentic AI, pemahaman masih terbatas"],
  [60, 79, "AI Ready", "Memahami konsep dan penggunaan dasar AI, RAG, dan Agentic AI"],
  [80, 89, "AI Proficient", "Memahami AI, RAG, dan Agentic AI serta mampu menerapkannya secara efektif"],
  [90, 100, "AI Champion", "Sangat memahami konsep, penerapan, dan risiko AI, RAG, dan Agentic AI"],
];

// 0-based indexes into MODULES[key].main of the "dasar" (recall/definition)
// questions; every other main question is "penerapan" (applied). Bonus
// questions are all scenario-based, so all count as penerapan.
const BASIC_MAIN_INDEXES: Record<(typeof MERGED_MODULE_KEYS)[number], number[]> = {
  m1: [0, 1, 2, 3, 5, 6, 7, 10, 13],
  m2: [0, 2, 3, 4, 5, 6, 7, 8, 9],
  m3: [0, 1, 2, 3, 4, 5, 8, 9, 11, 14],
};

const PRE_PER_MODULE = { basic: 5, applied: 0 };
const POST_PER_MODULE = { basic: 2, applied: 3 };
const POST_BONUS_TOTAL = 5;

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

function pickRandom<T>(pool: T[], count: number): T[] {
  return shuffle([...pool]).slice(0, count);
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

/**
 * Pre-test: 5 "dasar" questions per module (15 total).
 * Post-test: 2 dasar + 3 penerapan per module (15 main), plus 5 scenario
 * bonus questions — one from each module, the rest drawn from the
 * remaining bonus pool. No practical/essay item (out of the 20-minute
 * budget; assessed by the facilitator separately).
 */
export function buildMergedItems(testType: TestType): QuizItem[] {
  const perModule = testType === "pre" ? PRE_PER_MODULE : POST_PER_MODULE;

  const main: AnsweredItem[] = [];
  for (const key of MERGED_MODULE_KEYS) {
    const basicIdx = new Set(BASIC_MAIN_INDEXES[key]);
    const all = MODULES[key].main;
    const basic = all.filter((_, i) => basicIdx.has(i));
    const applied = all.filter((_, i) => !basicIdx.has(i));
    main.push(
      ...pickRandom(basic, perModule.basic).map((q) => toItem(q, "main")),
      ...pickRandom(applied, perModule.applied).map((q) => toItem(q, "main")),
    );
  }

  const list: QuizItem[] = shuffle(main);
  if (testType === "post") {
    const guaranteed: QuestionDef[] = [];
    const remaining: QuestionDef[] = [];
    for (const key of MERGED_MODULE_KEYS) {
      const [first, ...rest] = shuffle([...MODULES[key].bonus]);
      guaranteed.push(first);
      remaining.push(...rest);
    }
    const bonus = [...guaranteed, ...pickRandom(remaining, POST_BONUS_TOTAL - guaranteed.length)];
    list.push(...shuffle(bonus).map((q) => toItem(q, "bonus")));
  }
  return list;
}
