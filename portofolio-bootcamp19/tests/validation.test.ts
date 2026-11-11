import { describe, expect, it } from "vitest";

import {
  idParamSchema,
  messageSchema,
  projectBodySchema,
  projectIdSchema,
} from "../server/validation.ts";

describe("messageSchema", () => {
  // --- Happy path ---
  it("menerima payload valid dan menormalkan email", () => {
    const result = messageSchema.parse({
      name: "  Budi Santoso ",
      email: "  Budi@Example.COM ",
      body: "Halo, saya tertarik bekerja sama untuk proyek baru.",
    });

    expect(result.name).toBe("Budi Santoso");
    expect(result.email).toBe("budi@example.com");
    expect(result.body).toContain("bekerja sama");
  });

  it("menerima pesan tepat pada batas minimum (10 karakter)", () => {
    const result = messageSchema.safeParse({
      name: "Ani",
      email: "ani@mail.co",
      body: "1234567890",
    });

    expect(result.success).toBe(true);
  });

  // --- Edge / invalid cases ---
  it("menolak nama yang terlalu pendek", () => {
    const result = messageSchema.safeParse({
      name: "A",
      email: "a@mail.com",
      body: "Pesan yang cukup panjang untuk lolos validasi.",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["name"]);
  });

  it("menolak format email tidak valid", () => {
    const result = messageSchema.safeParse({
      name: "Budi",
      email: "budi-at-example",
      body: "Pesan yang cukup panjang untuk lolos validasi.",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["email"]);
  });

    it("menerima email dengan subdomain, tag plus, dan TLD panjang", () => {
      for (const email of [
        "budi@mail.example.co.id",
        "budi+proyek@example.com",
        "budi.santoso@sub-domain.example.org",
      ]) {
        const result = messageSchema.safeParse({
          name: "Budi",
          email,
          body: "Pesan yang cukup panjang untuk lolos validasi.",
        });

        expect(result.success).toBe(true);
      }
    });

    it("menolak email dengan titik ganda, titik di ujung, atau domain tidak valid", () => {
      for (const email of [
        "a@b..com",
        "a@b.com.",
        "a.@b.com",
        "a@-b.com",
        "a@b-.com",
        "a@b.c",
      ]) {
        const result = messageSchema.safeParse({
          name: "Budi",
          email,
          body: "Pesan yang cukup panjang untuk lolos validasi.",
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues.some((issue) => issue.path[0] === "email")).toBe(true);
      }
    });

  it("menolak pesan yang melebihi 2000 karakter", () => {
    const result = messageSchema.safeParse({
      name: "Budi",
      email: "budi@example.com",
      body: "x".repeat(2001),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["body"]);
  });

  it("menolak tipe data yang salah (body bukan string)", () => {
    const result = messageSchema.safeParse({
      name: "Budi",
      email: "budi@example.com",
      body: 12345,
    });

    expect(result.success).toBe(false);
  });
});

describe("projectIdSchema", () => {
  it("mengubah string numerik menjadi number", () => {
    expect(projectIdSchema.parse("42")).toBe(42);
  });

  it("menerima angka dengan spasi di tepi setelah trim", () => {
    expect(projectIdSchema.parse(" 42 ")).toBe(42);
  });

  it("menolak ID nol, negatif, dan non-numerik", () => {
    for (const invalid of ["0", "-3", "abc", "1.5", ""]) {
      expect(projectIdSchema.safeParse(invalid).success).toBe(false);
    }
  });

  it("menolak notasi non-kanonik (hex, eksponen, tanda plus) yang dulu diterima z.coerce", () => {
    for (const invalid of ["0x1f", "1e3", "+5", "1_000", "1.0"]) {
      expect(projectIdSchema.safeParse(invalid).success).toBe(false);
    }
  });

  it("menolak angka di luar safe integer setelah konversi", () => {
    expect(projectIdSchema.safeParse("9007199254740993").success).toBe(false);
  });
});

  describe("idParamSchema", () => {
    it("berperilaku sama dengan projectIdSchema", () => {
      expect(idParamSchema.parse("7")).toBe(7);
      expect(idParamSchema.safeParse("0").success).toBe(false);
      expect(idParamSchema.safeParse("abc").success).toBe(false);
    });
  });

  describe("projectBodySchema", () => {
    const valid = {
      title: "Proyek Contoh",
      description: "Deskripsi proyek contoh yang cukup panjang untuk validasi.",
      tech: "React, TypeScript",
    };

    it("menerima payload minimal tanpa tautan", () => {
      const result = projectBodySchema.parse(valid);

      expect(result.repo_url).toBeNull();
      expect(result.demo_url).toBeNull();
    });

    it("mengubah string kosong menjadi null", () => {
      const result = projectBodySchema.parse({
        ...valid,
        repo_url: "",
        demo_url: "  ",
      });

      expect(result.repo_url).toBeNull();
      expect(result.demo_url).toBeNull();
    });

    it("mempertahankan null eksplisit dari dashboard", () => {
      const result = projectBodySchema.parse({
        ...valid,
        repo_url: null,
        demo_url: null,
      });

      expect(result.repo_url).toBeNull();
      expect(result.demo_url).toBeNull();
    });

    it("menerima URL http dan https", () => {
      for (const url of ["https://github.com/a/b", "http://contoh.test"]) {
        const result = projectBodySchema.parse({ ...valid, repo_url: url });
        expect(result.repo_url).toBe(url);
      }
    });

    it("menolak URL tanpa skema http(s)", () => {
      for (const url of ["ftp://contoh.test", "github.com/a/b", "javascript:alert(1)"]) {
        expect(projectBodySchema.safeParse({ ...valid, repo_url: url }).success).toBe(
          false,
        );
      }
    });

    it("menolak judul terlalu pendek dan deskripsi terlalu pendek", () => {
      const result = projectBodySchema.safeParse({
        title: "x",
        description: "pendek",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((issue) => issue.path.join("."));
        expect(fields).toEqual(expect.arrayContaining(["title", "description"]));
      }
    });

    it("memakai string kosong sebagai default tech", () => {
      expect(projectBodySchema.parse(valid).tech).toBe("React, TypeScript");
      expect(
        projectBodySchema.parse({ title: "Dua Huruf", description: "Deskripsi cukup panjang." }).tech,
      ).toBe("");
    });
  });