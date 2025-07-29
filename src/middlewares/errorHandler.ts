import { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export default function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) return res.status(400).json({ error: err.issues.map(i => i.message).join(", ") });
  if ((err as Error).message === "Not Found") return res.status(404).json({ error: "URL not found" });
  if ((err as Error).message === "Expired") return res.status(410).json({ error: "URL expired" });
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
}