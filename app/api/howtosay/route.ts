import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { withRetry } from "@/lib/retry";

export const dynamic = "force-dynamic";

export type HowToSay = {
  arabic: string;
  translit: string;
  literal: string;
  note?: string;
  words: { arabic: string; translit: string; meaning: string }[];
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
  const systemInstruction = `You are a helpful Arabic (Modern Standard Arabic) teacher.
The learner wants to know how to naturally say the following in Arabic:
"${text}"
Translate the phrase naturally into Modern Standard Arabic.
Respond ONLY with a valid JSON object in this exact shape:
{
  "arabic": "natural Modern Standard Arabic rendering",
  "translit": "romanized pronunciation of the full translation",
  "literal": "literal back-translation of the Arabic phrase into ${lang}",
  "note": "an optional brief register/usage note in ${lang} (e.g. formal vs informal, singular vs plural, masculine vs feminine)",
  "words": [
    {
      "arabic": "an individual word from the translation in Arabic script",
      "translit": "romanized pronunciation of this word",
      "meaning": "its meaning in ${lang}"
    }
  ]
}
Do not wrap your response in markdown code blocks like \`\`\`json. Respond with the raw JSON string only. Include every major vocabulary word from your translation in the "words" breakdown.`;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.5,
          maxOutputTokens: 400,
        },
        contents: [{ role: "user" as const, parts: [{ text }] }],
      }),
    );

    const out = response.text ?? "";
    let parsed: HowToSay;
    try {
      parsed = JSON.parse(out);
    } catch {
      const match = out.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) parsed = JSON.parse(match[1]);
      else throw new Error("Could not parse response as JSON");
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("How To Say API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Translation failed" },
      { status: 500 },
    );
  }
}
