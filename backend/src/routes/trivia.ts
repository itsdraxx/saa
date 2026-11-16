import { Router } from "express";
import { dbAll, dbGet, dbRun, saveDb } from "../db.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = Router();

function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

// ─── GET /trivia/leaderboard ──────────────────────────
router.get("/leaderboard", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  // Best score per player (highest percentage, then fastest time)
  const leaderboard = dbAll(
    `SELECT id, player_name, score, total, percentage, time_taken, created_at
     FROM trivia_scores AS t1
     WHERE percentage = (
       SELECT MAX(percentage) FROM trivia_scores AS t2 WHERE t2.player_name = t1.player_name
     )
     GROUP BY player_name
     ORDER BY percentage DESC, time_taken ASC
     LIMIT ?`,
    [limit]
  );

  const totalPlayers = dbGet<{ count: number }>(
    "SELECT COUNT(DISTINCT player_name) as count FROM trivia_scores"
  );

  res.json({
    success: true,
    total_players: totalPlayers?.count ?? 0,
    leaderboard,
  });
});

// ─── POST /trivia/score ───────────────────────────────
router.post("/score", writeLimiter, (req, res) => {
  const { player_name, score, total, percentage, time_taken, visitor_id } = req.body;

  if (!player_name || typeof player_name !== "string" || player_name.trim().length < 2 || player_name.trim().length > 40) {
    res.status(400).json({ success: false, error: "player_name must be 2-40 characters" });
    return;
  }
  if (typeof score !== "number" || score < 0) {
    res.status(400).json({ success: false, error: "score must be a non-negative number" });
    return;
  }
  if (typeof total !== "number" || total < 1) {
    res.status(400).json({ success: false, error: "total must be a positive number" });
    return;
  }
  if (typeof percentage !== "number" || percentage < 0 || percentage > 100) {
    res.status(400).json({ success: false, error: "percentage must be 0-100" });
    return;
  }

  const cleanName = sanitize(player_name).slice(0, 40);

  const { lastId } = dbRun(
    "INSERT INTO trivia_scores (player_name, score, total, percentage, time_taken, visitor_id) VALUES (?, ?, ?, ?, ?, ?)",
    [cleanName, score, total, percentage, time_taken ?? null, visitor_id ?? null]
  );

  saveDb();

  // Get their rank
  const rankRow = dbGet<{ rank: number }>(
    `SELECT COUNT(*) + 1 as rank
     FROM trivia_scores
     WHERE percentage > ? OR (percentage = ? AND (time_taken IS NOT NULL AND time_taken < ?))`,
    [percentage, percentage, time_taken ?? 999999]
  );

  const entry = dbGet(
    "SELECT id, player_name, score, total, percentage, time_taken, created_at FROM trivia_scores WHERE id = ?",
    [lastId]
  );

  res.status(201).json({
    success: true,
    rank: rankRow?.rank ?? 1,
    entry,
  });
});

export default router;
