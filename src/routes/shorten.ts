import { Router } from "express";
import { z } from "zod";
import { createShortUrl } from "../services/url.service.js";

const router = Router();
const Body = z.object({ 
  url: z.string().url(), 
  expiresAt: z.string().datetime().optional().refine(
    (date) => !date || new Date(date) > new Date(),
    { message: "Expiration date must be in the future" }
  )
});

router.post("/api/urls", async (req, res, next) => {
  try {
    const { url, expiresAt } = Body.parse(req.body);
    const record = await createShortUrl(url, expiresAt ? new Date(expiresAt) : undefined);
    res.status(201).json({
      code: record.shortCode,
      shortUrl: `${req.protocol}://${req.get("host")}/${record.shortCode}`,
    });
  } catch (e) { next(e); }
});
export default router;