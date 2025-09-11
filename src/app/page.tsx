"use client";

import { useState, useRef, FormEvent, ChangeEvent, DragEvent } from "react";
// import * as XLSX from "xlsx";

interface RopaCell {
  value: string | null;
  source: "initial" | "manual" | "ai";
}

interface RopaData {
  nama_perusahaan: RopaCell;
  divisi_unitkerja: RopaCell;
  no_dokumen: RopaCell;
  versi: RopaCell;
  tanggal: RopaCell;
  no: RopaCell;
  unit_kerja: RopaCell;
  departemen: RopaCell;
  penanggung_jawab: RopaCell;
  kedudukan_pemilik_proses: RopaCell;
  nama_aktivitas: RopaCell;
  deskripsi_tujuan: RopaCell;
  kebijakan_rujukan: RopaCell;
  bentuk_data_pribadi: RopaCell;
  subjek_data_pribadi: RopaCell;
  jenis_data_pribadi: RopaCell;
  data_pribadi_spesifik: RopaCell;
  sumber_data: RopaCell;
  akurat_lengkap: RopaCell;
  penyimpanan_data: RopaCell;
  metode_pemrosesan: RopaCell;
  keputusan_otomatis: RopaCell;
  dasar_pemrosesan: RopaCell;
  masa_retensi: RopaCell;
  kewajiban_hukum: RopaCell;
  langkah_teknis_pengamanan: RopaCell;
  langkah_organisasi_pengamanan: RopaCell;
  kategori_penerima: RopaCell;
  profil_penerima: RopaCell;
  peran_penerima: RopaCell; 
  kontak_penerima: RopaCell; 
  tujuan_pengiriman: RopaCell; 
  data_dikirim: RopaCell; 
  perjanjian_kontraktual: RopaCell; 
  negara_tujuan: RopaCell; 
  bentuk_dokumen: RopaCell;
  mekanisme_transfer: RopaCell;
  hak_subjek: RopaCell; 
  asesmen_risiko: RopaCell;
  proses_sebelumnya: RopaCell;
  proses_setelahnya: RopaCell;
  keterangan_tambahan: RopaCell;
  saran_ai: string;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

interface RopaResult extends RopaData {
  fileName: string;
}

const transformApiDataToState = (apiIn: any): RopaData => {
  const norm = (s: string) => (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const toCellString = (v: any): string => {
    const raw = v?.value ?? v;
    if (Array.isArray(raw)) return raw.join("; ");
    if (typeof raw === "object") return JSON.stringify(raw);
    return String(raw);
  };

  const makeLookup = (obj: any) => {
    const map = new Map<string, any>();
    if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((k) => map.set(norm(k), (obj as any)[k]));
    }
    return (labelsOrKeys: string[]) => {
      for (const key of labelsOrKeys) {
        const byExact = (obj ?? {})[key];
        if (byExact !== undefined) return byExact;
        const byNorm = map.get(norm(key));
        if (byNorm !== undefined) return byNorm;
      }
      return undefined;
    };
  };

  const root = Array.isArray(apiIn) ? apiIn[0] : apiIn;
  const getRoot = makeLookup(root);

  const ropas =
    getRoot(["Record of Processing Activities"]) ??
    getRoot(["RoPA"]) ??
    getRoot(["aktivitas_pemrosesan"]) ??
    getRoot(["record_of_processing_activities"]) ??
    [];

  const firstRowObj = Array.isArray(ropas) && ropas.length ? ropas[0] : root;
  const getRow = makeLookup(firstRowObj);

  const META: Record<keyof Omit<RopaData, "saran_ai" | 
    "no" | "unit_kerja" | "departemen" | "penanggung_jawab" | "kedudukan_pemilik_proses" |
    "nama_aktivitas" | "deskripsi_tujuan" | "kebijakan_rujukan" | "bentuk_data_pribadi" |
    "subjek_data_pribadi" | "jenis_data_pribadi" | "data_pribadi_spesifik" | "sumber_data" |
    "akurat_lengkap" | "penyimpanan_data" | "metode_pemrosesan" | "keputusan_otomatis" |
    "dasar_pemrosesan" | "masa_retensi" | "kewajiban_hukum" | "langkah_teknis_pengamanan" |
    "langkah_organisasi_pengamanan" | "kategori_penerima" | "profil_penerima" |
    "peran_penerima" | "kontak_penerima" | "tujuan_pengiriman" | "data_dikirim" |
    "perjanjian_kontraktual" | "negara_tujuan" | "bentuk_dokumen" | "mekanisme_transfer" |
    "hak_subjek" | "asesmen_risiko" | "proses_sebelumnya" | "proses_setelahnya" |
    "keterangan_tambahan">, string[]> = {
    nama_perusahaan: ["Nama Perusahaan", "nama_perusahaan", "company", "company_name"],
    divisi_unitkerja: ["Divisi/Unit Kerja", "divisi_unitkerja", "divisi", "unit_kerja_divisi"],
    no_dokumen: ["No. Dokumen", "no_dokumen", "nomor_dokumen"],
    versi: ["Versi", "versi"],
    tanggal: ["Tanggal", "tanggal", "date"],
  };

  const ROW: Record<keyof Pick<RopaData,
    "no" | "unit_kerja" | "departemen" | "penanggung_jawab" | "kedudukan_pemilik_proses" |
    "nama_aktivitas" | "deskripsi_tujuan" | "kebijakan_rujukan" | "bentuk_data_pribadi" |
    "subjek_data_pribadi" | "jenis_data_pribadi" | "data_pribadi_spesifik" | "sumber_data" |
    "akurat_lengkap" | "penyimpanan_data" | "metode_pemrosesan" | "keputusan_otomatis" |
    "dasar_pemrosesan" | "masa_retensi" | "kewajiban_hukum" | "langkah_teknis_pengamanan" |
    "langkah_organisasi_pengamanan" | "kategori_penerima" | "profil_penerima" |
    "peran_penerima" | "kontak_penerima" | "tujuan_pengiriman" | "data_dikirim" |
    "perjanjian_kontraktual" | "negara_tujuan" | "bentuk_dokumen" | "mekanisme_transfer" |
    "hak_subjek" | "asesmen_risiko" | "proses_sebelumnya" | "proses_setelahnya" |
    "keterangan_tambahan">, string[]> = {
    no: ["No", "no", "nomor"],
    unit_kerja: ["Unit Kerja / Divisi", "unit_kerja", "divisi", "unit"],
    departemen: ["Departemen / Sub-Departemen", "departemen", "sub_departemen"],
    penanggung_jawab: ["Penanggungjawab Proses", "penanggung_jawab", "pic_proses"],
    kedudukan_pemilik_proses: ["Kedudukan Pemilik Proses", "kedudukan_pemilik_proses"],
    nama_aktivitas: ["Nama Aktivitas", "nama_aktivitas", "aktivitas"],
    deskripsi_tujuan: ["Deskripsi dan Tujuan Pemrosesan", "deskripsi_tujuan", "tujuan_pemrosesan"],
    kebijakan_rujukan: ["Kebijakan/SOP/IK/Dokumen Rujukan", "kebijakan_rujukan"],
    bentuk_data_pribadi: ["Bentuk Data Pribadi", "bentuk_data_pribadi"],
    subjek_data_pribadi: ["Subjek Data Pribadi", "subjek_data_pribadi"],
    jenis_data_pribadi: ["Jenis Data Pribadi", "jenis_data_pribadi"],
    data_pribadi_spesifik: ["Data Pribadi Spesifik (Ya/Tidak)", "data_pribadi_spesifik"],
    sumber_data: ["Sumber Pemerolehan Data Pribadi", "sumber_data", "sumber_pemerolehan"],
    akurat_lengkap: ["Akurasi dan Kelengkapan Data Pribadi", "akurat_lengkap"],
    penyimpanan_data: ["Penyimpanan Data Pribadi", "penyimpanan_data", "lokasi_penyimpanan"],
    metode_pemrosesan: ["Metode Pemrosesan Data Pribadi", "metode_pemrosesan"],
    keputusan_otomatis: ["Pengambilan Keputusan Terotomasi", "keputusan_otomatis", "automated_decision"],
    dasar_pemrosesan: ["Dasar Pemrosesan", "dasar_pemrosesan"],
    masa_retensi: ["Masa Retensi Data Pribadi", "masa_retensi", "retensi"],
    kewajiban_hukum: ["Kewajiban Hukum untuk menyimpan Data Pribadi", "kewajiban_hukum"],
    langkah_teknis_pengamanan: ["Langkah Teknis (Technical) Pengamanan Data Pribadi", "langkah_teknis_pengamanan"],
    langkah_organisasi_pengamanan: ["Langkah Organisasi (Organisational) Pengamanan Data Pribadi", "langkah_organisasi_pengamanan"],
    kategori_penerima: ["Kategori dan Jenis Penerima Data Pribadi", "kategori_penerima"],
    profil_penerima: ["Profil Penerima Data Pribadi", "profil_penerima"],
    peran_penerima: ["Pengendali / Prosesor / Pengendali Bersama", "peran_penerima"],
    kontak_penerima: ["Kontak Pengendali / Pengendali Bersama / Prosesor", "kontak_penerima"],
    tujuan_pengiriman: ["Tujuan Pengiriman / Pemrosesan / Berbagi / Akses", "Tujuan Pengiriman / Pemrosesan / Berbagi / Akses Data Pribadi", "tujuan_pengiriman"],
    data_dikirim: ["Jenis Data Pribadi yang Dikirim", "data_dikirim"],
    perjanjian_kontraktual: ["Perjanjian Kontraktual dengan penerima Data Pribadi", "perjanjian_kontraktual"],
    negara_tujuan: ["Negara lain sebagai penerima Transfer Data Pribadi", "negara_tujuan"],
    bentuk_dokumen: ["Bentuk Dokumen Pengiriman", "bentuk_dokumen"],
    mekanisme_transfer: ["Mekanisme Transfer", "mekanisme_transfer"],
    hak_subjek: ["Hak Subjek Data Pribadi yang Berlaku", "hak_subjek"],
    asesmen_risiko: ["Asesmen Risiko", "asesmen_risiko", "profil_resiko"],
    proses_sebelumnya: ["Proses / Kegiatan Sebelumnya", "proses_sebelumnya"],
    proses_setelahnya: ["Proses / Kegiatan Setelahnya", "proses_setelahnya"],
    keterangan_tambahan: ["Keterangan / Catatan Tambahan", "keterangan_tambahan", "keterangan"],
  };

  const out: Partial<RopaData> = {};

  (Object.keys(META) as Array<keyof typeof META>).forEach((stateKey) => {
    const val = getRoot(META[stateKey]);
    out[stateKey] = { value: toCellString(val), source: "ai" };
  });

  (Object.keys(ROW) as Array<keyof typeof ROW>).forEach((stateKey) => {
    const val = getRow(ROW[stateKey]);
    out[stateKey] = { value: toCellString(val), source: "ai" };
  });

  const saran =
    getRoot(["saran_ai", "Saran AI", "saran"]) ??
    getRow(["saran_ai", "Saran AI", "saran"]);
  out.saran_ai = Array.isArray(saran) ? saran.join(" ") : (saran ?? "");

  (Object.keys(out) as (keyof RopaData)[]).forEach((k) => {
    if (k !== "saran_ai") {
      const cell = out[k] as RopaCell;
      if (cell && (cell.value === "" || cell.value === "null")) {
        cell.value = null;
      }
    }
  });

  return out as RopaData;
};

export default function RopaAnalyzerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<RopaResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const handleFiles = (selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles(Array.from(selectedFiles));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) =>
    handleFiles(e.target.files);
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (files.length === 0) {
    setError("Silakan pilih satu atau lebih file terlebih dahulu.");
    return;
  }

  setIsLoading(true);
  setError(null);
  setResults([]);
  setIsEditMode(false);

  try {
    const collected: RopaResult[] = [];

    for (const file of files) {
      const formData = new FormData();

      formData.append("file", file, file.name);

      console.log("[upload] start", file.name);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,         
      });

      if (!res.ok) {
        let serverErr = "";
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const j = await res.json();
            serverErr = j?.error || JSON.stringify(j);
          } else {
            serverErr = await res.text();
          }
        } catch {
          serverErr = `HTTP ${res.status}`;
        }
        throw new Error(`Gagal memproses "${file.name}": ${serverErr}`);
      }

      const dataArray = await res.json(); // <-- backend kamu kirim array
      const raw = Array.isArray(dataArray) ? dataArray[0] : dataArray;

      console.log("[upload] success", file.name, raw);

      collected.push({
        ...transformApiDataToState(raw),
        fileName: file.name,
      });
    }

    setResults(collected);
  } catch (err: any) {
    console.error(err);
    setError(err?.message || "Terjadi kesalahan saat mengunggah.");
  } finally {
    setIsLoading(false);
  }
};


  // handler edit tabel manual
  const handleManualEdit = (
    resultIndex: number,
    fieldName: keyof RopaData,
    newValue: string
  ) => {
    const newResults = [...results];
    if (fieldName in newResults[resultIndex]) {
      const targetCell = newResults[resultIndex][fieldName] as RopaCell;
      if (targetCell) {
        targetCell.value = newValue;
        targetCell.source = "manual";
        setResults(newResults);
      }
    }
  };

  //   const handleDownloadExcel = async () => {
  //   if (results.length === 0) return;

  //   try {
  //     const response = await fetch("/api/excel", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ data: results }),
  //     });

  //     if (!response.ok) throw new Error("Gagal membuat file Excel");

  //     // Ambil hasil blob (binary Excel)
  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);

  //     // Buat link download
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "Hasil_Analisis_RoPA.xlsx";
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(url);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Terjadi kesalahan saat mengunduh Excel dari server");
  //   }
  // };

  // sama persis seperti punyamu, cuma ganti URL
  const handleDownloadExcel = async () => {
    if (results.length === 0) return;

    try {
      const response = await fetch("/api/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: results }), // TETAP kirim { data: results }
      });

      if (!response.ok) throw new Error("Gagal membuat file Excel");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Hasil_Analisis_RoPA.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengunduh Excel dari server");
    }
  };

  // handler chat ato brainstorming
  const handleChatSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chatInput.trim() || results.length === 0) return;

    const userMessage: ChatMessage = { sender: "user", text: chatInput };
    setChatHistory((prev) => [...prev, userMessage]);
    setChatInput("");

    try {
      const response = await fetch("/api/brainstorming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: chatInput, context: results }),
      });

      if (!response.ok) throw new Error("Gagal mendapatkan respons dari AI.");

      const res = await response.json();
      const aiMessage: ChatMessage = { sender: "ai", text: res.answer };
      setChatHistory((prev) => [...prev, aiMessage]);

      //  update data tabel dari chat
      if (res.updatedData && Array.isArray(res.updatedData)) {
        const newResults = [...results];
        res.updatedData.forEach(
          (update: { fileName: string; field: string; value: string }) => {
            const resultIndex = newResults.findIndex(
              (r) => r.fileName === update.fileName
            );
            if (resultIndex !== -1) {
              const fieldName = update.field as keyof RopaData;
              const targetCell = newResults[resultIndex][fieldName] as RopaCell;
              if (targetCell) {
                targetCell.value = update.value;
                targetCell.source = "ai"; // Tandai sebagai editan 'ai'
              }
            }
          }
        );
        setResults(newResults);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        sender: "ai",
        text: `Maaf, terjadi kesalahan: ${err.message}`,
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    }
  };

  const tableFields: (keyof Omit<RopaData, "saran_ai">)[] = [
  "nama_perusahaan",  
  "divisi_unitkerja",  
  "no_dokumen",        
  "versi",
  "tanggal",        
  "no",
  "nama_aktivitas",
  "unit_kerja",
  "departemen",
  "penanggung_jawab",
  "kedudukan_pemilik_proses",
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

function toLineFromObject(o: any): string {
  if (!o || typeof o !== "object") return "";
  // Prioritaskan key yang sering muncul
  const preferred = [
    "note", "catatan", "saran", "recommendation", "rekomendasi",
    "message", "text", "reason", "alasan", "detail", "value", "desc"
  ];
  for (const k of preferred) {
    if (typeof o[k] === "string" && o[k].trim()) return o[k].trim();
  }
  if (typeof o.field === "string" && typeof o.reason === "string") {
    return `[${o.field}] ${o.reason}`;
  }
  // fallback: gabungkan beberapa pasangan key:value
  const keys = Object.keys(o).slice(0, 3);
  if (keys.length) {
    return keys
      .map((k) => `${k}: ${typeof o[k] === "string" ? o[k] : JSON.stringify(o[k])}`)
      .join(" — ");
  }
  return JSON.stringify(o);
}

function normalizeSaran(input: any): string[] {
  if (!input) return [];
  if (typeof input === "string") {
    // kalau ternyata string JSON, coba parse
    try {
      const parsed = JSON.parse(input);
      return normalizeSaran(parsed);
    } catch {
      return input
        .split(/\n+/)
        .map((l) => l.replace(/^\s*[-•]\s*/g, "").trim())
        .filter(Boolean);
    }
  }
  if (Array.isArray(input)) {
    return input.flatMap((it) => normalizeSaran(it));
  }
  if (typeof input === "object") {
    const line = toLineFromObject(input);
    return line ? [line] : [];
  }
  return [String(input)];
}

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-7xl bg-white rounded-xl shadow-lg p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">RoPA</h1>
          <p className="text-gray-500 mt-2">
            Unggah satu atau lebih dokumen untuk dianalisis secara terpisah.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center space-y-4"
        >
          <div
            className={`w-full max-w-2xl border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-500 hover:bg-gray-50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, application/pdf"
              multiple
            />
            <p className="text-gray-600">
              {files.length > 0
                ? `${files.length} file terpilih`
                : "Klik atau seret file ke sini"}
            </p>
          </div>
          <button
            type="submit"
            disabled={isLoading || files.length === 0}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isLoading
              ? `Menganalisis ${files.length} file...`
              : "Proses Dokumen"}
          </button>
        </form>

        {error && (
          <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-700">
                Hasil Analisis
              </h2>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-6 py-2 font-semibold rounded-lg text-white transition-colors ${
                  isEditMode
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isEditMode ? "Simpan Perubahan" : "Ubah Data"}
              </button>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      File Asal
                    </th>
                    {tableFields.map((field) => (
                      <th
                        key={field}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap"
                      >
                        {field
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((result, resultIndex) => (
                    <tr key={resultIndex}>
                      <td className="px-4 py-2 ...">{result.fileName}</td>
                      {tableFields.map((fieldName) => {
                        const cell = result[fieldName];
                        if (!cell)
                          return (
                            <td key={fieldName} className="p-4 bg-red-100">
                              Error
                            </td>
                          );

                        const bgColor =
                          cell.source === "manual"
                            ? "bg-green-50"
                            : cell.source === "ai"
                            ? "bg-blue-50"
                            : "bg-transparent";
                        const ringColor =
                          cell.source === "manual"
                            ? "focus:ring-green-500"
                            : cell.source === "ai"
                            ? "focus:ring-blue-500"
                            : "focus:ring-gray-500";

                        return (
                          <td key={fieldName} className="p-0">
                            {isEditMode ? (
                              <input
                                type="text"
                                value={cell.value || ""}
                                onChange={(e) =>
                                  handleManualEdit(
                                    resultIndex,
                                    fieldName,
                                    e.target.value
                                  )
                                }
                                className={`w-full h-full p-4 border-none outline-none focus:ring-2 ${ringColor} transition-colors text-gray-700 ${bgColor}`}
                              />
                            ) : (
                              <div
                                className={`px-4 py-4 w-full h-full ${bgColor}`}
                              >
                                {cell.value || (
                                  <span className="text-red-500 italic">
                                    N/A
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-4">
                <div className="text-center flex items-center justify-center gap-3">
                  <button
                    onClick={handleDownloadExcel}
                    className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition"
                  >
                    Download Semua Hasil ke Excel
                  </button>
                </div>

                {results.map((result, index) => {
                  const items = normalizeSaran(result.saran_ai);
                  if (!items.length) return null;
                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm"
                    >
                      <h4 className="font-semibold text-amber-900">
                        💡 Saran dari AI untuk{" "}
                        <span className="font-mono">{result.fileName}</span>
                      </h4>
                      <ul className="mt-2 max-h-56 overflow-auto pr-2 space-y-2 list-disc pl-6 marker:text-amber-700">
                        {items.map((it, i) => (
                          <li key={i} className="text-sm leading-relaxed text-amber-900">
                            {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
        )}
        {results.length > 0 && (
          <div className="pt-6 border-t">
            <h3 className="text-xl font-semibold text-center text-gray-700 mb-4">
              Brainstorming
            </h3>
            <div className="w-full max-w-2xl mx-auto bg-gray-50 p-4 rounded-lg border h-64 overflow-y-auto flex flex-col space-y-2 mb-4">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg max-w-xs ${
                    msg.sender === "user"
                      ? "bg-blue-500 self-end"
                      : "bg-gray-600 self-start"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <form
              onSubmit={handleChatSubmit}
              className="flex gap-2 max-w-2xl mx-auto"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Tanyakan sesuatu tentang data di atas..."
                className="flex-grow p-2 border text-black rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Kirim
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}