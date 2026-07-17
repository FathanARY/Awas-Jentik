"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { apiPostForm } from "../api";
import VillageMapPicker, { type SelectedCell } from "./VillageMapPicker";
import { cellToLatLng } from "@/components/MapGrid";

import Header from "@/components/Header";

export default function LaporPage() {
  const router = useRouter();
  const [selectedGrid, setSelectedGrid] = useState<SelectedCell | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const paparanMap: Record<string, string> = {
      low: "Rendah",
      medium: "Sedang",
      high: "Tinggi",
    };
    const airMap: Record<string, string> = {
      yes: "Ya",
      no: "Tidak",
    };

    const paparanVal = fd.get("paparan_matahari") as string;
    const airVal = fd.get("air_tenang") as string;

    fd.set("air_tenang", airMap[airVal] || "Tidak");
    fd.set("paparan_matahari", paparanMap[paparanVal] || "Sedang");

    fd.append("curah_hujan_30_hari_mm", "300");
    fd.append("jarak_hutan_m", "100");
    fd.append("jarak_sawah_m", "500");
    fd.append("jarak_sungai_m", "400");
    fd.append("jarak_rawa_m", "1000");
    fd.append("jarak_tambang_m", "3000");
    fd.append("jarak_permukiman_m", "200");
    fd.append("jarak_puskesmas_m", "2000");
    fd.append("pendatang_30_hari", "3");
    fd.append("pendatang_dari_endemis", "1");
    fd.append("pekerja_mobil", "2");
    fd.append("riwayat_perjalanan_endemis", "0");
    fd.append("kasus_malaria_1km_30hari", "0");

    // Derive lat/lng from the grid cell the user clicked (0-indexed col = x-1, row = y-1)
    if (selectedGrid) {
      const { lat, lng } = cellToLatLng(selectedGrid.x - 1, selectedGrid.y - 1);
      fd.append("lat", String(lat));
      fd.append("lng", String(lng));
    } else {
      // Fallback: centre of the bounding box
      fd.append("lat", "-6.200000");
      fd.append("lng", "106.820000");
    }

    try {
      const result = await apiPostForm<{ kode_laporan: string }>("/lapor", fd);
      router.push(`/lapor/sukses?kode=${result.kode_laporan}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim laporan");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen relative font-sans text-slate-800 selection:bg-blue-200 selection:text-blue-900">
      {/* Modern Gradient Background */}
      <div className="fixed inset-0 z-[-1] bg-[#f8fafc]">
        <div className="absolute top-0 -left-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-10 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
      </div>

      <Header 
        leftContent={
          <Link href="/" className="font-extrabold tracking-tight text-lg text-slate-900 flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:-translate-x-0.5 transition-transform">
              <span className="material-symbols-outlined text-base">arrow_back</span>
            </span>
            MalariaWatch
          </Link>
        }
        rightContent={
          <div className="flex items-center gap-1 md:gap-3">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              New Report
            </div>
          </div>
        }
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-28 md:pb-20">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
            Report a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Puddle</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Please complete the field observation data accurately.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Location */}
          <section className="rounded-3xl p-6 md:p-8 bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined">map</span>
              </div>
              Puddle Location
            </h3>
            
            <VillageMapPicker selected={selectedGrid} onSelect={setSelectedGrid} />

            <input type="hidden" name="grid_x" value={selectedGrid?.x ?? ""} />
            <input type="hidden" name="grid_y" value={selectedGrid?.y ?? ""} />
            <input type="hidden" name="grid_land" value={selectedGrid?.land ?? ""} />
          </section>

          {/* Puddle Characteristics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Physical Properties */}
            <section className="rounded-3xl p-6 md:p-8 bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">water</span>
                </div>
                Physical Properties
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Moss Percentage (0-100%)</label>
                  <p className="text-xs text-slate-500 mb-3">Higher indicates puddle has been formed for a long time.</p>
                  <div className="relative">
                    <input type="number" min="0" max="100" name="persentase_lumut" placeholder="e.g. 68" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" required />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500 font-bold">%</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Vegetation (0-100%)</label>
                  <p className="text-xs text-slate-500 mb-3">Percentage of vegetation around puddle.</p>
                  <div className="relative">
                    <input type="number" min="0" max="100" name="persentase_vegetasi" placeholder="e.g. 75" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" required />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500 font-bold">%</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Puddle Area</label>
                    <div className="relative">
                      <input type="number" min="0" step="any" name="luas_genangan_m2" placeholder="e.g. 14" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" required />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500 font-bold">m²</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Depth <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <div className="relative">
                      <input type="number" min="0" step="any" name="depth" placeholder="e.g. 18" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500 font-bold">cm</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Environmental Factors */}
            <section className="rounded-3xl p-6 md:p-8 bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">eco</span>
                </div>
                Environmental Factors
              </h3>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">Still Water</label>
                  <div className="flex gap-4">
                    {[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ].map((opt, i) => (
                      <label key={opt.value} className="flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border border-slate-200 bg-white cursor-pointer group hover:border-blue-300 transition-colors">
                        <input className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500" name="air_tenang" type="radio" value={opt.value} defaultChecked={i === 0} />
                        <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">Sun Exposure</label>
                  <div className="space-y-3">
                    {[
                      { value: "low", label: "Low" },
                      { value: "medium", label: "Medium" },
                      { value: "high", label: "High" },
                    ].map((opt, i) => (
                      <label key={opt.value} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white cursor-pointer group hover:border-blue-300 transition-colors">
                        <input className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500" name="paparan_matahari" type="radio" value={opt.value} defaultChecked={i === 1} />
                        <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Photo Upload */}
          <section className="rounded-3xl p-6 md:p-8 bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined">add_a_photo</span>
              </div>
              Verification Photo <span className="text-xs font-bold px-2 py-1 bg-rose-100 text-rose-700 rounded-md uppercase tracking-wider ml-2">Required</span>
            </h3>
            
            {photoFile ? (
              /* ── Success state ── */
              <div className="w-full border-2 border-emerald-200 bg-emerald-50/60 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[240px] text-center">
                {/* File + check SVG */}
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-5">
                  <svg width="52" height="52" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* File body */}
                    <rect x="10" y="4" width="28" height="36" rx="4" fill="#a7f3d0" stroke="#059669" strokeWidth="2"/>
                    {/* Fold corner */}
                    <path d="M32 4 L38 10 L32 10 Z" fill="#6ee7b7" stroke="#059669" strokeWidth="1.5" strokeLinejoin="round"/>
                    {/* Image icon lines */}
                    <rect x="15" y="16" width="16" height="12" rx="2" fill="#6ee7b7" stroke="#059669" strokeWidth="1.5"/>
                    <circle cx="18" cy="19" r="1.5" fill="#059669"/>
                    <path d="M15 25 L19 21 L23 25" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 24 L24 21 L27 24" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* Green badge with check */}
                    <circle cx="40" cy="42" r="12" fill="#059669"/>
                    <path d="M34 42 L38.5 46.5 L46.5 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <p className="text-base font-extrabold text-slate-900 mb-1">Photo selected!</p>
                <p className="text-sm text-slate-500 font-medium max-w-[240px] truncate mb-6">{photoFile}</p>

                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setTimeout(() => photoInputRef.current?.click(), 50); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-emerald-500 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                  Choose Another Photo
                </button>

                <input
                  ref={photoInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  type="file"
                  name="foto"
                  onChange={(e) => setPhotoFile(e.target.files?.[0]?.name ?? null)}
                />
              </div>
            ) : (
              /* ── Default upload prompt ── */
              <label className="block w-full border-2 border-dashed border-blue-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer min-h-[240px] text-center transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                </div>
                <p className="text-lg font-bold text-slate-900 mb-1">
                  Tap to capture or select photo
                </p>
                <p className="text-sm text-slate-500 font-medium">
                  Ensure the puddle is clearly visible along with its surrounding area.
                </p>
                <input
                  ref={photoInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  type="file"
                  name="foto"
                  onChange={(e) => setPhotoFile(e.target.files?.[0]?.name ?? null)}
                />
              </label>
            )}
          </section>

          {/* Submit */}
          <div className="pt-4 flex flex-col items-end gap-3">
            {error && (
              <div className="w-full px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}
            <button
              type="submit"
              id="submit-laporan"
              disabled={submitting}
              className="group w-full md:w-auto px-10 py-4 rounded-full bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Mengirim..." : "Submit Report"}
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">{submitting ? "hourglass_top" : "send"}</span>
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-sm font-medium text-slate-500 bg-transparent">
        © 2026 MalariaWatch. Built for a healthier community.
      </footer>
    </div>
  );
}
