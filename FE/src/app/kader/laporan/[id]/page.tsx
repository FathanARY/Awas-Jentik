"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../api";
import { useAuth } from "@/contexts/AuthContext";
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
}

export default function KaderLaporanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<LaporanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== "user" && user.role !== "admin")) {
      router.push("/");
      return;
    }
    apiFetch<LaporanDetail>(`/laporan/${id}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, user, authLoading, router]);

  async function handleVerify() {
    setActionLoading("verify");
    setActionMsg(null);
    try {
      const updated = await apiFetch<LaporanDetail>(`/laporan/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ diverifikasi_oleh: user?.username || "Kader" }),
      });
      setData(updated);
      setActionMsg("Laporan berhasil diverifikasi.");
    } catch { setActionMsg("Verifikasi gagal."); }
    setActionLoading(null);
  }

  async function handleTindakan() {
    if (!catatan.trim()) {
      setActionMsg("Mohon isi catatan tindakan terlebih dahulu.");
      return;
    }
    setActionLoading("tindakan");
    setActionMsg(null);
    try {
      const updated = await apiFetch<LaporanDetail>(`/laporan/${id}/tindakan`, {
        method: "POST",
        body: JSON.stringify({ tindakan: catatan, diverifikasi_oleh: user?.username || "Kader" }),
      });
      setData(updated);
      setActionMsg("Laporan berhasil ditindaklanjuti.");
    } catch { setActionMsg("Gagal mencatat tindakan."); }
    setActionLoading(null);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary-fixed-dim border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-lg font-medium text-on-surface">Laporan tidak ditemukan</p>
        <Link href="/kader" className="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-on-primary">Kembali ke Dashboard</Link>
      </div>
    );
  }

  const risk = getRiskStyle(data.risiko_gabungan);
  const skor = data.risiko_gabungan ?? 0;
  const checklistItems = [
    { label: "Air Tenang", value: data.air_tenang === "Ya" ? "Ya" : "Tidak", highlight: data.air_tenang === "Ya" },
    { label: "Tutupan Lumut", value: `${data.persentase_lumut ?? 0}%`, highlight: (data.persentase_lumut ?? 0) > 50 },
    { label: "Vegetasi", value: `${data.persentase_vegetasi ?? 0}%`, highlight: (data.persentase_vegetasi ?? 0) > 50 },
    { label: "Jarak ke Permukiman", value: `${data.jarak_permukiman_m ?? "—"} m`, highlight: false },
  ];

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header
        leftContent={
          <div className="flex items-center gap-4">
            <Link href="/kader" aria-label="Kembali" className="p-2 -ml-2 rounded-full transition-colors flex items-center text-on-background hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-2xl hover:-translate-x-0.5 transition-transform">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-on-background">Detail Laporan #{data.kode_laporan}</h1>
              <p className="text-xs font-medium text-on-surface-variant">{data.alamat || "Lokasi"} · {new Date(data.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
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
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2" style={actionMsg.includes("gagal") ? { backgroundColor: "var(--color-error-container)", color: "var(--color-on-error-container)" } : { backgroundColor: "var(--color-primary-subtle)", color: "var(--color-on-primary-fixed-variant)" }}>
            <span className="material-symbols-outlined text-lg">{actionMsg.includes("gagal") ? "error" : "check_circle"}</span>
            {actionMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <section className="rounded-3xl shadow-sm overflow-hidden flex flex-col" style={{ backgroundColor: "var(--color-surface)" }}>
              <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: "var(--color-outline-variant)" }}>
                <span className="material-symbols-outlined text-xl text-primary">fact_check</span>
                <h2 className="text-xl font-semibold text-on-surface">Data Observasi Lapangan</h2>
              </div>
              <div className="p-4 flex flex-col gap-6">
                {data.foto_path ? (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Foto Laporan</h3>
                    <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden border border-outline-variant bg-surface-container">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${API_BASE.replace('/api', '')}${data.foto_path}`} alt="Foto Laporan" className="w-full h-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Foto Laporan</h3>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-outline-variant flex items-center justify-center flex-col gap-2 bg-surface-container text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                      <span className="text-sm font-medium">Tidak Ada Foto</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Hasil Inspeksi Visual</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {checklistItems.map((item) => (
                      <div key={item.label} className="flex items-start justify-between p-3 rounded-lg border border-outline-variant bg-surface-container-low">
                        <span className="text-base text-on-surface">{item.label}</span>
                        <span className="text-sm font-bold px-2 py-0.5 rounded" style={item.highlight ? { backgroundColor: "var(--color-primary-fixed)", color: "var(--color-primary)" } : { backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <section className="rounded-3xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
              <div className="p-4 border-b border-outline-variant flex items-center gap-2 bg-surface-bright">
                <span className="material-symbols-outlined text-xl text-secondary">memory</span>
                <h2 className="text-xl font-semibold text-on-surface">Analisis AI</h2>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {[
                    { item: "Skor Habitat", result: `${data.habitat_risk_score ?? "—"}`, color: "var(--color-primary)" },
                    { item: "Skor Mobilitas", result: `${data.mobility_risk_score ?? "—"}`, color: "var(--color-secondary)" },
                    { item: "Skor Kasus", result: `${data.case_score ?? "—"}`, color: "var(--color-error)" },
                  ].map((row, i) => (
                    <tr key={row.item} className="border-b border-outline-variant">
                      <td className="py-3 px-4 text-base text-on-surface">{row.item}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-bold" style={{ color: row.color }}>{row.result}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="rounded-3xl shadow-sm p-4 flex flex-col items-center text-center bg-surface">
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-2 text-on-surface-variant">Skor Area Final</h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-bold text-on-surface" style={{ fontSize: 48, lineHeight: 1 }}>{Math.round(skor)}</span>
                <span className="text-lg text-on-surface-variant">/ 100</span>
              </div>
              <div className="px-4 py-1.5 rounded-full flex items-center gap-2" style={{ backgroundColor: risk.chipBg, color: risk.chipFg }}>
                <span className="material-symbols-outlined text-lg">warning</span>
                <span className="text-xl font-semibold">{risk.level}</span>
              </div>
              <p className="text-sm mt-4 text-on-surface-variant">
                {getWeightFormula()}. Kategori: {data.heatmap_category || "—"}.
              </p>
            </section>

            <p className="text-xs text-center text-on-surface-variant italic">
              Skor prediktif ini bukan status resmi Kemenkes. Gunakan sebagai alat bantu keputusan.
            </p>
          </div>
        </div>

        {data.status !== "ditindaklanjuti" && (
          <div className="mt-8 pt-6 border-t border-outline-variant space-y-4">
            {data.status !== "terverifikasi" && (
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <button onClick={handleVerify} disabled={actionLoading === "verify"} className="w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50 active:scale-[0.98]" style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-on-secondary)" }}>
                  <span className="material-symbols-outlined text-lg">verified</span>
                  {actionLoading === "verify" ? "Memverifikasi..." : "Verifikasi Laporan"}
                </button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan tindakan (contoh: fogging terjadwal, penyuluhan warga, distribusi kelambu)..."
                className="flex-1 p-3 rounded-xl border border-outline bg-surface-container-low text-on-surface text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-20"
              />
              <button onClick={handleTindakan} disabled={actionLoading === "tindakan"} className="w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50 active:scale-[0.98]" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}>
                <span className="material-symbols-outlined text-lg">done_all</span>
                {actionLoading === "tindakan" ? "Memproses..." : "Tandai Selesai"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Link href={`/kader`} className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-primary text-primary text-sm font-bold flex items-center justify-center gap-2 transition-colors hover:bg-primary-subtle active:scale-[0.98]">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali ke Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
