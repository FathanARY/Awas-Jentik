"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { API_BASE } from "../api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Registration failed");
      }

      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
      <Header leftContent={<div className="font-extrabold tracking-tight text-lg text-slate-900">MalariaWatch</div>} />
      <div className="w-full max-w-md rounded-2xl shadow-xl border bg-white/80 backdrop-blur-sm p-8" style={{ borderColor: "var(--color-outline-variant)" }}>
        <h1 className="text-2xl font-bold mb-6 text-slate-900">Create Account</h1>
        {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Choose a username" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Choose a password" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-all disabled:opacity-50">
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="text-sm text-slate-500 text-center mt-6">
          Already have an account? <Link href="/login" className="font-bold text-blue-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
