---
name: "UI & Figma Design Token Standards"
description: "Aturan implementasi UI berbasis desain Figma MCP: design tokens, responsivitas, dan aksesibilitas."
applyTo: "**/*.{css,tsx,jsx,html}"
---

# Standar Implementasi UI dari Figma

## Sumber Design Tokens

- **Satu-satunya** sumber nilai visual adalah `src/styles/tokens.css`.
- Saat Figma MCP mengekstrak palette, tipografi, spacing, radius, atau shadow:
  1. Perbarui **nilai** variabel di `src/styles/tokens.css`.
  2. **Jangan ubah nama** variabel (`--color-primary`, `--space-4`, dst.) agar seluruh komponen ikut berubah otomatis.
  3. Jika Figma memakai token yang belum ada, **tambahkan variabel baru** dengan penamaan konsisten, bukan menulis nilai langsung di komponen.

## Larangan

- ❌ Nilai hex literal di file komponen (`#4f8cff`) — gunakan `var(--color-primary)`.
- ❌ Ukuran `px`/`rem` literal untuk spacing/radius/font-size di komponen.
- ❌ `!important` untuk menimpa token.
- ❌ Inline `style={{ color: "#..." }}`.

Yang diperbolehkan literal: `0`, `100%`, `1fr`, `auto`, dan nilai layout struktural (mis. `min-height: 44px` untuk target sentuh).

## Struktur Kelas

- Gunakan pola **BEM ringkas**: `.card`, `.card__title`, `.card--featured`.
- Kelas utilitas global hanya yang sudah ada: `.container`, `.section`, `.btn`, `.notice`, `.tag`.
- Tambahkan CSS baru di `src/styles/global.css`, bukan `<style>` di komponen.

## Responsivitas

- Pendekatan **mobile-first**; breakpoint tunggal `@media (min-width: 768px)` bila perlu.
- Grid proyek memakai `repeat(auto-fill, minmax(280px, 1fr))` — pertahankan pola ini.
- Pastikan **tidak ada horizontal overflow** pada 320px.

## Aksesibilitas (wajib)

- Tag semantik: `header`, `nav`, `main`, `section`, `article`, `footer`, `button`.
- Setiap section punya heading dan `aria-labelledby` yang menunjuk ke ID heading tersebut.
- Ikon dekoratif: `aria-hidden="true"`. Tombol ikon: `aria-label` jelas.
- Input wajib punya `<label htmlFor>`; error memakai `aria-invalid` + `aria-describedby`.
- Status loading/sukses memakai `role="status"`; error memakai `role="alert"`.
- Kontras teks minimal 4.5:1 terhadap background token.

## Alur Kerja Figma MCP

1. Baca node Figma (URL + `node-id`) — **jangan** membaca seluruh file.
2. Bandingkan token Figma dengan `tokens.css`, laporkan selisihnya.
3. Perbarui `tokens.css` **lebih dulu**, baru sentuh komponen.
4. Verifikasi dengan `npm run build` dan cek 320px / 768px / 1280px.