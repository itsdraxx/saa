import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { fallbackCollageImages } from "@/data/collage";

export async function GET(request: Request) {
  // Accessing request properties ensures dynamic evaluation under cacheComponents
  const _url = request.url;
  try {
    let collageDir = path.join(process.cwd(), "public", "images", "collage");
    if (!fs.existsSync(collageDir)) {
      collageDir = path.join(process.cwd(), "frontend", "public", "images", "collage");
    }

    if (!fs.existsSync(collageDir)) {
      return NextResponse.json({ success: true, images: fallbackCollageImages });
    }

    const files = fs.readdirSync(collageDir);
    const validExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg", ".heic"]);

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
    return NextResponse.json({ success: true, count: images.length, images });
  } catch (error) {
    console.error("[API/Collage] Error reading collage directory:", error);
    return NextResponse.json({ success: true, images: fallbackCollageImages });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "No files provided" }, { status: 400 });
    }

    let collageDir = path.join(process.cwd(), "public", "images", "collage");
    if (!fs.existsSync(collageDir)) {
      collageDir = path.join(process.cwd(), "frontend", "public", "images", "collage");
    }

    if (!fs.existsSync(collageDir)) {
      fs.mkdirSync(collageDir, { recursive: true });
    }

    const savedFiles: string[] = [];

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase() || ".jpg";
      const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${cleanBase}-${Date.now()}${ext}`;
      const filePath = path.join(collageDir, filename);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);

      savedFiles.push(`/images/collage/${encodeURIComponent(filename)}`);
    }

    return NextResponse.json({ success: true, uploaded: savedFiles });
  } catch (err: any) {
    console.error("[API/Collage/Upload] Error saving file:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to upload file" }, { status: 500 });
  }
}
