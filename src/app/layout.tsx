"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/sidebar";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex h-screen">
          <aside
            className={`transition-all duration-300 ease-in-out bg-sidebar text-sidebar-foreground 
              ${collapsed ? "w-16" : "w-64"}`}
          >
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          </aside>

          <main className="flex-1 transition-all duration-300 ease-in-out bg-background text-foreground p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
