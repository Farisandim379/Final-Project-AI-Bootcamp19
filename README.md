# Final Project AI — Bootcamp Batch 19

Repositori ini berisi hasil implementasi **Final Project AI Engineering (LLM, Prompt Engineering, Context Engineering, & GitHub Copilot)** pada **Bootcamp Batch 19** oleh **Faris Andi Muhammad**.

## Struktur Repositori

```text
.
├── Step-Step.docx                    # Dokumentasi step-by-step orkestrasi AI, prompting, Figma MCP, & fungsi .github/
├── portofolio-bootcamp19/            # Proyek utama: portofolio web full-stack + konfigurasi Copilot (.github/)
│   ├── .github/
│   │   ├── copilot-instructions.md               # Always-on global system prompt proyek
│   │   ├── instructions/
│   │   │   └── ui-figma.instructions.md          # Aturan UI, design tokens, responsivitas & aksesibilitas
│   │   └── prompts/
│   │       ├── code-review.prompt.md             # Reusable prompt /code-review
│   │       ├── figma-to-ui.prompt.md             # Reusable prompt /figma-to-ui (Figma MCP)
│   │       └── unit-test.prompt.md               # Reusable prompt /unit-test
│   ├── ARCHITECTURE_NOTES.md         # Pemetaan arsitektur codebase (@workspace & #codebase)
│   ├── FINAL_PROJECT_COPILOT_GUIDE.md
│   ├── server/                       # Backend Express 5 + Zod + node:sqlite
│   ├── src/                          # Frontend React 19 + Vite + CSS design tokens
│   └── tests/                        # Unit & integration test (Vitest + Supertest)
└── Githbu-copilot/                   # Latihan awal: slide orientasi Welcome Aboard (HTML + Tailwind CSS)
```

---

## Ringkasan Orkestrasi & Konteks `.github/`

Seluruh pengembangan pada [`portofolio-bootcamp19/`](./portofolio-bootcamp19) menerapkan arsitektur konteks GitHub Copilot:

1. **Always-On Instructions** ([`.github/copilot-instructions.md`](./portofolio-bootcamp19/.github/copilot-instructions.md)) — Menetapkan aturan arsitektur single-server Express + React, TypeScript strict tanpa `any`, parameterized SQLite (`?`), format response/error, validasi Zod, serta standar minimal **2 happy path + 3 edge cases** untuk setiap pengujian.
2. **Scoped Instructions** ([`.github/instructions/ui-figma.instructions.md`](./portofolio-bootcamp19/.github/instructions/ui-figma.instructions.md)) — Aktif otomatis untuk `**/*.{css,tsx,jsx,html}` guna menjaga pemakaian design tokens di `src/styles/tokens.css`, pola BEM di `src/styles/global.css`, tampilan responsif mobile-first, aksesibilitas, dan alur kerja **Figma MCP**.
3. **Reusable Prompt Files** ([`.github/prompts/`](./portofolio-bootcamp19/.github/prompts)) — Menyediakan slash command `/code-review`, `/figma-to-ui`, dan `/unit-test` dengan YAML frontmatter dan variabel input dinamis (`${input:...}`).
4. **Dokumentasi Lengkap** ([`Step-Step.docx`](./Step-Step.docx)) — Merangkum proses orkestrasi (Ask → Edit/Interactive → Agent Mode), fungsi 5 lapis `.github/`, isi penuh konteks `.md`, hingga alur prompt dari onboarding, audit bug, integrasi Figma MCP, perbaikan scroll spy navbar, hingga automated testing.

---

## Proyek GitHub yang Ditampilkan pada Portofolio

- [`char-analyzer-bc19`](https://github.com/Farisandim379/char-analyzer-bc19) — Char Analyzer REST API (Java, Spring Boot, PostgreSQL, Spring Data JPA)
- [`easycredit-bootcamp`](https://github.com/Farisandim379/easycredit-bootcamp) — EasyCredit — Pengajuan Kredit Online (ASP.NET Core, PostgreSQL, Oracle, Dapper)
- [`web-project-management`](https://github.com/Farisandim379/web-project-management) — Javas Project Management (Laravel 12, Livewire, Tailwind CSS, MySQL)
- [`cv-website`](https://github.com/Farisandim379/cv-website) — Interactive CV (Vue 3, Express, Tailwind CSS, Vite)

---

## Menjalankan Proyek Utama (`portofolio-bootcamp19`)

> Prasyarat: **Node.js ≥ 22.5.0** (dibutuhkan oleh modul bawaan `node:sqlite`) dan **npm**.

```bash
cd portofolio-bootcamp19
npm install
```

### Mode Development (2 terminal)
```bash
# Terminal 1 — Backend API Express (port 3001)
npm run dev:api

# Terminal 2 — Frontend Vite (port 5173, proxy /api -> 3001)
npm run dev
```

### Verifikasi & Build Produksi
```bash
npm run typecheck   # TypeScript strict check (tsc --noEmit)
npm test            # Vitest + Supertest (4 file uji, 39/39 PASS)
npm run build       # Build frontend ke dist/
npm start           # Jalankan server produksi (API + static dist/)
```
