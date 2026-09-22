export type TestType = "pre" | "post";

export interface OptItem {
  text: string;
  ok: boolean;
}

export interface AnsweredItem {
  kind: "main" | "bonus";
  q: string;
  opts: OptItem[];
  pick: number | null;
}

export interface EssayItem {
  kind: "essay";
}

export type QuizItem = AnsweredItem | EssayItem;

export interface Participant {
  nama: string;
  jab: string;
  telp: string;
}

export interface QuizResult {
  correct: number;
  bCorrect: number;
  bonusPts: number;
  score: number;
  band: [number, number, string, string];
  main: AnsweredItem[];
  bonus: AnsweredItem[];
  gain: number | null;
}
