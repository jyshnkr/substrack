import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { healthRoute } from "./routes/health.js";

const app = new Hono();

// Global middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// Routes
const routes = app.route("/", healthRoute);

export { app };

// Export type for Hono RPC client (used by frontend)
export type AppType = typeof routes;
