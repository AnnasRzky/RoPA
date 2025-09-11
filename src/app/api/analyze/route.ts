import { NextRequest, NextResponse } from "next/server";
import genAI from "@/lib/gemini";

async function streamToBuffer(
  stream: ReadableStream<Uint8Array>
): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

function fileToGenerativePart(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "File not found." }, { status: 400 });
    }

    const imageParts = await Promise.all(
      files.map(async (file) => {
        const allowedMimeTypes = ["image/png", "image/jpeg", "application/pdf"];
        if (!allowedMimeTypes.includes(file.type)) {
          // Melemparkan error jika ada file yang tidak didukung
          throw new Error(`Unsupported file type: ${file.type}`);
        }
        const buffer = await streamToBuffer(file.stream());
        return fileToGenerativePart(buffer, file.type);
      })
    );

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `
      Anda adalah asisten AI yang bertugas sebagai spesialis Kepatuhan Privasi Data.
      Tugas Anda adalah membaca dokumen yang diberikan dan mengisi template Record of Processing Activities (RoPA) secara lengkap dan akurat berdasarkan definisi kolom berikut.

      - "Nama Perusahaan": Nama perusahaan yang tertera 
      - "Divisi/Unit Kerja":
      - "No. Dokumen":	
      - "Versi":	
      - "Tanggal": Tanggal yang tertera pada dokumen 
	
      - "Nama":	(Pejabat Pelindung Data Pribadi Jika ada keterangan yg menjelaskan dalam dokumen dapat langsung diisi (Jika tidak ada tidak usah))
      - "Kontak":	(Kontak Pejabat Pelindung Data Pribadi Jika ada keterangan yg menjelaskan dalam dokumen dapat langsung diisi (Jika tidak ada tidak usah))

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

      --- TUGAS ANDA ---
      Analisis dokumen yang diberikan dan ekstrak informasi untuk mengisi kolom-kolom di atas.

      --- ATURAN PENTING ---
      1.  **Analisis Holistik**: Baca dan pahami seluruh dokumen untuk menemukan informasi relevan, bahkan jika tidak disebutkan secara eksplisit.
      2.  **Penanganan Data Hilang**: Jika informasi untuk kolom mana pun TIDAK DAPAT DITEMUKAN, isi nilainya dengan 'null'.
      3.  **Berikan Saran Cerdas**: Buat properti bernama "saran_ai". Jika ada nilai yang 'null', berikan saran yang paling logis berdasarkan konteks. Jika tidak ada konteks untuk memberikan saran, berikan string kosong.
      4.  **Format Output**: Kembalikan hasilnya HANYA dalam format JSON tunggal yang valid tanpa teks tambahan.

       --- ATURAN PENTING UNTUK 'saran_ai' ---
      Setelah mengekstrak semua data, Anda HARUS membuat properti "saran_ai". Properti ini memiliki DUA tujuan:

      1.  **REKOMENDASI NILAI KOSONG**:
          - Untuk setiap field yang nilainya 'null', berikan rekomendasi pengisian yang logis.
          - Gunakan format: "- [Nama Kolom]: Rekomendasi Anda."
          - Contoh: "- Masa Retensi: Tidak ditemukan, sarankan untuk diisi 'Sesuai Kebijakan Perusahaan'."

      2.  **VALIDASI DATA TIDAK COCOK**:
          - Periksa setiap data yang berhasil diekstrak. Apakah nilainya masuk akal untuk kolom tersebut berdasarkan definisinya?
          - Jika Anda menemukan kejanggalan (misalnya, nama orang di kolom 'Unit Kerja', atau tujuan proses di kolom 'Nama Aktivitas'), laporkan.
          - Gunakan format: "- Validasi [Nama Kolom]: Nilai '[Nilai yang Ditemukan]' terlihat tidak cocok karena [alasan Anda]."
          - Contoh: "- Validasi Unit Kerja: Nilai 'Budi Santoso' terlihat tidak cocok karena ini adalah nama orang, bukan nama divisi."
    `;

    const promises = files.map(async (file) => {
      const allowedMimeTypes = ["image/png", "image/jpeg", "application/pdf"];
      if (!allowedMimeTypes.includes(file.type)) {
        throw new Error(
          `Unsupported file type: ${file.type} for file ${file.name}`
        );
      }

      const buffer = await streamToBuffer(file.stream());
      const imagePart = fileToGenerativePart(buffer, file.type);

      // Panggil AI untuk SETIAP file secara terpisah
      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();

      // Parsing JSON untuk setiap hasil
      return JSON.parse(responseText.replace(/```json|```/g, "").trim());
    });

    // Tunggu semua proses selesai
    const allJsonResults = await Promise.all(promises);

    // Kembalikan ARRAY berisi semua hasil JSON
    return NextResponse.json(allJsonResults);
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
