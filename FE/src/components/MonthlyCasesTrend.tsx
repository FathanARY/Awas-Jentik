"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/api";

interface MonthlyCase {
  bulan: string;
  label: string;
  kasus_total: number;
  kasus_impor: number;
  kasus_lokal: number;
  curah_hujan_mm: number;
}

export default function MonthlyCasesTrend() {
  const [data, setData] = useState<MonthlyCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<MonthlyCase[]>("/stats/monthly-cases")
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

  const maxKasus = Math.max(...data.map((d) => d.kasus_total), 1);
  const maxHujan = Math.max(...data.map((d) => d.curah_hujan_mm), 1);
  const chartHeight = 180;
  const barWidth = 24;
  const gap = (100 / data.length);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4 mb-2 justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: "#ef4444" }} />
          <span className="text-[10px] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Lokal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: "#f97316" }} />
          <span className="text-[10px] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Impor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded inline-block" style={{ backgroundColor: "#3b82f6", width: 16 }} />
          <span className="text-[10px] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Curah Hujan</span>
        </div>
      </div>

      <div className="relative" style={{ height: chartHeight + 30 }}>
        <svg viewBox={`0 0 ${data.length * 40} ${chartHeight + 30}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {data.map((item, i) => {
            const x = i * 40 + 8;
            const lokalH = (item.kasus_lokal / maxKasus) * chartHeight;
            const imporH = (item.kasus_impor / maxKasus) * chartHeight;
            const lokalY = chartHeight - lokalH - imporH;
            const imporY = chartHeight - imporH;

            return (
              <g key={item.bulan}>
                <rect x={x} y={lokalY} width={barWidth} height={lokalH} fill="#ef4444" rx={2} />
                <rect x={x} y={imporY} width={barWidth} height={imporH} fill="#f97316" rx={2} />
                <text x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" fontSize={9} fill="var(--color-on-surface-variant)" fontFamily="Inter, sans-serif">
                  {item.label.split(" ")[0]}
                </text>
              </g>
            );
          })}

          {data.map((item, i) => {
            if (i === 0) return null;
            const prev = data[i - 1];
            const x1 = (i - 1) * 40 + 8 + barWidth / 2;
            const x2 = i * 40 + 8 + barWidth / 2;
            const y1 = chartHeight - (prev.curah_hujan_mm / maxHujan) * chartHeight;
            const y2 = chartHeight - (item.curah_hujan_mm / maxHujan) * chartHeight;
            return (
              <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" />
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
          Total 9 bulan: {data.reduce((sum, d) => sum + d.kasus_total, 0)} kasus
        </span>
        <span className="text-[10px] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
          71% transmisi lokal
        </span>
      </div>
    </div>
  );
}
