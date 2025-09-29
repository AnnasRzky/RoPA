"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, FileDown, Eye } from "lucide-react";

interface SourceFile {
  id: string;
  fileName: string;
  fileUrl: string;
}

interface ChatSession {
  id: string;
  title: string | null;
}

interface RecordData {
  id: string;
  fileName: string;
  resultFileUrl: string | null;
  createdAt: string;
  sourceFile: SourceFile;
  chatSession: ChatSession;
}

export default function Records() {
  const [records, setRecords] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchRecords = async () => {
    try {
      console.log("Fetching records...");
      const res = await fetch("/api/records"); // <-- PENTING
      console.log("Response status:", res.status);
      
      const data = await res.json();
      console.log("Data fetched:", data);
      setRecords(data);
    } catch (err) {
      console.error("Error fetching records:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchRecords();
}, []);


  if (loading) return <p className="text-center p-4">Loading records...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Records</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border border-border bg-card text-card-foreground">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 border border-border">No</th>
              <th className="px-4 py-2 border border-border">Tanggal</th>
              <th className="px-4 py-2 border border-border">File Asal</th>
              <th className="px-4 py-2 border border-border">File Hasil</th>
              <th className="px-4 py-2 border border-border">Chat Session</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  Tidak ada data record
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr key={record.id} className="hover:bg-muted/50">
                  {/* Nomor Urut */}
                  <td className="border px-4 py-2 text-center">{index + 1}</td>

                  {/* Tanggal */}
                  <td className="border px-4 py-2 text-center">
                    {new Date(record.createdAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>

                  {/* File Asal */}
                  <td className="border px-4 py-2 text-center">
                    <a
                      href={record.sourceFile?.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {record.sourceFile?.fileName || "-"}
                    </a>
                  </td>

                  {/* File Hasil */}
                  <td className="border px-4 py-2 text-center">
                    {record.resultFileUrl ? (
                      <a
                        href={record.resultFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-500 hover:underline flex items-center justify-center gap-1"
                      >
                        <FileDown className="w-4 h-4" /> {record.fileName}
                      </a>
                    ) : (
                      <span className="text-gray-400">Belum tersedia</span>
                    )}
                  </td>

                  {/* Chat Session */}
                  <td className="border px-4 py-2 text-center">
                    <Link
                      href={`/chat/${record.chatSession?.id}`}
                      className="flex items-center justify-center text-blue-500 hover:underline gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      {record.chatSession?.title || "Lihat Chat"}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}