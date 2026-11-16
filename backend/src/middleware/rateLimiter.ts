import rateLimit from "express-rate-limit";

/**
 * General API rate limiter — 60 requests per minute per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 60,                   // 60 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, error: "Too many requests — slow down!" },
});

/**
 * Write limiter — for POST endpoints (comments, wishes, scores).
 * 10 submissions per 5 minutes per IP.
 */
export const writeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,  // 5 minutes
  max: 10,                   // 10 writes per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, error: "Too many submissions — please wait a few minutes" },
});

