import Link from "next/link";

export const metadata = {
  title: "MalariaWatch — Portal Warga",
  description:
    "Laporan genangan Anda membantu mencegah penyebaran malaria di komunitas.",
};

import Header from "@/components/Header";
import LiveCommunityMap from "@/components/LiveCommunityMap";

export default function HomePage() {
  return (
    <div className="min-h-screen relative font-sans text-on-background bg-background">
      <Header />

      {/* Hero — Water Ripple Signature */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center min-h-[85vh] md:min-h-[90vh] text-center px-6 pt-20 water-surface">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            {[0, 1.5, 3, 4.5].map((delay, i) => (
              <div
                key={i}
                className="ripple-ring absolute inset-0 rounded-full border border-primary/30"
                style={{
                  animation: `rippleExpand 6s ease-out infinite`,
                  animationDelay: `${delay}s`,
                }}
              />
            ))}
            <div
              className="ripple-droplet absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-primary/60"
              style={{ animation: 'dropletFall 6s ease-out infinite' }}
            />
          </div>
        </div>

        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-bold tracking-[-0.03em] text-on-background mb-5 leading-[1.05] max-w-2xl">
          Awas<span className="text-primary">Jentik</span>
        </h1>
        <p className="text-lg md:text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed font-medium">
          Satu laporan genangan air bisa mencegah satu wabah malaria. Laporkan genangan di sekitar Anda dalam 2 menit.
        </p>
        <Link
          href="/lapor"
          className="group px-8 py-4 rounded-full bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">add_location</span>
          Laporkan Genangan
        </Link>

        <div className="mt-16 md:mt-20 flex gap-10 md:gap-16 text-center">
          {[
            { value: "124", label: "Laporan Ditangani" },
            { value: "850+", label: "Warga Aktif" },
            { value: "4", label: "Kategori Risiko" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-extrabold text-on-background tracking-tight">{stat.value}</div>
              <div className="text-xs md:text-sm font-semibold text-on-surface-variant mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-24">
        <div className="rounded-3xl bg-surface border border-outline-variant shadow-sm overflow-hidden">
          <LiveCommunityMap />
        </div>
      </section>

      <footer className="w-full text-center py-8 text-sm font-medium text-on-surface-variant border-t border-outline-variant bg-surface">
        © 2026 MalariaWatch. Dibangun untuk komunitas yang lebih sehat.
      </footer>
    </div>
  );
}
