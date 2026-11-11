import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { db } from "./db.ts";
import {
  idParamSchema,
  messageSchema,
  projectBodySchema,
  projectIdSchema,
} from "./validation.ts";

export const app = express();

app.use(helmet());
app.use(express.json({ limit: "10kb" }));

/** Bentuk balasan 422 yang seragam untuk semua endpoint yang memvalidasi body. */
function invalidPayload(res: Response, issues: { path: PropertyKey[]; message: string }[]) {
  res.status(422).json({
    error: "Data tidak valid",
    issues: issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
}

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api/projects", (_req: Request, res: Response) => {
  const rows = db
    .prepare(
      "SELECT id, title, description, repo_url, demo_url, tech, created_at FROM projects ORDER BY created_at DESC, id DESC",
    )
    .all();
  res.json({ data: rows });
});

app.get("/api/projects/:id", (req: Request, res: Response) => {
  const parsedId = projectIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ error: "ID proyek tidak valid" });
    return;
  }

  const row = db
    .prepare(
      "SELECT id, title, description, repo_url, demo_url, tech, created_at FROM projects WHERE id = ?",
    )
    .get(parsedId.data);

  if (!row) {
    res.status(404).json({ error: "Proyek tidak ditemukan" });
    return;
  }

  res.json({ data: row });
});

app.post("/api/messages", (req: Request, res: Response) => {
  const parsed = messageSchema.safeParse(req.body);

  if (!parsed.success) {
    invalidPayload(res, parsed.error.issues);
    return;
  }

  const { name, email, body } = parsed.data;
  const result = db
    .prepare("INSERT INTO messages (name, email, body) VALUES (?, ?, ?)")
    .run(name, email, body);

  res.status(201).json({ data: { id: Number(result.lastInsertRowid) } });
});

/** Kotak masuk dashboard: pesan terbaru lebih dulu. */
app.get("/api/messages", (_req: Request, res: Response) => {
  const rows = db
    .prepare(
      "SELECT id, name, email, body, created_at FROM messages ORDER BY created_at DESC, id DESC",
    )
    .all();
  res.json({ data: rows });
});

app.delete("/api/messages/:id", (req: Request, res: Response) => {
  const parsedId = idParamSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ error: "ID pesan tidak valid" });
    return;
  }

  const result = db.prepare("DELETE FROM messages WHERE id = ?").run(parsedId.data);

  if (result.changes === 0) {
    res.status(404).json({ error: "Pesan tidak ditemukan" });
    return;
  }

  res.status(204).end();
});

app.post("/api/projects", (req: Request, res: Response) => {
  const parsed = projectBodySchema.safeParse(req.body);

  if (!parsed.success) {
    invalidPayload(res, parsed.error.issues);
    return;
  }

  const { title, description, repo_url, demo_url, tech } = parsed.data;
  const result = db
    .prepare(
      "INSERT INTO projects (title, description, repo_url, demo_url, tech) VALUES (?, ?, ?, ?, ?)",
    )
    .run(title, description, repo_url, demo_url, tech);

  const row = db
    .prepare(
      "SELECT id, title, description, repo_url, demo_url, tech, created_at FROM projects WHERE id = ?",
    )
    .get(Number(result.lastInsertRowid));

  res.status(201).json({ data: row });
});

app.put("/api/projects/:id", (req: Request, res: Response) => {
  const parsedId = projectIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ error: "ID proyek tidak valid" });
    return;
  }

  const parsed = projectBodySchema.safeParse(req.body);
  if (!parsed.success) {
    invalidPayload(res, parsed.error.issues);
    return;
  }

  const { title, description, repo_url, demo_url, tech } = parsed.data;
  const result = db
    .prepare(
      "UPDATE projects SET title = ?, description = ?, repo_url = ?, demo_url = ?, tech = ? WHERE id = ?",
    )
    .run(title, description, repo_url, demo_url, tech, parsedId.data);

  if (result.changes === 0) {
    res.status(404).json({ error: "Proyek tidak ditemukan" });
    return;
  }

  const row = db
    .prepare(
      "SELECT id, title, description, repo_url, demo_url, tech, created_at FROM projects WHERE id = ?",
    )
    .get(parsedId.data);

  res.json({ data: row });
});

app.delete("/api/projects/:id", (req: Request, res: Response) => {
  const parsedId = projectIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ error: "ID proyek tidak valid" });
    return;
  }

  const result = db.prepare("DELETE FROM projects WHERE id = ?").run(parsedId.data);

  if (result.changes === 0) {
    res.status(404).json({ error: "Proyek tidak ditemukan" });
    return;
  }

  res.status(204).end();
});

// Satu server menyajikan API sekaligus bundle React (tanpa CORS).
// Cukup berdasarkan keberadaan dist/ agar `npm start` tidak bergantung pada NODE_ENV.
const clientDir = resolve("dist");
if (existsSync(clientDir)) {
  app.use(express.static(clientDir));
  app.get(/^(?!\/api).*/, (_req: Request, res: Response) => {
    res.sendFile("index.html", { root: clientDir });
  });
}

app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const clientError = toClientError(err);
  if (clientError) {
    res.status(clientError.status).json({ error: clientError.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Terjadi kesalahan pada server" });
});

interface ClientErrorResponse {
  status: number;
  message: string;
}

/**
 * Error body-parser berasal dari input klien, jadi tidak boleh dilaporkan
 * sebagai 500 + stack trace. Kunci `type` adalah kontrak http-errors.
 */
const BODY_PARSER_ERRORS = new Map<string, ClientErrorResponse>([
  ["entity.parse.failed", { status: 400, message: "Body JSON tidak valid" }],
  ["entity.too.large", { status: 413, message: "Body terlalu besar" }],
  ["charset.unsupported", { status: 415, message: "Charset tidak didukung" }],
  ["encoding.unsupported", { status: 415, message: "Encoding tidak didukung" }],
  ["request.aborted", { status: 400, message: "Permintaan dibatalkan" }],
]);

/** Fallback bila JSON.parse melempar SyntaxError tanpa properti `type`. */
const PARSE_FAILED: ClientErrorResponse = {
  status: 400,
  message: "Body JSON tidak valid",
};

function toClientError(err: unknown): ClientErrorResponse | null {
  if (!(err instanceof Error)) return null;

  const { type } = err as { type?: unknown };
  if (typeof type === "string") {
    const known = BODY_PARSER_ERRORS.get(type);
    if (known) return known;
  }

  // JSON rusak: SyntaxError dari JSON.parse yang membawa properti `body`.
  if (err instanceof SyntaxError && "body" in err) return PARSE_FAILED;

  return null;
}