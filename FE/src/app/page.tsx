import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "MalariaWatch — Portal Warga",
  description:
    "Laporan genangan Anda membantu mencegah penyebaran malaria di komunitas.",
};

import Header from "@/components/Header";
import LiveCommunityMap from "@/components/LiveCommunityMap";

// ── Feature cards data ─────────────────────────────────────────────────────
const features = [
  {
    icon: "water_drop",
    title: "Deteksi Genangan",
    desc: "Laporkan titik genangan air di sekitar Anda dengan foto dan lokasi GPS dalam hitungan detik.",
    color: "from-[#89d927]/20 to-[#b8e994]/10",
    iconColor: "text-[#5c8a1a]",
    delay: "0ms",
  },
  {
    icon: "psychology",
    title: "AI Risiko Malaria",
    desc: "Model AI ganda menganalisis habitat nyamuk & pola mobilitas warga untuk skor risiko akurat.",
    color: "from-[#ff9f0a]/15 to-[#ffe6b3]/10",
    iconColor: "text-[#ff9f0a]",
    delay: "80ms",
  },
  {
    icon: "map",
    title: "Peta Risiko Live",
    desc: "Heatmap real-time menampilkan sebaran risiko per wilayah agar warga & kader selalu waspada.",
    color: "from-[#5e8a3c]/15 to-[#bff09e]/10",
    iconColor: "text-[#5e8a3c]",
    delay: "160ms",
  },
  {
    icon: "notifications_active",
    title: "Notifikasi Cepat",
    desc: "Terima peringatan dini saat risiko di area Anda meningkat, sebelum jentik berkembang menjadi wabah.",
    color: "from-[#89d927]/15 to-[#dcf7c1]/10",
    iconColor: "text-[#3d6600]",
    delay: "240ms",
  },
  {
    icon: "groups",
    title: "Komunitas Aktif",
    desc: "850+ warga & kader bersama membangun sistem peringatan dini berbasis laporan nyata dari lapangan.",
    color: "from-[#ff9f0a]/10 to-[#ffc966]/10",
    iconColor: "text-[#ff9f0a]",
    delay: "320ms",
  },
  {
    icon: "verified_user",
    title: "Validasi Kader",
    desc: "Setiap laporan diverifikasi oleh kader kesehatan terlatih sebelum diteruskan ke Puskesmas setempat.",
    color: "from-[#89d927]/20 to-[#b8e994]/10",
    iconColor: "text-[#5c8a1a]",
    delay: "400ms",
  },
];

// ── How-it-works steps ─────────────────────────────────────────────────────
const steps = [
  {
    num: "01",
    icon: "photo_camera",
    title: "Foto & Lokasi",
    desc: "Ambil foto genangan, izinkan akses GPS — lokasi terisi otomatis.",
  },
  {
    num: "02",
    icon: "send",
    title: "Kirim Laporan",
    desc: "Isi detail singkat dan kirim dalam kurang dari 2 menit.",
  },
  {
    num: "03",
    icon: "manage_search",
    title: "AI Analisis",
    desc: "Model kami menghitung skor risiko berdasarkan habitat & mobilitas.",
  },
  {
    num: "04",
    icon: "health_and_safety",
    title: "Tindakan Nyata",
    desc: "Kader & Puskesmas mendapat notifikasi dan segera menindaklanjuti.",
  },
];

// ── Risk levels ────────────────────────────────────────────────────────────
const risks = [
  { label: "Rendah", color: "#b8e994", textColor: "#1a3300", desc: "Pantau berkala", icon: "check_circle" },
  { label: "Sedang", color: "#ffc966", textColor: "#592d00", desc: "Waspada aktif", icon: "warning" },
  { label: "Tinggi", color: "#ff8c42", textColor: "#ffffff", desc: "Tindakan segera", icon: "priority_high" },
  { label: "Kritis", color: "#ff453a", textColor: "#ffffff", desc: "Darurat wabah", icon: "emergency" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen relative font-sans text-on-background bg-background overflow-x-hidden">
      <Header />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center min-h-[90vh] text-center px-6 pt-24 hero-mesh water-surface">

        {/* Dot grid layer */}
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" aria-hidden />

        {/* Ripple rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            {[0, 1.5, 3, 4.5].map((delay, i) => (
              <div
                key={i}
                className="ripple-ring absolute inset-0 rounded-full border border-primary/30"
                style={{ animation: `rippleExpand 6s ease-out infinite`, animationDelay: `${delay}s` }}
              />
            ))}
            <div
              className="ripple-droplet absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary/60"
              style={{ animation: "dropletFall 6s ease-out infinite" }}
            />
          </div>
        </div>

        {/* Floating mascot — left */}
        <div
          className="float-mascot absolute left-[3%] top-[18%] w-28 md:w-40 pointer-events-none select-none opacity-90"
          aria-hidden
        >
          <Image
            src="/assets/mascot-fly.png"
            alt=""
            width={160}
            height={160}
            className="w-full h-auto drop-shadow-xl"
            priority
          />
        </div>

        {/* Floating mascot — bottom right */}
        <div
          className="float-mascot-alt absolute right-[4%] bottom-[12%] w-24 md:w-36 pointer-events-none select-none opacity-80"
          style={{ animationDelay: "1.2s" }}
          aria-hidden
        >
          <Image
            src="/assets/mascot-leaf.png"
            alt=""
            width={140}
            height={140}
            className="w-full h-auto drop-shadow-xl"
            priority
          />
        </div>

        {/* Floating mascot — top right */}
        <div
          className="float-mascot-slow absolute right-[10%] top-[10%] w-16 md:w-24 pointer-events-none select-none opacity-60"
          style={{ animationDelay: "2.5s" }}
          aria-hidden
        >
          <Image
            src="/assets/mascot-think.png"
            alt=""
            width={96}
            height={96}
            className="w-full h-auto drop-shadow-lg"
            priority
          />
        </div>

        {/* Decorative blobs */}
        <div
          className="absolute -left-20 -top-20 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle, #89d927 0%, transparent 70%)" }}
          aria-hidden
        />
        <div
          className="absolute -right-24 top-1/3 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #ff9f0a 0%, transparent 70%)" }}
          aria-hidden
        />

        <h1
          className="fade-in-up font-display text-6xl sm:text-7xl md:text-8xl font-bold tracking-[-0.03em] text-on-background mb-5 leading-[1.05] max-w-2xl"
          style={{ animationDelay: "60ms" }}
        >
          Awas<span className="text-primary">Jentik</span>
        </h1>

        <p
          className="fade-in-up text-lg md:text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed font-medium"
          style={{ animationDelay: "120ms" }}
        >
          Satu laporan genangan air bisa mencegah satu wabah malaria.
          Laporkan genangan di sekitar Anda dalam&nbsp;2 menit.
        </p>

        {/* CTA buttons */}
        <div
          className="fade-in-up flex flex-col sm:flex-row gap-3 items-center"
          style={{ animationDelay: "180ms" }}
        >
          <Link
            href="/lapor"
            className="group px-8 py-4 rounded-full bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">
              add_location
            </span>
            Laporkan Genangan
          </Link>
          <Link
            href="/riwayat"
            className="px-8 py-4 rounded-full bg-surface border border-outline-variant text-on-surface font-bold text-sm hover:bg-surface-container hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">history</span>
            Lihat Riwayat
          </Link>
        </div>

        {/* Stats strip */}
        <div
          className="fade-in-up mt-16 md:mt-20 flex gap-10 md:gap-16 text-center"
          style={{ animationDelay: "260ms" }}
        >
          {[
            { value: "124", label: "Laporan Ditangani", icon: "task_alt" },
            { value: "850+", label: "Warga Aktif", icon: "groups" },
            { value: "4", label: "Kategori Risiko", icon: "bar_chart" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="material-symbols-outlined text-primary text-base mb-0.5">{stat.icon}</span>
              <div className="text-3xl md:text-4xl font-extrabold text-on-background tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm font-semibold text-on-surface-variant">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40 pointer-events-none" aria-hidden>
          <span className="material-symbols-outlined text-lg text-on-surface-variant" style={{ animation: "floatYReverse 2s ease-in-out infinite" }}>
            keyboard_arrow_down
          </span>
        </div>
      </section>

      {/* ── Feature Cards ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Fitur Unggulan</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-on-background mb-3">
            Satu Platform, Perlindungan Penuh
          </h2>
          <p className="text-on-surface-variant max-w-lg mx-auto text-base leading-relaxed">
            Dari laporan warga hingga analitik AI — semua tersedia agar komunitas Anda terlindungi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className={`card-hover fade-in-up rounded-2xl p-6 bg-gradient-to-br ${f.color} border border-outline-variant/60`}
              style={{ animationDelay: f.delay }}
            >
              <div className="w-11 h-11 rounded-xl bg-surface/80 flex items-center justify-center mb-4 shadow-sm">
                <span className={`material-symbols-outlined filled-icon text-xl ${f.iconColor}`}>{f.icon}</span>
              </div>
              <h3 className="text-base font-bold text-on-background mb-1.5">{f.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 bg-surface border-y border-outline-variant">
        {/* Background mascot decoration */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 md:w-64 opacity-10 pointer-events-none select-none" aria-hidden>
          <Image src="/assets/mascot-fly.png" alt="" width={256} height={256} className="w-full h-auto" />
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Cara Kerja</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-on-background mb-3">
              Mudah, Cepat, Berdampak
            </h2>
            <p className="text-on-surface-variant max-w-md mx-auto text-base">
              Empat langkah sederhana dari Anda ke tindakan nyata di lapangan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div
              className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none"
              aria-hidden
            />
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="fade-in-up flex flex-col items-center text-center gap-3"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined filled-icon text-3xl text-primary">{s.icon}</span>
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-on-primary text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-on-background mb-1">{s.title}</div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Risk Level Legend ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Kategori Risiko</p>
          <h2 className="font-display text-3xl font-bold text-on-background mb-3">
            Pahami Tingkat Bahaya di Area Anda
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {risks.map((r, i) => (
            <div
              key={r.label}
              className="card-hover fade-in-up rounded-2xl p-5 flex flex-col items-center gap-2 border border-outline-variant/50 shadow-sm"
              style={{ backgroundColor: r.color + "30", animationDelay: `${i * 80}ms` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: r.color }}
              >
                <span className="material-symbols-outlined filled-icon text-lg" style={{ color: r.textColor }}>
                  {r.icon}
                </span>
              </div>
              <div className="font-bold text-on-background">{r.label}</div>
              <div className="text-xs text-on-surface-variant font-medium">{r.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Map Section ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-8">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Peta Risiko</p>
          <h2 className="font-display text-3xl font-bold text-on-background mb-3">
            Situasi Komunitas Saat Ini
          </h2>
          <p className="text-on-surface-variant text-base max-w-md mx-auto">
            Heatmap diperbarui secara real-time berdasarkan laporan warga dan analisis AI.
          </p>
        </div>
        <div className="rounded-3xl bg-surface border border-outline-variant shadow-sm overflow-hidden">
          <LiveCommunityMap />
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#89d927] to-[#5e8a3c] p-10 md:p-14 text-center shadow-xl shadow-primary/20">
          <div className="absolute -left-6 bottom-0 w-32 md:w-44 pointer-events-none select-none opacity-25" aria-hidden>
            <Image src="/assets/mascot-leaf.png" alt="" width={176} height={176} className="w-full h-auto" />
          </div>
          <div className="absolute -right-4 top-0 w-28 md:w-40 pointer-events-none select-none opacity-20 float-mascot-slow" aria-hidden>
            <Image src="/assets/mascot-think.png" alt="" width={160} height={160} className="w-full h-auto" />
          </div>

          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-3">Mulai Sekarang</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Jadilah Bagian dari<br />Komunitas yang Lebih Sehat
            </h2>
            <p className="text-white/80 max-w-md mx-auto mb-8 leading-relaxed">
              Bergabunglah dengan 850+ warga aktif yang sudah berkontribusi mencegah wabah malaria di Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/lapor"
                className="group px-8 py-4 rounded-full bg-white text-[#3d6600] font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">add_location</span>
                Laporkan Genangan Sekarang
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 rounded-full border-2 border-white/40 text-white font-bold text-sm hover:bg-white/10 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                Daftar Akun Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-outline-variant bg-surface">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/assets/mascot-fly.png" alt="Awas Jentik" width={32} height={32} className="w-8 h-8" />
            <span className="font-display font-bold text-on-background">
              Awas<span className="text-primary">Jentik</span>
            </span>
          </div>
          <p className="text-sm font-medium text-on-surface-variant text-center">
            © 2026 MalariaWatch. Dibangun untuk komunitas yang lebih sehat.
          </p>
          <div className="flex gap-4">
            <Link href="/lapor" className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium">
              Lapor
            </Link>
            <Link href="/riwayat" className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium">
              Riwayat
            </Link>
            <Link href="/login" className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium">
              Masuk
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
