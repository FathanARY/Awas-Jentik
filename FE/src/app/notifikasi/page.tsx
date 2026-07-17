"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import Header from "@/components/Header";

interface NotifItem {
  id: number;
  message: string;
  dibaca: boolean;
  grid_id: string;
  tipe: string;
  created_at: string;
}

export default function NotifikasiPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    apiFetch<NotifItem[]>("/notifications")
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoadingNotifs(false));
  }, []);

  async function markRead(id: number) {
    await apiFetch(`/notifications/${id}/read`, { method: "POST" });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n));
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh" style={{ backgroundColor: "var(--color-background)" }}>
      <Header
        leftContent={
          <Link href="/" className="font-extrabold tracking-tight text-lg text-slate-900 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-base">water_drop</span>
            </span>
            MalariaWatch
          </Link>
        }
      />
      <main className="p-4 pt-32 md:p-12 md:pt-36 min-h-screen w-full max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-on-surface)" }}>Notifikasi</h1>
          <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            Perubahan kategori risiko di area Anda
          </p>
        </div>

        {loadingNotifs ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 rounded-xl border bg-white" style={{ borderColor: "var(--color-outline-variant)" }}>
            <span className="material-symbols-outlined text-4xl mb-3" style={{ color: "var(--color-outline)" }}>notifications_off</span>
            <p className="text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Belum ada notifikasi.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.dibaca && markRead(n.id)}
                className={`p-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:shadow-md ${n.dibaca ? "bg-white" : "bg-blue-50 border-blue-200"}`}
                style={n.dibaca ? { borderColor: "var(--color-outline-variant)" } : {}}
              >
                <div className="flex items-start gap-3">
                  <span className={`material-symbols-outlined mt-0.5 ${n.tipe === "peringatan" ? "filled-icon" : ""}`}
                    style={{ color: n.tipe === "peringatan" ? "var(--color-error)" : "var(--color-primary)", fontSize: 24 }}>
                    {n.tipe === "peringatan" ? "warning" : "info"}
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm ${n.dibaca ? "" : "font-bold"}`} style={{ color: "var(--color-on-surface)" }}>
                      {n.message}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-outline)" }}>
                      {new Date(n.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                  {!n.dibaca && (
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
