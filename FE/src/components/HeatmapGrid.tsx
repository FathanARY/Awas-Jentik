"use client";

import { useEffect, useRef } from "react";

interface GridCell {
  grid_id: string;
  lat: number;
  lng: number;
  tutupan_lahan: string;
  risiko_grid: number;
  kategori: string;
  penduduk: number;
}

const KATEGORI_COLORS: Record<string, string> = {
  "Sangat Rendah": "#22c55e",
  "Rendah": "#eab308",
  "Sedang": "#f97316",
  "Tinggi": "#ef4444",
};

const VIEWBOX_SIZE = 600;
const GRID_SIZE = 50;
const CELL_SIZE = VIEWBOX_SIZE / GRID_SIZE;

function getContrastText(bgColor: string): string {
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1e293b" : "#ffffff";
}

interface HeatmapGridProps {
  grids: GridCell[];
  compact?: boolean;
}

export default function HeatmapGrid({ grids, compact = false }: HeatmapGridProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  const gridMap = new Map<string, GridCell>();
  for (const g of grids) {
    const match = g.grid_id.match(/HJ-G-(\d+)/);
    if (match) {
      const idx = parseInt(match[1], 10);
      const row = Math.floor((idx - 1) / GRID_SIZE);
      const col = (idx - 1) % GRID_SIZE;
      const key = `${row}:${col}`;
      gridMap.set(key, g);
    }
  }

  const handleMouseMove = (e: React.MouseEvent, g: GridCell) => {
    if (!tooltipRef.current) return;
    const t = tooltipRef.current;
    t.style.display = "block";
    t.style.left = `${e.clientX + 12}px`;
    t.style.top = `${e.clientY - 40}px`;
    t.innerHTML = `<b>${g.grid_id}</b><br/>${g.tutupan_lahan}<br/>Risiko: ${g.risiko_grid.toFixed(0)}/100 (${g.kategori})`;
  };

  const handleMouseLeave = () => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
  };

  const cells: { row: number; col: number; g: GridCell }[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const key = `${row}:${col}`;
      const g = gridMap.get(key);
      if (g) cells.push({ row, col, g });
    }
  }

  return (
    <div className="relative">
      <div
        ref={tooltipRef}
        className="fixed z-50 pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl"
        style={{ display: "none", maxWidth: 200 }}
      />
      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className={compact ? "w-full max-w-md" : "w-full max-w-2xl"}
        style={{ shapeRendering: "crispEdges" }}
      >
        {cells.map(({ row, col, g }) => {
          const color = KATEGORI_COLORS[g.kategori] || "#94a3b8";
          return (
            <rect
              key={g.grid_id}
              x={col * CELL_SIZE + 0.5}
              y={row * CELL_SIZE + 0.5}
              width={CELL_SIZE - 1}
              height={CELL_SIZE - 1}
              fill={color}
              rx={2}
              opacity={0.85}
              onMouseMove={(e) => handleMouseMove(e, g)}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: "pointer", transition: "opacity 0.15s" }}
              onMouseEnter={(e) => {
                (e.target as SVGRectElement).style.opacity = "1";
              }}
              onMouseOut={(e) => {
                (e.target as SVGRectElement).style.opacity = "0.85";
              }}
            />
          );
        })}
      </svg>

      <div className="flex justify-center gap-4 mt-3 text-xs font-medium">
        {Object.entries(KATEGORI_COLORS).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: color }} />
            <span style={{ color: "var(--color-on-surface-variant)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
