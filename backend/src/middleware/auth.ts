import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { HttpError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import type { Role } from "../generated/prisma/client";

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  departmentId: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new HttpError(401, "Oturum açmanız gerekiyor");
    }

    let userId: number;
    try {
      const payload = jwt.verify(header.slice(7), config.jwtSecret) as jwt.JwtPayload;
      userId = Number(payload.sub);
    } catch {
      throw new HttpError(401, "Oturumunuz geçersiz veya süresi dolmuş, lütfen tekrar giriş yapın");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, role: true, departmentId: true },
    });
    if (!user) {
      throw new HttpError(401, "Oturumunuz geçersiz, lütfen tekrar giriş yapın");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, "Oturum açmanız gerekiyor"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "Bu işlem için yetkiniz yok"));
    }
    next();
  };
}
