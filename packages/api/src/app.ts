import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { healthRoute } from "./routes/health.js";
import { auth } from "./routes/auth.js";
// Auth middleware will be used for protected routes in future phases

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
const routes = app
  .route("/", healthRoute)
  .route("/api/auth", auth);

// Protected routes example (for future use):
// app.use("/api/subscriptions/*", authMiddleware);
// app.use("/api/connections/*", authMiddleware);
// app.use("/api/alerts/*", authMiddleware);

export { app };

// Export type for Hono RPC client (used by frontend)
export type AppType = typeof routes;
