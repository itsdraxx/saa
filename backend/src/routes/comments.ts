import { Router } from "express";
import { dbAll, dbGet, dbRun, saveDb } from "../db.js";
import { writeLimiter } from "../middleware/rateLimiter.js";
import crypto from "node:crypto";

const router = Router();

function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

function hashIP(ip: string | undefined): string | null {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex");
}

// ─── GET /comments?post_id=post-2001 ──────────────────
router.get("/", (req, res) => {
  const { post_id } = req.query;

  if (!post_id || typeof post_id !== "string") {
    res.status(400).json({ success: false, error: "post_id query parameter is required" });
    return;
  }

  const comments = dbAll(
    "SELECT id, post_id, author_name, text, created_at FROM comments WHERE post_id = ? ORDER BY created_at ASC",
    [post_id]
  );

  res.json({ success: true, post_id, count: comments.length, comments });
});

// ─── POST /comments ───────────────────────────────────
router.post("/", writeLimiter, (req, res) => {
  const { post_id, author_name, text } = req.body;

  if (!post_id || typeof post_id !== "string") {
    res.status(400).json({ success: false, error: "post_id is required" });
    return;
  }
  if (!author_name || typeof author_name !== "string" || author_name.trim().length < 2 || author_name.trim().length > 40) {
    res.status(400).json({ success: false, error: "author_name must be 2-40 characters" });
    return;
  }
  if (!text || typeof text !== "string" || text.trim().length < 1 || text.trim().length > 500) {
    res.status(400).json({ success: false, error: "text must be 1-500 characters" });
    return;
  }

  const cleanName = sanitize(author_name).slice(0, 40);
  const cleanText = sanitize(text).slice(0, 500);
  const ipHash = hashIP(req.ip);

  const { lastId } = dbRun(
    "INSERT INTO comments (post_id, author_name, text, ip_hash) VALUES (?, ?, ?, ?)",
    [post_id, cleanName, cleanText, ipHash]
  );

  saveDb();

  const comment = dbGet(
    "SELECT id, post_id, author_name, text, created_at FROM comments WHERE id = ?",
    [lastId]
  );

  res.status(201).json({ success: true, comment });
});

export default router;
