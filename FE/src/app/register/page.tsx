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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Header />
      <div className="w-full max-w-md rounded-3xl shadow-lg bg-surface p-8">
        <h1 className="text-2xl font-bold mb-6 text-on-background">Buat Akun</h1>

        {success ? (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-xl bg-primary-subtle border border-primary-fixed-dim text-on-primary-fixed-variant text-sm font-medium">
              Akun berhasil dibuat! Silakan cek email Anda untuk tautan konfirmasi, lalu masuk.
            </div>
            <button onClick={() => router.push("/login")} className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm hover:-translate-y-0.5 active:scale-[0.98] transition-all">
              Ke Halaman Masuk
            </button>
          </div>
        ) : (
          <>
            {error && <div className="mb-4 px-4 py-3 rounded-xl bg-error-container border border-error text-on-error-container text-sm font-medium">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Kata Sandi</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Minimal 6 karakter" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? "Membuat akun..." : "Daftar"}
              </button>
            </form>
            <p className="text-sm text-on-surface-variant text-center mt-6">
              Sudah punya akun? <Link href="/login" className="font-bold text-primary hover:underline">Masuk</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
