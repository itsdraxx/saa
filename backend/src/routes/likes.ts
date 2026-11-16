import { Router } from "express";
import { dbAll, dbGet, dbRun, saveDb } from "../db.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// ─── GET /likes?post_id=post-2001 ─────────────────────
router.get("/", (req, res) => {
  const { post_id } = req.query;

  if (!post_id || typeof post_id !== "string") {
    res.status(400).json({ success: false, error: "post_id query parameter is required" });
    return;
  }

  const row = dbGet<{ count: number }>(
    "SELECT COUNT(*) as count FROM likes WHERE post_id = ?",
    [post_id]
  );

  res.json({ success: true, post_id, count: row?.count ?? 0 });
});

// ─── GET /likes/all ───────────────────────────────────
router.get("/all", (_req, res) => {
  const rows = dbAll<{ post_id: string; count: number }>(
    "SELECT post_id, COUNT(*) as count FROM likes GROUP BY post_id"
  );

  const likesMap: Record<string, number> = {};
  for (const row of rows) {
    likesMap[row.post_id] = row.count;
  }

  res.json({ success: true, likes: likesMap });
});

// ─── POST /likes (toggle) ────────────────────────────
router.post("/", writeLimiter, (req, res) => {
  const { post_id, visitor_id } = req.body;

  if (!post_id || typeof post_id !== "string") {
    res.status(400).json({ success: false, error: "post_id is required" });
    return;
  }
  if (!visitor_id || typeof visitor_id !== "string") {
    res.status(400).json({ success: false, error: "visitor_id is required" });
    return;
  }

  // Check if already liked
  const existing = dbGet(
    "SELECT id FROM likes WHERE post_id = ? AND visitor_id = ?",
    [post_id, visitor_id]
  );

  let liked: boolean;

  if (existing) {
    dbRun("DELETE FROM likes WHERE post_id = ? AND visitor_id = ?", [post_id, visitor_id]);
    liked = false;
  } else {
    dbRun("INSERT INTO likes (post_id, visitor_id) VALUES (?, ?)", [post_id, visitor_id]);
    liked = true;
  }

  saveDb();

  const row = dbGet<{ count: number }>(
    "SELECT COUNT(*) as count FROM likes WHERE post_id = ?",
    [post_id]
  );

  res.json({ success: true, post_id, liked, count: row?.count ?? 0 });
});

export default router;
