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

describe("GET /api/messages", () => {
  it("mengembalikan pesan yang tersimpan, terbaru lebih dulu", async () => {
    await request(app).post("/api/messages").send({
      name: "Andi",
      email: "andi@example.com",
      body: "Pesan pertama untuk kotak masuk dashboard.",
    });
    await request(app).post("/api/messages").send({
      name: "Bunga",
      email: "bunga@example.com",
      body: "Pesan kedua yang harusnya tampil lebih dulu.",
    });

    const res = await request(app).get("/api/messages");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      email: expect.any(String),
      body: expect.any(String),
      created_at: expect.any(String),
    });
    expect(res.body.data[0].name).toBe("Bunga");
  });
});

describe("DELETE /api/messages/:id", () => {
  it("menghapus pesan dan membalas 204", async () => {
    const created = await request(app).post("/api/messages").send({
      name: "Citra",
      email: "citra@example.com",
      body: "Pesan yang akan dihapus dari kotak masuk.",
    });
    const id = created.body.data.id as number;

    const res = await request(app).delete(`/api/messages/${id}`);
    expect(res.status).toBe(204);

    const after = await request(app).get("/api/messages");
    const ids = (after.body.data as { id: number }[]).map((m) => m.id);
    expect(ids).not.toContain(id);
  });

  it("membalas 404 untuk pesan yang sudah tidak ada", async () => {
    const res = await request(app).delete("/api/messages/999999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Pesan tidak ditemukan");
  });

  it("membalas 400 untuk ID pesan non-numerik", async () => {
    const res = await request(app).delete("/api/messages/abc");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ID pesan tidak valid");
  });
});

describe("POST /api/projects", () => {
  it("membuat proyek baru dan membalas 201 dengan data lengkap", async () => {
    const res = await request(app).post("/api/projects").send({
      title: "Proyek Uji",
      description: "Deskripsi proyek uji yang cukup panjang untuk lolos validasi.",
      repo_url: "https://github.com/contoh/proyek-uji",
      demo_url: null,
      tech: "React, TypeScript",
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      id: expect.any(Number),
      title: "Proyek Uji",
      repo_url: "https://github.com/contoh/proyek-uji",
      demo_url: null,
      tech: "React, TypeScript",
      created_at: expect.any(String),
    });

    await request(app).delete(`/api/projects/${res.body.data.id}`);
  });

  it("menyimpan string kosong sebagai null untuk tautan opsional", async () => {
    const res = await request(app).post("/api/projects").send({
      title: "Proyek Tanpa Tautan",
      description: "Proyek tanpa repo maupun demo untuk menguji normalisasi kosong.",
      repo_url: "",
      demo_url: "",
      tech: "",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.repo_url).toBeNull();
    expect(res.body.data.demo_url).toBeNull();

    await request(app).delete(`/api/projects/${res.body.data.id}`);
  });

  it("menolak payload tidak valid dengan 422 beserta detail field", async () => {
    const res = await request(app).post("/api/projects").send({
      title: "x",
      description: "pendek",
      repo_url: "bukan-url",
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe("Data tidak valid");

    const fields = (res.body.issues as { field: string }[]).map((i) => i.field);
    expect(fields).toEqual(expect.arrayContaining(["title", "description", "repo_url"]));
  });
});

describe("PUT /api/projects/:id", () => {
  it("memperbarui proyek yang ada", async () => {
    const created = await request(app).post("/api/projects").send({
      title: "Judul Lama",
      description: "Deskripsi awal sebelum diperbarui oleh pengujian.",
      repo_url: null,
      demo_url: null,
      tech: "HTML",
    });
    const id = created.body.data.id as number;

    const res = await request(app).put(`/api/projects/${id}`).send({
      title: "Judul Baru",
      description: "Deskripsi setelah diperbarui lewat dashboard admin.",
      repo_url: "https://github.com/contoh/baru",
      demo_url: "https://contoh.test/demo",
      tech: "React, Express",
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id,
      title: "Judul Baru",
      repo_url: "https://github.com/contoh/baru",
      demo_url: "https://contoh.test/demo",
      tech: "React, Express",
    });

    await request(app).delete(`/api/projects/${id}`);
  });

  it("membalas 404 untuk proyek yang tidak ada", async () => {
    const res = await request(app).put("/api/projects/999999").send({
      title: "Tidak Ada",
      description: "Proyek ini tidak pernah dibuat di database pengujian.",
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Proyek tidak ditemukan");
  });

  it("membalas 400 untuk ID non-numerik", async () => {
    const res = await request(app).put("/api/projects/abc").send({
      title: "Judul",
      description: "Deskripsi yang panjangnya memadai untuk validasi.",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ID proyek tidak valid");
  });
});

describe("DELETE /api/projects/:id", () => {
  it("menghapus proyek dan membalas 204", async () => {
    const created = await request(app).post("/api/projects").send({
      title: "Proyek Sekali Pakai",
      description: "Proyek yang dibuat hanya untuk dihapus pada pengujian ini.",
    });
    const id = created.body.data.id as number;

    const res = await request(app).delete(`/api/projects/${id}`);
    expect(res.status).toBe(204);

    const after = await request(app).get(`/api/projects/${id}`);
    expect(after.status).toBe(404);
  });

  it("membalas 404 untuk proyek yang tidak ada", async () => {
    const res = await request(app).delete("/api/projects/999999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Proyek tidak ditemukan");
  });
});
