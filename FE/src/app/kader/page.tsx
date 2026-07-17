"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import LiveCommunityMap from "@/components/LiveCommunityMap";

interface GridRisk {
  grid_id: string;
  skor: number;
  kategori: string;
}

interface MobilitasData {
  grid_id: string;
  pendatang_30_hari: number;
  pendatang_dari_endemis: number;
  pekerja_mobil: number;
  riwayat_perjalanan_endemis: number;
  mobility_risk_score: number | null;
  habitat_risk_score: number | null;
  case_score: number | null;
  risiko_gabungan: number | null;
  kategori: string | null;
  updated_at: string;
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
  if (score >= 80) return { borderColor: "var(--color-error)", chipBg: "var(--color-error-container)", chipFg: "var(--color-on-error-container)", scoreFg: "var(--color-error)" };
  if (score >= 60) return { borderColor: "#f59e0b", chipBg: "#fef3c7", chipFg: "#92400e", scoreFg: "#b45309" };
  return { borderColor: "#10b981", chipBg: "#d1fae5", chipFg: "#065f46", scoreFg: "#059669" };
}

export default function KaderDashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"verify" | "mobilitas">("verify");
  const [laporans, setLaporans] = useState<LaporanItem[]>([]);
  const [grids, setGrids] = useState<GridRisk[]>([]);
  const [selectedGrid, setSelectedGrid] = useState<string>("");
  const [mobilitasData, setMobilitasData] = useState<MobilitasData | null>(null);
  const [mobilitasResult, setMobilitasResult] = useState<MobilitasData | null>(null);

  const [form, setForm] = useState({
    pendatang_30_hari: 0,
    pendatang_dari_endemis: 0,
    pekerja_mobil: 0,
    riwayat_perjalanan_endemis: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "kader" && user.role !== "admin"))) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    apiFetch<LaporanItem[]>("/laporan").then(setLaporans).catch(() => {});
    apiFetch<GridRisk[]>("/grids/risk").then(setGrids).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedGrid) {
      apiFetch<MobilitasData>(`/mobilitas/${selectedGrid}`)
        .then(data => {
          setMobilitasData(data);
          setForm({
            pendatang_30_hari: data.pendatang_30_hari || 0,
            pendatang_dari_endemis: data.pendatang_dari_endemis || 0,
            pekerja_mobil: data.pekerja_mobil || 0,
            riwayat_perjalanan_endemis: data.riwayat_perjalanan_endemis || 0,
          });
        })
        .catch(() => { setMobilitasData(null); });
    }
  }, [selectedGrid]);

  async function handleSubmitMobilitas() {
    if (!selectedGrid) return;
    setSubmitting(true);
    setMobilitasResult(null);
    setMessage(null);
    try {
      const data = await apiFetch<MobilitasData>(`/mobilitas/${selectedGrid}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMobilitasResult(data);
      setMessage({ type: "success", text: `Grid ${selectedGrid} updated — risk: ${data.kategori}, score: ${(data.risiko_gabungan ?? 0).toFixed(0)}/100` });
    } catch {
      setMessage({ type: "error", text: "Failed to submit mobility data." });
    }
    setSubmitting(false);
  }

  if (loading || !user || (user.role !== "kader" && user.role !== "admin")) {
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
          <div className="font-extrabold tracking-tight text-lg text-slate-900 flex items-center gap-2.5">
            Kader Dashboard
          </div>
        }
        rightContent={
          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <Link href="/admin" className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors">
                Admin Panel
              </Link>
            )}
            <button onClick={signOut} className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-rose-600 hover:bg-rose-100 transition-colors">
              Logout
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              {user.username?.[0]?.toUpperCase() || "K"}
            </div>
          </div>
        }
      />

      <main className="p-4 pt-32 md:p-12 md:pt-36 min-h-screen w-full max-w-[1600px] mx-auto">
        {/* Tab Bar */}
        <div className="flex gap-1 p-1 rounded-full bg-slate-100 mb-6 w-fit" style={{ backgroundColor: "var(--color-surface-container)" }}>
          {[
            { key: "verify" as const, label: "Verifikasi Laporan", icon: "verified" },
            { key: "mobilitas" as const, label: "Input Mobilitas", icon: "directions_walk" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold transition-all"
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

        {/* Tab: Verifikasi */}
        {activeTab === "verify" && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-h-0 bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: "var(--color-outline-variant)" }}>
              <LiveCommunityMap />
            </div>
            <div className="w-full lg:w-[500px] space-y-4">
              <h3 className="text-sm font-bold" style={{ color: "var(--color-on-surface)" }}>
                Laporan Menunggu Verifikasi
              </h3>
              {laporans.filter(l => l.status !== "ditindaklanjuti").length === 0 ? (
                <div className="text-center py-8" style={{ color: "var(--color-on-surface-variant)" }}>
                  <span className="material-symbols-outlined text-3xl mb-2">check_circle</span>
                  <p className="text-sm">Semua laporan sudah ditindaklanjuti.</p>
                </div>
              ) : (
                laporans.filter(l => l.status !== "ditindaklanjuti").sort((a, b) => (b.risiko_gabungan ?? 0) - (a.risiko_gabungan ?? 0)).map(l => {
                  const score = l.risiko_gabungan ?? 0;
                  const style = getAreaStyle(score);
                  return (
                    <Link
                      href={`/admin/laporan/${l.kode_laporan}`}
                      key={l.kode_laporan}
                      className="block p-4 rounded-xl shadow-sm border-l-4 border-y border-r hover:shadow-md transition-shadow"
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
                        <span className="px-2 py-1 rounded text-xs font-bold capitalize" style={{ backgroundColor: style.chipBg, color: style.chipFg }}>
                          {l.heatmap_category || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <p className="text-xs mb-1" style={{ color: "var(--color-on-surface-variant)" }}>Risk Score</p>
                          <p className="text-xl font-bold" style={{ color: style.scoreFg }}>{score.toFixed(0)}/100</p>
                        </div>
                        <p className={`text-sm font-semibold capitalize ${l.status === 'ditindaklanjuti' ? 'text-green-600' : l.status === 'terverifikasi' ? 'text-blue-600' : 'text-amber-600'}`}>
                          {l.status}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab: Input Mobilitas */}
        {activeTab === "mobilitas" && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: "var(--color-outline-variant)" }}>
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-1" style={{ color: "var(--color-on-surface)" }}>Input Checklist Mobilitas</h2>
                <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                  Data mobilitas digunakan oleh AI Model Mobilitas (bobot 20%) dalam formula Risiko Gabungan.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--color-on-surface)" }}>Pilih Grid/Area</label>
                <select
                  value={selectedGrid}
                  onChange={e => setSelectedGrid(e.target.value)}
                  className="w-full p-3 rounded-lg border text-sm bg-white"
                  style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
                >
                  <option value="">— Pilih grid —</option>
                  {grids.map(g => (
                    <option key={g.grid_id} value={g.grid_id}>
                      {g.grid_id} — Skor: {g.skor.toFixed(0)} · {g.kategori}
                    </option>
                  ))}
                </select>
              </div>

              {selectedGrid && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "pendatang_30_hari", label: "Pendatang 30 Hari", desc: "Jumlah pendatang dalam 30 hari terakhir", icon: "group" },
                      { key: "pendatang_dari_endemis", label: "Pendatang dari Endemis", desc: "Subset dari pendatang, berasal dari daerah endemis", icon: "travel_explore" },
                      { key: "pekerja_mobil", label: "Pekerja Mobil", desc: "Estimasi pekerja tambang/hutan/kebun", icon: "engineering" },
                      { key: "riwayat_perjalanan_endemis", label: "Riwayat Perjalanan Endemis", desc: "Jumlah orang per 12 bulan", icon: "history" },
                    ].map(f => (
                      <div key={f.key} className="p-4 rounded-lg border" style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-sm" style={{ color: "var(--color-primary)" }}>{f.icon}</span>
                          <label className="text-sm font-bold" style={{ color: "var(--color-on-surface)" }}>{f.label}</label>
                        </div>
                        <p className="text-xs mb-2" style={{ color: "var(--color-on-surface-variant)" }}>{f.desc}</p>
                        <input
                          type="number"
                          min={0}
                          value={form[f.key as keyof typeof form]}
                          onChange={e => setForm(prev => ({ ...prev, [f.key]: Math.max(0, parseInt(e.target.value) || 0) }))}
                          className="w-full p-2 rounded-lg border text-sm"
                          style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmitMobilitas}
                    disabled={submitting}
                    className="w-full py-3 rounded-full font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        Menghitung Risiko...
                      </span>
                    ) : "Submit Data Mobilitas"}
                  </button>

                  {message && (
                    <div className={`p-4 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                      {message.text}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right panel: risk result */}
            <div className="w-full lg:w-[420px] space-y-4">
              {(mobilitasData || mobilitasResult) && (
                <div className="p-6 rounded-xl border bg-white shadow-sm" style={{ borderColor: "var(--color-outline-variant)" }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: "var(--color-on-surface)" }}>
                    Data Mobilitas Terkini — {selectedGrid}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Pendatang 30 Hari", value: mobilitasResult?.pendatang_30_hari ?? mobilitasData?.pendatang_30_hari },
                      { label: "Pendatang dari Endemis", value: mobilitasResult?.pendatang_dari_endemis ?? mobilitasData?.pendatang_dari_endemis },
                      { label: "Pekerja Mobil", value: mobilitasResult?.pekerja_mobil ?? mobilitasData?.pekerja_mobil },
                      { label: "Riwayat Perjalanan Endemis", value: mobilitasResult?.riwayat_perjalanan_endemis ?? mobilitasData?.riwayat_perjalanan_endemis },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span style={{ color: "var(--color-on-surface-variant)" }}>{item.label}</span>
                        <span className="font-bold" style={{ color: "var(--color-on-surface)" }}>{item.value ?? "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mobilitasResult && (
                <div className="p-6 rounded-xl border bg-white shadow-sm" style={{ borderColor: "var(--color-outline-variant)" }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: "var(--color-on-surface)" }}>AI Risk Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Habitat Score", value: mobilitasResult.habitat_risk_score, icon: "eco" },
                      { label: "Mobility Score", value: mobilitasResult.mobility_risk_score, icon: "directions_walk" },
                      { label: "Case Score", value: mobilitasResult.case_score, icon: "bug_report" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm" style={{ color: "var(--color-primary)" }}>{item.icon}</span>
                        <span className="flex-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>{item.label}</span>
                        <span className="text-sm font-bold" style={{ color: "var(--color-on-surface)" }}>{item.value?.toFixed(1) ?? "—"}</span>
                      </div>
                    ))}
                    <div className="pt-3 mt-3 border-t" style={{ borderColor: "var(--color-outline-variant)" }}>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm" style={{ color: "var(--color-error)" }}>warning</span>
                        <span className="flex-1 text-sm font-bold" style={{ color: "var(--color-on-surface)" }}>Risiko Gabungan</span>
                        <div className="text-right">
                          <span className="text-xl font-bold" style={{ color: (mobilitasResult.risiko_gabungan ?? 0) >= 75 ? "var(--color-error)" : (mobilitasResult.risiko_gabungan ?? 0) >= 50 ? "#b45309" : "#059669" }}>
                            {mobilitasResult.risiko_gabungan?.toFixed(0) ?? "—"}/100
                          </span>
                        </div>
                      </div>
                      <p className="text-xs mt-1 text-right" style={{ color: "var(--color-on-surface-variant)" }}>
                        <span className="font-bold">{mobilitasResult.kategori}</span> · 0.65×Habitat + 0.20×Mobilitas + 0.15×Kasus
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
