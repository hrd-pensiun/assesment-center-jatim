"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttemptReportTemplate } from "@/components/assessment/attempt-report-template";
import type { AssessmentAttempt } from "@/lib/assessment/types";

export function DownloadPdfButton({ attempt }: { attempt: AssessmentAttempt }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    if (!reportRef.current) return;
    setGenerating(true);
    try {
      const { default: html2pdf } = await import("html2pdf.js");
      const fileName = `WIT_${attempt.module_name.replace(/\s+/g, "_")}_${
        attempt.test_type === "pre" ? "PreTest" : "PostTest"
      }_${attempt.participant_nama.replace(/\s+/g, "_")}.pdf`;

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
            windowWidth: reportRef.current.scrollWidth,
            windowHeight: reportRef.current.scrollHeight,
          },
          jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait", hotfixes: ["px_scaling"] },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(reportRef.current)
        .save();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <Button variant="outline" className="rounded-full" onClick={handleDownload} disabled={generating}>
        <Download className="size-4" />
        {generating ? "Menyiapkan PDF..." : "Download Ulang PDF"}
      </Button>
      <div style={{ position: "fixed", left: -10000, top: 0 }} aria-hidden>
        <div ref={reportRef}>
          <AttemptReportTemplate attempt={attempt} />
        </div>
      </div>
    </>
  );
}
