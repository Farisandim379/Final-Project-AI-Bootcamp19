# Berijalan — Bootcamp Batch 19 Orientation Slide

Implementasi HTML + Tailwind CSS dari desain Figma
[`proyek-pemrograman`](https://www.figma.com/design/mCeVn33wzMHGCZ9GYkjeMM/proyek-pemrograman?node-id=3-2)
(node `3:2`) — slide orientasi "Welcome Aboard" untuk Berijalan Academy Division.

## Struktur folder

```
.
├── index.html                  # Markup halaman (semantic HTML5)
├── assets/
│   └── icons/                  # Aset SVG hasil ekspor Figma
│       ├── logo-mark.svg
│       ├── calendar.svg
│       ├── track.svg
│       ├── craft.svg
│       ├── guild.svg
│       ├── play.svg
│       ├── arrow-right.svg
│       ├── chevron-left.svg
│       └── chevron-right.svg
├── src/
│   ├── css/
│   │   └── input.css           # Sumber Tailwind + @layer base/components/utilities
│   └── js/
│       └── main.js             # Progressive enhancement (navigasi & CTA)
├── dist/
│   └── css/
│       └── style.css           # Hasil build (generated, jangan diedit manual)
├── tailwind.config.js          # Design token: warna, font, shadow, animasi
├── postcss.config.js
├── package.json
└── .gitignore
```

## Menjalankan

```bash
npm install       # install Tailwind + PostCSS (sekali saja)
npm run build     # build CSS sekali (minified) -> dist/css/style.css
npm run dev       # watch mode, rebuild otomatis saat file berubah
npm run serve     # sajian statis di http://localhost:3000
```

Buka `index.html` langsung di browser, atau jalankan `npm run serve`.

## Catatan implementasi

### Design token
Semua nilai visual dari Figma dipusatkan di `tailwind.config.js`, bukan
dihardcode di markup:

| Token | Nilai | Kegunaan |
| --- | --- | --- |
| `ink.950` | `#0f131d` | Background halaman |
| `ink.900` | `#171b26` | Pill / pagination |
| `ink.850` | `#1c1f2a` | Chip kecil (`01 / TRACK`) |
| `ink.800` | `#262a35` | Tile ikon |
| `accent.lavender` | `#c0c1ff` | Awal gradient judul |
| `accent.indigo` | `#8083ff` | CTA utama, tengah gradient |
| `accent.teal` | `#4fdbc8` | Status live, akhir gradient |
| `accent.deep` | `#0d0096` | Teks di atas CTA utama |
| `fg.primary` … `fg.faint` | `#dfe2f1` → `#464554` | Skala teks |

Tipografi: **Plus Jakarta Sans** (display/heading), **Inter** (body),
**JetBrains Mono** (label teknis).

### Arsitektur CSS
`src/css/input.css` dibagi tiga lapis agar mudah dirawat:

1. **base** — reset ringan, `body`, dan `prefers-reduced-motion`.
2. **components** — potongan UI yang dipakai berulang: `.shell`, `.pill`,
   `.chip`, `.metric-card`, `.btn-primary`, `.btn-ghost`, `.icon-btn`,
   `.ambient-glow-*`.
3. **utilities** — helper spesifik: `.text-gradient-brand`, `.status-dot`,
   `.reveal`.

Markup memakai kelas komponen tersebut, sehingga perubahan tema cukup
dilakukan di satu tempat.

### Aksesibilitas
- Struktur landmark: `<header>`, `<main>`, `<footer>`, `<nav>`, `<article>`.
- Ikon dekoratif memakai `alt=""` + `aria-hidden`; ikon berfungsi tetap
  punya `aria-label`.
- Tombol navigasi memakai `<button>` asli dengan status `disabled` yang
  sinkron dengan posisi slide.
- Animasi dimatikan otomatis saat pengguna mengaktifkan
  *reduce motion*.

### Responsif
- Mobile: kartu bertumpuk 1 kolom, CTA full-width.
- `sm` (≥640px): kartu 3 kolom, header menampilkan chip "Q2 Cohort".
- `lg`/`xl`: padding kanvas mengikuti frame Figma (192px).

### JavaScript
`src/js/main.js` hanya *progressive enhancement* — halaman tetap terbaca
tanpa JS. Interaksi yang tersedia:
- Tombol panah dan keyboard (`←`, `→`, `PageUp`, `PageDown`) memancarkan
  event `deck:navigate`.
- CTA memancarkan `orientation:start` dan `portal:open`.

Sambungkan event tersebut ke router presentasi atau backend Anda.