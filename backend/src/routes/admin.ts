import { Router } from "express";
import { dbAll, dbGet, dbRun, saveDb } from "../db.js";
import { requireAdmin, getAdminToken } from "../middleware/auth.js";

const router = Router();

// ─── POST /admin/login ────────────────────────────────
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET;

  if (!expectedPass) {
    res.status(500).json({ success: false, error: "Server admin credentials not configured in environment" });
    return;
  }

  if (!username || !password) {
    res.status(400).json({ success: false, error: "Username and password are required" });
    return;
  }

  if (username !== expectedUser || password !== expectedPass) {
    res.status(401).json({ success: false, error: "Invalid username or password" });
    return;
  }

  const token = getAdminToken();
  res.json({
    success: true,
    token,
    username: expectedUser,
    message: "Admin authentication successful",
  });
});

// All routes below require valid admin token or credentials
router.use(requireAdmin);

// ─── POST /admin/verify ───────────────────────────────
router.post("/verify", (_req, res) => {
  res.json({ success: true, message: "Admin access granted" });
});

// ─── GET /admin/stats ─────────────────────────────────
router.get("/stats", (_req, res) => {
  const comments = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM comments");
  const likes = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM likes");
  const trivia = dbGet<{ count: number }>("SELECT COUNT(DISTINCT player_name) as count FROM trivia_scores");
  const wishes = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM wishes");
  const posts = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM instagram_posts");
  const locations = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM map_locations");

  res.json({
    success: true,
    stats: {
      total_comments: comments?.count ?? 0,
      total_likes: likes?.count ?? 0,
      total_trivia_players: trivia?.count ?? 0,
      total_wishes: wishes?.count ?? 0,
      total_posts: posts?.count ?? 0,
      total_locations: locations?.count ?? 0,
    },
  });
});

// ═══════════════════════════════════════════════
// COMMENTS MANAGEMENT
// ═══════════════════════════════════════════════

router.get("/comments", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  const comments = dbAll(
    "SELECT id, post_id, author_name, text, created_at FROM comments ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit, offset]
  );

  const totalRow = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM comments");

  res.json({ success: true, total: totalRow?.count ?? 0, comments });
});

router.delete("/comments/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ success: false, error: "Invalid comment ID" });
    return;
  }

  const existing = dbGet("SELECT id FROM comments WHERE id = ?", [id]);
  if (!existing) {
    res.status(404).json({ success: false, error: "Comment not found" });
    return;
  }

  dbRun("DELETE FROM comments WHERE id = ?", [id]);
  saveDb();
  res.json({ success: true, message: `Comment ${id} permanently deleted` });
});

// ═══════════════════════════════════════════════
// WISHES MANAGEMENT
// ═══════════════════════════════════════════════

router.get("/wishes", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  const wishes = dbAll(
    "SELECT id, author_name, relation, message, emoji, created_at FROM wishes ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit, offset]
  );

  const totalRow = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM wishes");

  res.json({ success: true, total: totalRow?.count ?? 0, wishes });
});

router.delete("/wishes/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ success: false, error: "Invalid wish ID" });
    return;
  }

  const existing = dbGet("SELECT id FROM wishes WHERE id = ?", [id]);
  if (!existing) {
    res.status(404).json({ success: false, error: "Wish not found" });
    return;
  }

  dbRun("DELETE FROM wishes WHERE id = ?", [id]);
  saveDb();
  res.json({ success: true, message: `Wish ${id} permanently deleted` });
});

// ═══════════════════════════════════════════════
// TRIVIA SCORES MANAGEMENT
// ═══════════════════════════════════════════════

router.get("/trivia", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  const scores = dbAll(
    "SELECT id, player_name, score, total, percentage, time_taken, created_at FROM trivia_scores ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit, offset]
  );

  const totalRow = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM trivia_scores");

  res.json({ success: true, total: totalRow?.count ?? 0, scores });
});

router.delete("/trivia/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ success: false, error: "Invalid trivia score ID" });
    return;
  }

  const existing = dbGet("SELECT id FROM trivia_scores WHERE id = ?", [id]);
  if (!existing) {
    res.status(404).json({ success: false, error: "Trivia score not found" });
    return;
  }

  dbRun("DELETE FROM trivia_scores WHERE id = ?", [id]);
  saveDb();
  res.json({ success: true, message: `Trivia score ${id} permanently deleted` });
});

export default router;
