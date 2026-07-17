interface HeatmapBand {
  max_exclusive: number;
  level: string;
  level_index: number;
  color: string;
  explanation: string;
}

interface RiskStyle {
  bg: string;
  borderLeft: string;
  chipBg: string;
  chipFg: string;
  scoreFg: string;
  level: string;
  icon: string;
}

const BAND_STYLES: Record<number, Omit<RiskStyle, "level">> = {
  0: {
    bg: "#d1fae5",
    borderLeft: "#10b981",
    chipBg: "#d1fae5",
    chipFg: "#065f46",
    scoreFg: "#059669",
    icon: "check_circle",
  },
  1: {
    bg: "#d1fae5",
    borderLeft: "#10b981",
    chipBg: "#d1fae5",
    chipFg: "#065f46",
    scoreFg: "#059669",
    icon: "info",
  },
  2: {
    bg: "#fef3c7",
    borderLeft: "#f59e0b",
    chipBg: "#fef3c7",
    chipFg: "#92400e",
    scoreFg: "#b45309",
    icon: "warning",
  },
  3: {
    bg: "#ffedd5",
    borderLeft: "#f97316",
    chipBg: "#ffedd5",
    chipFg: "#9a3412",
    scoreFg: "#ea580c",
    icon: "warning",
  },
  4: {
    bg: "var(--color-error-container)",
    borderLeft: "var(--color-error)",
    chipBg: "var(--color-error)",
    chipFg: "var(--color-on-error)",
    scoreFg: "var(--color-error)",
    icon: "emergency",
  },
};

const HARDCODED_BANDS: HeatmapBand[] = [
  {
    max_exclusive: 20,
    level: "Sangat Rendah",
    level_index: 0,
    color: "hijau",
    explanation: "Risiko sangat rendah — tidak diperlukan tindakan khusus.",
  },
  {
    max_exclusive: 40,
    level: "Rendah",
    level_index: 1,
    color: "hijau_muda",
    explanation: "Risiko rendah — lakukan pemantauan rutin.",
  },
  {
    max_exclusive: 60,
    level: "Sedang",
    level_index: 2,
    color: "kuning",
    explanation: "Risiko sedang — segera kuras genangan dan laporkan ke puskesmas.",
  },
  {
    max_exclusive: 80,
    level: "Tinggi",
    level_index: 3,
    color: "oranye",
    explanation: "Risiko tinggi — fogging terjadwal dan distribusi kelambu.",
  },
  {
    max_exclusive: 100,
    level: "Sangat Tinggi",
    level_index: 4,
    color: "merah",
    explanation: "Risiko sangat tinggi — tanggap darurat, fogging massal, dan skrining massal.",
  },
];

const HARDCODED_WEIGHTS = { habitat: 0.65, mobility: 0.2, case: 0.15 };

let cachedBands: HeatmapBand[] | null = null;
let cachedWeights: { habitat: number; mobility: number; case: number } | null = null;

export async function fetchRiskConfig(): Promise<{
  bands: HeatmapBand[];
  weights: { habitat: number; mobility: number; case: number };
}> {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const res = await fetch(`${API_BASE}/model-info`);
    if (res.ok) {
      const data = await res.json();
      cachedBands = data.heatmap_bands;
      cachedWeights = data.combined_weights;
    }
  } catch {
    // use hardcoded fallback
  }
  return {
    bands: cachedBands || HARDCODED_BANDS,
    weights: cachedWeights || HARDCODED_WEIGHTS,
  };
}

function getBandForScore(score: number | null): HeatmapBand | null {
  if (score === null || score === undefined) return null;
  const bands = cachedBands || HARDCODED_BANDS;
  for (const band of bands) {
    if (score < band.max_exclusive) return band;
  }
  return bands[bands.length - 1];
}

export function getHeatmapLevel(score: number | null): number {
  const band = getBandForScore(score);
  return band?.level_index ?? -1;
}

export function getHeatmapCategory(score: number | null): string {
  const band = getBandForScore(score);
  return band?.level ?? "Tidak Diketahui";
}

export function getRiskStyle(score: number | null): RiskStyle {
  const level = getHeatmapLevel(score);
  const category = getHeatmapCategory(score);
  const style = BAND_STYLES[level] || BAND_STYLES[0];
  return { ...style, level: category };
}

export function getWeightFormula(): string {
  const w = cachedWeights || HARDCODED_WEIGHTS;
  return `${w.habitat} × Habitat + ${w.mobility} × Mobilitas + ${w.case} × Kasus`;
}

export function getScoreThresholdStyle(score: number | null | undefined): {
  color: string;
  bg: string;
} {
  const level = getHeatmapLevel(score ?? null);
  if (level >= 4) return { color: "var(--color-error)", bg: "var(--color-error-container)" };
  if (level >= 3) return { color: "#ea580c", bg: "#ffedd5" };
  if (level >= 2) return { color: "#b45309", bg: "#fef3c7" };
  return { color: "#059669", bg: "#d1fae5" };
}
