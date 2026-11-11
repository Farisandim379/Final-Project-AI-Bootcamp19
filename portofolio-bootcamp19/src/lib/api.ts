/**
 * Klien API tipis. Semua request lewat path relatif "/api" sehingga:
 * - dev  : diproxy Vite ke localhost:3001 (lihat vite.config.ts)
 * - prod : same-origin, karena Express menyajikan bundle React
 * Tidak ada base URL yang perlu di-hardcode dan tidak ada CORS.
 */

export interface Project {
  id: number;
  title: string;
  description: string;
  repo_url: string | null;
  demo_url: string | null;
  tech: string;
  created_at: string;
}

export interface ApiError {
  error: string;
  issues?: { field: string; message: string }[];
}

export class HttpError extends Error {
  readonly status: number;
  readonly payload: ApiError;

  constructor(status: number, payload: ApiError) {
    super(payload.error);
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
  }
}

/** Batas waktu request, agar status `sending` tidak menggantung selamanya. */
const REQUEST_TIMEOUT_MS = 10_000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    ...init,
  });

  const payload = (await response.json().catch(() => null)) as
    | (T & Partial<ApiError>)
    | null;

  if (!response.ok) {
    throw new HttpError(response.status, {
      error: payload?.error ?? "Permintaan gagal",
      issues: payload?.issues,
    });
  }

  if (payload === null) {
    throw new HttpError(502, { error: "Respons server tidak valid" });
  }

  return payload;
}

export async function getProjects(): Promise<Project[]> {
  const payload = await request<{ data?: Project[] }>("/api/projects");
  return payload.data ?? [];
}

export async function sendMessage(input: {
  name: string;
  email: string;
  body: string;
}): Promise<number> {
  const payload = await request<{ data?: { id?: number } }>("/api/messages", {
    method: "POST",
    body: JSON.stringify(input),
  });

  const id = payload.data?.id;
  if (typeof id !== "number") {
    throw new HttpError(200, { error: "Respons server tidak valid" });
  }

  return id;
}

/** Mengelompokkan issue validasi 422 per field, tanpa membuang issue duplikat. */
export function groupIssues(
  issues: { field: string; message: string }[],
): Record<string, string[]> {
  // Map + fromEntries: kunci seperti "__proto__" menjadi own property dan tidak
  // menyentuh prototype objek hasil.
  const grouped = new Map<string, string[]>();

  for (const issue of issues) {
    const key = issue.field || "form";
    const messages = grouped.get(key);

    if (messages) {
      messages.push(issue.message);
      continue;
    }

    grouped.set(key, [issue.message]);
  }

  return Object.fromEntries(grouped);
}
