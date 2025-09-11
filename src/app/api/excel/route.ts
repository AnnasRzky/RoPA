import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import path from "path";

export const runtime = "nodejs"; // exceljs butuh Node runtime

// urutan kolom tabel di template mulai kolom A
const TABLE_FIELDS: Array<keyof any> = [
  "no",
  "unit_kerja",
  "departemen",
  "penanggung_jawab",
  "kedudukan_pemilik_proses",
  "nama_aktivitas",
  "deskripsi_tujuan",
  "kebijakan_rujukan",
  "bentuk_data_pribadi",
  "subjek_data_pribadi",
  "jenis_data_pribadi",
  "data_pribadi_spesifik",
  "sumber_data",
  "akurat_lengkap",
  "penyimpanan_data",
  "metode_pemrosesan",
  "keputusan_otomatis",
  "dasar_pemrosesan",
  "masa_retensi",
  "kewajiban_hukum",
  "langkah_teknis_pengamanan",
  "langkah_organisasi_pengamanan",
  "kategori_penerima",
  "profil_penerima",
  "peran_penerima",
  "kontak_penerima",
  "tujuan_pengiriman",
  "data_dikirim",
  "perjanjian_kontraktual",
  "negara_tujuan",
  "bentuk_dokumen",
  "mekanisme_transfer",
  "hak_subjek",
  "asesmen_risiko",
  "proses_sebelumnya",
  "proses_setelahnya",
  "keterangan_tambahan",
];

// bantu: ubah RopaCell -> string plain
function toText(input: any): string {
  const v = input?.value ?? input; // bisa RopaCell {value, source} atau string langsung
  if (v == null) return "N/A";
  if (Array.isArray(v)) return v.join("; ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows: any[] = body?.data ?? [];
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Data kosong." }, { status: 400 });
    }

    // Buka template
    const templatePath = path.resolve(
      process.cwd(),
      "src",
      "template",
      "RoPA.xlsx"
    );

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(templatePath);

    // Kalau sheet diberi nama "RoPA", ambil itu; kalau tidak, ambil sheet pertama
    const ws =
      wb.getWorksheet("RoPA") ||
      wb.worksheets[0];

    // ===== Header (ambil dari row pertama yang kamu render di FE) =====
    const first = rows[0] || {};

    // NOTE: alamat cell ini sesuaikan dengan template kamu
    ws.getCell("C2").value = toText(first.nama_perusahaan);
    ws.getCell("C3").value = toText(first.divisi_unitkerja);
    ws.getCell("C4").value = toText(first.no_dokumen);
    ws.getCell("C5").value = toText(first.versi);
    ws.getCell("C6").value = toText(first.tanggal);

    // Optional: kalau kamu punya field nama/ kontak DPO di FE
    if (first.nama)  ws.getCell("C10").value = toText(first.nama);
    if (first.kontak) ws.getCell("C11").value = toText(first.kontak);

    // ===== Data Tabel =====
    // Mulai baris sesuai template-mu (di screenshoot kelihatan pertama isi di baris 15)
    const START_ROW = 15;

    rows.forEach((r, idx) => {
      const rowNumber = START_ROW + idx;
      const row = ws.getRow(rowNumber);
      TABLE_FIELDS.forEach((key, i) => {
        row.getCell(i + 1).value = toText(r[key]); // i+1 => kolom A=1
      });
      row.commit();
    });

    // Tulis kembali workbook, styles template akan dipertahankan
    const buffer = await wb.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition":
          'attachment; filename="Hasil_Analisis_RoPA.xlsx"',
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err: any) {
    console.error("Error generate Excel:", err);
    return NextResponse.json(
      { error: err?.message ?? "Gagal generate Excel" },
      { status: 500 }
    );
  }
}