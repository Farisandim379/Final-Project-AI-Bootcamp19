import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Database mengikuti env DB_PATH supaya unit test bisa memakai ":memory:".
 * Default: data/portfolio.db (auto-dibuat, sudah masuk .gitignore).
 */
const dbPath = process.env.DB_PATH ?? "data/portfolio.db";
if (dbPath !== ":memory:") {
  mkdirSync(dirname(dbPath), { recursive: true });
}

export const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    repo_url TEXT,
    demo_url TEXT,
    tech TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

/**
 * Empat repositori GitHub asli pemilik portofolio.
 * `demo_url` sengaja null: belum ada deployment publik, jadi kartu hanya
 * menampilkan tautan kode sumber (lihat ProjectCard).
 *
 * Urutan array dibalik dari urutan tampil, karena GET /api/projects memakai
 * `ORDER BY created_at DESC, id DESC` sehingga id terbesar tampil lebih dulu.
 */
const SEED_PROJECTS = [
  {
    title: "Interactive CV",
    description:
      "Website portofolio pribadi dengan frontend Vue 3 + Vite dan backend Express 5, disiapkan untuk deploy di Vercel.",
    repo_url: "https://github.com/Farisandim379/cv-website",
    demo_url: null,
    tech: "Vue 3, Express, Tailwind CSS, Vite",
  },
  {
    title: "Javas Project Management",
    description:
      "Aplikasi manajemen proyek internal dengan Kanban board, RBAC Administrator/Member, dashboard statistik task, dan pencarian real-time.",
    repo_url: "https://github.com/Farisandim379/web-project-management",
    demo_url: null,
    tech: "Laravel 12, Livewire, Tailwind CSS, MySQL",
  },
  {
    title: "EasyCredit — Pengajuan Kredit Online",
    description:
      "Sistem pengajuan kredit online dua database: master data di PostgreSQL (EF Core) dan transaksi cicilan di Oracle lewat stored procedure, diamankan JWT dan API key.",
    repo_url: "https://github.com/Farisandim379/easycredit-bootcamp",
    demo_url: null,
    tech: "ASP.NET Core, PostgreSQL, Oracle, Dapper",
  },
  {
    title: "Char Analyzer REST API",
    description:
      "REST API Spring Boot untuk menganalisis kalimat: menghitung total huruf alfabet dan frekuensi tiap karakter, lalu menyimpan riwayat analisis ke PostgreSQL.",
    repo_url: "https://github.com/Farisandim379/char-analyzer-bc19",
    demo_url: null,
    tech: "Java, Spring Boot, PostgreSQL, Spring Data JPA",
  },
];

const { count } = db
  .prepare("SELECT COUNT(*) AS count FROM projects")
  .get() as { count: number };

if (count === 0) {
  const insert = db.prepare(
    "INSERT INTO projects (title, description, repo_url, demo_url, tech) VALUES (?, ?, ?, ?, ?)",
  );
  for (const p of SEED_PROJECTS) {
    insert.run(p.title, p.description, p.repo_url, p.demo_url, p.tech);
  }
}