import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import "../worker-configuration.d.ts";

const app = new Hono<{ Bindings: CloudflareBindings }>().get("/question/:id", async (c) => {
  const id = c.req.param("id");

  const row = await c.env.Database.prepare(
    "SELECT db_json, updated_at FROM questions WHERE user_id = ?",
  )
    .bind(id)
    .first<{ db_json: string; updated_at: string }>();

  if (!row) {
    throw new HTTPException(404, { message: "Not found" });
  }

  try {
    return c.json({
      db: JSON.parse(row.db_json) as {
        /** [question, answer, folderID, genreID, comment] */
        q: [string, string, number | null, number | null, string | null][];

        /** folder names */
        f: string[];

        /** genre names */
        g: string[];
      },

      /** yyyy-MM-dd hh:mm:ss */
      updatedAt: row.updated_at,
    });
  } catch {
    throw new HTTPException(500, { message: "Corrupted data" });
  }
});

export default app;
export type AppType = typeof app;
