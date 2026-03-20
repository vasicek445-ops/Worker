import { NextResponse } from "next/server";

// GET: Return OpenAI API key for direct client-side Whisper calls
// This bypasses Vercel's 4.5MB body size limit on Hobby plan
export async function GET() {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { success: false, error: "OPENAI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    key: process.env.OPENAI_API_KEY,
  });
}
