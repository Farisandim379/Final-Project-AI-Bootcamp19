import { describe, expect, it } from "vitest";

import { groupIssues, HttpError } from "../src/lib/api.ts";

describe("groupIssues", () => {
  // --- Happy path ---
  it("mengelompokkan issue per field menjadi array pesan", () => {
    const grouped = groupIssues([
      { field: "name", message: "Nama minimal 2 karakter" },
      { field: "email", message: "Email minimal 5 karakter" },
    ]);

    expect(grouped).toEqual({
      name: ["Nama minimal 2 karakter"],
      email: ["Email minimal 5 karakter"],
    });
  });

  it("mempertahankan beberapa pesan untuk field yang sama", () => {
    const grouped = groupIssues([
      { field: "email", message: "Email minimal 5 karakter" },
      { field: "email", message: "Format email tidak valid" },
    ]);

    expect(grouped.email).toEqual([
      "Email minimal 5 karakter",
      "Format email tidak valid",
    ]);
  });

  // --- Edge cases ---
  it("memetakan issue tanpa field ke kunci form agar tidak hilang", () => {
    const grouped = groupIssues([{ field: "", message: "Data tidak valid" }]);

    expect(grouped.form).toEqual(["Data tidak valid"]);
  });

  it("mengembalikan objek kosong untuk daftar issue kosong", () => {
    expect(groupIssues([])).toEqual({});
  });

  it("tidak mencemari prototype saat field bernama __proto__", () => {
    const grouped = groupIssues([{ field: "__proto__", message: "x" }]);

    expect(Object.getPrototypeOf(grouped)).toBe(Object.prototype);

      const descriptor = Object.getOwnPropertyDescriptor(grouped, "__proto__");
      expect(descriptor?.value).toEqual(["x"]);
      expect(Object.keys(grouped)).toEqual(["__proto__"]);
    });
});

describe("HttpError", () => {
  it("menyimpan status dan payload sesuai kontrak ApiError", () => {
    const error = new HttpError(422, {
      error: "Data tidak valid",
      issues: [{ field: "body", message: "Pesan minimal 10 karakter" }],
    });

    expect(error.status).toBe(422);
    expect(error.payload.error).toBe("Data tidak valid");
    expect(error.payload.issues).toHaveLength(1);
    expect(error.name).toBe("HttpError");
  });
});