import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { HttpError } from "../lib/errors";
import { buildMeta, paginationSchema } from "../lib/pagination";
import { prisma } from "../lib/prisma";
import { userSelect } from "../lib/selects";
import { authenticate, requireRole } from "../middleware/auth";
import type { Prisma } from "../generated/prisma/client";

const router = Router();
router.use(authenticate, requireRole("ADMIN"));

const emailField = z
  .string({ error: "E-posta adresi gerekli" })
  .trim()
  .toLowerCase()
  .email("Geçerli bir e-posta adresi girin");

const passwordField = z
  .string({ error: "Şifre gerekli" })
  .min(8, "Şifre en az 8 karakter olmalı")
  .max(72, "Şifre en fazla 72 karakter olabilir");

const fullNameField = z
  .string({ error: "Ad soyad gerekli" })
  .trim()
  .min(2, "Ad soyad en az 2 karakter olmalı")
  .max(100, "Ad soyad en fazla 100 karakter olabilir");

const roleField = z.enum(["ADMIN", "STAFF"], { error: "Geçerli bir rol seçin" });

const departmentIdField = z.coerce
  .number({ error: "Departman seçin" })
  .int("Departman seçin")
  .positive("Departman seçin");

const listQuerySchema = paginationSchema.extend({
  departmentId: z.coerce
    .number({ error: "Departman filtresi geçersiz" })
    .int("Departman filtresi geçersiz")
    .positive("Departman filtresi geçersiz")
    .optional(),
});

const createSchema = z.object({
  fullName: fullNameField,
  email: emailField,
  password: passwordField,
  role: roleField,
  departmentId: departmentIdField,
});

const updateSchema = z.object({
  fullName: fullNameField,
  email: emailField,
  role: roleField,
  departmentId: departmentIdField,
});

const passwordSchema = z.object({ password: passwordField });

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, "Geçersiz kullanıcı numarası");
  }
  return id;
}

function isPrismaError(err: unknown, code: string): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === code;
}

async function ensureDepartmentExists(departmentId: number) {
  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) {
    throw new HttpError(400, "Seçilen departman bulunamadı");
  }
}

router.get("/", async (req, res, next) => {
  try {
    const { page, limit, search, departmentId } = listQuerySchema.parse(req.query);

    const where: Prisma.UserWhereInput = {};
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { fullName: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({ data, meta: buildMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { password, ...input } = createSchema.parse(req.body);
    await ensureDepartmentExists(input.departmentId);

    try {
      const user = await prisma.user.create({
        data: { ...input, passwordHash: await bcrypt.hash(password, 10) },
        select: userSelect,
      });
      res.status(201).json({ user });
    } catch (err) {
      if (isPrismaError(err, "P2002")) {
        throw new HttpError(409, "Bu e-posta adresi zaten kullanılıyor");
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const input = updateSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, "Kullanıcı bulunamadı");
    }
    if (id === req.user!.id && input.role !== existing.role) {
      throw new HttpError(400, "Kendi rolünüzü değiştiremezsiniz");
    }
    await ensureDepartmentExists(input.departmentId);

    try {
      const user = await prisma.user.update({ where: { id }, data: input, select: userSelect });
      res.json({ user });
    } catch (err) {
      if (isPrismaError(err, "P2002")) {
        throw new HttpError(409, "Bu e-posta adresi zaten kullanılıyor");
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

router.put("/:id/password", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { password } = passwordSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, "Kullanıcı bulunamadı");
    }

    await prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 10) } });
    res.json({ message: "Şifre güncellendi" });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === req.user!.id) {
      throw new HttpError(400, "Kendi hesabınızı silemezsiniz");
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, "Kullanıcı bulunamadı");
    }

    const openAssignments = await prisma.assignment.count({ where: { userId: id, returnedAt: null } });
    if (openAssignments > 0) {
      throw new HttpError(409, "Kullanıcının üzerinde zimmetli cihaz var, önce iade alınmalı");
    }

    const [assignments, activities] = await Promise.all([
      prisma.assignment.count({ where: { OR: [{ userId: id }, { assignedById: id }] } }),
      prisma.activityLog.count({ where: { performedById: id } }),
    ]);
    if (assignments > 0 || activities > 0) {
      throw new HttpError(409, "Zimmet geçmişi olan kullanıcı silinemez");
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: "Kullanıcı silindi" });
  } catch (err) {
    next(err);
  }
});

export default router;
