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
    "SELECT id, post_id, author_name, text, created_at, visitor_id FROM comments WHERE post_id = ? ORDER BY created_at ASC",
    [post_id]
  );

  res.json({ success: true, post_id, count: comments.length, comments });
});

// ─── POST /comments ───────────────────────────────────
router.post("/", writeLimiter, (req, res) => {
  const { post_id, author_name, text, visitor_id } = req.body;

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
  const cleanVisitorId = visitor_id && typeof visitor_id === "string" ? visitor_id.slice(0, 64) : null;

  const { lastId } = dbRun(
    "INSERT INTO comments (post_id, author_name, text, ip_hash, visitor_id) VALUES (?, ?, ?, ?, ?)",
    [post_id, cleanName, cleanText, ipHash, cleanVisitorId]
  );

  saveDb();

  const comment = dbGet(
    "SELECT id, post_id, author_name, text, created_at, visitor_id FROM comments WHERE id = ?",
    [lastId]
  );

  res.status(201).json({ success: true, comment });
});

// ─── DELETE /comments/:id (Delete own comment) ────────
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { author_name, visitor_id } = req.body;

  if (!id || isNaN(id)) {
    res.status(400).json({ success: false, error: "Invalid comment ID" });
    return;
  }

  const existing = dbGet<{ id: number; author_name: string; visitor_id: string | null }>(
    "SELECT id, author_name, visitor_id FROM comments WHERE id = ?",
    [id]
  );

  if (!existing) {
    res.status(404).json({ success: false, error: "Comment not found" });
    return;
  }

  // Only allow deleting if author_name matches or visitor_id matches
  const matchesName =
    author_name &&
    existing.author_name.toLowerCase().trim() === String(author_name).toLowerCase().trim();
  const matchesVisitor =
    visitor_id &&
    existing.visitor_id &&
    existing.visitor_id === String(visitor_id);

  if (!matchesName && !matchesVisitor) {
    res.status(403).json({
      success: false,
      error: "You can only delete your own comment",
    });
    return;
  }

  dbRun("DELETE FROM comments WHERE id = ?", [id]);
  saveDb();

  res.json({ success: true, message: "Comment deleted" });
});

export default router;
