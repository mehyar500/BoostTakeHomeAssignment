import rateLimit from "express-rate-limit";
export default rateLimit({
  windowMs: +process.env.RATE_LIMIT_WINDOW! * 1000,
  max: +process.env.RATE_LIMIT_MAX!,
  standardHeaders: true,
  legacyHeaders: false,
});