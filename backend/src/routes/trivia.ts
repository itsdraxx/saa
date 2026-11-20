import { Router } from "express";
import { dbAll, dbGet, dbRun, saveDb } from "../db.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

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

// ─── GET /trivia/status ───────────────────────────────
router.get("/status", (req, res) => {
  const visitorId = typeof req.query.visitor_id === "string" ? req.query.visitor_id : undefined;

  if (!visitorId) {
    res.json({ success: true, completed: false });
    return;
  }

  const existing = dbGet<{
    id: number;
    player_name: string;
    score: number;
    total: number;
    percentage: number;
    time_taken: number | null;
    created_at: string;
  }>(
    "SELECT id, player_name, score, total, percentage, time_taken, created_at FROM trivia_scores WHERE visitor_id = ? ORDER BY id DESC LIMIT 1",
    [visitorId]
  );

  if (!existing) {
    res.json({ success: true, completed: false });
    return;
  }

  const rankRow = dbGet<{ rank: number }>(
    `SELECT COUNT(*) + 1 as rank
     FROM trivia_scores
     WHERE percentage > ? OR (percentage = ? AND (time_taken IS NOT NULL AND time_taken < ?))`,
    [existing.percentage, existing.percentage, existing.time_taken ?? 999999]
  );

  res.json({
    success: true,
    completed: true,
    rank: rankRow?.rank ?? 1,
    entry: existing,
  });
});

// ─── POST /trivia/score ───────────────────────────────
router.post("/score", generalLimiter, (req, res) => {
  const { player_name, score, total, percentage, time_taken, visitor_id } = req.body;

  if (!player_name || typeof player_name !== "string" || player_name.trim().length < 1 || player_name.trim().length > 60) {
    res.status(400).json({ success: false, error: "player_name must be between 1 and 60 characters" });
    return;
  }
  if (typeof score !== "number" || score < 0) {
    res.status(400).json({ success: false, error: "score must be a non-negative number" });
    return;
  }
  const safeTotal = typeof total === "number" && total > 0 ? total : 6;
  const safePercentage = typeof percentage === "number" ? Math.min(Math.max(percentage, 0), 100) : Math.round((score / safeTotal) * 100);
  const cleanName = sanitize(player_name).slice(0, 50);

  // If visitor already submitted before, update their name and best score seamlessly
  if (visitor_id && typeof visitor_id === "string") {
    const existing = dbGet<{
      id: number;
      player_name: string;
      score: number;
      total: number;
      percentage: number;
      time_taken: number | null;
      created_at: string;
    }>(
      "SELECT id, player_name, score, total, percentage, time_taken, created_at FROM trivia_scores WHERE visitor_id = ? ORDER BY id DESC LIMIT 1",
      [visitor_id]
    );

    if (existing) {
      const bestScore = Math.max(existing.score, score);
      const bestPercentage = Math.max(existing.percentage, safePercentage);
      const bestTime = time_taken ?? existing.time_taken;

      dbRun(
        "UPDATE trivia_scores SET player_name = ?, score = ?, total = ?, percentage = ?, time_taken = ? WHERE id = ?",
        [cleanName, bestScore, safeTotal, bestPercentage, bestTime ?? null, existing.id]
      );
      saveDb();

      const rankRow = dbGet<{ rank: number }>(
        `SELECT COUNT(*) + 1 as rank
         FROM trivia_scores
         WHERE percentage > ? OR (percentage = ? AND (time_taken IS NOT NULL AND time_taken < ?))`,
        [bestPercentage, bestPercentage, bestTime ?? 999999]
      );

      const updated = dbGet(
        "SELECT id, player_name, score, total, percentage, time_taken, created_at FROM trivia_scores WHERE id = ?",
        [existing.id]
      );

      res.status(200).json({
        success: true,
        rank: rankRow?.rank ?? 1,
        entry: updated,
        message: "Your score and name were updated successfully!",
      });
      return;
    }
  }

  const { lastId } = dbRun(
    "INSERT INTO trivia_scores (player_name, score, total, percentage, time_taken, visitor_id) VALUES (?, ?, ?, ?, ?, ?)",
    [cleanName, score, safeTotal, safePercentage, time_taken ?? null, visitor_id ?? null]
  );

  saveDb();

  // Get their rank
  const rankRow = dbGet<{ rank: number }>(
    `SELECT COUNT(*) + 1 as rank
     FROM trivia_scores
     WHERE percentage > ? OR (percentage = ? AND (time_taken IS NOT NULL AND time_taken < ?))`,
    [safePercentage, safePercentage, time_taken ?? 999999]
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
