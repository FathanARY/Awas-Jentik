---
name: MalariaScan Redesign UI (Fresh & Friendly Concept)
description: Redesign antarmuka deteksi nyamuk malaria menggunakan gaya visual yang fresh, bersih, dan approachable (mengadaptasi tracker kesehatan modern) agar tidak mengintimidasi pengguna.
version: 1.0.0
source: visual-audit
mode: light
default-mode: light
style-direction: Minimalist Health-Tech + Soft Claymorphism
mood: fresh, approachable, clean
comparable-to: Apple Health, Noom
screen-type: Dashboard, Detail, Camera Scanner
target-platform: Google Apps Script Web App (HtmlService) — Tailwind v4 via CDN

# ============================================
# DESIGN TOKENS
# Consumed by index.html via Tailwind v4 @theme directive (CSS custom properties).
# Format: hex codes lowercase, rem-based sizing for typography & spacing.
# ============================================

colors:
  # Brand
  primary: "#89d927"             # purpose: main CTA, scanner active state, FAB
  primary-hover: "#75c01f"
  primary-subtle: "#eef8e3"      # ~10% feel — selected row, active tab bg
  secondary: "#ff9f0a"           # supporting accent (e.g., medium risk highlight)
  
  # Canvas
  background: "#f6f8f3"
  surface: "#ffffff"             # card/panel
  surface-2: "#fdfdfd"           # nested surface (modal, dropdown, popover)
  surface-hover: "#f9f9f9"
  
  # Text
  text-primary: "#1c1c1e"        # contrast vs background: 16.5:1 (WCAG AAA)
  text-secondary: "#8e8e93"
  text-muted: "#c7c7cc"
  text-on-primary: "#ffffff"     # text on primary bg
  
  # Lines
  border: "#f2f2f7"
  border-strong: "#e5e5ea"
  
  # Semantic
  success: "#34c759"
  success-subtle: "#e8f8ec"
  warning: "#ff9f0a"
  warning-subtle: "#fff4e5"
  error: "#ff453a"               # Use for 'Malaria Detected' high-risk
  error-subtle: "#ffebe9"
  info: "#32ade6"
  info-subtle: "#e7f6fd"

typography:
  font-family-display: "'Nunito', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
  font-family-body: "'Nunito', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
  font-family-mono: "ui-monospace, 'JetBrains Mono', monospace"
  
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
  h4:
    size: "1rem"              # 16px
    weight: 600
    line-height: 1.4
  body-lg:
    size: "1.125rem"          # 18px
    weight: 400
    line-height: 1.6
  body:
    size: "1rem"              # 16px
    weight: 500             # medium weight for better readability on light bg
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
  "2xl": "2rem"                # 32px
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
  "2xl": "1536px"

layout:
  max-content-width: "480px"   # Mobile-first web app feel
  sidebar-width: "280px"
  sidebar-collapsed-width: "80px"
  topbar-height: "64px"
  page-padding-x: "1.25rem"
  page-padding-y: "1.5rem"
  card-padding: "1.5rem"
  section-gap: "2rem"

# ============================================
# COMPONENT BEHAVIOR SPECS
# Resolved tokens — index.html generator pakai ini as authority.
# ============================================
components:
  button-primary:
    bg: "{colors.primary}"
    text: "{colors.text-on-primary}"
    padding: "1rem 2rem"
    radius: "{radius.full}"
    weight: 700
    font-size: "{typography.body.size}"
    hover-bg: "{colors.primary-hover}"
    focus-ring: "{shadow.focus}"
    disabled-opacity: 0.5
    
  button-secondary:
    bg: "{colors.surface}"
    text: "{colors.text-primary}"
    border: "1px solid {colors.border}"
    padding: "1rem 2rem"
    radius: "{radius.full}"
    hover-bg: "{colors.surface-hover}"
    
  button-icon:
    bg: "{colors.surface}"
    border: "1px solid {colors.border}"
    padding: "0.75rem"
    radius: "{radius.full}"
    hover-bg: "{colors.surface-hover}"
    
  input:
    bg: "{colors.surface}"
    text: "{colors.text-primary}"
    placeholder: "{colors.text-muted}"
    border: "1px solid {colors.border-strong}"
    radius: "{radius.xl}"
    padding: "1rem 1.25rem"
    focus-border: "{colors.primary}"
    focus-ring: "{shadow.focus}"
    
  card:
    bg: "{colors.surface}"
    border: "none"
    shadow: "{shadow.md}"
    radius: "{radius.xl}"
    padding: "{layout.card-padding}"
    
  badge:
    radius: "{radius.full}"
    padding: "0.25rem 0.75rem"
    font-size: "{typography.caption.size}"
    weight: 600
    text-transform: "uppercase"
    letter-spacing: "0.05em"
    
  list-item:
    bg: "{colors.surface}"
    radius: "{radius.lg}"
    padding: "1rem"
    shadow: "{shadow.sm}"
    margin-bottom: "1rem"
    hover-bg: "{colors.surface-hover}"

---

# 📖 OVERVIEW
Desain ini mengubah aplikasi deteksi nyamuk malaria yang biasanya terasa klinis/medis menjadi pengalaman yang bersih, modern, dan sangat ramah pengguna. Mengadaptasi pola desain aplikasi *health & lifestyle tracker*, antarmuka menggunakan *soft claymorphism* dengan sudut-sudut membulat yang bersahabat dan warna hijau yang segar, memastikan pengguna awam merasa aman dan mudah saat melakukan pemindaian (scanning).

# 🎨 COLORS PHILOSOPHY
**Primary (`#89d927`)** — Hijau cerah (lime/yellow-green) yang memberikan kesan sehat, organik, dan positif. Digunakan untuk tombol utama (seperti FAB Scanner) dan status "Aman".

**Canvas** — Latar belakang menggunakan `#f6f8f3` (off-white dengan tint hijau) agar *card* putih murni (`#ffffff`) dapat menonjol (elevated) melalui *soft shadow* tanpa perlu garis batas (*border*) yang kaku.

**Semantic colors** — Sangat penting untuk fitur deteksi. Gunakan `#ff453a` (Error Red) **hanya** untuk mengindikasikan deteksi nyamuk berbahaya (Anopheles).

# 🔤 TYPOGRAPHY PHILOSOPHY
**Font choice:** `Nunito` atau `Plus Jakarta Sans`. Mengutamakan *geometric rounded sans* agar selaras dengan bentuk komponen UI yang bulat (*pillowy*). Ini mengurangi kesan kaku pada aplikasi teknologi kesehatan.

**Hierarchy rules:**
- H1 tebal (Weight 700/800) untuk *greeting* atau nilai numerik penting (misal: "Hasil Scan").
- Gunakan `tabular-nums` pada area persentase akurasi AI.

# 📐 SPACING & LAYOUT PHILOSOPHY
**Base grid:** 8px.
**Max content width:** Dibatasi di 480px untuk web app karena penggunaan pemindai kamera (scanner) paling optimal pada *form factor mobile*. Di layar *desktop*, layout akan terpusat (centered) menyerupai tampilan *smartphone*.
**Whitespace:** *Generous*. Berikan ruang bernapas yang besar antar *card* (section gap 2rem/32px) agar informasi hasil analisis AI mudah dicerna.

# 🟦 SHAPE & RADIUS PHILOSOPHY
**Sangat Membulat (Pillowy).** 
- *Card* utama menggunakan radius `xl` (24px).
- *Button*, Ikon aksi, dan *Tags* wajib menggunakan radius `full` (pill shape). 
- Tidak ada sudut tajam (0px) pada elemen interaktif manapun.

# 🌫️ ELEVATION PHILOSOPHY
**Strategy:** Soft shadow / Tonal.
Alih-alih menggunakan border untuk memisahkan *card*, desain ini mengandalkan `shadow.md` (`0 8px 24px rgba(0, 0, 0, 0.06)`) untuk memberikan kesan melayang yang lembut (*claymorphism* halus). 

# 🧩 COMPONENT BEHAVIOR RULES
**Camera/Scanner Area:** Overlay pemindai harus memiliki batas (*bounding box*) dengan sudut membulat, dan area di luar kotak fokus digelapkan dengan *backdrop* tembus pandang (`rgba(0,0,0,0.4)`).
**FAB (Floating Action Button):** Tombol utama untuk "Scan Nyamuk" diletakkan mengambang di tengah bawah layar (dikemas dalam *dock* navigation) untuk jangkauan ibu jari yang ergonomis.
**List Data:** Riwayat scan ditampilkan berjejer secara vertikal dengan bentuk *card* membulat yang memiliki ikon, teks utama (spesies nyamuk), dan *badge* status di sebelah kanan.

# 🚫 RULES TO NEVER BREAK
- Never gunakan *sharp corners* (radius < 8px) pada elemen UI utama.
- Never gunakan *hard drop shadows* dengan *opacity* tinggi (warna hitam pekat).
- Never campurkan border garis keras jika elemen sudah menggunakan *shadow*.
- Never buat *layout* melebar (full width) di desktop; pertahankan porsi maksimal 480px di tengah layar.

# ✅ RULES TO ALWAYS FOLLOW
- Gunakan ikon dengan gaya *outline* tebal dan ujung membulat (*rounded terminals*).
- Pertahankan kontras warna teks (minimal abu-abu gelap `#8e8e93`) agar tetap terbaca pada latar belakang terang.
- Berikan efek *scale up* atau *springy bounce* kecil (`easing-emphasized`) saat tombol atau *card* di-klik.

# 🔧 GAS INTEGRATION NOTES
- File ini di-consume oleh `index.html` (Tailwind v4 CDN) via `@theme` directive di inline `<style>`.
- Pastikan memuat Google Font `Nunito` atau `Plus Jakarta Sans` di bagian `<head>`.
- Batasi *layout* menggunakan `max-w-[480px] mx-auto` pada kontainer utama.
- Fitur kamera di GAS memerlukan API `navigator.mediaDevices.getUserMedia`; pastikan *environment* melayani akses HTTPS agar izin kamera (webcam/kamera HP) diizinkan oleh *browser*.