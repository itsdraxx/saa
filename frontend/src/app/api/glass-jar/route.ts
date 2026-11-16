import { NextResponse } from "next/server";
import { glassJarMessages } from "@/data/glass-jar-messages";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const random = searchParams.get("random");

  if (random === "true") {
    const randomIndex = Math.floor(Math.random() * glassJarMessages.length);
    return NextResponse.json({
      success: true,
      message: glassJarMessages[randomIndex],
      total: glassJarMessages.length,
    });
  }

  return NextResponse.json({
    success: true,
    total: glassJarMessages.length,
    messages: glassJarMessages,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.message) {
      return NextResponse.json(
        { success: false, error: "A love note message is required" },
        { status: 400 }
      );
    }

    const newNote = {
      id: glassJarMessages.length + 1,
      message: String(body.message).trim(),
      author: body.author ? String(body.author).trim() : "Family Member",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Note added to the Glass Jar",
      note: newNote,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}

