import { Router } from "express";
import { listUrls } from "../services/url.service.js";
const router = Router();
router.get("/api/urls", async (_req, res) => {
  const urls = await listUrls();
  res.json(urls);
});
export default router;