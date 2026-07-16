"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import VillageMapPicker, { type SelectedCell } from "./VillageMapPicker";

import Header from "@/components/Header";

export default function LaporPage() {
  const router = useRouter();
  const [selectedGrid, setSelectedGrid] = useState<SelectedCell | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/lapor/sukses");
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
              <input accept="image/*" capture="environment" className="hidden" type="file" />
            </label>
          </section>

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              id="submit-laporan"
              className="group w-full md:w-auto px-10 py-4 rounded-full bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Submit Report
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">send</span>
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
