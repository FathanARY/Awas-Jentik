"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";

/* ─────────────────────────────── Types ─────────────────────────────── */
type LandType =
  | "forest"
  | "rice"
  | "plantation"
  | "residential"
  | "river"
  | "swamp"
  | "mining"
  | "road";

interface Cell {
  land: LandType;
  special?: "puskesmas" | "school";
}

interface HoveredCell {
  x: number;
  y: number;
  land: LandType;
  reports: number;
}

/* ─────────────────────────── Config ──────────────────────────────── */
const GRID = 50;

const LAND_COLORS: Record<LandType, string> = {
  forest:      "#2d5a27",
  rice:        "#7cb87a",
  plantation:  "#9aaa55",
  residential: "#d4c5a9",
  river:       "#3a7bd5",
  swamp:       "#5b8a6b",
  mining:      "#4a4a4a",
  road:        "#c0b8a8",
};

const PUSKESMAS = { col: 24, row: 26 };
const SCHOOLS = [{ col: 13, row: 35 }, { col: 35, row: 12 }];

/* ─────────────────────── Map generation ─────────────────────────── */
function generateMap(): Cell[][] {
  const grid: Cell[][] = Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => ({ land: "road" as LandType }))
  );

  function fill(
    land: LandType,
    rowStart: number,
    rowEnd: number,
    colStart: number,
    colEnd: number,
    pred?: (r: number, c: number) => boolean
  ) {
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (!pred || pred(r, c)) grid[r][c] = { ...grid[r][c], land };
      }
    }
  }

  fill("forest", 0, 28, 0, 20);
  fill("forest", 0, 8, 21, 24, (r, c) => c <= 20 + (8 - r));
  fill("forest", 22, 29, 0, 18, (r, c) => c <= 18 - Math.floor((r - 22) * 0.5));
  fill("plantation", 0, 19, 31, 49);
  fill("plantation", 0, 5, 43, 49, (r, c) => c <= 42 + r);
  fill("rice", 15, 34, 21, 40);
  fill("rice", 29, 38, 5, 20);
  fill("residential", 20, 37, 21, 36);
  fill("swamp", 38, 49, 0, 19);
  fill("swamp", 44, 49, 20, 25);
  fill("mining", 42, 49, 42, 49);
  fill("mining", 40, 41, 44, 49);

  for (let r = 0; r < GRID; r++) {
    const col = Math.round(38 + 4 * Math.sin(r * 0.18));
    for (let dc = -1; dc <= 1; dc++) {
      const cc = col + dc;
      if (cc >= 0 && cc < GRID) grid[r][cc] = { ...grid[r][cc], land: "river" };
    }
  }

  grid[PUSKESMAS.row][PUSKESMAS.col].special = "puskesmas";
  for (const s of SCHOOLS) grid[s.row][s.col].special = "school";

  return grid;
}

const MAP_DATA = generateMap();

export default function LiveCommunityMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  const reportsData = useMemo(() => {
    const data: number[][] = Array.from({ length: GRID }, () => Array(GRID).fill(0));
    data[25][25] = 12; data[26][25] = 11; data[25][26] = 15;
    data[30][25] = 13; data[29][26] = 11;
    
    data[40][10] = 8; data[41][10] = 7; data[40][11] = 6;
    data[30][30] = 9; data[31][30] = 6;
    
    data[20][35] = 3; data[21][36] = 4; data[20][34] = 2;
    data[10][10] = 4; data[11][10] = 2; data[10][11] = 1;

    const seed = [5, 12, 17, 22, 28, 33, 41, 45, 8, 19, 37, 44, 2, 48, 14, 24];
    seed.forEach((val, i) => {
        data[(val * 3) % GRID][(val * 7) % GRID] = (i % 5) + 1;
    });

    return data;
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

        const reports = reportsData[r][c];
        if (reports > 0) {
            let borderColor = "";
            let fillColor = "";
            if (reports >= 10) { 
                borderColor = "#dc2626"; 
                fillColor = "rgba(220, 38, 38, 0.5)";
            } else if (reports >= 6) { 
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
  }, [hovered, reportsData]);

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
    const reports = reportsData[row][col];
    setHovered({ x: col + 1, y: row + 1, land: cell.land, reports });
  }

  return (
    <div className="flex flex-col flex-1 relative z-10">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
        <div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-xl">map</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Live Community Map</h2>
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
              hovered.reports >= 10 ? 'bg-red-50 text-red-600 border border-red-100' : 
              hovered.reports >= 6 ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
              hovered.reports > 0 ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' : 
              'bg-slate-50 text-slate-500 border border-slate-100'
            }`}>
              {hovered.reports} Reports
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 rounded-xl border border-dashed border-slate-200 text-xs font-medium text-slate-400 flex items-center justify-center h-[100px] min-w-[150px]">
            Hover map to view details
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* Map Container - Full width without letterboxing */}
        <div className="w-full rounded-2xl overflow-hidden border border-slate-200 relative bg-[#c0b8a8]">
          <canvas
            ref={canvasRef}
            className="w-full h-auto aspect-square cursor-crosshair block shadow-inner"
            style={{ imageRendering: "pixelated" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHovered(null)}
          />
          
          {/* Map Gradient Overlay to match existing aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none" />
        </div>

      {/* Legend Container Moved Outside */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-white/50 backdrop-blur-sm border border-slate-200/80 px-4 py-3 rounded-xl shadow-sm text-xs font-medium text-slate-700 w-fit">
        <div className="text-slate-400 uppercase tracking-widest font-bold text-[10px]">Hotspots</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm border-2 border-[#dc2626] bg-[#dc2626]/40" /> 10+ (Level 3)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm border-2 border-[#f97316] bg-[#f97316]/40" /> 6-9 (Level 2)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm border-2 border-[#eab308] bg-[#eab308]/40" /> 1-5 (Level 1)</div>
      </div>
    </div>
    </div>
  );
}
