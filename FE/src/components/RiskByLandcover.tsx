"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/api";

interface LandcoverStat {
  tutupan: string;
  rata_rata_risiko: number;
  pct_tinggi: number;
  grid: number;
}

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#64748b",
];

export default function RiskByLandcover() {
  const [data, setData] = useState<LandcoverStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<LandcoverStat[]>("/stats/risk-by-landcover")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="material-symbols-outlined animate-spin text-2xl" style={{ color: "var(--color-primary)" }}>progress_activity</span>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.rata_rata_risiko - a.rata_rata_risiko);
  const maxRisk = Math.max(...sorted.map((d) => d.rata_rata_risiko), 1);

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((item, i) => (
        <div key={item.tutupan} className="flex items-center gap-3">
          <span className="text-sm font-medium w-28 shrink-0 truncate" style={{ color: "var(--color-on-surface)" }}>
            {item.tutupan}
          </span>
          <div className="flex-1 h-6 rounded-full relative overflow-hidden" style={{ backgroundColor: "var(--color-surface-container-highest)" }}>
            <div
              className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{
                width: `${(item.rata_rata_risiko / 100) * 100}%`,
                minWidth: item.rata_rata_risiko > 0 ? 24 : 0,
                backgroundColor: COLORS[i % COLORS.length],
              }}
            >
              <span className="text-[10px] font-bold text-white drop-shadow-sm">
                {item.rata_rata_risiko.toFixed(1)}
              </span>
            </div>
          </div>
          {item.pct_tinggi > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
              {item.pct_tinggi}% Tinggi
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
