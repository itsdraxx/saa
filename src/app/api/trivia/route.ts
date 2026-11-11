import { NextResponse } from "next/server";
import { triviaQuestions } from "@/data/trivia";

export async function GET() {
  return NextResponse.json({
    success: true,
    total: triviaQuestions.length,
    questions: triviaQuestions,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.question || !Array.isArray(body.options)) {
      return NextResponse.json(
        { success: false, error: "Question and options array are required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Trivia question submitted successfully",
      question: {
        id: triviaQuestions.length + 1,
        ...body,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}

