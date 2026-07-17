"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push(user.role === "admin" ? "/admin" : "/");
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Header leftContent={<div className="font-extrabold tracking-tight text-lg text-on-background">MalariaWatch</div>} />
      <div className="w-full max-w-md rounded-3xl shadow-lg bg-surface p-8">
        <h1 className="text-2xl font-bold mb-6 text-on-background">Masuk</h1>
        {error && <div className="mb-4 px-4 py-3 rounded-xl bg-error-container border border-error text-on-error-container text-sm font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-on-surface mb-1">Kata Sandi</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Kata sandi Anda" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-surface text-on-surface-variant">atau</span></div>
        </div>

        <button onClick={() => signInWithGoogle()} className="w-full py-3 rounded-full border border-outline bg-surface text-on-surface font-bold text-sm hover:bg-surface-container-low transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Masuk dengan Google
        </button>

        <p className="text-sm text-on-surface-variant text-center mt-6">
          Belum punya akun? <Link href="/register" className="font-bold text-primary hover:underline">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
