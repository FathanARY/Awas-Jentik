import Link from "next/link";

export function generateStaticParams() {
  return [
    { id: "MW-2023-089" },
    { id: "MW-2023-090" },
    { id: "MW-2023-091" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: `Report Detail #${id} — MalariaWatch Admin`,
    description: `Field observation details and AI consistency check for report #${id}.`,
  };
}

export default async function AdminLaporanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Contextual Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-outline-variant)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              aria-label="Back"
              className="p-2 -ml-2 rounded-full transition-colors flex items-center"
              style={{ color: "var(--color-on-surface)" }}
            >
              <span className="material-symbols-outlined text-2xl">
                arrow_back
              </span>
            </Link>
            <div>
              <h1
                className="text-xl font-semibold"
                style={{ color: "var(--color-on-surface)" }}
              >
                Report Detail #{id}
              </h1>
              <p
                className="text-xs"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Sukamaju Village • Uploaded 24 Oct 2023, 14:30 WIB
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
              style={{
                backgroundColor: "var(--color-surface-container-highest)",
                color: "var(--color-on-surface-variant)",
              }}
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              Pending Action
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-12 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <section
              className="rounded-xl border shadow-sm overflow-hidden flex flex-col"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <div
                className="p-4 border-b flex items-center gap-2"
                style={{ borderColor: "var(--color-outline-variant)" }}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ color: "var(--color-primary)" }}
                >
                  fact_check
                </span>
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  Field Observation Data
                </h2>
              </div>
              <div className="p-4 flex flex-col gap-6">
                {/* Photo */}
                <div className="space-y-3">
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    Location Photo Evidence
                  </h3>
                  <div
                    className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden border"
                    style={{
                      backgroundColor: "var(--color-surface-container)",
                      borderColor: "var(--color-outline-variant)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGjWqPdMeWzM0wrCXqAMt70X9e_eb9PBlH4ST1s_7x4Iemi6o5kgOSZwqgqL08z0T6S8730o9forREgKx_H0ctVYzVweunEfDFOltKm49tA4podgd-Ucm00Qt7mJ0q2BwAzR-bqgk3gjB9C86DhMbOU1Pcfr1QPKdd7mXemOZnifRXIM8072C5r2n9SyrqXnUcuPjciEQQlWDonjzwIQSQHM1i4vFrRGIhUrzs8B5y4JacSNlRMtmwvg"
                      alt="Observation location photo"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs backdrop-blur-sm flex items-center gap-1"
                      style={{
                        backgroundColor: "rgba(33,49,69,0.8)",
                        color: "var(--color-inverse-on-surface)",
                      }}
                    >
                      <span className="material-symbols-outlined text-sm">
                        location_on
                      </span>
                      -6.200000, 106.816666
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-3">
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    Visual Inspection Results
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Clear Water Puddle", value: "Yes", highlight: true },
                      { label: "Mosquito Larvae Visible", value: "Yes", highlight: true },
                      { label: "Dense Vegetation Cover", value: "Yes", highlight: true },
                      { label: "Distance to Settlement", value: "< 50 Meter", highlight: false },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start justify-between p-3 rounded-lg border"
                        style={{
                          backgroundColor: "var(--color-surface-container-low)",
                          borderColor: "rgba(196,197,213,0.5)",
                        }}
                      >
                        <span
                          className="text-base"
                          style={{ color: "var(--color-on-surface)" }}
                        >
                          {item.label}
                        </span>
                        <span
                          className="text-sm font-bold px-2 py-0.5 rounded"
                          style={
                            item.highlight
                              ? {
                                  backgroundColor: "var(--color-primary-fixed)",
                                  color: "var(--color-primary)",
                                }
                              : {
                                  backgroundColor: "var(--color-surface-container)",
                                  color: "var(--color-on-surface-variant)",
                                }
                          }
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* AI Consistency Check */}
            <section
              className="rounded-xl border shadow-sm overflow-hidden"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{
                  backgroundColor: "var(--color-surface-bright)",
                  borderColor: "var(--color-outline-variant)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    memory
                  </span>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    AI Consistency Check
                  </h2>
                </div>
                <span
                  className="px-2 py-1 rounded text-xs font-bold flex items-center gap-1"
                  style={{
                    backgroundColor: "var(--color-secondary-container)",
                    color: "var(--color-on-secondary-container)",
                  }}
                >
                  Confidence: 94%
                </span>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {[
                    { item: "Vegetation", result: "Match", icon: "check_circle", color: "var(--color-primary)" },
                    { item: "Clear Water", result: "Match", icon: "check_circle", color: "var(--color-primary)" },
                    {
                      item: "Location Condition",
                      result: "High Consistency",
                      icon: "verified",
                      color: "var(--color-secondary)",
                    },
                  ].map((row, i) => (
                    <tr
                      key={row.item}
                      className="border-b transition-colors"
                      style={{
                        borderColor:
                          i < 2 ? "rgba(196,197,213,0.3)" : "transparent",
                      }}
                    >
                      <td
                        className="py-3 px-4 text-base"
                        style={{ color: "var(--color-on-surface)" }}
                      >
                        {row.item}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className="inline-flex items-center gap-1 text-sm"
                          style={{ color: row.color }}
                        >
                          <span
                            className="material-symbols-outlined text-sm"
                            style={{ color: row.color }}
                          >
                            {row.icon}
                          </span>
                          {row.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Final Area Score */}
            <section
              className="rounded-xl border shadow-sm p-4 flex flex-col items-center text-center"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <h2
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Final Area Score
              </h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span
                  className="font-bold"
                  style={{ fontSize: 48, lineHeight: 1, color: "var(--color-on-surface)" }}
                >
                  88
                </span>
                <span
                  className="text-lg"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  / 100
                </span>
              </div>
              <div
                className="px-4 py-1.5 rounded-full flex items-center gap-2"
                style={{
                  backgroundColor: "var(--color-error-container)",
                  color: "var(--color-on-error-container)",
                }}
              >
                <span className="material-symbols-outlined text-lg">warning</span>
                <span className="text-xl font-semibold">Critical</span>
              </div>
              <p
                className="text-sm mt-4"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Score indicates a high probability of an active malaria vector breeding site. Immediate action is recommended.
              </p>
            </section>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-end gap-4"
          style={{ borderColor: "var(--color-outline-variant)" }}
        >
          <button
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
            }}
          >
            <span className="material-symbols-outlined text-lg">rule</span>
            Manual Verification
          </button>
          <button
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
            style={{
              backgroundColor: "var(--color-secondary)",
              color: "var(--color-on-secondary)",
            }}
          >
            <span className="material-symbols-outlined text-lg">pest_control</span>
            Schedule Fogging
          </button>
          <button
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-on-primary)",
            }}
          >
            <span className="material-symbols-outlined text-lg">done_all</span>
            Mark as Resolved
          </button>
        </div>
      </main>
    </div>
  );
}
