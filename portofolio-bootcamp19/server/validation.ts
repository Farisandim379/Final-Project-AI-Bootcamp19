import { z } from "zod";

/**
 * Local-part dan domain divalidasi per-label sehingga `a@b..com`, `a@b.com.`,
 * `a.@b.com`, dan `a@-b.com` ditolak — bukan hanya "ada @ dan titik".
 */
const EMAIL_PATTERN =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

/** Kontrak validasi input dari sisi klien. Dipakai juga sebagai tipe di frontend. */
export const messageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(80, "Nama maksimal 80 karakter"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "Email minimal 5 karakter")
    .max(120, "Email maksimal 120 karakter")
    .refine((value) => EMAIL_PATTERN.test(value), {
      message: "Format email tidak valid",
    }),
  body: z
    .string()
    .trim()
    .min(10, "Pesan minimal 10 karakter")
    .max(2000, "Pesan maksimal 2000 karakter"),
});

export type MessageInput = z.infer<typeof messageSchema>;

/**
 * Parameter path harus digit murni. Tanpa ini `z.coerce.number()` menerima
 * "0x1f" -> 31, "1e3" -> 1000, "+5" -> 5, dan " 1 " -> 1.
 */
const DIGITS_ONLY = /^\d+$/;

export const projectIdSchema = z
  .string()
  .trim()
  .regex(DIGITS_ONLY, "ID harus bilangan bulat")
  .transform((value) => Number(value))
  .refine((value) => Number.isSafeInteger(value), "ID harus bilangan bulat")
  .refine((value) => value > 0, "ID harus lebih dari 0");