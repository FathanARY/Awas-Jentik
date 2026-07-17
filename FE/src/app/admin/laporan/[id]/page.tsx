"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../api";
import { getRiskStyle, getWeightFormula } from "@/lib/risk-utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface LaporanDetail {
  kode_laporan: string;
  status: string;
  created_at: string;
  lat: number | null;
  lng: number | null;
  alamat: string | null;
  foto_path: string | null;
  persentase_lumut: number | null;
  persentase_vegetasi: number | null;
  air_tenang: string | null;
  paparan_matahari: string | null;
  luas_genangan_m2: number | null;
  jarak_permukiman_m: number | null;
  habitat_risk_score: number | null;
  habitat_category: string | null;
  mobility_risk_score: number | null;
  case_score: number | null;
  risiko_gabungan: number | null;
  heatmap_category: string | null;
  heatmap_level: number | null;
}

export default function AdminLaporanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<LaporanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<LaporanDetail>(`/laporan/${id}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleVerify() {
    setActionLoading("verify");
    setActionMsg(null);
    try {
      const updated = await apiFetch<LaporanDetail>(`/laporan/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ diverifikasi_oleh: "Admin" }),
      });
      setData(updated);
      setActionMsg("Report verified successfully!");
    } catch { setActionMsg("Verification failed."); }
    setActionLoading(null);
  }

  async function handleTindakan(tindakan: string) {
    setActionLoading("tindakan");
    setActionMsg(null);
    try {
      const updated = await apiFetch<LaporanDetail>(`/laporan/${id}/tindakan`, {
        method: "POST",
        body: JSON.stringify({ tindakan, diverifikasi_oleh: "Admin" }),
      });
      setData(updated);
      setActionMsg(`Action "${tindakan}" recorded.`);
    } catch { setActionMsg("Action failed."); }
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "var(--color-background)" }}>
        <p className="text-lg font-medium" style={{ color: "var(--color-on-surface)" }}>Report not found</p>
        <Link href="/admin" className="px-6 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}>Back to Dashboard</Link>
      </div>
    );
  }

  const risk = getRiskStyle(data.risiko_gabungan);
  const skor = data.risiko_gabungan ?? 0;
  const checklistItems = [
    { label: "Still Water", value: data.air_tenang === "Ya" ? "Yes" : "No", highlight: data.air_tenang === "Ya" },
    { label: "Moss Coverage", value: `${data.persentase_lumut ?? 0}%`, highlight: (data.persentase_lumut ?? 0) > 50 },
    { label: "Vegetation Density", value: `${data.persentase_vegetasi ?? 0}%`, highlight: (data.persentase_vegetasi ?? 0) > 50 },
    { label: "Distance to Settlement", value: `${data.jarak_permukiman_m ?? "—"} m`, highlight: false },
  ];

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: "var(--color-background)" }}>
      <Header
        leftContent={
          <div className="flex items-center gap-4">
            <Link href="/admin" aria-label="Back" className="p-2 -ml-2 rounded-full transition-colors flex items-center text-slate-900 hover:bg-slate-100 group">
              <span className="material-symbols-outlined text-2xl group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Report Detail #{data.kode_laporan}</h1>
              <p className="text-xs font-medium text-slate-500">{data.alamat || "Location"} · {new Date(data.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          </div>
        }
        rightContent={
          <div className="hidden md:flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${data.status === "ditindaklanjuti" ? "bg-green-100 text-green-700" : data.status === "terverifikasi" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
              <span className="material-symbols-outlined text-sm">{data.status === "ditindaklanjuti" ? "check_circle" : data.status === "terverifikasi" ? "verified" : "sync"}</span>
              {data.status}
            </span>
          </div>
        }
      />

      <main className="flex-grow max-w-7xl mx-auto w-full p-4 pt-32 md:p-12 md:pt-36">
        {actionMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2" style={actionMsg.includes("failed") ? { backgroundColor: "var(--color-error-container)", color: "var(--color-on-error-container)" } : { backgroundColor: "#d1fae5", color: "#065f46" }}>
            <span className="material-symbols-outlined text-lg">{actionMsg.includes("failed") ? "error" : "check_circle"}</span>
            {actionMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <section className="rounded-xl border shadow-sm overflow-hidden flex flex-col" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-outline-variant)" }}>
              <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: "var(--color-outline-variant)" }}>
                <span className="material-symbols-outlined text-xl" style={{ color: "var(--color-primary)" }}>fact_check</span>
                <h2 className="text-xl font-semibold" style={{ color: "var(--color-on-surface)" }}>Field Observation Data</h2>
              </div>
              <div className="p-4 flex flex-col gap-6">
                {data.foto_path ? (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Report Image</h3>
                    <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden border" style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${API_BASE.replace('/api', '')}${data.foto_path}`} alt="Report Image" className="w-full h-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Report Image</h3>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border flex items-center justify-center flex-col gap-2" style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface-variant)" }}>
                      <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                      <span className="text-sm font-medium">No Image Attached</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Visual Inspection Results</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {checklistItems.map((item) => (
                      <div key={item.label} className="flex items-start justify-between p-3 rounded-lg border" style={{ backgroundColor: "var(--color-surface-container-low)", borderColor: "rgba(196,197,213,0.5)" }}>
                        <span className="text-base" style={{ color: "var(--color-on-surface)" }}>{item.label}</span>
                        <span className="text-sm font-bold px-2 py-0.5 rounded" style={item.highlight ? { backgroundColor: "var(--color-primary-fixed)", color: "var(--color-primary)" } : { backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <section className="rounded-xl border shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-outline-variant)" }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ backgroundColor: "var(--color-surface-bright)", borderColor: "var(--color-outline-variant)" }}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl" style={{ color: "var(--color-secondary)" }}>memory</span>
                  <h2 className="text-xl font-semibold" style={{ color: "var(--color-on-surface)" }}>AI Risk Breakdown</h2>
                </div>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {[
                    { item: "Habitat Score", result: `${data.habitat_risk_score ?? "—"}`, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 14 6h7v7a7 7 0 0 1-14 0Z"/><path d="M11 20v-5"/></svg>, color: "var(--color-primary)" },
                    { item: "Mobility Score", result: `${data.mobility_risk_score ?? "—"}`, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-footprints"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/></svg>, color: "var(--color-secondary)" },
                    { item: "Case Score", result: `${data.case_score ?? "—"}`, icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bug"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>, color: "var(--color-error)" },
                  ].map((row, i) => (
                    <tr key={row.item} className="border-b" style={{ borderColor: i < 2 ? "rgba(196,197,213,0.3)" : "transparent" }}>
                      <td className="py-3 px-4 text-base" style={{ color: "var(--color-on-surface)" }}>{row.item}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: row.color }}>{row.icon} {row.result}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="rounded-xl border shadow-sm p-4 flex flex-col items-center text-center" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-outline-variant)" }}>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-on-surface-variant)" }}>Final Area Score</h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-bold" style={{ fontSize: 48, lineHeight: 1, color: "var(--color-on-surface)" }}>{Math.round(skor)}</span>
                <span className="text-lg" style={{ color: "var(--color-on-surface-variant)" }}>/ 100</span>
              </div>
              <div className="px-4 py-1.5 rounded-full flex items-center gap-2" style={{ backgroundColor: risk.chipBg, color: risk.chipFg }}>
                <span className="material-symbols-outlined text-lg">warning</span>
                <span className="text-xl font-semibold">{risk.level}</span>
              </div>
              <p className="text-sm mt-4" style={{ color: "var(--color-on-surface-variant)" }}>
                {getWeightFormula()}. Kategori: {data.heatmap_category || "—"}.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-end gap-4" style={{ borderColor: "var(--color-outline-variant)" }}>
          {data.status !== "terverifikasi" && data.status !== "ditindaklanjuti" && (
            <button onClick={handleVerify} disabled={actionLoading === "verify"} className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50" style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-on-secondary)" }}>
              <span className="material-symbols-outlined text-lg">verified</span>
              {actionLoading === "verify" ? "Verifying..." : "Verify Report"}
            </button>
          )}
          {data.status !== "ditindaklanjuti" && (
            <button onClick={() => handleTindakan("Fogging terjadwal")} disabled={actionLoading === "tindakan"} className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}>
              <span className="material-symbols-outlined text-lg">done_all</span>
              {actionLoading === "tindakan" ? "Processing..." : "Mark as Resolved"}
            </button>
          )}
          <Link href={`/admin`} className="w-full sm:w-auto px-6 py-2.5 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors" style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </Link>
        </div>
      </main>
    </div>
  );
}
