import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = Number(process.env.PORT) || 3001;

console.log(`SubsTrack API server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`SubsTrack API server running at http://localhost:${port}`);
