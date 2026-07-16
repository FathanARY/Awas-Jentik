"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../api";

interface AreaItem {
  id: string;
  name: string;
  region: string;
  score: number;
  level: string;
  reports: number;
}

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
  const [areas, setAreas] = useState<AreaItem[]>([]);
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
    apiFetch<AreaItem[]>("/areas").then(setAreas).catch(() => {});
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

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full flex flex-col py-8 px-4 w-64 z-40 border-r pt-24"
        style={{
          backgroundColor: "var(--color-surface-container-low)",
          borderColor: "var(--color-outline-variant)",
          color: "var(--color-primary)",
        }}
      >
        <div className="mb-8 mt-12">
          <h1
            className="text-2xl font-extrabold mb-1"
            style={{ color: "var(--color-primary)" }}
          >
            MalariaWatch
          </h1>
          <p
            className="text-xs"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Surveillance Unit
          </p>
        </div>
        <nav className="flex-1 space-y-2">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab("priority"); }}
            className="flex items-center px-2 py-3 rounded-l-md font-bold border-r-4 transition-all"
            style={{
              color: "var(--color-primary)",
              borderColor: "var(--color-primary)",
              backgroundColor: "var(--color-surface-container-high)",
            }}
          >
            <span className="material-symbols-outlined mr-4">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </a>
          <button
            onClick={() => setActiveTab("laporan")}
            className="w-full text-left flex items-center px-2 py-3 rounded-l-md transition-all"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined mr-4">description</span>
            <span className="text-sm">Reports</span>
          </button>
          <button
            onClick={() => setActiveTab("changes")}
            className="w-full text-left flex items-center px-2 py-3 rounded-l-md transition-all"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined mr-4">swap_horiz</span>
            <span className="text-sm">Changes</span>
          </button>
          <button
            onClick={() => setActiveTab("stale")}
            className="w-full text-left flex items-center px-2 py-3 rounded-l-md transition-all"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined mr-4">schedule</span>
            <span className="text-sm">Stale Areas</span>
          </button>
        </nav>
        <div className="mt-auto pt-4 space-y-3">
          <button
            onClick={() => router.push("/lapor")}
            className="w-full py-2 px-4 rounded-full text-sm font-bold shadow-md flex items-center justify-center transition-all active:scale-95"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            <span className="material-symbols-outlined filled-icon mr-2">add</span>
            Add New Report
          </button>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="w-full py-2 px-4 rounded-full text-sm font-medium border flex items-center justify-center transition-all active:scale-95"
            style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined mr-2">logout</span>
            Sign Out
          </button>
          <div
            className="flex items-center p-2 rounded-lg shadow-sm"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--color-on-surface)" }}>{user?.username || "Admin"}</p>
              <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-28 p-12 min-h-screen w-full">
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
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
          <div
            className="flex-1 rounded-xl shadow-sm border flex flex-col overflow-hidden relative group"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-surface-variant)",
            }}
          >
            {/* Map Controls */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button
                className="px-4 py-2 rounded-full shadow-md text-sm font-medium border flex items-center transition-colors"
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-on-surface)",
                  borderColor: "var(--color-outline-variant)",
                }}
              >
                <span className="material-symbols-outlined mr-1 text-lg">layers</span>
                Endemicity Data
              </button>
              <button
                className="px-4 py-2 rounded-full shadow-md text-sm font-medium border flex items-center transition-colors opacity-70"
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-on-surface)",
                  borderColor: "var(--color-outline-variant)",
                }}
              >
                <span className="material-symbols-outlined mr-1 text-lg">sync_alt</span>
                Migration Patterns
              </button>
            </div>

            {/* Map Legend */}
            <div
              className="absolute bottom-4 right-4 z-10 p-2 rounded-lg shadow-md border"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <h4
                className="text-xs font-semibold uppercase mb-1"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Risk Level
              </h4>
              <ul className="space-y-1">
                {[
                  { color: "var(--color-error)", label: "High" },
                  { color: "#f59e0b", label: "Medium" },
                  { color: "#10b981", label: "Low" },
                ].map((r) => (
                  <li key={r.label} className="flex items-center text-sm gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Map Image */}
            <div
              className="w-full h-full relative overflow-hidden"
              style={{ backgroundColor: "var(--color-surface-container)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzFfW9tTwhBd4JY9enx8uWWmJd-rIHHjgw1QsQbdynUXZsXbz8uA-BOEwbxJyqPKMlZggyN73iFZLDeighkxbNFhVx-wiPyn5T0PKmJ1_Wb7UdpRya09Z6eR0zrs2zULzi_C-_Qbu_x0ocglzGDs7GVoqx5Dw6NwBW9RcFrybINL-5ObrtTI8rpW_YncCZug5-0ZkCoTYcf_orLVujaxFA0gyQSdhf6lwLu4JGig8vtObqOfe8Re9dAA"
                alt="Map of Indonesia"
                className="w-full h-full object-cover opacity-80"
              />
              {/* Markers */}
              <div
                className="absolute top-[30%] left-[40%] w-4 h-4 rounded-full animate-pulse"
                style={{
                  backgroundColor: "var(--color-error)",
                  boxShadow: "0 0 10px rgba(186,26,26,0.8)",
                }}
              />
              <div
                className="absolute top-[45%] left-[60%] w-3 h-3 rounded-full"
                style={{ backgroundColor: "#f59e0b" }}
              />
              <div
                className="absolute top-[60%] left-[20%] w-3 h-3 rounded-full"
                style={{ backgroundColor: "#10b981" }}
              />
              <div
                className="absolute top-[25%] left-[70%] w-5 h-5 rounded-full animate-ping opacity-75"
                style={{
                  backgroundColor: "var(--color-error)",
                  boxShadow: "0 0 15px rgba(186,26,26,0.9)",
                }}
              />
            </div>
          </div>

          {/* Tabbed Panel */}
          <div className="w-full lg:w-96 flex flex-col gap-4">
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
              {activeTab === "priority" && areas.map((area) => {
                const style = getAreaStyle(area.score);
                return (
                <div
                  key={area.id}
                  className="block p-4 rounded-xl shadow-sm border-l-4 border-y border-r"
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
                      <h4 className="text-base font-bold" style={{ color: "var(--color-on-surface)" }}>{area.name}</h4>
                      <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{area.region}</p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-bold flex items-center" style={{ backgroundColor: style.chipBg, color: style.chipFg }}>
                      <span className="material-symbols-outlined text-sm mr-1">{style.icon}</span>
                      {area.level}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: "var(--color-on-surface-variant)" }}>Risk Score</p>
                      <p className="text-xl font-bold" style={{ color: style.scoreFg }}>{area.score}/100</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs mb-1" style={{ color: "var(--color-on-surface-variant)" }}>New Reports</p>
                      <p className="text-lg font-semibold" style={{ color: "var(--color-on-surface)" }}>{area.reports}</p>
                    </div>
                  </div>
                </div>
              )})}

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
