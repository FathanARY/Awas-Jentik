import Link from "next/link";

export const metadata = {
  title: "MalariaWatch — Citizen Portal",
  description:
    "Your puddle report helps prevent the spread of malaria in the community.",
};

import Header from "@/components/Header";

export default function HomePage() {
  return (
    <div className="min-h-screen relative font-sans text-slate-800 selection:bg-blue-200 selection:text-blue-900">
      {/* Modern Gradient Background */}
      <div className="fixed inset-0 z-[-1] bg-[#f8fafc]">
        <div className="absolute top-0 -left-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-10 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
      </div>

      <Header />

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 pt-36 pb-28 md:pb-20">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mt-8 mb-20 md:mt-16 md:mb-24">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl leading-[1.1] mb-6">
            Stop Malaria <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Before It Spreads.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed font-medium">
            Mosquitoes breed in stagnant water. Your reports help our rapid response team detect and eliminate high-risk puddles in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/lapor"
              className="group w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">add_location</span>
              Report a Puddle
            </Link>
          </div>
        </section>

        {/* Features Bento Box */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Card 1: Community Map (Spans 2 columns on desktop) */}
          <div className="md:col-span-2 rounded-3xl p-6 md:p-8 bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100 to-transparent opacity-50 rounded-bl-full pointer-events-none" />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-xl">map</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Live Community Map</h2>
                <p className="text-slate-500 font-medium">Tracking hotspots in real-time.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700">3 Active Hotspots</span>
              </div>
            </div>
            
            <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-slate-200 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfXV87APQ-roIxUdWzBdwENFHnv6MDTppT8YoH5osci4yeFwNdocA7w9y8EIPM9-6e21NLs7NZampfV3ZNvPYuTu18nTRq9QVOCFUNLE7sUV1rxwevx8f4H8tUfCLBq_5FenCGEEHJ66AmHZbQ3dEq27prM805i36ZJWwQpUg9yar2orsNwU1GtQZsvS_qiGljOE-60o7PRAgAtpeHBP-LnlpHjkGyXOYiWK8me-qsirCqQ4XRVAc4aw"
                alt="Community Map Preview"
                className="w-full h-full object-cover filter brightness-[1.05] contrast-[1.05] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
            </div>
          </div>

          {/* Card 2: Quick Stats */}
          <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-30 pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 text-indigo-300">
                <span className="material-symbols-outlined text-xl">analytics</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Our Impact</h2>
              <p className="text-slate-300 font-medium text-sm">Together we&apos;re making a difference.</p>
            </div>
            
            <div className="mt-8 flex flex-col gap-5">
              <div>
                <div className="text-4xl font-extrabold text-white mb-1">124</div>
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-300">Completed Reports</div>
              </div>
              <div className="h-px w-full bg-white/10" />
              <div>
                <div className="text-4xl font-extrabold text-white mb-1">850+</div>
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-300">Active Citizens</div>
              </div>
            </div>
          </div>

          {/* Card 3: AI Verification */}
          <div className="rounded-3xl p-6 md:p-8 bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 shadow-sm border border-indigo-100">
              <span className="material-symbols-outlined text-3xl">memory</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">AI-Powered Verification</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Every photo you submit is automatically analyzed by our AI to confirm breeding site characteristics, ensuring our rapid response teams prioritize the highest risk areas first.
            </p>
          </div>

          {/* Card 4: Action Ready */}
          <div className="md:col-span-2 rounded-3xl p-6 md:p-8 bg-blue-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 pointer-events-none" />
            
            <div className="relative z-10 max-w-sm text-center sm:text-left">
              <h3 className="text-2xl font-bold mb-2">Ready to contribute?</h3>
              <p className="text-blue-100 font-medium text-sm">It only takes 2 minutes to report a suspicious water puddle and save lives.</p>
            </div>
            
            <Link
              href="/lapor"
              className="relative z-10 px-8 py-4 rounded-full bg-white text-blue-700 font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all whitespace-nowrap flex items-center gap-2"
            >
              Start Reporting
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-sm font-medium text-slate-500 border-t border-slate-200 bg-white/30 backdrop-blur-md">
        © 2026 MalariaWatch. Built for a healthier community.
      </footer>
    </div>
  );
}
