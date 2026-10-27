import { Hono } from "hono";
import "../worker-configuration.d.ts";

const app = new Hono<{ Bindings: CloudflareBindings }>().get("/question/:id", async (c) => {
  const id = c.req.param("id");

  const row = await c.env.Database.prepare(
    "SELECT db_json, updated_at FROM questions WHERE user_id = ?",
  )
    .bind(id)
    .first<{ db_json: string; updated_at: string }>();

  if (!row) {
    return c.json({ error: "Not found" }, 404);
  }

  try {
    return c.json({
      db: JSON.parse(row.db_json) as {
        /** [question, answer, folderID, genreID, comment] */
        q: [
          string,
          string,
          number | undefined | null,
          number | undefined | null,
          string | undefined | null,
        ][];

        /** folder names */
        f: string[];

        /** genre names */
        g: string[];
      },

      /** yyyy-MM-dd hh:mm:ss */
      updatedAt: row.updated_at,
    });
  } catch {
    return c.json({ error: "Corrupted data" }, 500);
  }
});

export default app;
export type AppType = typeof app;
