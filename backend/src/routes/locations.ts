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
const uploadsDir = path.join(__dirname, "..", "..", "uploads", "locations");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `loc-${uniqueSuffix}${ext}`);
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

export interface LocationRow {
  id: string;
  name: string;
  name_te: string;
  lat: number;
  lng: number;
  year: number;
  story: string;
  story_te: string;
  image: string;
  category: string;
  icon: string;
  order_index: number;
  created_at: string;
}

function parseLocationRow(row: LocationRow) {
  return {
    id: row.id,
    name: row.name,
    nameTe: row.name_te || "",
    lat: Number(row.lat),
    lng: Number(row.lng),
    year: Number(row.year),
    story: row.story || "",
    storyTe: row.story_te || "",
    image: row.image || "",
    category: row.category || "holiday",
    icon: row.icon || "📍",
    orderIndex: typeof row.order_index === "number" ? row.order_index : 0,
    createdAt: row.created_at,
  };
}

// ─── PUBLIC: GET /locations ───────────────────
router.get("/", (_req, res) => {
  try {
    const rows = dbAll<LocationRow>(
      "SELECT * FROM map_locations ORDER BY order_index ASC, year ASC"
    );
    res.json({
      success: true,
      total: rows.length,
      locations: rows.map(parseLocationRow),
    });
  } catch (err) {
    console.error("Error fetching map locations:", err);
    res.status(500).json({ success: false, error: "Failed to fetch map locations" });
  }
});

// ─── PUBLIC: GET /locations/:id ───────────────
router.get("/:id", (req, res) => {
  try {
    const row = dbGet<LocationRow>(
      "SELECT * FROM map_locations WHERE id = ?",
      [req.params.id]
    );
    if (!row) {
      res.status(404).json({ success: false, error: "Location not found" });
      return;
    }
    res.json({ success: true, location: parseLocationRow(row) });
  } catch (err) {
    console.error("Error fetching location:", err);
    res.status(500).json({ success: false, error: "Failed to fetch location" });
  }
});

// ─── ADMIN: Image Upload ───────────────────────
function handleUpload(req: any, res: any) {
  if (!req.file) {
    res.status(400).json({ success: false, error: "No image file provided" });
    return;
  }

  const cld = getCloudinary();
  if (cld) {
    cld.uploader.upload(
      req.file.path,
      {
        folder: "saa/locations",
        resource_type: "image",
        transformation: [{ quality: "auto:good", fetch_format: "auto" }],
      },
      (uploadErr, result) => {
        try {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        } catch {}

        if (uploadErr || !result) {
          console.error("Cloudinary upload failed, using local disk fallback:", uploadErr);
          const localUrl = `/uploads/locations/${req.file.filename}`;
          res.json({ success: true, url: localUrl, filename: req.file.filename });
          return;
        }

        res.json({
          success: true,
          url: result.secure_url,
          filename: result.public_id,
        });
      }
    );
    return;
  }

  const localUrl = `/uploads/locations/${req.file.filename}`;
  res.json({ success: true, url: localUrl, filename: req.file.filename });
}

router.post("/upload", requireAdmin, upload.single("image"), handleUpload);
router.post("/admin/upload", requireAdmin, upload.single("image"), handleUpload);

// ─── ADMIN: Batch Reorder ──────────────────────
function handleBatchReorder(req: any, res: any) {
  try {
    const { order } = req.body;
    if (!Array.isArray(order) || order.length === 0) {
      res.status(400).json({ success: false, error: "Missing or invalid 'order' array of location IDs" });
      return;
    }

    order.forEach((id: string, index: number) => {
      dbRun("UPDATE map_locations SET order_index = ? WHERE id = ?", [index, id]);
    });

    saveDb();
    res.json({ success: true, message: "Locations reordered successfully" });
  } catch (err) {
    console.error("Error reordering locations:", err);
    res.status(500).json({ success: false, error: "Failed to reorder locations" });
  }
}

router.put("/reorder", requireAdmin, handleBatchReorder);
router.post("/reorder", requireAdmin, handleBatchReorder);
router.put("/admin/reorder", requireAdmin, handleBatchReorder);
router.post("/admin/reorder", requireAdmin, handleBatchReorder);

// ─── ADMIN: Create Location ────────────────────
function handleCreateLocation(req: any, res: any) {
  try {
    const {
      id,
      name,
      nameTe = "",
      lat,
      lng,
      year,
      story = "",
      storyTe = "",
      image = "",
      category = "holiday",
      icon = "📍",
    } = req.body;

    if (!name || lat === undefined || lng === undefined || !year) {
      res.status(400).json({
        success: false,
        error: "Name, latitude, longitude, and year are required",
      });
      return;
    }

    const locId = id?.trim() || `loc-${Date.now()}`;
    const numLat = Number(lat);
    const numLng = Number(lng);
    const numYear = Number(year);

    if (isNaN(numLat) || isNaN(numLng) || isNaN(numYear)) {
      res.status(400).json({
        success: false,
        error: "Latitude, longitude, and year must be valid numbers",
      });
      return;
    }

    // Check if ID already exists
    const existing = dbGet("SELECT id FROM map_locations WHERE id = ?", [locId]);
    if (existing) {
      res.status(409).json({ success: false, error: "Location with this ID already exists" });
      return;
    }

    // Get max order_index to place at end of list
    const maxOrderRow = dbGet<{ max_order: number | null }>(
      "SELECT MAX(order_index) as max_order FROM map_locations"
    );
    const nextOrder = (maxOrderRow?.max_order ?? -1) + 1;

    dbRun(
      `INSERT INTO map_locations (id, name, name_te, lat, lng, year, story, story_te, image, category, icon, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [locId, name, nameTe, numLat, numLng, numYear, story, storyTe, image, category, icon, nextOrder]
    );

    saveDb();

    const created = dbGet<LocationRow>("SELECT * FROM map_locations WHERE id = ?", [locId]);
    res.status(201).json({
      success: true,
      message: "Location created successfully",
      location: created ? parseLocationRow(created) : null,
    });
  } catch (err) {
    console.error("Error creating location:", err);
    res.status(500).json({ success: false, error: "Failed to create location" });
  }
}

router.post("/", requireAdmin, handleCreateLocation);
router.post("/admin", requireAdmin, handleCreateLocation);

// ─── ADMIN: Update Location ────────────────────
function handleUpdateLocation(req: any, res: any) {
  try {
    const locId = req.params.id;
    const existing = dbGet<LocationRow>("SELECT * FROM map_locations WHERE id = ?", [locId]);
    if (!existing) {
      res.status(404).json({ success: false, error: "Location not found" });
      return;
    }

    const {
      name = existing.name,
      nameTe = existing.name_te,
      lat = existing.lat,
      lng = existing.lng,
      year = existing.year,
      story = existing.story,
      storyTe = existing.story_te,
      image = existing.image,
      category = existing.category,
      icon = existing.icon,
    } = req.body;

    const numLat = Number(lat);
    const numLng = Number(lng);
    const numYear = Number(year);

    dbRun(
      `UPDATE map_locations
       SET name = ?, name_te = ?, lat = ?, lng = ?, year = ?, story = ?, story_te = ?, image = ?, category = ?, icon = ?
       WHERE id = ?`,
      [name, nameTe, numLat, numLng, numYear, story, storyTe, image, category, icon, locId]
    );

    saveDb();

    const updated = dbGet<LocationRow>("SELECT * FROM map_locations WHERE id = ?", [locId]);
    res.json({
      success: true,
      message: "Location updated successfully",
      location: updated ? parseLocationRow(updated) : null,
    });
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).json({ success: false, error: "Failed to update location" });
  }
}

router.put("/:id", requireAdmin, handleUpdateLocation);
router.put("/admin/:id", requireAdmin, handleUpdateLocation);

// ─── ADMIN: Delete Location ────────────────────
function handleDeleteLocation(req: any, res: any) {
  try {
    const locId = req.params.id;
    const existing = dbGet("SELECT id FROM map_locations WHERE id = ?", [locId]);
    if (!existing) {
      res.status(404).json({ success: false, error: "Location not found" });
      return;
    }

    dbRun("DELETE FROM map_locations WHERE id = ?", [locId]);
    saveDb();

    res.json({ success: true, message: "Location deleted successfully" });
  } catch (err) {
    console.error("Error deleting location:", err);
    res.status(500).json({ success: false, error: "Failed to delete location" });
  }
}

router.delete("/:id", requireAdmin, handleDeleteLocation);
router.delete("/admin/:id", requireAdmin, handleDeleteLocation);

export default router;
