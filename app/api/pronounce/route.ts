import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { withRetry } from "@/lib/retry";

export const dynamic = "force-dynamic";

// Audio-capable Gemini model. Swap if this preview ID stops accepting audio.
const MODEL = "gemini-3.1-flash-lite-preview";

export type PronounceResult = {
  score: number;     // 0–100
  heard: string;     // what the model heard (Arabic) or "—"
  feedback: string;  // one short encouraging tip in the user's language
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });

  let body: { word?: string; translit?: string; language?: "en" | "he"; audio?: string; mimeType?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { word, translit = "", language = "en", audio, mimeType = "audio/wav" } = body;
  if (!word?.trim() || !audio) {
    return NextResponse.json({ error: "word and audio are required" }, { status: 400 });
  }

  const lang = language === "he" ? "Hebrew (עברית)" : "English";
  const systemInstruction = `You are a warm, encouraging Arabic (MSA) pronunciation coach.
The learner is practising the word "${word}"${translit ? ` (transliteration: ${translit})` : ""}.
Listen to the attached audio of them saying it and grade ONLY how accurately they pronounced THIS word.
Respond ONLY with valid JSON:
{
  "score": <integer 0-100>,
  "heard": "<what you actually heard in Arabic, or '—' if unclear/silent>",
  "feedback": "<one short, kind, specific tip in ${lang}>"
}
If the audio is silent, noise, or clearly a different word, give a low score and say so gently.`;

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: MODEL,
        config: { systemInstruction, responseMimeType: "application/json", temperature: 0.3, maxOutputTokens: 250 },
        contents: [{ role: "user", parts: [{ text: `Here is my pronunciation of "${word}".` }, { inlineData: { mimeType, data: audio } }] }],
      }),
    );
    const out = response.text ?? "";
    let parsed: PronounceResult;
    try {
      parsed = JSON.parse(out);
    } catch {
      const m = out.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) parsed = JSON.parse(m[1]);
      else throw new Error("parse");
    }
    parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score)));
    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("Pronounce error:", err);
    return NextResponse.json({ error: "Grading unavailable" }, { status: 500 });
  }
}
