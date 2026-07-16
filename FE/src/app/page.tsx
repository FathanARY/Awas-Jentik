import Link from "next/link";

export const metadata = {
  title: "MalariaWatch — Citizen Portal",
  description:
    "Your puddle report helps prevent the spread of malaria in the community.",
};

export default function HomePage() {
  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* TopAppBar */}
      <header
        className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-12 h-16 shadow-sm"
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-outline-variant)",
        }}
      >
        <div
          className="text-xl font-bold"
          style={{ color: "var(--color-primary)" }}
        >
          MalariaWatch
        </div>
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-full transition-colors"
            style={{ color: "var(--color-on-surface-variant)" }}
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            className="p-2 rounded-full transition-colors"
            style={{ color: "var(--color-on-surface-variant)" }}
            aria-label="Account"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col px-4 md:px-12 py-6 gap-8 max-w-7xl mx-auto w-full pt-24 pb-28 md:pb-8">
        {/* Welcome Section */}
        <section className="flex flex-col gap-2">
          <h1
            className="text-2xl md:text-3xl font-semibold"
            style={{ color: "var(--color-on-surface)" }}
          >
            Fight Malaria Together
          </h1>
          <p
            className="text-base"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Your report helps prevent the spread of outbreaks in our community.
          </p>
        </section>

        {/* Primary CTA Area */}
        <section
          className="rounded-xl p-6 shadow-sm border flex flex-col gap-4 items-center text-center"
          style={{
            backgroundColor: "var(--color-surface-container-lowest)",
            borderColor: "var(--color-surface-container)",
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
            style={{
              backgroundColor: "var(--color-primary-container)",
              color: "var(--color-on-primary-container)",
            }}
          >
            <span className="material-symbols-outlined filled-icon text-4xl">
              water_drop
            </span>
          </div>
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--color-on-surface)" }}
          >
            Found a Water Puddle?
          </h2>
          <p
            className="text-base max-w-md"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Malaria mosquitoes breed in water puddles. Report immediately so the
            team can take preventive action.
          </p>
          <Link
            href="/lapor"
            id="cta-lapor"
            className="mt-2 px-8 py-3 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2 w-full md:w-auto justify-center"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-on-primary)",
            }}
          >
            <span className="material-symbols-outlined text-sm">
              add_location
            </span>
            Report Water Puddle
          </Link>
        </section>

        {/* Community Map */}
        <section className="flex flex-col gap-4 flex-grow">
          <div className="flex justify-between items-end">
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--color-on-surface)" }}
            >
              Community Map
            </h2>
            <a
              href="#"
              className="text-sm font-medium flex items-center gap-1 hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              See Full
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </a>
          </div>
          <div
            className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-sm border"
            style={{
              borderColor: "var(--color-surface-container-high)",
              backgroundColor: "var(--color-surface-container-lowest)",
            }}
          >
            {/* Map fallback */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDfXV87APQ-roIxUdWzBdwENFHnv6MDTppT8YoH5osci4yeFwNdocA7w9y8EIPM9-6e21NLs7NZampfV3ZNvPYuTu18nTRq9QVOCFUNLE7sUV1rxwevx8f4H8tUfCLBq_5FenCGEEHJ66AmHZbQ3dEq27prM805i36ZJWwQpUg9yar2orsNwU1GtQZsvS_qiGljOE-60o7PRAgAtpeHBP-LnlpHjkGyXOYiWK8me-qsirCqQ4XRVAc4aw')",
              }}
            />
            {/* Floating info card */}
            <div
              className="absolute bottom-4 left-4 right-4 md:right-auto md:w-64 p-2 rounded-lg shadow-lg border backdrop-blur-sm"
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                borderColor: "var(--color-surface-container)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: "var(--color-error)" }}
                />
                <div className="flex flex-col">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    3 Active Hotspots
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    Within 2km radius
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats — Desktop */}
        <section className="hidden md:grid grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: "check_circle",
              bg: "var(--color-secondary-container)",
              fg: "var(--color-on-secondary-container)",
              value: "124",
              label: "Completed Reports",
            },
            {
              icon: "pending_actions",
              bg: "var(--color-tertiary-container)",
              fg: "var(--color-on-tertiary-container)",
              value: "12",
              label: "In Progress",
            },
            {
              icon: "group",
              bg: "var(--color-primary-container)",
              fg: "var(--color-on-primary-container)",
              value: "850",
              label: "Active Citizens",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl shadow-sm border flex items-start gap-4"
              style={{
                backgroundColor: "var(--color-surface-container-lowest)",
                borderColor: "var(--color-surface-container)",
              }}
            >
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: stat.bg, color: stat.fg }}
              >
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <div>
                <h3
                  className="text-2xl font-semibold"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  {stat.value}
                </h3>
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Bottom Nav — Mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 shadow-lg rounded-t-xl"
        style={{ backgroundColor: "var(--color-surface-container)" }}
      >
        <button
          className="flex flex-col items-center justify-center px-4 py-1 rounded-full"
          style={{
            backgroundColor: "var(--color-secondary-container)",
            color: "var(--color-on-secondary-container)",
          }}
        >
          <span className="material-symbols-outlined filled-icon text-lg">
            home
          </span>
          <span
            className="text-xs font-bold mt-1"
            style={{ color: "var(--color-primary)" }}
          >
            Home
          </span>
        </button>
        <Link
          href="/lapor"
          className="flex flex-col items-center justify-center"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <span className="material-symbols-outlined text-lg">
            medical_services
          </span>
          <span className="text-xs mt-1">Report</span>
        </Link>
        <button
          className="flex flex-col items-center justify-center"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <span className="material-symbols-outlined text-lg">map</span>
          <span className="text-xs mt-1">Map</span>
        </button>
        <button
          className="flex flex-col items-center justify-center"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <span className="material-symbols-outlined text-lg">person</span>
          <span className="text-xs mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
