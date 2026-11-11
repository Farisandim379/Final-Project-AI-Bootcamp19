---
name: figma-to-ui
description: Mengekstrak desain dari Figma MCP dan mengimplementasikannya menjadi UI sesuai design token proyek.
argument-hint: "URL Figma lengkap dengan node-id (mis. https://www.figma.com/design/...?node-id=3-2)"
agent: agent
---

# Figma MCP to UI Workflow

Baca desain target menggunakan tool Figma MCP dari URL:
**${input:figmaUrl}**

Ikuti aturan di [copilot-instructions.md](../copilot-instructions.md) dan [ui-figma.instructions.md](../instructions/ui-figma.instructions.md).

## Konteks Proyek (jangan dilewati)

- Semua nilai visual berasal dari `src/styles/tokens.css` (nama variabel **tidak boleh** diubah).
- Gaya komponen ada di `src/styles/global.css` dengan pola BEM ringkas.
- Komponen halaman ada di `src/pages/`, komponen bersama di `src/components/`.
- Stack: React 19 + Vite, TypeScript strict, tanpa CSS framework.

## Tahapan Eksekusi

1. **Ekstraksi** — dari node Figma, ambil design tokens (palette, font family/size/weight, spacing, radius, shadow), hierarki layout, dan daftar aset SVG.
2. **Diff token** — bandingkan dengan `tokens.css` yang ada, laporkan variabel yang perlu diubah/ditambah. **Jangan** mengubah nama variabel yang sudah dipakai.
3. **Sinkronisasi token** — perbarui `src/styles/tokens.css` lebih dulu.
4. **Implementasi UI** — bangun struktur semantik + styling responsif. Wajib: heading + `aria-labelledby` per section, `aria-hidden` untuk ikon dekoratif, label pada input.
5. **Verifikasi** — jalankan `npm run typecheck`, `npm run build`, `npm test`. Laporkan hasilnya.

## Larangan Keras

- ❌ Menulis hex/px literal di komponen — selalu `var(--token)`.
- ❌ Mengubah nama variabel di `tokens.css`.
- ❌ Menambah dependency CSS (Tailwind, styled-components) tanpa bertanya.
- ❌ Menyalin seluruh isi file Figma — hanya `node-id` yang diberikan.

Jika ada elemen desain yang tidak dapat dipetakan ke token/komponen yang ada, **tanyakan** sebelum menebak.