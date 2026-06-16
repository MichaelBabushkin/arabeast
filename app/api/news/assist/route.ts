import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { withRetry } from "@/lib/retry";

export const dynamic = "force-dynamic";

export type NewsAssist = {
  translation: string;
  simplified: string;
  vocab: { arabic: string; translit: string; meaning: string }[];
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  let body: { text?: string; language?: "en" | "he" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, language = "en" } = body;
  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const lang = language === "he" ? "Hebrew (עברית)" : "English";
  const systemInstruction = `You are a kind, encouraging Arabic (Modern Standard Arabic) teacher helping a learner read real news.
Given an Arabic news headline and/or summary, respond ONLY with valid JSON in this exact shape:
{
  "translation": "a natural, accurate translation of the news into ${lang}",
  "simplified": "the same news rewritten in SIMPLER, easier Modern Standard Arabic (short sentences, common words) — still in Arabic",
  "vocab": [
    { "arabic": "the word in Arabic", "translit": "romanized pronunciation", "meaning": "its meaning in ${lang}" }
  ]
}
Pick the 4–6 most useful/important vocabulary words for a learner. Keep it concise.`;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.4,
          maxOutputTokens: 700,
        },
        contents: [{ role: "user" as const, parts: [{ text }] }],
      }),
    );

    const out = response.text ?? "";
    let parsed: NewsAssist;
    try {
      parsed = JSON.parse(out);
    } catch {
      const match = out.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) parsed = JSON.parse(match[1]);
      else throw new Error("Could not parse response as JSON");
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("News assist error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Assist unavailable" },
      { status: 500 },
    );
  }
}
