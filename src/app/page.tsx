"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartPage() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/chat-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        throw new Error("Failed to create session");
      }

      const data = await res.json();

      // Redirect ke workspace dengan session id
      router.push(`/chat/${data.id}`);
    } catch (error) {
      console.error(error);
      alert("Error creating session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg mt-10">
      <h1 className="text-2xl font-bold mb-4">Start New Chat Session</h1>
      <form onSubmit={handleCreateSession} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Session Title</label>
          <input
            type="text"
            placeholder="e.g., Analisis RoPA 28 Sept"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-lg bg-background text-foreground"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Session"}
        </button>
      </form>
    </div>
  );
}
