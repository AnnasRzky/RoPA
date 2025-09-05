import { NextRequest, NextResponse } from "next/server";
import genAI from "@/lib/gemini";

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export async function POST(req: NextRequest) {
  try {
    // Ambil file dari request (form-data)
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file jadi base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";
    const base64 = buffer.toString("base64");

    // Konteks schema
    const schemaContext = `
Anda adalah asisten AI yang bertugas membaca dokumen (PDF/Word/Image/Teks) 
dan memetakannya ke dalam schema Records of Processing Activities (RoPA).

Berikut adalah arti dari setiap kolom:

- "No": Nomor aktivitas/pemrosesan.
- "Unit Kerja / Divisi": Nama unit/divisi yang terlibat.
- "Departemen / Sub-Departemen": Nama departemen/sub-departemen.
- "Penanggungjawab Proses": Penanggung jawab pemrosesan Data Pribadi (contoh: jabatan, divisi).
- "Kedudukan Pemilik Proses": Peran pemilik proses (Pengendali / Prosesor / Pengendali Bersama).
- "Nama Aktivitas": Nama aktivitas pemrosesan Data Pribadi.
- "Deskripsi dan Tujuan Pemrosesan": Tujuan pemrosesan, misal "untuk kebutuhan rekrutmen".
- "Kebijakan/SOP/IK/Dokumen Rujukan": Nama dokumen rujukan (SOP, IK, kebijakan).
- "Bentuk Data Pribadi": Jenis artefak (Elektronik, Non-Elektronik, Lainnya).
- "Subjek Data Pribadi": Profil subjek (Nasabah, Karyawan, Calon Karyawan, dll).
- "Jenis Data Pribadi": Jenis data yang diproses (umum/spesifik).
- "Data Pribadi Spesifik (Ya/Tidak)": Apakah ada data spesifik? (contoh: medis, keuangan).
- "Sumber Pemerolehan Data Pribadi": Dari mana data diperoleh (subjek langsung, pihak ketiga, sistem).
- "Akurasi dan Kelengkapan Data Pribadi": Bagaimana data diperbarui dan dijaga akurasinya.
- "Penyimpanan Data Pribadi": Metode penyimpanan (hardcopy, aplikasi, keduanya).
- "Metode Pemrosesan Data Pribadi": Cara pemrosesan (manual, aplikasi, keduanya).
- "Pengambilan Keputusan Terotomasi": Jelaskan jika ada mekanisme automated decision/profiling.
- "Dasar Pemrosesan": Landasan hukum (Consent, Contractual, Legal Obligation, Vital Interest, Legitimate Interest).
- "Masa Retensi Data Pribadi": Periode penyimpanan data.
- "Kewajiban Hukum untuk menyimpan Data Pribadi": Aturan hukum yang mewajibkan penyimpanan.
- "Langkah Teknis (Technical) Pengamanan Data Pribadi": Pengamanan teknis.
- "Langkah Organisasi (Organisational) Pengamanan Data Pribadi": Pengamanan organisasi/kebijakan.
- "Kategori dan Jenis Penerima Data Pribadi": Penerima data (internal/eksternal).
- "Profil Penerima Data Pribadi": Profil detail penerima (divisi, vendor, pemerintah).
- "Pengendali / Prosesor / Pengendali Bersama": Peran penerima data jika eksternal.
- "Kontak Pengendali / Prosesor": Kontak/PIC penerima data eksternal.
- "Tujuan Pengiriman / Pemrosesan / Berbagi / Akses": Tujuan transfer data.
- "Jenis Data Pribadi yang Dikirim": Jenis data pribadi yang diproses/dikirim.
- "Perjanjian Kontraktual dengan penerima Data Pribadi": Apakah ada perjanjian (Ya/Tidak).
- "Negara lain sebagai penerima Transfer Data Pribadi": Negara penerima jika ada transfer lintas negara.
- "Bentuk Dokumen Pengiriman": Bentuk dokumen transfer (Elektronik/Non-Elektronik).
- "Mekanisme Transfer": Metode pertukaran (Email, FTP, manual, dll).
- "Hak Subjek Data Pribadi yang Berlaku": Hak-hak Subjek Data Pribadi dapat dipernuhi / diakomodir:
1. Hak Mendapatkan Informasi Pemrosesan Data Pribadi (Pasal 5)
2. Hak Memutakhirkan Data Pribadinya (Pasal 6)
3. Hak Akses dan Mendapatkan Salinan (Pasal 7)
4. Hak Mengakhiri Pemroseaan Data Pribadinya (Pasal 8)
5. Hak Menarik Persetujuan (Pasal 9)
6. Hak Keberatan akan Pemrosesan Otomatis (Automated Decision Making) (Pasal 10)
7. Hak Menunda atau Membatasi Pemrosesan Data Pribadi (Pasal 11)
8. Hak atas Gugatan Ganti Rugi (Pasal 12)
9. Hak Interoperabilitas (Pasal 13)
- "Asesmen Risiko": Hasil analisis kategori Risiko Tinggi sesuai Pasal 34 ayat (2) UU PDP dan/atau referensi ke pembahasan risiko di Risk Register, diantaranya meliputi:
a. pengambilan keputusan secara otomatis yang memiliki akibat hukum atau dampak yang signifikan terhadap Subjek Data Pribadi; 
b. pemrosesan atas Data Pribadi yang bersifat spesifik; 
c. pemrosesan Data Pribadi dalam skala besar  (contohnya pemrosesan data pribadi Nasabah dalam skala besar);
d. pemrosesan Data Pribadi untuk kegiatan evaluasi, penskoran, atau pemantauan yang sistematis terhadap Subjek Data Pribadi; 
e. pemrosesan Data Pribadi untuk kegiatan pencocokan atau penggabungan sekelompok data; 
f. penggunaan teknologi baru dalam pemrosesan Data Pribadi; dan/atau
g. pemrosesan Data Pribadi yang membatasi pelaksanaan hak Subjek Data Pribadi.
- "Proses / Kegiatan Sebelumnya": Aktivitas sebelumnya.
- "Proses / Kegiatan Setelahnya": Aktivitas setelahnya.
- "Keterangan / Catatan Tambahan": Catatan tambahan.

RULES:
1. Jika data ditemukan → isi sesuai teks dokumen.
2. Jika data tidak ditemukan → kembalikan objek:
   { "need_user_input": true, "field": "Nama Field", "reason": "Kenapa butuh input user" }
3. Jika user mengizinkan AI untuk mengasumsikan → isi dengan asumsi terbaik.
4. Jawaban HARUS berupa JSON valid, tanpa teks tambahan, tanpa markdown, tanpa backtick.

Jika semua data ditemukan (contoh dari CV):
{
  "No": "1",
  "Unit Kerja / Divisi": "Sumber Daya Manusia",
  "Nama Aktivitas": "Perekrutan Karyawan Baru",
  "Deskripsi dan Tujuan Pemrosesan": "Mengumpulkan dan memproses data dari CV kandidat untuk keperluan seleksi dan rekrutmen.",
  "Subjek Data Pribadi": "Calon Karyawan",
  "Jenis Data Pribadi": "Umum",
  "Dasar Pemrosesan": "Consent",
  "Masa Retensi Data Pribadi": "1 tahun setelah proses rekrutmen selesai"
}

Jika ada data yang tidak ditemukan:
{
  "need_user_input": true,
  "field": "Dasar Pemrosesan",
  "reason": "Dokumen CV tidak secara eksplisit menyebutkan landasan hukum pemrosesan data."
}
`;

    // Kirim ke Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: schemaContext },
            {
              inlineData: {
                data: base64,
                mimeType,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json", // <-- pastikan JSON valid
      },
    });

    // Ambil text dari response
    const text = result.response?.text() || "{}";

    // Parsing JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text, error: "Failed to parse JSON" };
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Processing failed", detail: error.message },
      { status: 500 }
    );
  }
}
