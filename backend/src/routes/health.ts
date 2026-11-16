import { Router } from "express";
import { dbGet } from "../db.js";

const router = Router();

// ─── GET /health ──────────────────────────────────────
router.get("/", (_req, res) => {
  try {
    const comments = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM comments");
    const likes = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM likes");
    const trivia = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM trivia_scores");
    const wishes = dbGet<{ count: number }>("SELECT COUNT(*) as count FROM wishes");

    res.json({
      success: true,
      status: "healthy",
      db: "connected",
      uptime: Math.floor(process.uptime()),
      stats: {
        comments: comments?.count ?? 0,
        likes: likes?.count ?? 0,
        trivia_players: trivia?.count ?? 0,
        wishes: wishes?.count ?? 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      status: "unhealthy",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

export default router;
