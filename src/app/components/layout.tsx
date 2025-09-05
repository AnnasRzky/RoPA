"use client";

import Sidebar from "./sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-black">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
