import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerDoc from "../swagger.json" with { type: "json" };
import rateLimiter from "./middlewares/rateLimiter.js";
import errorHandler from "./middlewares/errorHandler.js";

import health from "./routes/health.js";
import shorten from "./routes/shorten.js";
import redirect from "./routes/redirect.js";
import list from "./routes/list.js";

const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(rateLimiter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use(health, shorten, redirect, list);
app.use(errorHandler);
export default app;