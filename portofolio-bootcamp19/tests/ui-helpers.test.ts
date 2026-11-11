import { describe, expect, it } from "vitest";

import { toProject, truncate } from "../src/lib/project.ts";

const ROW = {
  id: 7,
  title: "Dashboard Analitik",
  description: "Visualisasi data penjualan.",
  repo_url: "https://github.com/contoh/dashboard",
  demo_url: null,
  tech: "React, Chart.js , TypeScript",
  created_at: "2026-11-11 10:00:00",
};

describe("toProject", () => {
  // --- Happy path ---
  it("memetakan baris API menjadi model UI dengan camelCase", () => {
    const project = toProject(ROW);

    expect(project).toMatchObject({
      id: 7,
      repoUrl: "https://github.com/contoh/dashboard",
      demoUrl: null,
      createdAt: "2026-11-11 10:00:00",
    });
  });

  it("memecah tech menjadi array dan memangkas spasi", () => {
    expect(toProject(ROW).tech).toEqual(["React", "Chart.js", "TypeScript"]);
  });

  // --- Edge cases ---
  it("menghasilkan array kosong bila tech kosong", () => {
    expect(toProject({ ...ROW, tech: "" }).tech).toEqual([]);
  });

  it("membuang entri tech kosong akibat koma berlebih", () => {
    expect(toProject({ ...ROW, tech: ",,React,," }).tech).toEqual(["React"]);
  });
});

describe("truncate", () => {
  it("mengembalikan teks asli bila tidak melebihi batas", () => {
    expect(truncate("Teks pendek", 20)).toBe("Teks pendek");
  });

  it("memotong pada batas kata terdekat dan menambahkan elipsis", () => {
    const result = truncate("Kalimat contoh yang cukup panjang", 18);

    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(19);
    expect(result).toBe("Kalimat contoh…");
  });

  it("menangani batas nol dan negatif", () => {
    expect(truncate("Teks apa pun", 0)).toBe("");
    expect(truncate("Teks apa pun", -5)).toBe("");
  });
});