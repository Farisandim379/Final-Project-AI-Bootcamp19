---
name: unit-test
description: Membuat unit test lengkap (happy path + edge cases) dan memverifikasinya.
argument-hint: "Path file yang akan diuji (mis. src/lib/project.ts)"
agent: agent
---

# Automated Unit Test Generator

Buat unit test untuk **${input:targetFile:src/lib/project.ts}** dengan mengikuti aturan di [copilot-instructions.md](../copilot-instructions.md).

## Konteks Proyek

- Framework: **Vitest** + **Supertest**, konfigurasi di `vite.config.ts` (`test.include = ["tests/**/*.test.ts"]`).
- Untuk test API: set `process.env.DB_PATH = ":memory:"` **sebelum** mengimpor `server/app.ts`, lalu gunakan `await import(...)`.
- Untuk test helper murni: impor langsung dari `src/lib/`, tanpa DOM.
- Jangan menambah dependency test baru tanpa bertanya.

## Cakupan Wajib

1. Minimal **2 skenario normal** (happy path) — termasuk verifikasi nilai hasil, bukan hanya status.
2. Minimal **3 skenario gagal/batas**: input kosong, `null`/`undefined`, format salah, tipe salah, atau boundary (batas min/maks).

## Aturan Penulisan

- Satu `describe` per fungsi/endpoint; nama `it` harus menjelaskan perilaku yang diharapkan.
- Gunakan `expect(...).toMatchObject` untuk objek parsial dan `arrayContaining` untuk daftar.
- Hindari assertion yang selalu benar (mis. `expect(true).toBe(true)`).
- Beri komentar pemisah `// --- Happy path ---` dan `// --- Edge cases ---`.

## Verifikasi

Setelah file test dibuat, jalankan:

```bash
npm run typecheck
npm test
```

Keduanya **wajib lulus 100%**. Jika gagal, perbaiki akar masalahnya — jangan melemahkan assertion.
Laporkan jumlah test yang lulus di akhir.