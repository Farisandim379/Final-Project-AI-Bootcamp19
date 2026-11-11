export interface Project {
  id: number;
  title: string;
  description: string;
  repoUrl: string | null;
  demoUrl: string | null;
  tech: string[];
  createdAt: string;
}

/** Mengubah baris API (snake_case) menjadi model UI (camelCase + array tech). */
export function toProject(row: {
  id: number;
  title: string;
  description: string;
  repo_url: string | null;
  demo_url: string | null;
  tech: string;
  created_at: string;
}): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    repoUrl: row.repo_url,
    demoUrl: row.demo_url,
    tech: row.tech
      ? row.tech
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    createdAt: row.created_at,
  };
}

/** Memotong teks panjang agar kartu tetap rapi tanpa memecah kata. */
export function truncate(text: string, maxLength: number): string {
  if (maxLength <= 0) return "";
  if (text.length <= maxLength) return text;

  const sliced = text.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  const cut = lastSpace > maxLength * 0.6 ? sliced.slice(0, lastSpace) : sliced;

  return `${cut.trimEnd()}…`;
}