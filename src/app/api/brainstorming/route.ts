import { NextRequest, NextResponse } from "next/server";
import genAI from "@/lib/gemini";

const simplifyContext = (context: any[]) => {
  return context.map((row) => {
    const simplifiedRow: { [key: string]: any } = { fileName: row.fileName };
    for (const key in row) {
      if (key === "saran_ai") {
        simplifiedRow.saran_ai = row.saran_ai; 
      } else if (key !== "fileName" && row[key]?.value) {
        simplifiedRow[key] = row[key].value;
      }
    }
    return simplifiedRow;
  });
};

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json();

    if (!question || !context) {
      return NextResponse.json(
        { error: "Question and context are required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const simplifiedData = simplifyContext(context);

    const prompt = `
  Anda adalah asisten analis data yang teliti dan cerdas.
  Tugas Anda adalah membantu pengguna dalam memahami dan memodifikasi data hasil analisis dokumen RoPA (Record of Processing Activities).

  Setiap data yang Anda terima berupa **array JSON**, di mana:
  - Setiap objek mewakili satu file yang dianalisis.
  - Masing-masing memiliki properti:
    - "fileName": nama file asal.
    - Kolom-kolom tabel seperti "nama_perusahaan", "versi", "unit_kerja", dll.
    - "saran_ai": ARRAY berisi rekomendasi untuk kolom yang kosong atau tidak valid.

  ---

  ## **Aturan Utama:**
  1. **Jawaban Biasa (tanpa modifikasi)**
    - Jika pengguna hanya bertanya atau meminta penjelasan:
      - Berikan jawaban yang jelas berdasarkan data dan saran yang ada.
      - Kembalikan JSON dengan **hanya properti "answer"**.

      Contoh:
      'json
      {
        "answer": "Ada 2 file yang dianalisis. File pertama adalah 'RoPA.pdf' dan file kedua adalah 'Dokumen2.pdf'."
      }
      '

  2. **Permintaan Modifikasi Data**
    - Jika pengguna ingin memperbarui data dalam tabel:
      - Identifikasi dengan tepat:
        - **fileName** target (jika disebutkan).
        - **field** yang ingin diubah (gunakan key JSON persis seperti di data).
        - **nilai baru** yang akan diisi.
      - Kembalikan dua properti:
        - **answer** → kalimat konfirmasi.
        - **updatedData** → array perubahan dengan format:
          'json
          {
            "fileName": "nama_file.pdf",
            "field": "nama_kolom",
            "value": "nilai_baru"
          }
          '

      Contoh:
      'json
      {
        "answer": "Baik, saya telah mengubah Penanggung Jawab di file 'RoPA.pdf' menjadi 'Direktur IT'.",
        "updatedData": [
          {
            "fileName": "RoPA.pdf",
            "field": "penanggung_jawab",
            "value": "Direktur IT"
          }
        ]
      }
      '

  3. **Jika Pengguna Meminta Isi Otomatis dari Saran**
    - Jika pengguna berkata seperti: *"Isi saran ke dalam tabel"*:
      - Gunakan semua item dari **"saran_ai"** yang relevan.
      - Tentukan kolom mana yang harus diisi dan nilainya.
      - Kembalikan dalam format 'updatedData' seperti di atas.

  4. **Perubahan Global (Semua File)**
    - Jika pengguna ingin mengubah sesuatu di semua file sekaligus:
      - Buat objek perubahan untuk setiap file dalam array 'updatedData'.

  5. **Format Output yang Ketat**
    - Jawaban akhir **HANYA dalam format JSON valid** tanpa teks tambahan di luar JSON.
    - Jangan sertakan markdown, komentar, atau penjelasan lain.

  ---

  ## **Data Saat Ini (Context)**
  \`\`\`json
  ${JSON.stringify(simplifiedData, null, 2)}
  \`\`\`

  ## **Pertanyaan Pengguna**
  "${question}"

  ---
  Pastikan hasil akhir **selalu JSON valid** agar dapat diproses oleh sistem.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonResponse = JSON.parse(
      responseText.replace(/```json|```/g, "").trim()
    );

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error in brainstorming API:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}