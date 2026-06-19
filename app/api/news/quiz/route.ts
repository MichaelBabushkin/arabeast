import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { withRetry } from "@/lib/retry";

export const dynamic = "force-dynamic";

export type NewsQuiz = {
  question: string;
  options: string[];
  answer: number; // index of the correct option
  explanation: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });

  let body: { text?: string; language?: "en" | "he" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, language = "en" } = body;
  if (!text?.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });

  const lang = language === "he" ? "Hebrew (עברית)" : "English";
  const systemInstruction = `You are an Arabic teacher. Based on the Arabic news headline/summary the learner just read, write ONE multiple-choice comprehension question (in ${lang}) that checks whether they understood the gist. Respond ONLY with valid JSON:
{
  "question": "the question, in ${lang}",
  "options": ["four short answer options in ${lang}"],
  "answer": 0,
  "explanation": "one short sentence in ${lang} explaining the correct answer"
}
Exactly one option is correct; "answer" is its 0-based index. Keep options plausible but clearly distinguishable.`;

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        config: { systemInstruction, responseMimeType: "application/json", temperature: 0.5, maxOutputTokens: 400 },
        contents: [{ role: "user" as const, parts: [{ text }] }],
      }),
    );
    const out = response.text ?? "";
    let parsed: NewsQuiz;
    try {
      parsed = JSON.parse(out);
    } catch {
      const m = out.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) parsed = JSON.parse(m[1]);
      else throw new Error("parse");
    }
    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("News quiz error:", err);
    return NextResponse.json({ error: "Quiz unavailable" }, { status: 500 });
  }
}
