"use client";

import { useEffect, useState } from "react";
import { Plus, FileText, Eye, Download, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 

type RecordItem = {
  id: string;
  name: string;
  date: string;
  size: string;
  status: "ready" | "processing" | "failed" | string;
};

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter(); 

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch("/api/records");
        if (!response.ok) {
          // Jika API gagal, kita lempar error untuk ditangkap di blok catch
          throw new Error("Gagal mengambil data dari server");
        }
        const data = await response.json();
        // Support beberapa bentuk response dari API
        setRecords(data?.records ?? data ?? []);
      } catch (error) {
        console.warn("Fetch /api/records gagal, menggunakan data fallback:", error);
        // Data dummy sebagai fallback jika API error, agar UI tetap bisa dites
        setRecords([
          { id: "1", name: "sample-ropa-2025-09.xlsx", date: "2025-09-04", size: "14 KB", status: "ready" },
          { id: "2", name: "scan-cv-john-doe.pdf", date: "2025-08-29", size: "220 KB", status: "processing" },
          { id: "3", name: "report-privacy.docx", date: "2025-07-15", size: "48 KB", status: "failed" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []); // Dependensi kosong agar hanya berjalan sekali

  const handleDownload = (id: string) => {
    window.open(`/api/records/${id}/download`, "_blank");
  };

  const handleView = (id: string) => {
    // GANTI: Gunakan router.push untuk navigasi tanpa reload halaman penuh
    router.push(`/records/${id}`);
  };

  const handleDelete = async (id: string) => {
    // SARAN: confirm() dan alert() sebaiknya diganti dengan komponen Modal kustom
    // untuk pengalaman pengguna yang lebih baik di aplikasi production.
    if (!window.confirm("Apakah Anda yakin ingin menghapus record ini?")) return;
    
    try {
      const res = await fetch(`/api/records/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Penghapusan gagal");
      setRecords((prevRecords) => prevRecords.filter((r) => r.id !== id));
    } catch (err) {
      alert("Gagal menghapus: " + (err as Error).message);
    }
  };

  // HAPUS: Pembungkus <Layout> dihilangkan.
  return (
    <div className="flex-1 bg-black p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <h1 className="text-white text-3xl font-bold">Records</h1>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Link href="/" className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Upload
            </Link>
            <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <FileText className="w-4 h-4 mr-2" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">Generated Files</h2>
            <p className="text-gray-400 text-sm">{loading ? "Memuat…" : `${records.length} file ditemukan`}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading...</td>
                  </tr>
                ) : records.length > 0 ? (
                  records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{rec.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{rec.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{rec.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            rec.status === "ready" ? "bg-green-500/20 text-green-300" :
                            rec.status === "processing" ? "bg-yellow-500/20 text-yellow-300" :
                            "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button title="View" onClick={() => handleView(rec.id)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                            <Eye className="w-4 h-4 text-gray-300" />
                          </button>
                          <button title="Download" onClick={() => handleDownload(rec.id)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                            <Download className="w-4 h-4 text-gray-300" />
                          </button>
                          <button title="Delete" onClick={() => handleDelete(rec.id)} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      Tidak ada record ditemukan. Silakan upload dokumen untuk memulai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
