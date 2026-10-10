import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/errors";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, "İstenen kaynak bulunamadı"));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? "Geçersiz istek verisi";
    return res.status(400).json({ message });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "İstek gövdesi geçerli bir JSON değil" });
  }
  console.error(err);
  return res.status(500).json({ message: "Beklenmeyen bir hata oluştu, lütfen daha sonra tekrar deneyin" });
}
