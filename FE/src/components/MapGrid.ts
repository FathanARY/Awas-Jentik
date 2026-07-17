/* ─────────────────────────────── MapGrid.ts ────────────────────────────────
 * Single source of truth for the 50×50 grid map used across the app.
 * Shared by:
 *   - VillageMapPicker  (lapor page – let user click a cell)
 *   - LiveCommunityMap  (landing page heatmap – plot reports by lat/lng)
 * ─────────────────────────────────────────────────────────────────────────── */

/* ── Types ────────────────────────────────────────────────────────────────── */
export type LandType =
  | "forest"
  | "rice"
  | "plantation"
  | "residential"
  | "river"
  | "swamp"
  | "mining"
  | "road";

export interface Cell {
  land: LandType;
  special?: "puskesmas" | "school";
}

/* ── Grid size ────────────────────────────────────────────────────────────── */
export const GRID = 50;

/* ── Geographic bounding box (lat/lng of the grid corners) ────────────────── */
export const LAT_MAX = -6.10;   // top edge    (northernmost)
export const LAT_MIN = -6.30;   // bottom edge (southernmost)
export const LNG_MIN = 106.72;  // left edge   (westernmost)
export const LNG_MAX = 106.92;  // right edge  (easternmost)

/* ── Coordinate conversion helpers ────────────────────────────────────────── */

/**
 * Convert a 0-indexed (col, row) grid cell to the lat/lng of its centre.
 * col  = 0  → near LNG_MIN;  col  = GRID-1 → near LNG_MAX
 * row  = 0  → near LAT_MAX;  row  = GRID-1 → near LAT_MIN (rows go south)
 */
export function cellToLatLng(col: number, row: number): { lat: number; lng: number } {
  const lng = LNG_MIN + ((col + 0.5) / GRID) * (LNG_MAX - LNG_MIN);
  const lat = LAT_MAX - ((row + 0.5) / GRID) * (LAT_MAX - LAT_MIN);
  return { lat, lng };
}

/**
 * Convert a lat/lng to a 0-indexed (col, row) grid cell.
 * Returns null if the point is outside the bounding box.
 */
export function latLngToCell(lat: number, lng: number): { col: number; row: number } | null {
  const col = Math.floor(((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * GRID);
  const row = Math.floor(((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * GRID);
  if (col < 0 || col >= GRID || row < 0 || row >= GRID) return null;
  return { col, row };
}

/* ── Visual styles ────────────────────────────────────────────────────────── */
export const LAND_COLORS: Record<LandType, string> = {
  forest:      "#2d5a27",
  rice:        "#7cb87a",
  plantation:  "#9aaa55",
  residential: "#d4c5a9",
  river:       "#3a7bd5",
  swamp:       "#5b8a6b",
  mining:      "#4a4a4a",
  road:        "#c0b8a8",
};

export const LAND_LABELS: Record<LandType, string> = {
  forest:      "Forest",
  rice:        "Rice Field",
  plantation:  "Plantation",
  residential: "Residential",
  river:       "River",
  swamp:       "Swamp",
  mining:      "Mining Area",
  road:        "Road/Empty Land",
};

/* ── Special landmark positions (0-indexed col, row) ─────────────────────── */
export const PUSKESMAS = { col: 24, row: 26 };
export const SCHOOLS   = [{ col: 13, row: 35 }, { col: 35, row: 12 }];

/* ── Map generation ───────────────────────────────────────────────────────── */
export function generateMap(): Cell[][] {
  const grid: Cell[][] = Array.from({ length: GRID }, () =>
    Array.from({ length: GRID }, () => ({ land: "road" as LandType }))
  );

  function fill(
    land: LandType,
    rowStart: number, rowEnd: number,
    colStart: number, colEnd: number,
    pred?: (r: number, c: number) => boolean
  ) {
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (!pred || pred(r, c)) grid[r][c] = { ...grid[r][c], land };
      }
    }
  }

  /* Forest – top-left blob */
  fill("forest", 0, 28, 0, 20);
  fill("forest", 0, 8, 21, 24, (r, c) => c <= 20 + (8 - r));
  fill("forest", 22, 29, 0, 18, (r, c) => c <= 18 - Math.floor((r - 22) * 0.5));

  /* Plantation – top-right block */
  fill("plantation", 0, 19, 31, 49);
  fill("plantation", 0, 5, 43, 49, (r, c) => c <= 42 + r);

  /* Rice fields – central band */
  fill("rice", 15, 34, 21, 40);
  fill("rice", 29, 38, 5, 20);

  /* Residential – center cluster */
  fill("residential", 20, 37, 21, 36);

  /* Swamp – bottom-left */
  fill("swamp", 38, 49, 0, 19);
  fill("swamp", 44, 49, 20, 25);

  /* Mining – bottom-right corner */
  fill("mining", 42, 49, 42, 49);
  fill("mining", 40, 41, 44, 49);

  /* River – winding strip */
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

/* Pre-generated map – module-level singleton so it's computed only once */
export const MAP_DATA = generateMap();
