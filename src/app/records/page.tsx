"use client";
import { useState } from "react";
import { Clock, Trash2 } from "lucide-react";

const Records = () => {
  const [selectedHistory, setSelectedHistory] = useState(null);

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
              <th className="px-4 py-2 border border-border">Edit</th>
            </tr>
          </thead>
          <tbody>
            {/* Data record akan di-render di sini */}
          </tbody>
        </table>
      </div>

      {/* Modal / Panel History */}
      {selectedHistory && (
        <div className="mt-6 bg-card p-4 rounded shadow-lg">
          <h2 className="text-lg font-semibold mb-2">History</h2>
          <ul className="space-y-2">
            {/* History list akan di-render di sini */}
          </ul>
          <button
            onClick={() => setSelectedHistory(null)}
            className="mt-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Records;
