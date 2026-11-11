# Project Instructions

## 1. Gambaran Proyek & Arsitektur

- Proyek ini adalah **portofolio web personal** (single-page, satu proses).
- Pola arsitektur: **Satu server Express** yang menyajikan API `/api/*` sekaligus bundle React hasil build (`dist/`).
- Pisahkan tanggung jawab secara berlapis:
  - `server/app.ts` — konfigurasi Express, routing, middleware (transport).
  - `server/validation.ts` — kontrak & validasi input (Zod).
  - `server/db.ts` — akses database via parameterized query.
  - `src/pages/` — komponen halaman (presentasi).
  - `src/lib/` — klien API & helper murni (mudah diuji).
- **Jangan** menambahkan lapisan/service baru tanpa kebutuhan nyata. Proyek ini kecil dan sengaja dijaga datar.

## 2. Tech Stack & Versi

- Bahasa: **TypeScript** (strict, `noUnusedLocals`, `noUnusedParameters`).
- Runtime: **Node.js ≥ 22.5** (wajib, karena memakai modul bawaan `node:sqlite`).
- Frontend: **React 19** + **Vite**.
- Backend: **Express 5**, **Helmet**, **Zod**.
- Database: **SQLite via `node:sqlite`** — tanpa library tambahan, tanpa server DB, tanpa ORM.
- Test: **Vitest** + **Supertest**.
- Package manager: **npm** (gunakan `npm`, jangan mencampur dengan pnpm/yarn).

## 3. Konvensi Penamaan & Gaya Kode

- Nama simbol harus mendeskripsikan tujuan: `getProjects`, `toProject`, `isSending`.
- Terapkan **SRP** dan **Guard Clauses** (early return) — hindari `if` bersarang lebih dari 2 level.
- Gunakan tipe eksplisit. **Dilarang** memakai `any`; gunakan `unknown` lalu persempit tipenya.
- Impor modul lokal **wajib memakai ekstensi `.ts`/`.tsx`** (mis. `import { db } from "./db.ts"`), karena proyek berjalan dengan `tsx` + `allowImportingTsExtensions`.
- Penamaan file: komponen `PascalCase.tsx`, modul non-komponen `camelCase.ts`.
- Gaya CSS: **design tokens** di `src/styles/tokens.css`. Komponen **dilarang** memakai nilai warna/ukuran literal — selalu `var(--token)`.

## 4. Standar Error Handling & Format Response

- Semua query database **wajib** memakai placeholder `?` (`db.prepare(sql).get(param)`). Dilarang menyusun SQL dari string input.
- Format response sukses: `{ "data": ... }`.
- Format response gagal: `{ "error": "pesan" }`, dan untuk validasi tambahkan `{ "issues": [{ "field", "message" }] }`.
- Kode status: `200` OK, `201` Created, `400` request tidak valid (mis. ID salah, JSON rusak), `404` tidak ditemukan, `422` gagal validasi, `500` kesalahan server.
- Selalu tangani `null`/`undefined` dan promise rejection secara eksplisit.

## 5. Keamanan & Pengujian

- Validasi **semua** input eksternal dengan Zod sebelum diproses.
- Ambil konfigurasi dari environment variable (`PORT`, `DB_PATH`, `NODE_ENV`). **Jangan pernah** hardcode secret.
- Pertahankan `helmet()` aktif dan `express.json({ limit: "10kb" })`.
- Jangan menambahkan CORS manual: dev memakai proxy Vite, produksi same-origin.
- Setiap fitur baru atau bugfix **wajib** disertai test di `tests/`:
  - minimal **2 skenario normal** (happy path),
  - minimal **3 skenario gagal/batas** (input kosong/null, format salah, boundary).
- Jalankan `npm run typecheck` dan `npm test` — keduanya wajib lulus sebelum pekerjaan dianggap selesai.
- Jika spesifikasi atau konteks belum lengkap, **ajukan pertanyaan klarifikasi** alih-alih menebak logika bisnis.

## 6. Perintah Penting

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Frontend Vite di port 5173 (proxy `/api` → 3001) |
| `npm run dev:api` | API Express di port 3001 |
| `npm run build` | Build frontend ke `dist/` |
| `npm start` | Jalankan server produksi (menyajikan API + `dist/`) |
| `npm test` | Vitest (37 test) |
| `npm run typecheck` | `tsc --noEmit` |