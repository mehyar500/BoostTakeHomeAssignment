import { Router } from "express";
const router = Router();
router.get("/healthz", (_, res) => res.send("ok"));
export default router;