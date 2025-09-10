import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import { readFileSync } from "fs";

export const runtime = "nodejs";

const HEADER_CELL_MAP: Record<string, string> = {
  "Nama Perusahaan": "C2",
  "Divisi/Unit Kerja": "C3",
  "No. Dokumen": "C4",
  "Versi": "C5",
  "Tanggal": "C6",
};  

const TABLE_COL_MAP: Array<[key: string, label: string, col: string]> = [
  ["no", "No", "A"],
  ["nama_aktivitas", "Nama Aktivitas", "B"],
  ["unit_kerja", "Unit Kerja / Divisi", "C"],
  ["departemen", "Departemen / Sub-Departemen", "D"],
  ["penanggung_jawab", "Penanggungjawab Proses", "E"],
  ["kedudukan_pemilik_proses", "Kedudukan Pemilik Proses", "F"],
  ["deskripsi_tujuan", "Deskripsi dan Tujuan Pemrosesan", "G"],
  ["kebijakan_rujukan", "Kebijakan/SOP/IK/Dokumen Rujukan", "H"],
  ["bentuk_data_pribadi", "Bentuk Data Pribadi", "I"],
  ["subjek_data_pribadi", "Subjek Data Pribadi", "J"],
  ["jenis_data_pribadi", "Jenis Data Pribadi", "K"],
  ["data_pribadi_spesifik", "Data Pribadi Spesifik (Ya/Tidak)", "L"],
  ["sumber_data", "Sumber Pemerolehan Data Pribadi", "M"],
  ["akurat_lengkap", "Akurasi dan Kelengkapan Data Pribadi", "N"],
  ["penyimpanan_data", "Penyimpanan Data Pribadi", "O"],
  ["metode_pemrosesan", "Metode Pemrosesan Data Pribadi", "P"],
  ["keputusan_otomatis", "Pengambilan Keputusan Terotomasi", "Q"],
  ["dasar_pemrosesan", "Dasar Pemrosesan", "R"],
  ["masa_retensi", "Masa Retensi Data Pribadi", "S"],
  ["kewajiban_hukum", "Kewajiban Hukum untuk menyimpan Data Pribadi", "T"],
  ["langkah_teknis_pengamanan", "Langkah Teknis (Technical) Pengamanan Data Pribadi", "U"],
  ["langkah_organisasi_pengamanan", "Langkah Organisasi (Organisational) Pengamanan Data Pribadi", "V"],
  ["kategori_penerima", "Kategori dan Jenis Penerima Data Pribadi", "W"],
  ["profil_penerima", "Profil Penerima Data Pribadi", "X"],
  ["peran_penerima", "Pengendali / Prosesor / Pengendali Bersama", "Y"],
  ["kontak_penerima", "Kontak Pengendali / Pengendali Bersama / Prosesor", "Z"],
  ["tujuan_pengiriman", "Tujuan Pengiriman / Pemrosesan / Berbagi / Akses Data Pribadi", "AA"],
  ["data_dikirim", "Jenis Data Pribadi yang Dikirim", "AB"],
  ["perjanjian_kontraktual", "Perjanjian Kontraktual dengan penerima Data Pribadi", "AC"],
  ["negara_tujuan", "Negara lain sebagai penerima Transfer Data Pribadi", "AD"],
  ["bentuk_dokumen", "Bentuk Dokumen Pengiriman", "AE"],
  ["mekanisme_transfer", "Mekanisme Transfer", "AF"],
  ["hak_subjek", "Hak Subjek Data Pribadi yang Berlaku", "AG"],
  ["asesmen_risiko", "Asesmen Risiko", "AH"],
  ["proses_sebelumnya", "Proses / Kegiatan Sebelumnya", "AI"],
  ["proses_setelahnya", "Proses / Kegiatan Setelahnya", "AJ"],
  ["keterangan_tambahan", "Keterangan / Catatan Tambahan", "AK"],
];

const norm = (s: string) => s.toLowerCase().replace(/[^\w]+/g, "_");

const toCellString = (v: any): string => {
  const raw = v?.value ?? v;
  if (raw == null) return "N/A";
  if (Array.isArray(raw)) return raw.join("; ");
  if (typeof raw === "object") return JSON.stringify(raw);
  return String(raw);
};

const pick = (o: any, label: string, snakeKey?: string) => {
  if (!o) return undefined;
  const cand = [snakeKey ?? norm(label), label];
  for (const k of cand) {
    if (o[k] != null) return o[k];
  }
  return undefined;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const templatePath = path.join(process.cwd(), "src", "template", "RoPA.xlsx");
    const wb = XLSX.read(readFileSync(templatePath));
    const ws = wb.Sheets[wb.SheetNames[0]];

    const headerSource =
      body?.header ??
      body ?? 
      {};

    const rowsSource: any[] =
      body?.data ??
      body?.RoPA ??
      (Array.isArray(body) ? body : [body]);

    Object.entries(HEADER_CELL_MAP).forEach(([label, addr]) => {
      const v = pick(headerSource, label);
      ws[addr] = { t: "s", v: toCellString(v) };
    });

    const startRow = 15;
    rowsSource.forEach((rowObj, i) => {
      TABLE_COL_MAP.forEach(([snake, label, col]) => {
        const v = pick(rowObj, label, snake);
        ws[`${col}${startRow + i}`] = { t: "s", v: toCellString(v) };
      });
    });

    // tulis file
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": 'attachment; filename="RoPA.xlsx"',
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err) {
    console.error("Error generate Excel:", err);
    return NextResponse.json({ error: "Gagal generate Excel" }, { status: 500 });
  }
}
