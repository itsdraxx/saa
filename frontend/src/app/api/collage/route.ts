import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { fallbackCollageImages } from "@/data/collage";

export async function GET() {
  try {
    let collageDir = path.join(process.cwd(), "public", "images", "collage");
    if (!fs.existsSync(collageDir)) {
      collageDir = path.join(process.cwd(), "frontend", "public", "images", "collage");
    }

    if (!fs.existsSync(collageDir)) {
      return NextResponse.json({ success: true, images: fallbackCollageImages });
    }

    const files = fs.readdirSync(collageDir);
    const validExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);

    const imageFiles = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return validExtensions.has(ext) && !file.startsWith(".");
      })
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

    if (imageFiles.length === 0) {
      return NextResponse.json({ success: true, images: fallbackCollageImages });
    }

    const images = imageFiles.map((file) => `/images/collage/${encodeURIComponent(file)}`);
    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error("[API/Collage] Error reading collage directory:", error);
    return NextResponse.json({ success: true, images: fallbackCollageImages });
  }
}
