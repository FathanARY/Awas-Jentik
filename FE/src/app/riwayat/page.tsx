"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import Header from "@/components/Header";

interface LaporanItem {
  kode_laporan: string;
  status: string;
  heatmap_category: string | null;
  habitat_category: string | null;
  risiko_gabungan: number | null;
  created_at: string;
  alamat: string | null;
  habitat_risk_score: number | null;
  mobility_risk_score: number | null;
  case_score: number | null;
}

function getRiskColors(score: number | null) {
  if (!score && score !== 0) return { scoreFg: "var(--color-outline)", chipBg: "var(--color-surface-container-high)", chipFg: "var(--color-on-surface-variant)" };
  if (score >= 80) return { scoreFg: "var(--color-error)", chipBg: "var(--color-error-container)", chipFg: "var(--color-on-error-container)" };
  if (score >= 60) return { scoreFg: "#b45309", chipBg: "#fef3c7", chipFg: "#92400e" };
  if (score >= 40) return { scoreFg: "var(--color-secondary)", chipBg: "var(--color-secondary-container)", chipFg: "var(--color-on-secondary-container)" };
  return { scoreFg: "#059669", chipBg: "#d1fae5", chipFg: "#065f46" };
}

export default function RiwayatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [laporans, setLaporans] = useState<LaporanItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedKode, setExpandedKode] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    apiFetch<LaporanItem[]>("/laporan")
      .then(setLaporans)
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh" style={{ backgroundColor: "var(--color-background)" }}>
      <Header />
      <main className="p-4 pt-32 md:p-12 md:pt-36 min-h-screen w-full max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-on-surface)" }}>Riwayat Laporan</h1>
          <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            Semua laporan genangan yang telah Anda kirimkan
          </p>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : laporans.length === 0 ? (
          <div className="text-center py-12 rounded-xl border bg-white" style={{ borderColor: "var(--color-outline-variant)" }}>
            <span className="material-symbols-outlined text-4xl mb-3" style={{ color: "var(--color-outline)" }}>description</span>
            <p className="text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Belum ada laporan.</p>
            <Link href="/lapor" className="inline-block mt-4 px-6 py-2 rounded-full text-sm font-bold shadow-md" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}>
              Lapor Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {laporans.map(l => {
              const score = l.risiko_gabungan ?? 0;
              const colors = getRiskColors(l.risiko_gabungan);
              const isExpanded = expandedKode === l.kode_laporan;
              return (
                <div
                  key={l.kode_laporan}
                  className="rounded-xl border shadow-sm bg-white overflow-hidden transition-all"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedKode(isExpanded ? null : l.kode_laporan)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-bold font-mono" style={{ color: "var(--color-primary)" }}>{l.kode_laporan}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>{l.alamat || "—"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${l.status === "ditindaklanjuti" ? "bg-green-100 text-green-700" : l.status === "terverifikasi" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                          {l.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs mb-1" style={{ color: "var(--color-on-surface-variant)" }}>Risk Score</p>
                        <p className="text-xl font-bold" style={{ color: colors.scoreFg }}>{score.toFixed(0)}/100</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: colors.chipBg, color: colors.chipFg }}>
                          {l.heatmap_category || l.habitat_category || "N/A"}
                        </span>
                        <p className="text-xs mt-1" style={{ color: "var(--color-outline)" }}>{new Date(l.created_at).toLocaleDateString("id-ID")}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: "var(--color-outline)" }}>
                      <span className="material-symbols-outlined text-sm">{isExpanded ? "expand_less" : "expand_more"}</span>
                      {isExpanded ? "Sembunyikan detail" : "Lihat detail AI breakdown"}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)" }}>
                      <div className="pt-3 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--color-outline)" }}>AI Risk Breakdown</h4>
                        {[
                          { label: "Habitat Score", value: l.habitat_risk_score, icon: "eco", weight: "0.65", color: "var(--color-primary)" },
                          { label: "Mobility Score", value: l.mobility_risk_score, icon: "directions_walk", weight: "0.20", color: "var(--color-secondary)" },
                          { label: "Case Score", value: l.case_score, icon: "bug_report", weight: "0.15", color: "var(--color-error)" },
                        ].map(item => {
                          const val = item.value ?? 0;
                          const barWidth = Math.min(val, 100);
                          return (
                            <div key={item.label}>
                              <div className="flex items-center gap-2 text-sm mb-1">
                                <span className="material-symbols-outlined text-sm" style={{ color: item.color }}>{item.icon}</span>
                                <span style={{ color: "var(--color-on-surface-variant)" }}>{item.label}</span>
                                <span className="ml-auto font-bold" style={{ color: "var(--color-on-surface)" }}>{val.toFixed(0)}/100</span>
                              </div>
                              <div className="h-2 rounded-full w-full" style={{ backgroundColor: "var(--color-surface-container-highest)", overflow: "hidden" }}>
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${barWidth}%`,
                                    backgroundColor: item.color,
                                  }}
                                />
                              </div>
                              <div className="text-right text-[10px] mt-0.5" style={{ color: "var(--color-outline)" }}>
                                ×{item.weight}
                              </div>
                            </div>
                          );
                        })}
                        <div className="pt-2 mt-2 border-t border-outline-variant">
                          <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                            Risiko Gabungan
                            <span className="ml-auto text-lg" style={{ color: colors.scoreFg }}>{score.toFixed(0)}/100</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
