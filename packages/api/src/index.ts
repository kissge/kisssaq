import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import "../worker-configuration.d.ts";

const databaseSchema = z.object({
  /** [question, answer, folderID, genreID, comment] */
  q: z.array(
    z.tuple([
      z.string(),
      z.string(),
      z.number().nullable(),
      z.number().nullable(),
      z.string().nullable(),
    ]),
  ),
  /** folder names */
  f: z.array(z.string()),
  /** genre names */
  g: z.array(z.string()),
});

function getJSTNow(): string {
  return new Date().toLocaleString("sv-SE", {
    timeZone: "Asia/Tokyo",
    hour12: false,
  });
}

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use(
    "*",
    cors({
      origin: (origin, c) => {
        const allowedOrigins = (c.env.ALLOWED_ORIGINS ?? "http://localhost:5173").split(",");

        return allowedOrigins.includes(origin) ? origin : null;
      },
    }),
  )
  .get("/question/:id", async (c) => {
    const id = c.req.param("id");

    const row = await c.env.Database.prepare(
      "SELECT db_json, updated_at FROM questions WHERE user_id = ?",
    )
      .bind(id)
      .first<{ db_json: string; updated_at: string }>();

    if (!row) {
      throw new HTTPException(404, { message: "Not found" });
    }

    let rawDatabase: unknown;
    try {
      rawDatabase = JSON.parse(row.db_json);
    } catch {
      throw new HTTPException(500, { message: "Corrupted data" });
    }

    const database = databaseSchema.safeParse(rawDatabase);
    if (!database.success) {
      throw new HTTPException(500, { message: "Corrupted data" });
    }

    return c.json({
      db: database.data,
      /** yyyy-MM-dd hh:mm:ss */
      updatedAt: row.updated_at,
    });
  })
  .put(
    "/question/:id",
    zValidator(
      "json",
      z.object({
        db: databaseSchema,
      }),
    ),
    async (c) => {
      const id = c.req.param("id");
      const body = c.req.valid("json");

      const updatedAt = getJSTNow();
      await c.env.Database.prepare(
        `INSERT INTO questions (user_id, db_json, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         db_json = excluded.db_json,
         updated_at = excluded.updated_at`,
      )
        .bind(id, JSON.stringify(body.db), updatedAt)
        .run();

      return c.json({ updatedAt });
    },
  );

export default app;
export type AppType = typeof app;
