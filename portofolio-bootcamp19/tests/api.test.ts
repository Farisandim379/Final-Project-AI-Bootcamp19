import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

// DB in-memory wajib diset SEBELUM modul server diimpor.
process.env.DB_PATH = ":memory:";

const { app } = await import("../server/app.ts");

describe("GET /api/health", () => {
  it("mengembalikan status ok", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("GET /api/projects", () => {
  let firstProjectId: number;

  beforeAll(async () => {
    const res = await request(app).get("/api/projects");
    firstProjectId = res.body.data[0].id;
  });

  it("mengembalikan 4 proyek hasil seed", async () => {
    const res = await request(app).get("/api/projects");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(4);
    expect(res.body.data[0]).toMatchObject({
      id: expect.any(Number),
      title: expect.any(String),
      description: expect.any(String),
      tech: expect.any(String),
    });
  });

  it("menyediakan repo_url GitHub asli untuk setiap proyek", async () => {
    const res = await request(app).get("/api/projects");
    const repoUrls = (res.body.data as { repo_url: string | null }[]).map(
      (p) => p.repo_url,
    );

    expect(repoUrls).toEqual(
      expect.arrayContaining([
        "https://github.com/Farisandim379/char-analyzer-bc19",
        "https://github.com/Farisandim379/easycredit-bootcamp",
        "https://github.com/Farisandim379/web-project-management",
        "https://github.com/Farisandim379/cv-website",
      ]),
    );
    expect(repoUrls.every((url) => url !== null)).toBe(true);
  });

  it("menyetel demo_url null karena belum ada deployment publik", async () => {
    const res = await request(app).get("/api/projects");
    const demoUrls = (res.body.data as { demo_url: string | null }[]).map(
      (p) => p.demo_url,
    );

    expect(demoUrls).toHaveLength(4);
    expect(demoUrls.every((url) => url === null)).toBe(true);
  });

  it("mengembalikan satu proyek berdasarkan ID", async () => {
    const res = await request(app).get(`/api/projects/${firstProjectId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(firstProjectId);
  });

  // --- Edge cases ---
  it("menolak ID non-numerik dengan 400", async () => {
    const res = await request(app).get("/api/projects/abc");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ID proyek tidak valid");
  });

  it("mengembalikan 404 untuk ID yang tidak ada", async () => {
    const res = await request(app).get("/api/projects/999999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Proyek tidak ditemukan");
  });
});

describe("POST /api/messages", () => {
  it("menyimpan pesan valid dan mengembalikan 201", async () => {
    const res = await request(app).post("/api/messages").send({
      name: "Siti",
      email: "siti@example.com",
      body: "Halo, saya ingin berdiskusi mengenai kolaborasi proyek.",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toEqual(expect.any(Number));
  });

  // --- Edge cases ---
  it("menolak input tidak valid dengan 422 beserta detail field", async () => {
    const res = await request(app).post("/api/messages").send({
      name: "",
      email: "bukan-email",
      body: "pendek",
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe("Data tidak valid");

    const fields = (res.body.issues as { field: string }[]).map((i) => i.field);
    expect(fields).toEqual(expect.arrayContaining(["name", "email", "body"]));
  });

  it("menolak body JSON yang rusak dengan 400", async () => {
    const res = await request(app)
      .post("/api/messages")
      .set("Content-Type", "application/json")
      .send('{"name": "Budi", ');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Body JSON tidak valid");
  });

  it("membalas 413 (bukan 500) untuk body melebihi limit", async () => {
    const res = await request(app)
      .post("/api/messages")
      .set("Content-Type", "application/json")
      .send(
        JSON.stringify({
          name: "Budi",
          email: "budi@example.com",
          body: "x".repeat(20_000),
        }),
      );

    expect(res.status).toBe(413);
    expect(res.body).toEqual({ error: "Body terlalu besar" });
  });

  it("membalas 415 untuk charset yang tidak didukung", async () => {
    const res = await request(app)
      .post("/api/messages")
      .set("Content-Type", "application/json; charset=latin1")
      .send('{"name":"Budi"}');

    expect(res.status).toBe(415);
    expect(res.body).toEqual({ error: "Charset tidak didukung" });
  });
});

describe("GET /api/projects/:id - ID non-kanonik", () => {
  it("membalas 400 untuk hex/eksponen/tanda plus, bukan 404 menyesatkan", async () => {
    for (const id of ["0x1f", "1e3", "+5"]) {
      const res = await request(app).get(`/api/projects/${id}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("ID proyek tidak valid");
    }
  });
});
