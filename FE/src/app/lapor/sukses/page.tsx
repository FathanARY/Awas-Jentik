"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { apiFetch } from "../../api";

interface LaporanDetail {
  kode_laporan: string;
  risiko_gabungan: number | null;
  heatmap_category: string | null;
  habitat_category: string | null;
  lat: number | null;
  lng: number | null;
  alamat: string | null;
}

function getRiskColors(score: number | null, category: string | null) {
  if (!score && score !== 0) return { bg: "var(--color-surface-container)", left: "var(--color-outline)", chipBg: "var(--color-surface-container-high)", chipFg: "var(--color-on-surface-variant)", level: "Unknown" };
  if (category === "Very High" || score >= 80) return { bg: "var(--color-error-container)", left: "var(--color-error)", chipBg: "var(--color-error)", chipFg: "var(--color-on-error)", level: "Critical" };
  if (category === "High" || score >= 60) return { bg: "#fef3c7", left: "#f59e0b", chipBg: "#f59e0b", chipFg: "#92400e", level: "High" };
  if (category === "Medium" || score >= 40) return { bg: "var(--color-surface-container-high)", left: "var(--color-secondary)", chipBg: "var(--color-secondary-container)", chipFg: "var(--color-on-secondary-container)", level: "Medium" };
  return { bg: "var(--color-surface-container)", left: "#10b981", chipBg: "#d1fae5", chipFg: "#065f46", level: "Low" };
}

function LaporSuksesContent() {
  const searchParams = useSearchParams();
  const kode = searchParams.get("kode");
  const [data, setData] = useState<LaporanDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!kode) { setLoading(false); return; }
    apiFetch<LaporanDetail>(`/laporan/${kode}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [kode]);

  const risk = getRiskColors(data?.risiko_gabungan ?? null, data?.heatmap_category ?? null);
  const score = data?.risiko_gabungan ?? 0;

  return (
    <div className="flex flex-col min-h-dvh items-center justify-center p-4 md:p-12" style={{ backgroundColor: "var(--color-background)" }}>
      <main className="w-full max-w-2xl rounded-xl shadow-lg border overflow-hidden flex flex-col animate-enter opacity-0" style={{ backgroundColor: "var(--color-surface-container-lowest)", borderColor: "rgba(196,197,213,0.3)" }}>
        <div className="px-6 pt-8 pb-4 flex flex-col items-center text-center border-b relative" style={{ backgroundColor: "var(--color-surface-bright)", borderColor: "rgba(196,197,213,0.3)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 relative" style={{ backgroundColor: "rgba(30,64,175,0.1)" }}>
            <div className="absolute inset-0 rounded-full border-2 scale-110" style={{ borderColor: "rgba(0,40,142,0.2)" }} />
            <div className="absolute inset-0 rounded-full border scale-125" style={{ borderColor: "rgba(0,40,142,0.1)" }} />
            <span className="material-symbols-outlined filled-icon" style={{ fontSize: 48, color: "var(--color-primary)" }}>check_circle</span>
          </div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--color-on-surface)" }}>Report Submitted!</h1>
          <p className="text-base max-w-md" style={{ color: "var(--color-on-surface-variant)" }}>
            {data ? `Report #${data.kode_laporan} has been processed by AI.` : "Your observation data has entered the central surveillance system."}
          </p>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-8">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="material-symbols-outlined animate-spin text-3xl" style={{ color: "var(--color-primary)" }}>progress_activity</span>
            </div>
          ) : (
            <>
              <div className="animate-enter opacity-0 delay-100 rounded-lg p-6 border-l-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden" style={{ backgroundColor: risk.bg, borderLeftColor: risk.left }}>
                <div className="absolute right-0 top-0 w-32 h-32 rounded-full -mr-16 -mt-16 pointer-events-none" style={{ backgroundColor: risk.left, opacity: 0.05 }} />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-2 rounded-full" style={{ backgroundColor: `${risk.left}1a`, color: risk.left }}>
                    <span className="material-symbols-outlined filled-icon text-xl">warning</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: "var(--color-on-surface)" }}>Risk Score: {Math.round(score)}/100</h2>
                    <p className="text-base mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
                      {data?.alamat || "This area has been analyzed by the AI risk model."}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider relative z-10 self-start md:self-auto" style={{ backgroundColor: risk.chipBg, color: risk.chipFg }}>{risk.level}</div>
              </div>

              <div className="animate-enter opacity-0 delay-200 flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Report Code</h3>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--color-surface-container)", borderColor: "rgba(196,197,213,0.5)" }}>
                  <p className="text-2xl font-bold tracking-wider" style={{ color: "var(--color-primary)" }}>{data?.kode_laporan || "—"}</p>
                  <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>Share this code with your health officer to track your report.</p>
                </div>
              </div>

              <div className="animate-enter opacity-0 delay-300 flex flex-col gap-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: "var(--color-outline)" }}>
                  <span className="material-symbols-outlined text-sm">list_alt</span>
                  Recommended Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: "water_damage", title: "Drain Puddle", desc: "Do this within the next 3 days." },
                    { icon: "bed", title: "Use Mosquito Net", desc: "Ensure sleeping area is protected." },
                    { icon: "medical_services", title: "Contact Health Center", desc: "Seek nearest facility immediately." },
                  ].map((rec) => (
                    <div key={rec.title} className="p-4 rounded-lg border shadow-sm flex flex-row md:flex-col items-center md:items-start gap-4" style={{ backgroundColor: "var(--color-surface-container)", borderColor: "rgba(196,197,213,0.5)" }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>
                        <span className="material-symbols-outlined filled-icon">{rec.icon}</span>
                      </div>
                      <div className="flex-1 md:text-left">
                        <h4 className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{rec.title}</h4>
                        <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>{rec.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="pt-4 mt-2 border-t" style={{ borderColor: "rgba(196,197,213,0.3)" }}>
            <Link href="/" id="kembali-beranda" className="w-full py-4 px-6 rounded-full flex justify-center items-center gap-2 shadow-md transition-all active:scale-[0.98] text-sm font-medium" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}>
              <span className="material-symbols-outlined">home</span>
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LaporSuksesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-dvh items-center justify-center p-4" style={{ backgroundColor: "var(--color-background)" }}>
        <span className="material-symbols-outlined animate-spin text-4xl" style={{ color: "var(--color-primary)" }}>progress_activity</span>
      </div>
    }>
      <LaporSuksesContent />
    </Suspense>
  );
}
