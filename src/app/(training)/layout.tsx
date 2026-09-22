import type { Metadata } from "next";
import "./ai-training.css";

export const metadata: Metadata = {
  title: "WIT Training Assessment",
  description: "Ukur pemahaman peserta sebelum & sesudah workshop",
};

// Independent root layout: this route group intentionally does NOT share
// the (dashboard) group's <html>/<body> or Tailwind/shadcn theme. The
// participant-facing assessment keeps wit-assessment.html's own design
// system (ai-training.css, ported verbatim) untouched by the admin UI.
export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
