import Header from "@/components/Header";
import Link from "next/link";

export const metadata = {
  title: "Dashboard — MalariaWatch Admin",
  description: "MalariaWatch health worker surveillance dashboard.",
};

const areas = [
  {
    id: "MW-2023-089",
    name: "Kab. Asmat",
    region: "Papua Selatan",
    score: 92,
    level: "Critical",
    reports: 45,
    icon: "trending_up",
    borderColor: "var(--color-error)",
    chipBg: "var(--color-error-container)",
    chipFg: "var(--color-on-error-container)",
    scoreFg: "var(--color-error)",
  },
  {
    id: "MW-2023-090",
    name: "Kab. Mimika",
    region: "Papua Tengah",
    score: 85,
    level: "High",
    reports: 32,
    icon: "warning",
    borderColor: "var(--color-error)",
    chipBg: "var(--color-error-container)",
    chipFg: "var(--color-on-error-container)",
    scoreFg: "var(--color-error)",
  },
  {
    id: "MW-2023-091",
    name: "Kab. Sumba Timur",
    region: "Nusa Tenggara Timur",
    score: 68,
    level: "Medium",
    reports: 12,
    icon: "info",
    borderColor: "#f59e0b",
    chipBg: "#fef3c7",
    chipFg: "#92400e",
    scoreFg: "#b45309",
  },
];

export default function AdminDashboardPage() {
  return (
    <div
      className="flex min-h-dvh"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Alert Banner */}
      <div
        className="fixed top-0 left-0 w-full z-[60] py-2 px-6 flex items-center justify-center shadow-lg"
        style={{
          backgroundColor: "var(--color-error)",
          color: "var(--color-on-error)",
        }}
        id="top-alert"
      >
        <span className="material-symbols-outlined filled-icon mr-2">warning</span>
        <span className="text-sm font-bold uppercase tracking-wide">
          High Risk Cluster Detected!
        </span>
      </div>

      <Header 
        leftContent={
          <div className="font-extrabold tracking-tight text-lg text-slate-900 flex items-center gap-2.5">
            Admin Dashboard
          </div>
        }
        rightContent={
          <div className="flex items-center gap-4">
            <div className="relative hidden md:flex items-center text-slate-500">
              <span className="material-symbols-outlined absolute left-2">search</span>
              <input
                className="pl-8 pr-4 py-2 rounded-full border border-slate-200 bg-white/50 text-sm outline-none transition-all w-64 focus:bg-white"
                placeholder="Search data..."
                type="text"
              />
            </div>
            <button className="p-2 rounded-full text-slate-600 hover:text-blue-600 transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAza4dAlhNHG15GBa7SuVYmgB2R7x7sWS7pLuy4x6llcKHX3cS8jT7eaU0e7mzeTf7-pBV3iTAfeuZ_siENuL5vEcASlFDr0OekQ4V-GaQAg-V8AXVBmWBYq0gaT3gb1qlcQEysFMuRm2uYS16sH2FnCctpS5oRWPECF7LBs7UaCuCrt7To0rpI3JpRpeJvyrj5bBXwigtV9fnPnrphEupFWM4gBIH9MmoCOeoXh2Uy2lkSocWfdFreOQ"
              alt="Health Worker Avatar"
              className="w-8 h-8 rounded-full object-cover border border-slate-200 ml-2"
            />
          </div>
        }
      />

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full flex flex-col py-8 px-4 w-64 z-40 border-r pt-24"
        style={{
          backgroundColor: "var(--color-surface-container-low)",
          borderColor: "var(--color-outline-variant)",
          color: "var(--color-primary)",
        }}
      >
        <div className="mb-8 mt-12">
          <h1
            className="text-2xl font-extrabold mb-1"
            style={{ color: "var(--color-primary)" }}
          >
            MalariaWatch
          </h1>
          <p
            className="text-xs"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Surveillance Unit
          </p>
        </div>
        <nav className="flex-1 space-y-2">
          <a
            href="#"
            className="flex items-center px-2 py-3 rounded-l-md font-bold border-r-4 transition-all"
            style={{
              color: "var(--color-primary)",
              borderColor: "var(--color-primary)",
              backgroundColor: "var(--color-surface-container-high)",
            }}
          >
            <span className="material-symbols-outlined mr-4">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </a>
          <a
            href="#"
            className="flex items-center px-2 py-3 rounded-l-md transition-all"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined mr-4">description</span>
            <span className="text-sm">Reports</span>
          </a>
          <a
            href="#"
            className="flex items-center px-2 py-3 rounded-l-md transition-all"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined mr-4">explore</span>
            <span className="text-sm">Map View</span>
          </a>
          <a
            href="#"
            className="flex items-center px-2 py-3 rounded-l-md transition-all"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined mr-4">leaderboard</span>
            <span className="text-sm">Analytics</span>
          </a>
          <a
            href="#"
            className="flex items-center px-2 py-3 rounded-l-md transition-all"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined mr-4">settings</span>
            <span className="text-sm">Settings</span>
          </a>
        </nav>
        <div className="mt-auto pt-6">
          <button
            className="w-full py-2 px-4 rounded-full text-sm font-bold shadow-md flex items-center justify-center transition-all active:scale-95"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-on-primary)",
            }}
          >
            <span className="material-symbols-outlined filled-icon mr-2">add</span>
            Add New Report
          </button>
          <div
            className="mt-6 flex items-center p-2 rounded-lg shadow-sm"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCTazlSUhlRaDORLoOeV99Kcumq3XE0iGvWeDl-o-KXbKkMfvDOSRh_DSRNuBVaYy4kvwWSubX4ZCnrU2RnOVd7_oq8iOQcDVIXa4QsaU7tX5R3Jd0ayC0HJzV8PFWv4Qz14nv8mkuh6Llm1HhK4wV9wzNk5zujkCxkaoanlVXjNle7EYKYSnqDSKSyieoOJRJKxNeQKpeUhgQxEf1cxqeeb9B9t8p5L0qk911G72mA1p4xFjC0FRu9A"
              alt="Health Official"
              className="w-10 h-10 rounded-full object-cover border mr-4"
              style={{ borderColor: "var(--color-outline-variant)" }}
            />
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: "var(--color-on-surface)" }}
              >
                Dr. Budi Santoso
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Admin
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-28 p-12 min-h-screen w-full">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]">
          {/* Map */}
          <div
            className="flex-1 rounded-xl shadow-sm border flex flex-col overflow-hidden relative group"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-surface-variant)",
            }}
          >
            {/* Map Controls */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button
                className="px-4 py-2 rounded-full shadow-md text-sm font-medium border flex items-center transition-colors"
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-on-surface)",
                  borderColor: "var(--color-outline-variant)",
                }}
              >
                <span className="material-symbols-outlined mr-1 text-lg">layers</span>
                Endemicity Data
              </button>
              <button
                className="px-4 py-2 rounded-full shadow-md text-sm font-medium border flex items-center transition-colors opacity-70"
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-on-surface)",
                  borderColor: "var(--color-outline-variant)",
                }}
              >
                <span className="material-symbols-outlined mr-1 text-lg">sync_alt</span>
                Migration Patterns
              </button>
            </div>

            {/* Map Legend */}
            <div
              className="absolute bottom-4 right-4 z-10 p-2 rounded-lg shadow-md border"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <h4
                className="text-xs font-semibold uppercase mb-1"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Risk Level
              </h4>
              <ul className="space-y-1">
                {[
                  { color: "var(--color-error)", label: "High" },
                  { color: "#f59e0b", label: "Medium" },
                  { color: "#10b981", label: "Low" },
                ].map((r) => (
                  <li key={r.label} className="flex items-center text-sm gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Map Image */}
            <div
              className="w-full h-full relative overflow-hidden"
              style={{ backgroundColor: "var(--color-surface-container)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzFfW9tTwhBd4JY9enx8uWWmJd-rIHHjgw1QsQbdynUXZsXbz8uA-BOEwbxJyqPKMlZggyN73iFZLDeighkxbNFhVx-wiPyn5T0PKmJ1_Wb7UdpRya09Z6eR0zrs2zULzi_C-_Qbu_x0ocglzGDs7GVoqx5Dw6NwBW9RcFrybINL-5ObrtTI8rpW_YncCZug5-0ZkCoTYcf_orLVujaxFA0gyQSdhf6lwLu4JGig8vtObqOfe8Re9dAA"
                alt="Map of Indonesia"
                className="w-full h-full object-cover opacity-80"
              />
              {/* Markers */}
              <div
                className="absolute top-[30%] left-[40%] w-4 h-4 rounded-full animate-pulse"
                style={{
                  backgroundColor: "var(--color-error)",
                  boxShadow: "0 0 10px rgba(186,26,26,0.8)",
                }}
              />
              <div
                className="absolute top-[45%] left-[60%] w-3 h-3 rounded-full"
                style={{ backgroundColor: "#f59e0b" }}
              />
              <div
                className="absolute top-[60%] left-[20%] w-3 h-3 rounded-full"
                style={{ backgroundColor: "#10b981" }}
              />
              <div
                className="absolute top-[25%] left-[70%] w-5 h-5 rounded-full animate-ping opacity-75"
                style={{
                  backgroundColor: "var(--color-error)",
                  boxShadow: "0 0 15px rgba(186,26,26,0.9)",
                }}
              />
            </div>
          </div>

          {/* Priority List */}
          <div className="w-full lg:w-96 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3
                className="text-xl font-bold"
                style={{ color: "var(--color-on-surface)" }}
              >
                Regional Priority
              </h3>
              <button style={{ color: "var(--color-primary)" }}>
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {areas.map((area) => (
                <Link
                  key={area.id}
                  href={`/admin/laporan/${area.id}`}
                  className="block p-4 rounded-xl shadow-sm border-l-4 border-y border-r hover:shadow-md transition-shadow cursor-pointer"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderLeftColor: area.borderColor,
                    borderTopColor: "var(--color-outline-variant)",
                    borderRightColor: "var(--color-outline-variant)",
                    borderBottomColor: "var(--color-outline-variant)",
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4
                        className="text-base font-bold"
                        style={{ color: "var(--color-on-surface)" }}
                      >
                        {area.name}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-on-surface-variant)" }}
                      >
                        {area.region}
                      </p>
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs font-bold flex items-center"
                      style={{
                        backgroundColor: area.chipBg,
                        color: area.chipFg,
                      }}
                    >
                      <span className="material-symbols-outlined text-sm mr-1">
                        {area.icon}
                      </span>
                      {area.level}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p
                        className="text-xs mb-1"
                        style={{ color: "var(--color-on-surface-variant)" }}
                      >
                        Risk Score
                      </p>
                      <p
                        className="text-xl font-bold"
                        style={{ color: area.scoreFg }}
                      >
                        {area.score}/100
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-xs mb-1"
                        style={{ color: "var(--color-on-surface-variant)" }}
                      >
                        New Reports
                      </p>
                      <p
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-on-surface)" }}
                      >
                        {area.reports}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
