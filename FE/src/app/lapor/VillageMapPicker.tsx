"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  x: number; // col 1-50
  y: number; // row 1-50
  land: LandType;
  special?: string;
}

export interface SelectedCell {
  x: number;
  y: number;
  land: LandType;
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

const LAND_LABELS: Record<LandType, string> = {
  forest:      "Forest",
  rice:        "Rice Field",
  plantation:  "Plantation",
  residential: "Residential",
  river:       "River",
  swamp:       "Swamp",
  mining:      "Mining Area",
  road:        "Road/Empty Land",
};

/* Special landmark positions (0-indexed col, row) */
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

  /* Forest – top-left blob (~600 cells) */
  fill("forest", 0, 28, 0, 20);
  fill("forest", 0, 8, 21, 24, (r, c) => c <= 20 + (8 - r));
  fill("forest", 22, 29, 0, 18, (r, c) => c <= 18 - Math.floor((r - 22) * 0.5));

  /* Plantation – top-right block (~300 cells) */
  fill("plantation", 0, 19, 31, 49);
  fill("plantation", 0, 5, 43, 49, (r, c) => c <= 42 + r);

  /* Rice fields – central band (~500 cells) */
  fill("rice", 15, 34, 21, 40);
  fill("rice", 29, 38, 5, 20);

  /* Residential – center cluster (~500 cells) */
  fill("residential", 20, 37, 21, 36);

  /* Swamp – bottom-left (~200 cells) */
  fill("swamp", 38, 49, 0, 19);
  fill("swamp", 44, 49, 20, 25);

  /* Mining – bottom-right corner (~100 cells) */
  fill("mining", 42, 49, 42, 49);
  fill("mining", 40, 41, 44, 49);

  /* River – winding strip top-right → bottom-center (~150 cells) */
  for (let r = 0; r < GRID; r++) {
    const col = Math.round(38 + 4 * Math.sin(r * 0.18));
    for (let dc = -1; dc <= 1; dc++) {
      const cc = col + dc;
      if (cc >= 0 && cc < GRID) grid[r][cc] = { ...grid[r][cc], land: "river" };
    }
  }

  /* Special landmarks */
  grid[PUSKESMAS.row][PUSKESMAS.col].special = "puskesmas";
  for (const s of SCHOOLS) grid[s.row][s.col].special = "school";

  return grid;
}

const MAP_DATA = generateMap();

/* ─────────────────────── Component ──────────────────────────────── */
interface VillageMapPickerProps {
  onSelect: (cell: SelectedCell | null) => void;
  selected: SelectedCell | null;
}

export default function VillageMapPicker({ onSelect, selected }: VillageMapPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<HoveredCell | null>(null);
  const [cellPx, setCellPx] = useState(10);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      setCellPx(Math.max(4, Math.floor(w / GRID)));
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = cellPx * GRID;
    canvas.width = size;
    canvas.height = size;

    /* Fill cells */
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        ctx.fillStyle = LAND_COLORS[MAP_DATA[r][c].land];
        ctx.fillRect(c * cellPx, r * cellPx, cellPx, cellPx);
      }
    }

    /* Thin grid lines */
    ctx.strokeStyle = "rgba(0,0,0,0.10)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * cellPx, 0); ctx.lineTo(i * cellPx, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cellPx); ctx.lineTo(size, i * cellPx); ctx.stroke();
    }

    /* Axis labels every 10 cells */
    if (cellPx >= 7) {
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = `bold ${Math.max(cellPx * 0.55, 6)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 10; i <= GRID; i += 10) {
        ctx.fillText(String(i), i * cellPx - cellPx * 5, cellPx * 0.5);
        ctx.fillText(String(i), cellPx * 0.5, i * cellPx - cellPx * 5);
      }
    }

    /* Hovered cell */
    if (hovered) {
      const hc = hovered.x - 1;
      const hr = hovered.y - 1;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = Math.max(1, cellPx >= 8 ? 2 : 1);
      ctx.strokeRect(hc * cellPx + 0.5, hr * cellPx + 0.5, cellPx - 1, cellPx - 1);
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillRect(hc * cellPx, hr * cellPx, cellPx, cellPx);
    }

    /* Selected cell */
    if (selected) {
      const sc = selected.x - 1;
      const sr = selected.y - 1;
      ctx.strokeStyle = "#ff4444";
      ctx.lineWidth = Math.max(1.5, cellPx >= 8 ? 2.5 : 1.5);
      ctx.strokeRect(sc * cellPx + 1, sr * cellPx + 1, cellPx - 2, cellPx - 2);
      ctx.fillStyle = "rgba(255,68,68,0.35)";
      ctx.fillRect(sc * cellPx + 1, sr * cellPx + 1, cellPx - 2, cellPx - 2);
    }

    /* Landmarks */
    if (cellPx >= 6) {
      const drawLandmark = (col: number, row: number, color: string, letter: string) => {
        const px = col * cellPx + cellPx / 2;
        const py = row * cellPx + cellPx / 2;
        const r  = Math.max(cellPx * 0.85, 4) / 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = `bold ${Math.max(r * 1.1, 5)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(letter, px, py);
      };

      drawLandmark(PUSKESMAS.col, PUSKESMAS.row, "#e53935", "+");
      for (const s of SCHOOLS) drawLandmark(s.col, s.row, "#1565C0", "S");
    }
  }, [cellPx, hovered, selected]);

  useEffect(() => { draw(); }, [draw]);

  function getCellFromEvent(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const col = Math.floor(((e.clientX - rect.left) * scaleX) / cellPx);
    const row = Math.floor(((e.clientY - rect.top) * scaleY) / cellPx);
    if (col < 0 || col >= GRID || row < 0 || row >= GRID) return null;
    return { col, row };
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const pos = getCellFromEvent(e);
    if (!pos) { setHovered(null); return; }
    const cell = MAP_DATA[pos.row][pos.col];
    setHovered({ x: pos.col + 1, y: pos.row + 1, land: cell.land, special: cell.special });
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const pos = getCellFromEvent(e);
    if (!pos) return;
    const cell = MAP_DATA[pos.row][pos.col];
    const next: SelectedCell = { x: pos.col + 1, y: pos.row + 1, land: cell.land };
    if (selected?.x === next.x && selected?.y === next.y) onSelect(null);
    else onSelect(next);
  }

  const legend: { land: LandType }[] = [
    { land: "forest" }, { land: "rice" }, { land: "plantation" },
    { land: "residential" }, { land: "river" }, { land: "swamp" }, { land: "mining" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
      {/* Map Area */}
      <div ref={containerRef} className="relative w-full lg:flex-1">
        <canvas
          ref={canvasRef}
          className="w-full rounded-2xl border border-slate-200 shadow-sm cursor-crosshair block"
          style={{ imageRendering: "pixelated" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
          onClick={handleClick}
        />

        {/* Hint overlay */}
        {!selected && (
          <div className="pointer-events-none absolute bottom-3 right-3 rounded-md px-3 py-1.5 text-xs font-medium bg-slate-900/60 text-white backdrop-blur-md">
            Click grid to select location
          </div>
        )}
      </div>

      {/* Info Panel (Right Side) */}
      <div className="w-full lg:w-72 flex flex-col gap-6 shrink-0">
        
        {/* Dynamic Info Box */}
        <div className="rounded-2xl p-5 border border-slate-200 bg-slate-50/50 shadow-sm min-h-[160px] flex flex-col justify-center transition-all">
          {selected ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">location_on</span>
                  Selected: ({selected.x}, {selected.y})
                </span>
                <button type="button" onClick={() => onSelect(null)} className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors">
                  Clear
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="w-3 h-3 rounded-sm shadow-sm border border-slate-200" style={{ backgroundColor: LAND_COLORS[selected.land] }} />
                {LAND_LABELS[selected.land]}
              </div>
              <div className="text-xs text-slate-500 leading-relaxed bg-white p-2 rounded-lg border border-slate-100 mt-1">
                ≈ {(selected.x - 1) * 100}m East, {(selected.y - 1) * 100}m South from origin
              </div>
            </div>
          ) : hovered ? (
            <div className="flex flex-col gap-3">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">my_location</span>
                Hovering: ({hovered.x}, {hovered.y})
              </span>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="w-3 h-3 rounded-sm shadow-sm border border-slate-200" style={{ backgroundColor: LAND_COLORS[hovered.land] }} />
                {LAND_LABELS[hovered.land]}
              </div>
              {(hovered.special === "puskesmas" || hovered.special === "school") && (
                <div className="flex flex-col gap-1 mt-1">
                  {hovered.special === "puskesmas" && <div className="text-rose-600 font-bold text-sm flex items-center gap-1"><span className="material-symbols-outlined text-sm">local_hospital</span> Health Center</div>}
                  {hovered.special === "school"    && <div className="text-blue-600 font-bold text-sm flex items-center gap-1"><span className="material-symbols-outlined text-sm">school</span> School</div>}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-500 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                <span className="material-symbols-outlined text-2xl">touch_app</span>
              </div>
              <p className="text-sm font-medium">Hover map to view details,<br/>click to select.</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="rounded-2xl p-5 border border-slate-200 bg-white shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Map Legend</h4>
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-sm font-medium text-slate-700">
            {legend.map(({ land }) => (
              <div key={land} className="flex items-center gap-3 group">
                <span className="w-4 h-4 rounded-md shadow-sm border border-slate-200 group-hover:scale-110 transition-transform" style={{ backgroundColor: LAND_COLORS[land] }} />
                {LAND_LABELS[land]}
              </div>
            ))}
            <div className="h-px w-full bg-slate-100 my-1 col-span-2" />
            <div className="flex items-center gap-3 group">
              <span className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm group-hover:scale-110 transition-transform">+</span>
              Health Center
            </div>
            <div className="flex items-center gap-3 group">
              <span className="w-4 h-4 rounded-full bg-blue-700 flex items-center justify-center text-[10px] text-white font-bold shadow-sm group-hover:scale-110 transition-transform">S</span>
              School (2)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
