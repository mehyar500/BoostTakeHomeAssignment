import { Router } from "express";
import { resolveShortCode } from "../services/url.service.js";
const router = Router();
router.get("/:code", async (req, res, next) => {
  try {
    const long = await resolveShortCode(req.params.code);
    res.redirect(302, long);
  } catch (e) { next(e); }
});
export default router;