"use client";

import { useState } from "react";
import { Grid3X3, FileText, MessageSquare, Menu, X } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${collapsed ? "w-16" : "w-64"} bg-black h-screen flex flex-col transition-all duration-300`}>
      <div className="p-6 flex items-center justify-between">
        {!collapsed && <h1 className="text-gray-400 text-sm font-medium">Desktop - 1</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-2">
          <Link href="/" className="flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            <Grid3X3 className="w-5 h-5 mr-3" />
            {!collapsed && "Dashboard"}
          </Link>

          <Link href="/records" className="flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            <FileText className="w-5 h-5 mr-3" />
            {!collapsed && "Records"}
          </Link>

          <button className="w-full flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            <MessageSquare className="w-5 h-5 mr-3" />
            {!collapsed && "New Chat"}
          </button>
        </div>
      </nav>
    </div>
  );
}
