import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import path from "path";

export const runtime = "nodejs";

function toText(v: any): string {
  const val = v?.value ?? v;
  if (val == null) return "N/A";
  if (Array.isArray(val)) return val.map(toText).join("\n");
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function parseAddr(addr: string) {
  const m = /^([A-Z]+)(\d+)$/.exec(addr)!;
  return { col: m[1], row: Number(m[2]) };
}

function colLetterToNumber(col: string) {
  let n = 0;
  for (let i = 0; i < col.length; i++) n = n * 26 + (col.charCodeAt(i) - 64);
  return n;
}

function cloneRowStyle(ws: ExcelJS.Worksheet, fromRowNo: number, toRowNo: number) {
  const from = ws.getRow(fromRowNo);
  const to = ws.getRow(toRowNo);
  to.height = from.height;
  for (let c = 1; c <= ws.columnCount; c++) {
    const fc = from.getCell(c);
    const tc = to.getCell(c);
    tc.style = JSON.parse(JSON.stringify(fc.style || {}));
    tc.alignment = fc.alignment ? { ...fc.alignment } : undefined;
    tc.numFmt = fc.numFmt;
    tc.value = null;
  }
  to.commit();
}

function cloneRowMerges(ws: ExcelJS.Worksheet, fromRowNo: number, toRowNo: number) {
  const merges: string[] = (ws.model as any).merges || [];
  merges.forEach((rng) => {
    const [a1, a2] = rng.split(":");
    const p1 = parseAddr(a1);
    const p2 = parseAddr(a2);
    if (p1.row === fromRowNo && p2.row === fromRowNo) {
      ws.mergeCells(
        toRowNo,
        colLetterToNumber(p1.col),
        toRowNo,
        colLetterToNumber(p2.col)
      );
    }
  });
}

const TABLE_FIELDS = [
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
] as const;


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows: any[] = Array.isArray(body) ? body : body?.data || [];
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Data kosong." }, { status: 400 });
    }

    const templatePath = path.resolve(process.cwd(), "src", "template", "RoPA.xlsx");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(templatePath);

    const ws = wb.getWorksheet("RoPA") || wb.worksheets[0];

    const header = body?.header || rows[0] || {};
    ws.getCell("C2").value = toText(header.nama_perusahaan);
    ws.getCell("C3").value = toText(header.divisi_unitkerja || header.divisi);
    ws.getCell("C4").value = toText(header.no_dokumen);
    ws.getCell("C5").value = toText(header.versi);
    ws.getCell("C6").value = toText(header.tanggal);
    if (header.nama) ws.getCell("C10").value = toText(header.nama);
    if (header.kontak) ws.getCell("C11").value = toText(header.kontak);

const START_ROW = 15;
const N = rows.length;

const PATTERN_ROW = START_ROW;

if (N > 1) {
  ws.spliceRows(PATTERN_ROW + 1, 0, ...Array(N - 1).fill([]));

  for (let i = 1; i < N; i++) {
    const rNo = PATTERN_ROW + i;
    cloneRowStyle(ws, PATTERN_ROW, rNo);
    cloneRowMerges(ws, PATTERN_ROW, rNo);
  }
} 

rows.forEach((r, idx) => {
  const rowNo = PATTERN_ROW + idx;
  const row = ws.getRow(rowNo);
  TABLE_FIELDS.forEach((field, i) => {
    const cell = row.getCell(i + 1); 
    cell.value = toText(r[field]);
    cell.alignment = { ...(cell.alignment || {}), wrapText: true, vertical: "top" };
  });
  row.commit();
});

    const buf = await wb.xlsx.writeBuffer();
    return new NextResponse(Buffer.from(buf), {
      headers: {
        "Content-Disposition": 'attachment; filename="Hasil_Analisis_RoPA.xlsx"',
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err: any) {
    console.error("Error generate Excel:", err);
    return NextResponse.json(
      { error: err?.message || "Gagal generate Excel" },
      { status: 500 }
    );
  }
}
