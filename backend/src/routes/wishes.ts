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

const ALLOWED_EMOJIS = ["❤️", "🙏", "🪔", "🎉", "🥂", "🌸", "✨", "💐", "🕊️", "💛", "🎊", "🥹"];

// ─── GET /wishes ──────────────────────────────────────
router.get("/", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);

  const wishes = dbAll(
    "SELECT id, author_name, relation, message, emoji, created_at FROM wishes ORDER BY created_at DESC LIMIT ?",
    [limit]
  );

  const countRow = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM wishes");

  res.json({ success: true, count: countRow?.count ?? 0, wishes });
});

// ─── GET /wishes/count ────────────────────────────────
router.get("/count", (_req, res) => {
  const row = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM wishes");
  res.json({ success: true, count: row?.count ?? 0 });
});

// ─── POST /wishes ─────────────────────────────────────
router.post("/", writeLimiter, (req, res) => {
  const { author_name, relation, message, emoji } = req.body;

  if (!author_name || typeof author_name !== "string" || author_name.trim().length < 2 || author_name.trim().length > 40) {
    res.status(400).json({ success: false, error: "author_name must be 2-40 characters" });
    return;
  }
  if (!message || typeof message !== "string" || message.trim().length < 5 || message.trim().length > 600) {
    res.status(400).json({ success: false, error: "message must be 5-600 characters" });
    return;
  }

  const cleanName = sanitize(author_name).slice(0, 40);
  const cleanRelation = relation ? sanitize(String(relation)).slice(0, 30) : null;
  const cleanMessage = sanitize(message).slice(0, 600);
  const chosenEmoji = emoji && ALLOWED_EMOJIS.includes(emoji) ? emoji : "❤️";
  const ipHash = hashIP(req.ip);

  const { lastId } = dbRun(
    "INSERT INTO wishes (author_name, relation, message, emoji, ip_hash) VALUES (?, ?, ?, ?, ?)",
    [cleanName, cleanRelation, cleanMessage, chosenEmoji, ipHash]
  );

  saveDb();

  const wish = dbGet(
    "SELECT id, author_name, relation, message, emoji, created_at FROM wishes WHERE id = ?",
    [lastId]
  );

  res.status(201).json({ success: true, wish });
});

export default router;
