---
name: MalariaWatch Redesign UI (Fresh & Friendly Concept)
description: Redesign antarmuka surveilans malaria menggunakan gaya visual yang fresh, bersih, dan approachable (mengadaptasi tracker kesehatan modern) agar tidak mengintimidasi pengguna.
version: 2.0.0
source: visual-audit
mode: light
default-mode: light
style-direction: Minimalist Health-Tech + Soft Claymorphism
mood: fresh, approachable, clean
comparable-to: Apple Health, Noom
screen-type: Citizen Portal, Admin Dashboard, Report Form, Kader Dashboard
target-platform: Next.js 16 (App Router) + Tailwind v4

# ============================================
# DESIGN TOKENS
# Consumed by globals.css via Tailwind v4 @theme directive (CSS custom properties).
# Format: hex codes lowercase, rem-based sizing for typography & spacing.
# ============================================

colors:
  # Brand
  primary: "#89d927"             # purpose: main CTA, active state, primary actions
  primary-hover: "#75c01f"
  primary-subtle: "#eef8e3"      # ~10% feel — selected row, active tab bg
  secondary: "#ff9f0a"           # supporting accent (medium risk, warnings)
  
  # Canvas
  background: "#f6f8f3"
  surface: "#ffffff"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f0f2eb"
  surface-container: "#eaede4"
  surface-container-high: "#e3e6dd"
  surface-container-highest: "#dde0d7"
  surface-dim: "#e2e5dd"
  surface-bright: "#ffffff"
  surface-variant: "#e8ebe2"
  
  # Text
  on-background: "#1c1c1e"       # contrast vs background: 16.5:1 (WCAG AAA)
  on-surface: "#1c1c1e"
  on-surface-variant: "#6b6e64"
  
  # Lines
  outline: "#7c8075"
  outline-variant: "#c6c9bf"
  
  # Semantic
  error: "#ff453a"
  error-container: "#ffe0dd"
  on-error: "#ffffff"
  on-error-container: "#93000a"

typography:
  font-family-display: "Nunito"
  font-family-body: "Nunito"
  font-family-mono: "JetBrains Mono, ui-monospace, monospace"
  
  display:
    size: "2.5rem"            # 40px
    weight: 800
    line-height: 1.1
    letter-spacing: "-0.025em"
  h1:
    size: "1.75rem"           # 28px
    weight: 700
    line-height: 1.2
    letter-spacing: "-0.02em"
  h2:
    size: "1.25rem"           # 20px
    weight: 700
    line-height: 1.25
    letter-spacing: "-0.015em"
  h3:
    size: "1.125rem"          # 18px
    weight: 600
    line-height: 1.3
  body:
    size: "1rem"              # 16px
    weight: 500
    line-height: 1.55
  body-sm:
    size: "0.875rem"          # 14px
    weight: 500
    line-height: 1.5
  label:
    size: "0.75rem"           # 12px
    weight: 600
    line-height: 1.4
    letter-spacing: "0.02em"
  caption:
    size: "0.7rem"            # 11px
    weight: 500
    line-height: 1.35
  numeric:
    feature: "tabular-nums"
    weight: 700

spacing:
  base: 8                      # px grid unit
  scale:
    "0": "0"
    "0.5": "0.125rem"          # 2px
    "1": "0.25rem"             # 4px
    "2": "0.5rem"              # 8px
    "3": "0.75rem"             # 12px
    "4": "1rem"                # 16px
    "5": "1.25rem"             # 20px
    "6": "1.5rem"              # 24px
    "8": "2rem"                # 32px
    "10": "2.5rem"             # 40px
    "12": "3rem"               # 48px
    "16": "4rem"               # 64px
    "20": "5rem"               # 80px
    "24": "6rem"               # 96px

radius:
  none: "0"
  sm: "0.5rem"                 # 8px
  md: "0.75rem"                # 12px
  lg: "1rem"                   # 16px
  xl: "1.5rem"                 # 24px (Main cards)
  2xl: "2rem"                  # 32px
  full: "9999px"

shadow:
  none: "none"
  xs: "0 2px 4px rgba(0, 0, 0, 0.02)"
  sm: "0 4px 12px rgba(0, 0, 0, 0.04)"
  md: "0 8px 24px rgba(0, 0, 0, 0.06)"
  lg: "0 12px 32px rgba(0, 0, 0, 0.08)"
  xl: "0 20px 48px rgba(0, 0, 0, 0.1)"
  focus: "0 0 0 4px rgba(137, 217, 39, 0.25)" # Primary color with 25% opacity

motion:
  duration-fast: "150ms"
  duration-base: "250ms"
  duration-slow: "400ms"
  easing-standard: "cubic-bezier(0.4, 0, 0.2, 1)"
  easing-emphasized: "cubic-bezier(0.34, 1.56, 0.64, 1)" # Springy feel

breakpoints:
  sm: "640px"
  md: "768px"
  lg: "1024px"
  xl: "1280px"
  2xl: "1536px"

layout:
  max-content-width: "1024px"  # Desktop max width
  page-padding-x: "1.5rem"
  page-padding-y: "2rem"
  card-padding: "1.5rem"
  section-gap: "2rem"

# ============================================
# COMPONENT BEHAVIOR SPECS
# ============================================
components:
  button-primary:
    bg: "{colors.primary}"
    text: "{colors.on-primary}"
    padding: "0.75rem 2rem"
    radius: "{radius.full}"
    weight: 700
    font-size: "0.875rem"
    hover-bg: "{colors.primary-hover}"
    focus-ring: "{shadow.focus}"
    active: "scale(0.98)"
    disabled-opacity: 0.5
    
  button-secondary:
    bg: "{colors.surface}"
    text: "{colors.on-surface}"
    border: "1px solid {colors.outline}"
    padding: "0.75rem 2rem"
    radius: "{radius.full}"
    hover-bg: "{colors.surface-container-low}"
    active: "scale(0.98)"
    
  input:
    bg: "{colors.surface-container-low}"
    text: "{colors.on-surface}"
    border: "1px solid {colors.outline}"
    radius: "{radius.xl}"
    padding: "0.75rem 1rem"
    focus-border: "{colors.primary}"
    focus-ring: "0 0 0 4px rgba(137, 217, 39, 0.20)"
    
  card:
    bg: "{colors.surface}"
    shadow: "{shadow.md}"
    radius: "{radius.xl}"
    padding: "{layout.card-padding}"
    
  badge:
    radius: "{radius.full}"
    padding: "0.25rem 0.75rem"
    font-size: "0.7rem"
    weight: 600
    text-transform: "uppercase"
    letter-spacing: "0.05em"
    
  list-item:
    bg: "{colors.surface}"
    radius: "{radius.lg}"
    padding: "1rem"
    shadow: "{shadow.sm}"
    hover-bg: "{colors.surface-container-low}"

---

# 📖 OVERVIEW
Desain ini mengubah aplikasi surveilans malaria yang biasanya terasa klinis/medis menjadi pengalaman yang bersih, modern, dan sangat ramah pengguna. Mengadaptasi pola desain aplikasi health & lifestyle tracker, antarmuka menggunakan soft claymorphism dengan sudut-sudut membulat yang bersahabat dan warna hijau yang segar.

# 🎨 COLORS PHILOSOPHY
**Primary (`#89d927`)** — Hijau cerah (lime/yellow-green) yang memberikan kesan sehat, organik, dan positif. Digunakan untuk tombol utama dan status risiko rendah.

**Secondary (`#ff9f0a`)** — Oranye hangat untuk aksen pendukung, peringatan, dan risiko menengah.

**Canvas** — Latar belakang menggunakan `#f6f8f3` (off-white dengan tint hijau) agar card putih (`#ffffff`) dapat menonjol melalui soft shadow tanpa perlu border yang kaku.

**Semantic colors** — `#ff453a` (Error Red) digunakan hanya untuk indikasi risiko tinggi dan malaria terdeteksi.

# 🔤 TYPOGRAPHY PHILOSOPHY
**Font choice:** `Nunito`. Geometric rounded sans yang selaras dengan bentuk komponen UI yang bulat (pillowy). Ini mengurangi kesan kaku pada aplikasi teknologi kesehatan.

**Hierarchy rules:**
- H1 tebal (Weight 700/800) untuk greeting atau nilai numerik penting.
- Gunakan `tabular-nums` pada area skor risiko dan data numerik.
- Body text weight 500 untuk keterbacaan optimal di latar terang.

# 📐 SPACING & LAYOUT PHILOSOPHY
**Base grid:** 8px.
**Max content width:** 1024px untuk halaman utama (5xl).
**Whitespace:** Generous. Berikan ruang bernapas yang besar antar card (section gap 2rem/32px).

# 🟦 SHAPE & RADIUS PHILOSOPHY
**Sangat Membulat (Pillowy).** 
- Card utama menggunakan radius `xl` (24px) atau `2xl` (32px).
- Button, ikon aksi, dan badge wajib menggunakan radius `full` (pill shape). 
- Tidak ada sudut tajam pada elemen interaktif.

# 🌫️ ELEVATION PHILOSOPHY
**Strategy:** Soft shadow / Tonal.
Alih-alih menggunakan border untuk memisahkan card, desain ini mengandalkan shadow ringan untuk memberikan kesan melayang yang lembut.

# 🚫 RULES TO NEVER BREAK
- Never gunakan sharp corners (radius < 8px) pada elemen UI utama.
- Never gunakan hard drop shadows dengan opacity tinggi (warna hitam pekat).
- Never campurkan border garis keras jika elemen sudah menggunakan shadow.
- Never gunakan warna biru sebagai primary — ini adalah brand hijau (malaria prevention).

# ✅ RULES TO ALWAYS FOLLOW
- Gunakan ikon Material Symbols dengan gaya outline tebal dan ujung membulat.
- Pertahankan kontras warna teks (minimal `on-surface-variant`) agar tetap terbaca.
- Berikan efek scale up atau springy bounce kecil saat elemen interaktif di-klik.
- Gunakan Bahasa Indonesia untuk semua teks UI.
