import type { Metadata } from "next";
import { AiTrainingApp } from "@/components/ai-training/ai-training-app";

export const metadata: Metadata = {
  title: "Post-Test Gabungan — WIT Training Assessment",
};

export default function MergedPostTestPage() {
  return <AiTrainingApp variant={{ kind: "merged", testType: "post", durationMinutes: 20 }} />;
}
