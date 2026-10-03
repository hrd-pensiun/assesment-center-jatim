import type { Metadata } from "next";
import { AiTrainingApp } from "@/components/ai-training/ai-training-app";

export const metadata: Metadata = {
  title: "Pre-Test Gabungan — WIT Training Assessment",
};

export default function MergedPreTestPage() {
  return <AiTrainingApp variant={{ kind: "merged", testType: "pre", durationMinutes: 15 }} />;
}
