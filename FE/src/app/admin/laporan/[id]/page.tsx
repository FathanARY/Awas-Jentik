import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  curah_hujan_30_hari_mm: number | null;
  jarak_permukiman_m: number | null;
  habitat_risk_score: number | null;
  habitat_category: string | null;
  mobility_risk_score: number | null;
  case_score: number | null;
  risiko_gabungan: number | null;
  heatmap_category: string | null;
}

function getRiskStyle(score: number | null) {
  if (!score) return { bg: "var(--color-surface-container)", fg: "var(--color-on-surface-variant)", level: "Unknown" };
  if (score >= 80) return { bg: "var(--color-error-container)", fg: "var(--color-on-error-container)", level: "Critical" };
  if (score >= 60) return { bg: "#fef3c7", fg: "#92400e", level: "High" };
  if (score >= 40) return { bg: "var(--color-surface-container-high)", fg: "var(--color-on-surface-variant)", level: "Medium" };
  return { bg: "#d1fae5", fg: "#065f46", level: "Low" };
}

async function fetchReport(id: string): Promise<LaporanDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/laporan/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Report Detail #${id} — MalariaWatch Admin` };
}

export default async function AdminLaporanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchReport(id);

  if (!data) notFound();

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
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${data.status === "ditindaklanjuti" ? "bg-green-100 text-green-700 border border-green-200" : "bg-amber-100 text-amber-700 border border-amber-200"}`}>
              <span className="material-symbols-outlined text-sm">{data.status === "ditindaklanjuti" ? "check_circle" : "sync"}</span>
              {data.status === "ditindaklanjuti" ? "Resolved" : "Pending Action"}
            </span>
          </div>
        }
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-12 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <section className="rounded-xl border shadow-sm overflow-hidden flex flex-col" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-outline-variant)" }}>
              <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: "var(--color-outline-variant)" }}>
                <span className="material-symbols-outlined text-xl" style={{ color: "var(--color-primary)" }}>fact_check</span>
                <h2 className="text-xl font-semibold" style={{ color: "var(--color-on-surface)" }}>Field Observation Data</h2>
              </div>
              <div className="p-4 flex flex-col gap-6">
                {data.lat && data.lng && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>Location</h3>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border" style={{ backgroundColor: "var(--color-surface-container)", borderColor: "var(--color-outline-variant)" }}>
                      <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(33,49,69,0.05)" }}>
                        <span className="material-symbols-outlined text-4xl" style={{ color: "var(--color-primary)" }}>location_on</span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs backdrop-blur-sm flex items-center gap-1" style={{ backgroundColor: "rgba(33,49,69,0.8)", color: "var(--color-inverse-on-surface)" }}>
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {data.lat.toFixed(6)}, {data.lng.toFixed(6)}
                      </div>
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
                    { item: "Habitat Score", result: `${data.habitat_risk_score ?? "—"}`, icon: "eco", color: "var(--color-primary)" },
                    { item: "Mobility Score", result: `${data.mobility_risk_score ?? "—"}`, icon: "directions_walk", color: "var(--color-secondary)" },
                    { item: "Case Score", result: `${data.case_score ?? "—"}`, icon: "coronavirus", color: "var(--color-error)" },
                  ].map((row, i) => (
                    <tr key={row.item} className="border-b" style={{ borderColor: i < 2 ? "rgba(196,197,213,0.3)" : "transparent" }}>
                      <td className="py-3 px-4 text-base" style={{ color: "var(--color-on-surface)" }}>{row.item}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: row.color }}>
                          <span className="material-symbols-outlined text-sm">{row.icon}</span>
                          {row.result}
                        </span>
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
              <div className="px-4 py-1.5 rounded-full flex items-center gap-2" style={{ backgroundColor: risk.bg, color: risk.fg }}>
                <span className="material-symbols-outlined text-lg">warning</span>
                <span className="text-xl font-semibold">{risk.level}</span>
              </div>
              <p className="text-sm mt-4" style={{ color: "var(--color-on-surface-variant)" }}>
                Combined risk = 0.65 × Habitat + 0.20 × Mobility + 0.15 × Cases. Category: {data.heatmap_category || "—"}.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-end gap-4" style={{ borderColor: "var(--color-outline-variant)" }}>
          <Link href={`/admin`} className="w-full sm:w-auto px-6 py-2.5 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors" style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}>
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
