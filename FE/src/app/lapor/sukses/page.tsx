import Link from "next/link";

export const metadata = {
  title: "Report Submitted — MalariaWatch",
  description: "Your puddle report has been successfully submitted and is being processed.",
};

export default function LaporSuksesPage() {
  return (
    <div
      className="flex flex-col min-h-dvh items-center justify-center p-4 md:p-12"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <main
        className="w-full max-w-2xl rounded-xl shadow-lg border overflow-hidden flex flex-col animate-enter opacity-0"
        style={{
          backgroundColor: "var(--color-surface-container-lowest)",
          borderColor: "rgba(196,197,213,0.3)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 pt-8 pb-4 flex flex-col items-center text-center border-b relative"
          style={{
            backgroundColor: "var(--color-surface-bright)",
            borderColor: "rgba(196,197,213,0.3)",
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4 relative"
            style={{ backgroundColor: "rgba(30,64,175,0.1)" }}
          >
            {/* Decorative rings */}
            <div
              className="absolute inset-0 rounded-full border-2 scale-110"
              style={{ borderColor: "rgba(0,40,142,0.2)" }}
            />
            <div
              className="absolute inset-0 rounded-full border scale-125"
              style={{ borderColor: "rgba(0,40,142,0.1)" }}
            />
            <span
              className="material-symbols-outlined filled-icon"
              style={{ fontSize: 48, color: "var(--color-primary)" }}
            >
              check_circle
            </span>
          </div>
          <h1
            className="text-2xl font-semibold mb-1"
            style={{ color: "var(--color-on-surface)" }}
          >
            Report Submitted!
          </h1>
          <p
            className="text-base max-w-md"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Your observation data has entered the central surveillance system and
            is being processed.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 flex flex-col gap-8">
          {/* Risk Score Banner */}
          <div
            className="animate-enter opacity-0 delay-100 rounded-lg p-6 border-l-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
            style={{
              backgroundColor: "var(--color-error-container)",
              borderLeftColor: "var(--color-error)",
            }}
          >
            <div
              className="absolute right-0 top-0 w-32 h-32 rounded-full -mr-16 -mt-16 pointer-events-none"
              style={{ backgroundColor: "var(--color-error)", opacity: 0.05 }}
            />
            <div className="flex items-center gap-4 relative z-10">
              <div
                className="p-2 rounded-full"
                style={{
                  backgroundColor: "rgba(186,26,26,0.1)",
                  color: "var(--color-error)",
                }}
              >
                <span className="material-symbols-outlined filled-icon text-xl">
                  warning
                </span>
              </div>
              <div>
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--color-on-error-container)" }}
                >
                  Risk Score: 85/100
                </h2>
                <p
                  className="text-base mt-1"
                  style={{ color: "rgba(147,0,10,0.8)" }}
                >
                  This area is designated as a High Alert Zone.
                </p>
              </div>
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider relative z-10 self-start md:self-auto"
              style={{
                backgroundColor: "var(--color-error)",
                color: "var(--color-on-error)",
              }}
            >
              Critical
            </div>
          </div>

          {/* Map View */}
          <div className="animate-enter opacity-0 delay-200 flex flex-col gap-2">
            <h3
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-outline)" }}
            >
              Report Location
            </h3>
            <div
              className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden border shadow-sm group"
              style={{
                borderColor: "var(--color-outline-variant)",
                backgroundColor: "var(--color-surface-container-high)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBl1RWFJZ-FaPvXD3bVbrynrWTnvZn9DBaazQ6XCi5KBOTrNWUcBsRBxn8Q50atrR_gOn2d8PX34vMt9cLarBsGFkVC5pxeEMhcT9Gp05-QuOiJN9oWlGZhUQvrUYHaYAxpo7aNZHNxG1xNLNvdbHaPUYHvGkd_uTk2ZkGGTBip0UMSZmrpwqfAmhzV07V_6TlShY0F7DuxvZoRwiR_UG9jRrp_h42nBSUqNgr-0Q0O08YEQEcRQuavRQ"
                alt="Report location map"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: "rgba(33,49,69,0.1)" }}
              >
                <div className="relative flex items-center justify-center">
                  <div
                    className="absolute w-12 h-12 rounded-full animate-ping"
                    style={{ backgroundColor: "rgba(186,26,26,0.3)" }}
                  />
                  <div
                    className="absolute w-6 h-6 rounded-full"
                    style={{ backgroundColor: "rgba(186,26,26,0.4)" }}
                  />
                  <span
                    className="material-symbols-outlined filled-icon text-xl relative z-10 drop-shadow-md"
                    style={{ color: "var(--color-error)" }}
                  >
                    location_on
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="animate-enter opacity-0 delay-300 flex flex-col gap-4">
            <h3
              className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
              style={{ color: "var(--color-outline)" }}
            >
              <span className="material-symbols-outlined text-sm">list_alt</span>
              Action Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: "water_damage",
                  title: "Drain Puddle",
                  desc: "Do this within the next 3 days.",
                },
                {
                  icon: "bed",
                  title: "Use Mosquito Net",
                  desc: "Ensure sleeping area is protected.",
                },
                {
                  icon: "medical_services",
                  title: "Contact Health Center",
                  desc: "Seek nearest facility immediately.",
                },
              ].map((rec) => (
                <div
                  key={rec.title}
                  className="p-4 rounded-lg border shadow-sm flex flex-row md:flex-col items-center md:items-start gap-4 transition-colors"
                  style={{
                    backgroundColor: "var(--color-surface-container)",
                    borderColor: "rgba(196,197,213,0.5)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "var(--color-secondary-container)",
                      color: "var(--color-on-secondary-container)",
                    }}
                  >
                    <span className="material-symbols-outlined filled-icon">
                      {rec.icon}
                    </span>
                  </div>
                  <div className="flex-1 md:text-left">
                    <h4
                      className="text-sm font-medium"
                      style={{ color: "var(--color-on-surface)" }}
                    >
                      {rec.title}
                    </h4>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      {rec.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Action */}
          <div
            className="pt-4 mt-2 border-t"
            style={{ borderColor: "rgba(196,197,213,0.3)" }}
          >
            <Link
              href="/"
              id="kembali-beranda"
              className="w-full py-4 px-6 rounded-full flex justify-center items-center gap-2 shadow-md transition-all active:scale-[0.98] text-sm font-medium"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-on-primary)",
              }}
            >
              <span className="material-symbols-outlined">home</span>
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
