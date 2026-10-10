import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce
    .number({ error: "Sayfa numarası geçersiz" })
    .int("Sayfa numarası geçersiz")
    .min(1, "Sayfa numarası geçersiz")
    .default(1),
  limit: z.coerce
    .number({ error: "Sayfa boyutu 1 ile 100 arasında olmalı" })
    .int("Sayfa boyutu 1 ile 100 arasında olmalı")
    .min(1, "Sayfa boyutu 1 ile 100 arasında olmalı")
    .max(100, "Sayfa boyutu 1 ile 100 arasında olmalı")
    .default(10),
  search: z.string().trim().optional(),
});

export function buildMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
