"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type LandType,
  GRID,
  LAND_COLORS,
  PUSKESMAS,
  SCHOOLS,
  MAP_DATA,
  cellToLatLng,
} from "@/components/MapGrid";

interface HoveredCell {
  x: number;
  y: number;
  land: LandType;
  risk: number;
}


interface LiveCommunityMapProps {
  /** Compact mode: hides header, padding, tooltip — just canvas + legend */
  compact?: boolean;
}

export default function LiveCommunityMap({ compact = false }: LiveCommunityMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  const [riskData, setRiskData] = useState<number[][]>(() =>
    Array.from({ length: GRID }, () => Array(GRID).fill(0))
  );
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    function fetchRisks() {
      fetch(`${API_BASE}/grids/risk`, { cache: "no-store" })
        .then((res) => {
          if (!res.ok) throw new Error("fetch failed");
          return res.json();
        })
        .then((gridsRisk: { grid_id: string; skor: number; kategori: string }[]) => {
          const lookup: Record<string, number> = {};
          gridsRisk.forEach(g => { lookup[g.grid_id] = g.skor; });

          const data: number[][] = Array.from({ length: GRID }, () => Array(GRID).fill(0));
          for (let r = 0; r < GRID; r++) {
            for (let c = 0; c < GRID; c++) {
              const { lat, lng } = cellToLatLng(c, r);
              const gx = Math.floor(Math.abs(lat) * 100) % 100;
              const gy = Math.floor(Math.abs(lng) * 100) % 100;
              const gridId = `AREA-${gx.toString().padStart(2, '0')}${gy.toString().padStart(2, '0')}`;
              data[r][c] = lookup[gridId] || 0;
            }
          }
          setRiskData(data);
        })
        .catch(() => setFetchError(true));
    }

    fetchRisks(); // fetch immediately on mount
    const interval = setInterval(fetchRisks, 30_000); // then every 30 seconds
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellPx = 20; 
    const size = cellPx * GRID;
    canvas.width = size;
    canvas.height = size;

    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        ctx.fillStyle = LAND_COLORS[MAP_DATA[r][c].land];
        ctx.fillRect(c * cellPx, r * cellPx, cellPx, cellPx);

        const risk = riskData[r][c];
        if (risk > 0) {
            let borderColor = "";
            let fillColor = "";
            if (risk >= 75) { 
                borderColor = "#dc2626"; 
                fillColor = "rgba(220, 38, 38, 0.5)";
            } else if (risk >= 50) { 
                borderColor = "#f97316"; 
                fillColor = "rgba(249, 115, 22, 0.4)";
            } else { 
                borderColor = "#eab308"; 
                fillColor = "rgba(234, 179, 8, 0.3)";
            }
            
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(c * cellPx + 1.5, r * cellPx + 1.5, cellPx - 3, cellPx - 3);
            
            ctx.fillStyle = fillColor;
            ctx.fillRect(c * cellPx + 3, r * cellPx + 3, cellPx - 6, cellPx - 6);
        }
      }
    }

    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * cellPx, 0); ctx.lineTo(i * cellPx, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cellPx); ctx.lineTo(size, i * cellPx); ctx.stroke();
    }

    if (hovered) {
      const hc = hovered.x - 1;
      const hr = hovered.y - 1;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 3;
      ctx.strokeRect(hc * cellPx + 1.5, hr * cellPx + 1.5, cellPx - 3, cellPx - 3);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(hc * cellPx, hr * cellPx, cellPx, cellPx);
    }
  }, [hovered, riskData]);

  useEffect(() => { draw(); }, [draw]);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cellPx = canvas.width / GRID;
    
    const col = Math.floor(((e.clientX - rect.left) * scaleX) / cellPx);
    const row = Math.floor(((e.clientY - rect.top) * scaleY) / cellPx);
    
    if (col < 0 || col >= GRID || row < 0 || row >= GRID) {
      setHovered(null);
      return;
    }
    const cell = MAP_DATA[row][col];
    const risk = riskData[row][col];
    setHovered({ x: col + 1, y: row + 1, land: cell.land, risk });
  }

  /* ── Compact mode (admin dashboard) ───────────────────────────────────── */
  if (compact) {
    return (
      <div className="flex flex-col w-full h-full min-h-0 gap-2">
        {/* Canvas fills available height */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="relative rounded-xl overflow-hidden border border-outline-variant/60 bg-[#c0b8a8] aspect-square h-full max-h-full max-w-full shadow-sm">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair block"
              style={{ imageRendering: "pixelated" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHovered(null)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-xl" />
          </div>
        </div>

        {/* ── Bottom bar: legend + tooltip panel side-by-side ──────────── */}
        <div className="shrink-0 flex items-start gap-3 flex-wrap">

          {/* Hover tooltip — outside the map */}
          {hovered ? (
            <div className="bg-surface border border-outline-variant rounded-xl px-3 py-2 text-[11px] font-medium flex items-center gap-3 shadow-sm">
              <div className="flex items-center gap-1 font-bold text-on-background">
                <span className="material-symbols-outlined text-[13px] text-primary">my_location</span>
                Grid ({hovered.x}, {hovered.y})
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm border border-outline-variant/50 shrink-0" style={{ backgroundColor: LAND_COLORS[hovered.land] }} />
                <span className="capitalize text-on-surface-variant">{hovered.land}</span>
              </div>
              <div className={`px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-widest font-bold ${
                hovered.risk >= 75 ? 'bg-[#ff453a]/10 text-[#ff453a]' :
                hovered.risk >= 50 ? 'bg-[#ff8c42]/10 text-[#ff8c42]' :
                hovered.risk > 0  ? 'bg-[#ffc966]/20 text-[#592d00]' :
                'text-on-surface-variant'
              }`}>
                {hovered.risk > 0 ? `Risiko: ${hovered.risk.toFixed(1)}` : 'Tidak ada data'}
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-outline-variant rounded-xl px-3 py-2 text-[11px] font-medium text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px] text-on-surface-variant/50">touch_app</span>
              Arahkan kursor ke peta
            </div>
          )}

          {/* Legend strip */}
          <div className="flex items-center gap-3 text-[10px] font-medium text-on-surface-variant ml-auto">
            <span className="text-primary/70 uppercase tracking-widest font-bold">Hotspot</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm border-2 border-[#ff453a] bg-[#ff453a]/30 shrink-0" />
              Kritis ≥75
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm border-2 border-[#ff8c42] bg-[#ff8c42]/30 shrink-0" />
              Tinggi ≥50
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm border-2 border-[#ffc966] bg-[#ffc966]/40 shrink-0" />
              Sedang &lt;50
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm border-2 border-outline-variant bg-surface-container shrink-0" />
              Rendah (= 0)
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* ── Full mode (landing page) ──────────────────────────────────────────── */
  return (
    <div className="flex flex-col flex-1 relative z-10 min-h-0 h-full p-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4 shrink-0">
        <div>
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 shadow-sm">
            <span className="material-symbols-outlined text-xl text-primary">map</span>
          </div>
          <h2 className="text-xl font-bold text-on-background mb-1">Peta Risiko Live</h2>
          <p className="text-sm text-on-surface-variant font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
            Diperbarui setiap 30 detik
          </p>
        </div>

        {/* Hover tooltip panel */}
        {hovered ? (
          <div className="bg-surface/95 backdrop-blur-sm px-4 py-3 rounded-2xl border border-outline-variant shadow-sm text-xs font-medium transition-all min-w-[160px]">
            <div className="font-bold text-on-background mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-primary">my_location</span>
              Grid ({hovered.x}, {hovered.y})
            </div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-3 h-3 rounded-sm shadow-sm border border-outline-variant/50" style={{ backgroundColor: LAND_COLORS[hovered.land] }} />
              <span className="capitalize text-on-surface-variant">{hovered.land}</span>
            </div>
            <div className={`px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold w-fit ${
              hovered.risk >= 75 ? 'bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/20' :
              hovered.risk >= 50 ? 'bg-[#ff8c42]/10 text-[#ff8c42] border border-[#ff8c42]/20' :
              hovered.risk > 0  ? 'bg-[#ffc966]/20 text-[#592d00] border border-[#ffc966]/40' :
              'bg-surface-container text-on-surface-variant border border-outline-variant'
            }`}>
              {hovered.risk > 0 ? `Risiko: ${hovered.risk.toFixed(1)}` : 'Tidak ada data'}
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 rounded-2xl border border-dashed border-outline-variant text-xs font-medium text-on-surface-variant flex items-center gap-2 h-[88px] min-w-[160px] justify-center">
            <span className="material-symbols-outlined text-base text-on-surface-variant/50">touch_app</span>
            Arahkan kursor ke peta
          </div>
        )}
      </div>

      {/* ── Map + Legend side-by-side ─────────────────────────────────────── */}
      <div className="flex flex-row gap-4 flex-1 min-h-0 items-start">

        {/* Map canvas */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="relative rounded-2xl overflow-hidden border border-outline-variant/60 bg-[#c0b8a8] aspect-square h-full max-h-[500px] max-w-full shadow-sm">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair block"
              style={{ imageRendering: "pixelated" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHovered(null)}
            />
            {/* Subtle vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-2xl" />
          </div>
        </div>

        {/* ── Legend (vertical, right of map) ──────────────────────────── */}
        <div className="flex flex-col gap-3 shrink-0 bg-surface/80 backdrop-blur-sm border border-outline-variant/70 px-4 py-4 rounded-2xl text-xs font-medium text-on-surface-variant self-start">
          <span className="text-primary/70 uppercase tracking-widest font-bold text-[10px] pb-1 border-b border-outline-variant/50">
            Hotspot
          </span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm border-2 border-[#ff453a] bg-[#ff453a]/30 shrink-0" />
            <span>Kritis (≥ 75)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm border-2 border-[#ff8c42] bg-[#ff8c42]/30 shrink-0" />
            <span>Tinggi (≥ 50)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm border-2 border-[#ffc966] bg-[#ffc966]/40 shrink-0" />
            <span>Sedang (&lt; 50)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm border-2 border-outline-variant bg-surface-container shrink-0" />
            <span>Rendah (= 0)</span>
          </div>
        </div>

      </div>
    </div>
  );
}

