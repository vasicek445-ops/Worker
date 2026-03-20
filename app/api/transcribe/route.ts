import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB — Whisper API limit

interface WhisperSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

interface WhisperResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  segments: WhisperSegment[];
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'file' field in form data" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is 25MB, got ${(file.size / 1024 / 1024).toFixed(1)}MB` },
        { status: 400 }
      );
    }

    // Build FormData for the Whisper API
    const whisperForm = new FormData();
    whisperForm.append("file", file);
    whisperForm.append("model", "whisper-1");
    whisperForm.append("response_format", "verbose_json");
    // Language: omit to let Whisper auto-detect (Czech, Slovak, German, English, etc.)

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: whisperForm,
    });

    if (!whisperRes.ok) {
      const errorBody = await whisperRes.text();
      console.error("[transcribe] Whisper API error:", whisperRes.status, errorBody);
      return NextResponse.json(
        { success: false, error: `Whisper API error: ${whisperRes.status}` },
        { status: 502 }
      );
    }

    const data: WhisperResponse = await whisperRes.json();

    return NextResponse.json({
      success: true,
      text: data.text,
      language: data.language,
      duration: data.duration,
      segments: data.segments.map((s) => ({
        start: s.start,
        end: s.end,
        text: s.text,
      })),
    });
  } catch (error) {
    console.error("[transcribe] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
