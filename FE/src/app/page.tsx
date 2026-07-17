import Link from "next/link";

export const metadata = {
  title: "MalariaWatch — Portal Warga",
  description:
    "Laporan genangan Anda membantu mencegah penyebaran malaria di komunitas.",
};

import Header from "@/components/Header";
import LiveCommunityMap from "@/components/LiveCommunityMap";
import FlyingMosquito from "@/components/FlyingMosquito";

export default function HomePage() {
  return (
    <div className="min-h-screen relative font-sans text-on-background">
      <div className="fixed inset-0 z-[-1] bg-background">
        <div className="absolute top-0 -left-10 w-96 h-96 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-10 w-96 h-96 bg-secondary-container rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-primary-fixed-dim rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
      </div>

      <Header />

      <main className="max-w-5xl mx-auto px-6 pt-36 pb-28 md:pb-20">
        <section className="relative overflow-hidden flex flex-col items-center text-center mt-8 mb-20 md:mt-16 md:mb-24">
          <FlyingMosquito />
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-on-background max-w-3xl leading-[1.1] mb-6">
            Stop Malaria <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">Before It Spreads.</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mb-10 leading-relaxed font-medium">
            Nyamuk berkembang biak di air tergenang. Laporan Anda membantu tim tanggap cepat mendeteksi dan menghilangkan genangan berisiko tinggi secara real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/lapor"
              className="group w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-on-primary font-bold text-sm shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">add_location</span>
              Laporkan Genangan
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-2 rounded-3xl p-6 md:p-8 bg-surface backdrop-blur-xl border border-outline-variant shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-fixed to-transparent opacity-50 rounded-bl-full pointer-events-none" />
            <LiveCommunityMap />
          </div>

          <div className="flex flex-col gap-6 md:gap-8">
            <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-inverse-surface to-inverse-surface text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary rounded-full blur-3xl opacity-30 pointer-events-none" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-primary-fixed">
                  <span className="material-symbols-outlined text-xl">analytics</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Dampak Kami</h2>
                <p className="text-on-surface-variant font-medium text-sm">Bersama kita membuat perubahan.</p>
              </div>
              
              <div className="mt-8 flex flex-col gap-5">
                <div>
                  <div className="text-4xl font-extrabold text-white mb-1">124</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-primary-fixed-dim">Laporan Ditangani</div>
                </div>
                <div className="h-px w-full bg-white/10" />
                <div>
                  <div className="text-4xl font-extrabold text-white mb-1">850+</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-primary-fixed-dim">Warga Aktif</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-6 md:p-8 bg-surface shadow-sm flex flex-col justify-center">
              <div className="mb-4 relative w-12 h-12">
                <span className="material-symbols-outlined text-[3.5rem] text-primary leading-none">person</span>
                <div className="absolute -bottom-1 -right-1 bg-surface rounded-full">
                  <span className="material-symbols-outlined text-2xl text-primary leading-none filled-icon">verified_user</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-on-background mb-3 tracking-tight mt-2">AI di Mana Saja</h3>
              <p className="text-base text-on-surface-variant font-semibold leading-snug">
                Laporkan. Kumpulkan titik berkualitas dan dukung tim yang lengkap.
              </p>
            </div>
          </div>

          <div className="rounded-3xl p-6 md:p-8 bg-surface backdrop-blur-xl border border-outline-variant shadow-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-subtle text-primary flex items-center justify-center mb-6 shadow-sm">
              <span className="material-symbols-outlined text-3xl">memory</span>
            </div>
            <h3 className="text-xl font-bold text-on-background mb-3">Verifikasi AI</h3>
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
              Setiap foto yang Anda kirim dianalisis otomatis oleh AI kami untuk mengonfirmasi karakteristik tempat perkembangbiakan, memastikan tim tanggap cepat memprioritaskan area risiko tertinggi.
            </p>
          </div>

          <div className="md:col-span-2 rounded-3xl p-6 md:p-8 bg-primary text-on-primary shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-20 pointer-events-none" />
            
            <div className="relative z-10 max-w-sm text-center sm:text-left">
              <h3 className="text-2xl font-bold mb-2">Siap berkontribusi?</h3>
              <p className="text-primary-fixed font-medium text-sm">Hanya butuh 2 menit untuk melaporkan genangan air mencurigakan dan menyelamatkan nyawa.</p>
            </div>
            
            <Link
              href="/lapor"
              className="relative z-10 px-8 py-4 rounded-full bg-on-primary text-primary font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all whitespace-nowrap flex items-center gap-2"
            >
              Mulai Melapor
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="w-full text-center py-8 text-sm font-medium text-on-surface-variant border-t border-outline-variant bg-surface">
        © 2026 MalariaWatch. Dibangun untuk komunitas yang lebih sehat.
      </footer>
    </div>
  );
}
