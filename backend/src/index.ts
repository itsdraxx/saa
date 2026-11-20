import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(envPath) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(envPath);
}

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { initDb } from "./db.js";
import { generalLimiter } from "./middleware/rateLimiter.js";

// Route imports
import commentsRouter from "./routes/comments.js";
import likesRouter from "./routes/likes.js";
import triviaRouter from "./routes/trivia.js";
import wishesRouter from "./routes/wishes.js";
import adminRouter from "./routes/admin.js";
import healthRouter from "./routes/health.js";
import postsRouter from "./routes/posts.js";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// ─── Global Middleware ────────────────────────────────

// Security headers
app.use(helmet());

// CORS — allow frontend origins
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-side)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-key", "x-admin-token", "Authorization"],
    credentials: true,
  })
);

// Parse JSON body (increased for post data with image metadata)
app.use(express.json({ limit: "1mb" }));

// Trust proxy (for rate limiter to get real IP behind Nginx)
app.set("trust proxy", 1);

// General rate limiter
app.use("/api/saa", generalLimiter);
app.use("/comments", generalLimiter);
app.use("/likes", generalLimiter);
app.use("/trivia", generalLimiter);
app.use("/wishes", generalLimiter);

// ─── Routes ───────────────────────────────────────────
// Mount routes under both /api/saa/* and root /* so any API_BASE works seamlessly
app.use("/api/saa/comments", commentsRouter);
app.use("/comments", commentsRouter);

app.use("/api/saa/likes", likesRouter);
app.use("/likes", likesRouter);

app.use("/api/saa/trivia", triviaRouter);
app.use("/trivia", triviaRouter);

app.use("/api/saa/wishes", wishesRouter);
app.use("/wishes", wishesRouter);

app.use("/api/saa/admin", adminRouter);
app.use("/admin", adminRouter);

app.use("/api/saa/posts", postsRouter);
app.use("/posts", postsRouter);

app.use("/api/saa/health", healthRouter);
app.use("/health", healthRouter);

// Static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    name: "25 Years of Us — Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/api/saa/health",
      comments: "/api/saa/comments",
      likes: "/api/saa/likes",
      trivia: "/api/saa/trivia",
      wishes: "/api/saa/wishes",
      posts: "/api/saa/posts",
      admin: "/api/saa/admin (protected)",
    },
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ─── Initialize DB then Start Server ──────────────────

async function main() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`\n🎉 SAA Backend running on http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/saa/health`);
      console.log(`   Admin:  http://localhost:${PORT}/api/saa/admin/stats`);
      console.log(`   ENV:    ${process.env.NODE_ENV || "development"}\n`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

main();

export default app;
