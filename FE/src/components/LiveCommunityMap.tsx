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


export default function LiveCommunityMap() {
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

  return (
    <div className="flex flex-col flex-1 relative z-10 min-h-0 h-full">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4 shrink-0">
        <div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-xl">map</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Live Report Heat-Map</h2>
          <p className="text-slate-500 font-medium">Tracking hotspots in real-time.</p>
        </div>
        
        {/* Tooltip moved here, outside the map */}
        {hovered ? (
          <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-sm border border-slate-200/60 text-xs font-medium transition-all min-w-[150px]">
            <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
               <span className="material-symbols-outlined text-[16px] text-slate-400">my_location</span>
               Grid ({hovered.x}, {hovered.y})
            </div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: LAND_COLORS[hovered.land] }} />
              <span className="capitalize text-slate-600">{hovered.land}</span>
            </div>
            <div className={`px-2.5 py-1.5 rounded-md text-[11px] uppercase tracking-widest font-bold w-fit ${
              hovered.risk >= 75 ? 'bg-red-50 text-red-600 border border-red-100' : 
              hovered.risk >= 50 ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
              hovered.risk > 0 ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' : 
              'bg-slate-50 text-slate-500 border border-slate-100'
            }`}>
              {hovered.risk > 0 ? `Risk: ${hovered.risk.toFixed(1)}` : 'No Data'}
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 rounded-xl border border-dashed border-slate-200 text-xs font-medium text-slate-400 flex items-center justify-center h-[100px] min-w-[150px]">
            Hover map to view details
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
        {/* Map Container - responsive to height to avoid cutoff */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-[#c0b8a8] aspect-square h-full max-h-[500px] max-w-full">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair block shadow-inner"
              style={{ imageRendering: "pixelated" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHovered(null)}
            />
            
            {/* Map Gradient Overlay to match existing aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none" />
          </div>
        </div>

      {/* Legend Container Moved Outside */}
      <div className="flex flex-wrap items-center justify-center mx-auto gap-x-6 gap-y-3 bg-white/50 backdrop-blur-sm border border-slate-200/80 px-4 py-3 rounded-xl shadow-sm text-xs font-medium text-slate-700 w-fit shrink-0">
        <div className="text-slate-400 uppercase tracking-widest font-bold text-[10px]">Hotspots</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm border-2 border-[#dc2626] bg-[#dc2626]/40" /> Tinggi (Risk ≥ 75)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm border-2 border-[#f97316] bg-[#f97316]/40" /> Sedang (Risk ≥ 50)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm border-2 border-[#eab308] bg-[#eab308]/40" /> Rendah (Risk &lt; 50)</div>
      </div>
    </div>
    </div>
  );
}
