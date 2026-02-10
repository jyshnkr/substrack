import { Hono } from "hono";

export const healthRoute = new Hono().get("/health", (c) => {
  return c.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "0.0.1",
    },
  });
});
