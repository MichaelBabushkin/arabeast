import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { withRetry } from "@/lib/retry";

export const dynamic = "force-dynamic";

export type WordGloss = {
  translit: string;
  meaning: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });

  let body: { word?: string; context?: string; language?: "en" | "he" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { word, context = "", language = "en" } = body;
  if (!word?.trim()) return NextResponse.json({ error: "word is required" }, { status: 400 });

  const lang = language === "he" ? "Hebrew (עברית)" : "English";
  const systemInstruction = `You are an Arabic (MSA) teacher. The learner tapped a single Arabic word while reading a news article and wants quick help. Respond ONLY with valid JSON:
{
  "translit": "romanized pronunciation of the word",
  "meaning": "a short, clear meaning in ${lang} (1-4 words, use the contextual sense if a sentence is given)"
}`;

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        config: { systemInstruction, responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 120 },
        contents: [{ role: "user" as const, parts: [{ text: context ? `Word: ${word}\nSentence: ${context}` : `Word: ${word}` }] }],
      }),
    );
    const out = response.text ?? "";
    let parsed: WordGloss;
    try {
      parsed = JSON.parse(out);
    } catch {
      const m = out.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) parsed = JSON.parse(m[1]);
      else throw new Error("parse");
    }
    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("Word gloss error:", err);
    return NextResponse.json({ error: "Lookup unavailable" }, { status: 500 });
  }
}
