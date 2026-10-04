import type { AttemptSummaryRow } from "@/lib/assessment/types";

const INK: [number, number, number] = [16, 17, 18];
const ACCENT: [number, number, number] = [237, 28, 36];
const MUTED: [number, number, number] = [139, 139, 139];
const BORDER: [number, number, number] = [230, 229, 231];
const SOFT: [number, number, number] = [245, 244, 246];
const GREEN: [number, number, number] = [5, 150, 105];

const MARGIN = 40;
const LOGO_RATIO = 480 / 157;

function avg(values: number[]): number | null {
  return values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null;
}

function fmt(value: number | null): string {
  return value === null ? "-" : String(value).replace(".", ",");
}

async function loadImageDataUrl(src: string): Promise<string | null> {
  try {
    const blob = await (await fetch(src)).blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export interface SummaryReportInput {
  rows: AttemptSummaryRow[];
  filterLines: string[];
}

/**
 * Participant summary PDF (A4 landscape): scorecards + the full participant
 * table for whatever the admin currently has filtered. Built with jsPDF +
 * autotable (vector text, header row repeated on every page) rather than
 * rasterising HTML, so hundreds of rows stay crisp and never hit canvas
 * size limits.
 */
export async function downloadSummaryReport({ rows, filterLines }: SummaryReportInput) {
  const [{ jsPDF }, { default: autoTable }, logo] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    loadImageDataUrl("/branding/wit-logo-black.png"),
  ]);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const printedAt = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const pre = rows.filter((r) => r.test_type === "pre");
  const post = rows.filter((r) => r.test_type === "post");
  const participants = new Set(
    rows.map((r) => `${r.participant_nama.trim().toLowerCase()}|${r.participant_telp.replace(/\D/g, "")}`),
  );
  const passed = post.filter((r) => r.is_passed).length;

  // ---- page-1 header ----
  if (logo) doc.addImage(logo, "PNG", MARGIN, MARGIN - 4, 22 * LOGO_RATIO, 22, "wit-logo", "FAST");
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...INK);
  doc.text("Laporan Ringkasan Peserta Assessment", pageW - MARGIN, MARGIN + 10, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...MUTED);
  doc.text(`Dicetak ${printedAt}`, pageW - MARGIN, MARGIN + 25, { align: "right" });
  doc.setDrawColor(...ACCENT).setLineWidth(2).line(MARGIN, MARGIN + 36, pageW - MARGIN, MARGIN + 36);

  // ---- filter info ----
  doc.setFontSize(9).setTextColor(...MUTED);
  const filterText = filterLines.length ? `Filter: ${filterLines.join("  |  ")}` : "Filter: semua data";
  const wrapped = doc.splitTextToSize(filterText, pageW - MARGIN * 2) as string[];
  doc.text(wrapped, MARGIN, MARGIN + 54);
  let y = MARGIN + 54 + wrapped.length * 12 + 8;

  // ---- scorecards ----
  const cards: { label: string; value: string; hint: string }[][] = [
    [
      { label: "Total Peserta", value: String(participants.size), hint: `${rows.length} pengerjaan tercatat` },
      { label: "Total Pre-Test", value: String(pre.length), hint: "pengerjaan pre-test" },
      { label: "Total Post-Test", value: String(post.length), hint: "pengerjaan post-test" },
      { label: "Rata-rata Skor", value: fmt(avg(rows.map((r) => r.score))), hint: "seluruh pengerjaan" },
    ],
    [
      { label: "Rata-rata Pre-Test", value: fmt(avg(pre.map((r) => r.score))), hint: "skor pre-test" },
      { label: "Rata-rata Post-Test", value: fmt(avg(post.map((r) => r.score))), hint: "skor post-test" },
      { label: "Lulus (Post-Test)", value: String(passed), hint: post.length ? `${Math.round((passed / post.length) * 100)}% dari post-test` : "belum ada post-test" },
      { label: "Belum Lulus (Post-Test)", value: String(post.length - passed), hint: "skor di bawah 80" },
    ],
  ];
  const gap = 12;
  const cardW = (pageW - MARGIN * 2 - gap * 3) / 4;
  const cardH = 52;
  for (const row of cards) {
    row.forEach((card, i) => {
      const x = MARGIN + i * (cardW + gap);
      doc.setFillColor(...SOFT).setDrawColor(...BORDER).setLineWidth(0.5).roundedRect(x, y, cardW, cardH, 8, 8, "FD");
      doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...MUTED);
      doc.text(card.label.toUpperCase(), x + 12, y + 16);
      doc.setFontSize(20).setTextColor(...INK);
      doc.text(card.value, x + 12, y + 38);
      doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...MUTED);
      doc.text(card.hint, x + cardW - 12, y + 38, { align: "right" });
    });
    y += cardH + gap;
  }

  // ---- table ----
  autoTable(doc, {
    startY: y + 4,
    margin: { top: 56, left: MARGIN, right: MARGIN, bottom: 40 },
    head: [["No", "Nama", "Jabatan", "No. Telepon", "Tipe", "Skor", "Status", "Tanggal"]],
    body: rows.map((r, i) => [
      String(i + 1),
      r.participant_nama,
      r.participant_jabatan,
      r.participant_telp,
      r.test_type === "pre" ? "Pre-Test" : "Post-Test",
      String(r.score),
      r.test_type === "pre" ? "-" : r.is_passed ? "Lulus" : "Belum Lulus",
      new Date(r.created_at).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ]),
    styles: { font: "helvetica", fontSize: 9, cellPadding: 5, textColor: INK, lineColor: BORDER, lineWidth: 0.4, overflow: "linebreak" },
    headStyles: { fillColor: INK, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
    alternateRowStyles: { fillColor: [250, 250, 251] },
    columnStyles: {
      0: { cellWidth: 30, halign: "center" },
      5: { halign: "center", cellWidth: 40 },
      4: { cellWidth: 60 },
      6: { cellWidth: 70 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 6) {
        if (data.cell.raw === "Lulus") data.cell.styles.textColor = GREEN;
        else if (data.cell.raw === "Belum Lulus") data.cell.styles.textColor = ACCENT;
        else data.cell.styles.textColor = MUTED;
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        if (logo) doc.addImage(logo, "PNG", MARGIN, 22, 16 * LOGO_RATIO, 16, "wit-logo", "FAST");
        doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...MUTED);
        doc.text("Laporan Ringkasan Peserta Assessment", pageW - MARGIN, 34, { align: "right" });
        doc.setDrawColor(...ACCENT).setLineWidth(1).line(MARGIN, 44, pageW - MARGIN, 44);
      }
    },
  });

  // ---- footers (page x of y) ----
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BORDER).setLineWidth(0.5).line(MARGIN, pageH - 30, pageW - MARGIN, pageH - 30);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...MUTED);
    doc.text("WIT.ID - WIT Training Assessment", MARGIN, pageH - 17);
    doc.text(`Halaman ${i} dari ${pages}`, pageW - MARGIN, pageH - 17, { align: "right" });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`Laporan-Peserta-Assessment-${stamp}.pdf`);
}
