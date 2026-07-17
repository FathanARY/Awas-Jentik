"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signUp(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
      <Header leftContent={<div className="font-extrabold tracking-tight text-lg text-slate-900">MalariaWatch</div>} />
      <div className="w-full max-w-md rounded-2xl shadow-xl border bg-white/80 backdrop-blur-sm p-8" style={{ borderColor: "var(--color-outline-variant)" }}>
        <h1 className="text-2xl font-bold mb-6 text-slate-900">Create Account</h1>

        {success ? (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
              Account created! Please check your email for a confirmation link, then sign in.
            </div>
            <button onClick={() => router.push("/login")} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:-translate-y-0.5 transition-all">
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
            {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Minimum 6 characters" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>
            <p className="text-sm text-slate-500 text-center mt-6">
              Already have an account? <Link href="/login" className="font-bold text-blue-600 hover:underline">Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
