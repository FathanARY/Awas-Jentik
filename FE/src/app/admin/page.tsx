"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../api";
import LiveCommunityMap from "@/components/LiveCommunityMap";

interface StatsItem {
  total_laporan: number;
  laporan_menunggu: number;
  laporan_ditindaklanjuti: number;
  rata_rata_risiko: number;
}

interface ChangeItem {
  grid_id: string;
  timestamp: string;
  skor_lama: number;
  skor_baru: number;
  kategori_lama: string;
  kategori_baru: string;
  sumber_perubahan: string;
}

interface StaleAreaItem {
  grid_id: string;
  last_updated: string | null;
  days_stale: number;
  current_skor: number | null;
  current_kategori: string | null;
}

interface NotifItem {
  id: number;
  message: string;
  dibaca: boolean;
  grid_id: string;
  tipe: string;
  created_at: string;
}

interface LaporanItem {
  kode_laporan: string;
  status: string;
  heatmap_category: string | null;
  risiko_gabungan: number | null;
  created_at: string;
  alamat: string | null;
}

function getAreaStyle(score: number) {
  if (score >= 80) return { borderColor: "var(--color-error)", chipBg: "var(--color-error-container)", chipFg: "var(--color-on-error-container)", scoreFg: "var(--color-error)", icon: "trending_up" };
  if (score >= 60) return { borderColor: "#f59e0b", chipBg: "#fef3c7", chipFg: "#92400e", scoreFg: "#b45309", icon: "warning" };
  return { borderColor: "#10b981", chipBg: "#d1fae5", chipFg: "#065f46", scoreFg: "#059669", icon: "info" };
}

export default function AdminDashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<StatsItem | null>(null);
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [staleAreas, setStaleAreas] = useState<StaleAreaItem[]>([]);
  const [activeTab, setActiveTab] = useState<"priority" | "changes" | "stale" | "laporan">("priority");
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [laporans, setLaporans] = useState<LaporanItem[]>([]);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState<string | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    apiFetch<StatsItem>("/stats").then(setStats).catch(() => {});
    apiFetch<{ changes: ChangeItem[] }>("/changes").then(r => setChanges(r.changes)).catch(() => {});
    apiFetch<StaleAreaItem[]>("/areas/stale").then(setStaleAreas).catch(() => {});
    apiFetch<NotifItem[]>("/notifications").then(setNotifications).catch(() => {});
    apiFetch<{ count: number }>("/notifications/unread/count").then(r => setUnreadCount(r.count)).catch(() => {});
    apiFetch<LaporanItem[]>("/laporan").then(setLaporans).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvUploading(true);
    setCsvResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/upload-csv`, {
        method: "POST",
        body: fd,
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      const data = await res.json();
      setCsvResult(`${data.rows_updated} grid updated, ${data.categories_changed} changed.`);
      apiFetch<{ changes: ChangeItem[] }>("/changes").then(r => setChanges(r.changes)).catch(() => {});
    } catch {
      setCsvResult("Upload failed.");
    }
    setCsvUploading(false);
    e.target.value = "";
  }

  async function markNotifRead(id: number) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/notifications/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-dvh"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Alert Banner */}
      {changes.length > 0 && (
      <div
        className="fixed top-0 left-0 w-full z-[60] py-2 px-6 flex items-center justify-center shadow-lg"
        style={{
          backgroundColor: "var(--color-error)",
          color: "var(--color-on-error)",
        }}
        id="top-alert"
      >
        <span className="material-symbols-outlined filled-icon mr-2">warning</span>
        <span className="text-sm font-bold uppercase tracking-wide">
          High Risk Cluster Detected!
        </span>
      </div>
      )}

      <Header 
        leftContent={
          <div className="font-extrabold tracking-tight text-lg text-slate-900 flex items-center gap-2.5">
            Admin Dashboard
          </div>
        }
        rightContent={
          <div className="flex items-center gap-4">
            <div className="relative hidden md:flex items-center text-slate-500">
              <span className="material-symbols-outlined absolute left-2">search</span>
              <input
                className="pl-8 pr-4 py-2 rounded-full border border-slate-200 bg-white/50 text-sm outline-none transition-all w-64 focus:bg-white"
                placeholder="Search data..."
                type="text"
              />
            </div>
            <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotif(!showNotif)} className="p-2 rounded-full text-slate-600 hover:text-blue-600 transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-10 w-80 max-h-96 overflow-y-auto rounded-xl shadow-xl border bg-white z-50" style={{ borderColor: "var(--color-outline-variant)" }}>
                <div className="p-3 border-b font-bold text-sm" style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-center" style={{ color: "var(--color-on-surface-variant)" }}>No notifications</div>
                ) : notifications.slice(0, 10).map(n => (
                  <div key={n.id} onClick={() => markNotifRead(n.id)} className={`p-3 border-b cursor-pointer transition-colors ${n.dibaca ? "" : "bg-blue-50"}`} style={{ borderColor: "var(--color-outline-variant)" }}>
                    <p className="text-xs font-medium" style={{ color: n.dibaca ? "var(--color-on-surface-variant)" : "var(--color-on-surface)" }}>{n.message}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-outline)" }}>{new Date(n.created_at).toLocaleString("id-ID")}</p>
                  </div>
                ))}
              </div>
            )}
            </div>
            <button onClick={() => csvInputRef.current?.click()} className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">upload_file</span>
              CSV
            </button>
            <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
            {csvUploading && <span className="text-xs text-blue-600 animate-pulse">Uploading...</span>}
            {csvResult && <span className="text-xs text-green-600 max-w-[200px] truncate hidden md:inline">{csvResult}</span>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAza4dAlhNHG15GBa7SuVYmgB2R7x7sWS7pLuy4x6llcKHX3cS8jT7eaU0e7mzeTf7-pBV3iTAfeuZ_siENuL5vEcASlFDr0OekQ4V-GaQAg-V8AXVBmWBYq0gaT3gb1qlcQEysFMuRm2uYS16sH2FnCctpS5oRWPECF7LBs7UaCuCrt7To0rpI3JpRpeJvyrj5bBXwigtV9fnPnrphEupFWM4gBIH9MmoCOeoXh2Uy2lkSocWfdFreOQ"
              alt="Health Worker Avatar"
              className="w-8 h-8 rounded-full object-cover border border-slate-200 ml-2"
            />
          </div>
        }
      />

      {/* Main Content */}
      <main className="pt-36 p-4 md:p-12 min-h-screen w-full max-w-[1600px] mx-auto">
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6 mt-4">
            {[
              { label: "Total Reports", value: stats.total_laporan, color: "var(--color-primary)", icon: "description" },
              { label: "Pending", value: stats.laporan_menunggu, color: "#f59e0b", icon: "pending_actions" },
              { label: "Resolved", value: stats.laporan_ditindaklanjuti, color: "#10b981", icon: "check_circle" },
              { label: "Avg Risk", value: `${stats.rata_rata_risiko}`, color: "var(--color-error)", icon: "speed" },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-xl border shadow-sm flex items-center gap-3" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-outline-variant)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                  <span className="material-symbols-outlined">{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--color-on-surface-variant)" }}>{s.label}</p>
                  <p className="text-xl font-bold" style={{ color: "var(--color-on-surface)" }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-260px)]">
          {/* Map */}
          <div className="flex-1 bg-white p-6 rounded-2xl border shadow-sm flex flex-col" style={{ borderColor: "var(--color-outline-variant)" }}>
            <LiveCommunityMap />
          </div>

          {/* Tabbed Panel */}
          <div className="w-full lg:w-[500px] flex flex-col gap-4">
            <div className="flex gap-1 p-1 rounded-full bg-slate-100" style={{ backgroundColor: "var(--color-surface-container)" }}>
              {[
                { key: "priority" as const, label: "Priority", icon: "trending_up" },
                { key: "laporan" as const, label: `Reports${laporans.length ? ` (${laporans.length})` : ""}`, icon: "description" },
                { key: "changes" as const, label: `Changes${changes.length ? ` (${changes.length})` : ""}`, icon: "swap_horiz" },
                { key: "stale" as const, label: `Stale${staleAreas.length ? ` (${staleAreas.length})` : ""}`, icon: "schedule" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-bold transition-all"
                  style={activeTab === tab.key ? {
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                    boxShadow: "0 2px 8px rgba(0,40,142,0.3)",
                  } : {
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {activeTab === "priority" && (laporans.length === 0 ? (
                <div className="text-center py-8" style={{ color: "var(--color-on-surface-variant)" }}>
                  <span className="material-symbols-outlined text-3xl mb-2">trending_up</span>
                  <p className="text-sm font-medium">No priority reports.</p>
                </div>
              ) : [...laporans].sort((a, b) => (b.risiko_gabungan ?? 0) - (a.risiko_gabungan ?? 0)).map((l) => {
                const score = l.risiko_gabungan ?? 0;
                const style = getAreaStyle(score);
                return (
                <Link
                  href={`/admin/laporan/${l.kode_laporan}`}
                  key={l.kode_laporan}
                  className="block p-4 rounded-xl shadow-sm border-l-4 border-y border-r hover:shadow-md transition-shadow cursor-pointer"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderLeftColor: style.borderColor,
                    borderTopColor: "var(--color-outline-variant)",
                    borderRightColor: "var(--color-outline-variant)",
                    borderBottomColor: "var(--color-outline-variant)",
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-base font-bold font-mono" style={{ color: "var(--color-on-surface)" }}>{l.kode_laporan}</h4>
                      <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{l.alamat || "—"}</p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-bold flex items-center capitalize" style={{ backgroundColor: style.chipBg, color: style.chipFg }}>
                      <span className="material-symbols-outlined text-sm mr-1">{style.icon}</span>
                      {l.heatmap_category || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: "var(--color-on-surface-variant)" }}>Risk Score</p>
                      <p className="text-xl font-bold" style={{ color: style.scoreFg }}>{score.toFixed(0)}/100</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs mb-1" style={{ color: "var(--color-on-surface-variant)" }}>Status</p>
                      <p className={`text-sm font-semibold capitalize ${l.status === 'ditindaklanjuti' ? 'text-green-600' : l.status === 'terverifikasi' ? 'text-blue-600' : 'text-amber-600'}`}>{l.status}</p>
                    </div>
                  </div>
                </Link>
              )}))}

              {activeTab === "laporan" && (laporans.length === 0 ? (
                <div className="text-center py-8" style={{ color: "var(--color-on-surface-variant)" }}>
                  <span className="material-symbols-outlined text-3xl mb-2">description</span>
                  <p className="text-sm font-medium">No reports yet.</p>
                </div>
              ) : laporans.map((l) => (
                <Link
                  key={l.kode_laporan}
                  href={`/admin/laporan/${l.kode_laporan}`}
                  className="block p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                  style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-outline-variant)" }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold font-mono" style={{ color: "var(--color-primary)" }}>{l.kode_laporan}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--color-on-surface-variant)" }}>{l.alamat || "—"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${l.status === "ditindaklanjuti" ? "bg-green-100 text-green-700" : l.status === "terverifikasi" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                        {l.status}
                      </span>
                      {l.risiko_gabungan != null && (
                        <span className="text-xs font-bold" style={{ color: (l.risiko_gabungan ?? 0) >= 75 ? "var(--color-error)" : (l.risiko_gabungan ?? 0) >= 50 ? "#b45309" : "#059669" }}>
                          {l.risiko_gabungan.toFixed(0)}/100
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs mt-2" style={{ color: "var(--color-outline)" }}>{new Date(l.created_at).toLocaleDateString("id-ID")}</p>
                </Link>
              )))}

              {activeTab === "changes" && (changes.length === 0 ? (
                <div className="text-center py-8" style={{ color: "var(--color-on-surface-variant)" }}>
                  <span className="material-symbols-outlined text-3xl mb-2">check_circle</span>
                  <p className="text-sm font-medium">No recent category changes detected.</p>
                </div>
              ) : changes.map((c, i) => (
                <div key={i} className="block p-4 rounded-xl shadow-sm border border-l-4 hover:shadow-md transition-shadow" style={{
                  backgroundColor: "var(--color-surface)",
                  borderLeftColor: "var(--color-error)",
                  borderTopColor: "var(--color-outline-variant)",
                  borderRightColor: "var(--color-outline-variant)",
                  borderBottomColor: "var(--color-outline-variant)",
                }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold" style={{ color: "var(--color-on-surface)" }}>{c.grid_id}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
                      {c.kategori_lama} → {c.kategori_baru}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                    <span>Score: {c.skor_lama.toFixed(0)} → {c.skor_baru.toFixed(0)}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--color-on-surface-variant)" }}>{c.sumber_perubahan}</p>
                  <p className="text-xs" style={{ color: "var(--color-outline)" }}>{new Date(c.timestamp).toLocaleString("id-ID")}</p>
                </div>
              )))}

              {activeTab === "stale" && (staleAreas.length === 0 ? (
                <div className="text-center py-8" style={{ color: "var(--color-on-surface-variant)" }}>
                  <span className="material-symbols-outlined text-3xl mb-2">update</span>
                  <p className="text-sm font-medium">All areas have been updated recently.</p>
                </div>
              ) : staleAreas.map((a, i) => (
                <div key={i} className="block p-4 rounded-xl shadow-sm border border-dashed hover:shadow-md transition-shadow" style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "#f59e0b",
                  backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(245,158,11,0.05) 5px, rgba(245,158,11,0.05) 10px)",
                }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold" style={{ color: "var(--color-on-surface)" }}>{a.grid_id}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
                      <span className="material-symbols-outlined text-sm">warning</span>
                      {a.days_stale}d stale
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                    Last updated: {a.last_updated ? new Date(a.last_updated).toLocaleDateString("id-ID") : "Never"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-outline)" }}>
                    Current: Score {a.current_skor?.toFixed(0) ?? "—"} · {a.current_kategori ?? "Unknown"}
                  </p>
                </div>
              )))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
