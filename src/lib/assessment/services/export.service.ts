import ExcelJS from "exceljs";
import type { InsForgeClient } from "@insforge/sdk";
import { listAttempts } from "@/lib/assessment/repositories/attempts.repository";
import type { AttemptFilters } from "@/lib/assessment/types";

const EXPORT_PAGE_SIZE = 1000;

export async function exportAttemptsToExcel(client: InsForgeClient, filters: AttemptFilters) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Hasil Assessment");

  sheet.columns = [
    { header: "Nama", key: "nama", width: 28 },
    { header: "Jabatan", key: "jabatan", width: 22 },
    { header: "No. Telp", key: "telp", width: 18 },
    { header: "Modul", key: "modul", width: 26 },
    { header: "Tipe Tes", key: "tipe", width: 10 },
    { header: "Skor", key: "skor", width: 8 },
    { header: "Benar/Total", key: "benar", width: 14 },
    { header: "Lulus", key: "lulus", width: 10 },
    { header: "Tanggal", key: "tanggal", width: 22 },
  ];
  sheet.getRow(1).font = { bold: true };

  let page = 1;
  for (;;) {
    const { data, error } = await listAttempts(client, {
      ...filters,
      page,
      pageSize: EXPORT_PAGE_SIZE,
    });
    if (error) throw new Error(error.message ?? "Gagal mengambil data untuk export.");
    const rows = data ?? [];
    if (rows.length === 0) break;

    for (const attempt of rows) {
      sheet.addRow({
        nama: attempt.participant_nama,
        jabatan: attempt.participant_jabatan,
        telp: attempt.participant_telp,
        modul: attempt.module_name,
        tipe: attempt.test_type === "pre" ? "Pre-Test" : "Post-Test",
        skor: attempt.score,
        benar: `${attempt.correct_count}/${attempt.main_answers.length}`,
        lulus: attempt.test_type === "post" ? (attempt.is_passed ? "Lulus" : "Belum Lulus") : "-",
        tanggal: new Date(attempt.created_at).toLocaleString("id-ID"),
      });
    }

    if (rows.length < EXPORT_PAGE_SIZE) break;
    page += 1;
  }

  return workbook.xlsx.writeBuffer();
}
