import { NextResponse } from "next/server";
import { galleryItems } from "@/data/gallery";
import { timelineEntries } from "@/data/timeline";
import { familyMessages } from "@/data/family-messages";
import { thenVsNowPairs } from "@/data/then-vs-now";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "gallery") {
    return NextResponse.json({ success: true, data: galleryItems });
  }

  if (type === "timeline") {
    return NextResponse.json({ success: true, data: timelineEntries });
  }

  if (type === "messages") {
    return NextResponse.json({ success: true, data: familyMessages });
  }

  if (type === "then-now") {
    return NextResponse.json({ success: true, data: thenVsNowPairs });
  }

  return NextResponse.json({
    success: true,
    data: {
      timeline: timelineEntries,
      gallery: galleryItems,
      messages: familyMessages,
      thenVsNow: thenVsNowPairs,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validates incoming memory payload for admin dashboard
    if (!body || !body.title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Memory received for admin review",
      entry: {
        id: `custom-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}

