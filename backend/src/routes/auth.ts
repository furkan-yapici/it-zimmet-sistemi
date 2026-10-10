import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config";
import { HttpError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();

const loginSchema = z.object({
  email: z
    .string({ error: "E-posta adresi gerekli" })
    .trim()
    .toLowerCase()
    .email("Geçerli bir e-posta adresi girin"),
  password: z.string({ error: "Şifre gerekli" }).min(1, "Şifre gerekli"),
});

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  createdAt: true,
  department: { select: { id: true, name: true } },
} as const;

// Kullanıcı bulunamasa da bcrypt çalıştırılır; yanıt süresiyle e-posta var mı yok mu anlaşılmasın
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 10);

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const found = await prisma.user.findUnique({ where: { email } });
    const passwordOk = await bcrypt.compare(password, found?.passwordHash ?? DUMMY_HASH);
    if (!found || !passwordOk) {
      throw new HttpError(401, "E-posta veya şifre hatalı");
    }

    const token = jwt.sign({ role: found.role }, config.jwtSecret, {
      subject: String(found.id),
      expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"],
    });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: found.id }, select: userSelect });
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id }, select: userSelect });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// JWT durumsuz olduğu için sunucuda tutulan bir oturum yok; çıkışta istemci token'ı siler
router.post("/logout", authenticate, (_req, res) => {
  res.json({ message: "Çıkış yapıldı" });
});

export default router;
