import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();
router.use(authenticate, requireRole("ADMIN"));

router.get("/", async (_req, res, next) => {
  try {
    const data = await prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
