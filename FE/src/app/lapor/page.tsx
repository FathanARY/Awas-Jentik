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

    fd.append("pendatang_30_hari", "3");
    fd.append("pendatang_dari_endemis", "1");
    fd.append("pekerja_mobil", "2");
    fd.append("riwayat_perjalanan_endemis", "0");
    fd.append("kasus_malaria_1km_30hari", "0");

    if (selectedGrid) {
      const { lat, lng } = cellToLatLng(selectedGrid.x - 1, selectedGrid.y - 1);
      fd.append("lat", String(lat));
      fd.append("lng", String(lng));
    } else {
      fd.append("lat", "-6.200000");
      fd.append("lng", "106.820000");
    }

    try {
      const result = await apiPostForm<{ kode_laporan: string }>("/lapor", fd);
      router.push(`/lapor/sukses?kode=${result.kode_laporan}`);
    } catch (err) {
      // FastAPI 422 detail can be an array of {loc, msg, type} objects
      let msg = "Gagal mengirim laporan";
      if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen relative font-sans text-on-background bg-background water-surface">

      <Header />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-28 md:pb-20">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-on-background mb-3">
            Laporkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">Genangan</span>
          </h1>
          <p className="text-lg text-on-surface-variant font-medium">
            Mohon lengkapi data observasi lapangan dengan akurat.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          <section className="rounded-3xl p-6 md:p-8 bg-surface shadow-sm">
            <h3 className="text-xl font-bold text-on-background mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">map</span>
              </div>
              Lokasi Genangan
            </h3>
            
            <VillageMapPicker selected={selectedGrid} onSelect={setSelectedGrid} />

            {selectedGrid && (
              <>
                <input type="hidden" name="grid_x" value={selectedGrid.x} />
                <input type="hidden" name="grid_y" value={selectedGrid.y} />
                <input type="hidden" name="grid_land" value={selectedGrid.land ?? ""} />
              </>
            )}
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <section className="rounded-3xl p-6 md:p-8 bg-surface shadow-sm">
              <h3 className="text-xl font-bold text-on-background mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary-container text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined">water</span>
                </div>
                Sifat Fisik
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">Persentase Lumut (0-100%)</label>
                  <p className="text-xs text-on-surface-variant mb-3">Semakin tinggi berarti genangan sudah terbentuk lama.</p>
                  <div className="relative">
                    <input type="number" min="0" max="100" name="persentase_lumut" placeholder="cth. 68" className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 pr-10 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-on-surface-variant font-bold">%</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">Vegetasi (0-100%)</label>
                  <p className="text-xs text-on-surface-variant mb-3">Persentase vegetasi di sekitar genangan.</p>
                  <div className="relative">
                    <input type="number" min="0" max="100" name="persentase_vegetasi" placeholder="cth. 75" className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 pr-10 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-on-surface-variant font-bold">%</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-3">Luas Genangan</label>
                    <div className="relative">
                      <input type="number" min="0" step="any" name="luas_genangan_m2" placeholder="cth. 14" className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 pr-10 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-on-surface-variant font-bold">m²</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-3">Kedalaman <span className="text-on-surface-variant font-normal">(Opsional)</span></label>
                    <div className="relative">
                      <input type="number" min="0" step="any" name="depth" placeholder="cth. 18" className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 pr-10 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-on-surface-variant font-bold">cm</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl p-6 md:p-8 bg-surface shadow-sm">
              <h3 className="text-xl font-bold text-on-background mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">eco</span>
                </div>
                Faktor Lingkungan
              </h3>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-4">Air Tenang</label>
                  <div className="flex gap-4">
                    {[
                      { value: "yes", label: "Ya" },
                      { value: "no", label: "Tidak" },
                    ].map((opt, i) => (
                      <label key={opt.value} className="flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border border-outline bg-surface cursor-pointer hover:border-primary hover:bg-primary-subtle/50 transition-all">
                        <input className="w-5 h-5 text-primary border-outline focus:ring-primary" name="air_tenang" type="radio" value={opt.value} defaultChecked={i === 0} />
                        <span className="text-on-surface font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-4">Paparan Matahari</label>
                  <div className="space-y-3">
                    {[
                      { value: "low", label: "Rendah" },
                      { value: "medium", label: "Sedang" },
                      { value: "high", label: "Tinggi" },
                    ].map((opt, i) => (
                      <label key={opt.value} className="flex items-center gap-3 p-4 rounded-xl border border-outline bg-surface cursor-pointer hover:border-primary hover:bg-primary-subtle/50 transition-all">
                        <input className="w-5 h-5 text-primary border-outline focus:ring-primary" name="paparan_matahari" type="radio" value={opt.value} defaultChecked={i === 1} />
                        <span className="text-on-surface font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-3xl p-6 md:p-8 bg-surface shadow-sm">
            <h3 className="text-xl font-bold text-on-background mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary-container text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined">add_a_photo</span>
              </div>
              Foto Verifikasi <span className="text-xs font-bold px-2 py-1 bg-error-container text-on-error-container rounded-md uppercase tracking-wider ml-2">Wajib</span>
            </h3>
            
            <input
              ref={photoInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              type="file"
              name="foto"
              onChange={(e) => setPhotoFile(e.target.files?.[0]?.name ?? null)}
            />
            {photoFile ? (
              <div className="w-full border-2 border-primary-fixed-dim bg-primary-subtle/60 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[240px] text-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary-fixed mb-5">
                  <svg width="52" height="52" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="4" width="28" height="36" rx="4" fill="#dcf7c1" stroke="#89d927" strokeWidth="2"/>
                    <path d="M32 4 L38 10 L32 10 Z" fill="#b8e994" stroke="#89d927" strokeWidth="1.5" strokeLinejoin="round"/>
                    <rect x="15" y="16" width="16" height="12" rx="2" fill="#b8e994" stroke="#89d927" strokeWidth="1.5"/>
                    <circle cx="18" cy="19" r="1.5" fill="#89d927"/>
                    <path d="M15 25 L19 21 L23 25" stroke="#89d927" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 24 L24 21 L27 24" stroke="#89d927" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="40" cy="42" r="12" fill="#89d927"/>
                    <path d="M34 42 L38.5 46.5 L46.5 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <p className="text-base font-extrabold text-on-background mb-1">Foto dipilih!</p>
                <p className="text-sm text-on-surface-variant font-medium max-w-[240px] truncate mb-6">{photoFile}</p>

                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setTimeout(() => photoInputRef.current?.click(), 50); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-primary text-on-primary-fixed-variant text-sm font-bold hover:bg-primary-subtle transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                  Pilih Foto Lain
                </button>
              </div>
            ) : (
              <div onClick={() => photoInputRef.current?.click()} className="block w-full border-2 border-dashed border-outline hover:border-primary hover:bg-primary-subtle/50 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer min-h-[240px] text-center transition-all">
                <div className="w-16 h-16 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                </div>
                <p className="text-lg font-bold text-on-background mb-1">
                  Ketuk untuk mengambil atau pilih foto
                </p>
                <p className="text-sm text-on-surface-variant font-medium">
                  Pastikan genangan terlihat jelas beserta area sekitarnya.
                </p>
              </div>
            )}
          </section>

          <div className="pt-4 flex flex-col items-end gap-3">
            {error && (
              <div className="w-full px-4 py-3 rounded-xl bg-error-container border border-error text-on-error-container text-sm font-medium">
                {error}
              </div>
            )}
            <button
              type="submit"
              id="submit-laporan"
              disabled={submitting}
              className="group w-full md:w-auto px-10 py-4 rounded-full bg-primary text-on-primary font-bold text-sm shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Mengirim..." : "Kirim Laporan"}
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">{submitting ? "hourglass_top" : "send"}</span>
            </button>
          </div>
        </form>
      </main>

      <footer className="w-full text-center py-8 text-sm font-medium text-on-surface-variant bg-transparent">
        © 2026 MalariaWatch. Dibangun untuk komunitas yang lebih sehat.
      </footer>
    </div>
  );
}
