"use client";

import React from "react";
import Layout from "./components/layout";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <Layout>
      <div className="flex-1 bg-black flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-4xl font-bold mb-2">RoPA</h1>
          <p className="text-gray-400 text-xl mb-8">Record of Processing Activities</p>
          <button className="flex items-center justify-center w-96 px-6 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
            <Plus className="w-5 h-5 mr-3" />
            Add Document/Image
          </button>
        </div>
      </div>
    </Layout>
  );
}
