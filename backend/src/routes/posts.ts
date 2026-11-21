import { Router } from "express";
import { dbAll, dbGet, dbRun, saveDb } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = Router();

// ─── Cloudinary Helper ─────────────────────────
function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return cloudinary;
  }
  return null;
}

// ─── Multer setup for image uploads ───────────
const uploadsDir = path.join(__dirname, "..", "..", "uploads", "instagram");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
    }
  },
});

// ─── Helper to parse a DB row into a post object ─
interface PostRow {
  id: string;
  year: number;
  date_str: string;
  title: string;
  location: string;
  aspect_ratio: string;
  category: string;
  caption: string;
  hashtags: string;
  images: string;
  likes_count: number;
  created_at: string;
}

function parsePostRow(row: PostRow) {
  return {
    id: row.id,
    year: row.year,
    dateStr: row.date_str,
    title: row.title,
    location: row.location,
    aspectRatio: row.aspect_ratio || "landscape",
    category: row.category,
    caption: row.caption,
    hashtags: JSON.parse(row.hashtags || "[]"),
    images: JSON.parse(row.images || "[]"),
    likesCount: row.likes_count || 0,
    createdAt: row.created_at,
    comments: [],
  };
}

// ═══════════════════════════════════════════════
// PUBLIC ROUTES (no auth required)
// ═══════════════════════════════════════════════

// GET /posts — fetch all posts ordered by year ASC
router.get("/", (_req, res) => {
  try {
    const rows = dbAll<PostRow>(
      "SELECT * FROM instagram_posts ORDER BY year ASC, created_at ASC"
    );
    const posts = rows.map(parsePostRow);
    res.json({ success: true, posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ success: false, error: "Failed to fetch posts" });
  }
});

// GET /posts/:id — fetch a single post
router.get("/:id", (req, res) => {
  try {
    const row = dbGet<PostRow>("SELECT * FROM instagram_posts WHERE id = ?", [
      req.params.id,
    ]);
    if (!row) {
      res.status(404).json({ success: false, error: "Post not found" });
      return;
    }
    res.json({ success: true, post: parsePostRow(row) });
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ success: false, error: "Failed to fetch post" });
  }
});

// ═══════════════════════════════════════════════
// ADMIN ROUTES (require auth)
// ═══════════════════════════════════════════════

// POST /posts/upload — upload an image
router.post("/upload", requireAdmin, upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: "No image file provided" });
    return;
  }

  const cld = getCloudinary();
  if (cld) {
    try {
      const uploadResult = await cld.uploader.upload(req.file.path, {
        folder: "saa/instagram",
        resource_type: "image",
        transformation: [
          { quality: "auto:good", fetch_format: "auto" },
        ],
      });

      // Remove the local temp file from disk to save 100% of VPS disk space
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupErr) {
        console.warn("Could not delete local temp uploaded file:", cleanupErr);
      }

      res.json({
        success: true,
        url: uploadResult.secure_url,
        filename: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
      });
      return;
    } catch (uploadErr) {
      console.error("Cloudinary upload failed, using local storage fallback:", uploadErr);
    }
  }

  // Local disk fallback
  const url = `/uploads/instagram/${req.file.filename}`;
  res.json({ success: true, url, filename: req.file.filename });
});

// POST /posts — create a new post
router.post("/", requireAdmin, (req, res) => {
  try {
    const { id, year, dateStr, title, location, aspectRatio, category, caption, hashtags, images } = req.body;

    if (!id || !year || !title || !category || !caption) {
      res.status(400).json({ success: false, error: "Missing required fields: id, year, title, category, caption" });
      return;
    }

    // Check if id already exists
    const existing = dbGet("SELECT id FROM instagram_posts WHERE id = ?", [id]);
    if (existing) {
      res.status(409).json({ success: false, error: `Post with id "${id}" already exists` });
      return;
    }

    dbRun(
      `INSERT INTO instagram_posts (id, year, date_str, title, location, aspect_ratio, category, caption, hashtags, images, likes_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        id,
        Number(year),
        dateStr || "",
        title,
        location || "",
        aspectRatio || "landscape",
        category,
        caption,
        JSON.stringify(hashtags || []),
        JSON.stringify(images || []),
      ]
    );
    saveDb();

    const created = dbGet<PostRow>("SELECT * FROM instagram_posts WHERE id = ?", [id]);
    res.status(201).json({ success: true, post: created ? parsePostRow(created) : null });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ success: false, error: "Failed to create post" });
  }
});

// PUT /posts/:id — update an existing post
router.put("/:id", requireAdmin, (req, res) => {
  try {
    const existing = dbGet<PostRow>("SELECT * FROM instagram_posts WHERE id = ?", [req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, error: "Post not found" });
      return;
    }

    const { year, dateStr, title, location, aspectRatio, category, caption, hashtags, images } = req.body;

    dbRun(
      `UPDATE instagram_posts SET
        year = ?, date_str = ?, title = ?, location = ?, aspect_ratio = ?,
        category = ?, caption = ?, hashtags = ?, images = ?
       WHERE id = ?`,
      [
        year !== undefined ? Number(year) : existing.year,
        dateStr !== undefined ? dateStr : existing.date_str,
        title !== undefined ? title : existing.title,
        location !== undefined ? location : existing.location,
        aspectRatio !== undefined ? aspectRatio : existing.aspect_ratio,
        category !== undefined ? category : existing.category,
        caption !== undefined ? caption : existing.caption,
        hashtags !== undefined ? JSON.stringify(hashtags) : existing.hashtags,
        images !== undefined ? JSON.stringify(images) : existing.images,
        req.params.id,
      ]
    );
    saveDb();

    const updated = dbGet<PostRow>("SELECT * FROM instagram_posts WHERE id = ?", [req.params.id]);
    res.json({ success: true, post: updated ? parsePostRow(updated) : null });
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ success: false, error: "Failed to update post" });
  }
});

// DELETE /posts/:id — delete a post
router.delete("/:id", requireAdmin, (req, res) => {
  try {
    const existing = dbGet("SELECT id FROM instagram_posts WHERE id = ?", [req.params.id]);
    if (!existing) {
      res.status(404).json({ success: false, error: "Post not found" });
      return;
    }

    dbRun("DELETE FROM instagram_posts WHERE id = ?", [req.params.id]);
    saveDb();
    res.json({ success: true, message: `Post "${req.params.id}" deleted` });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ success: false, error: "Failed to delete post" });
  }
});

export default router;
