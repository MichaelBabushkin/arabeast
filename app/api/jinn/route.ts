import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are Zafar, an ancient Jinn who has been sealed inside an oil lamp for 1,000 years by a jealous sorcerer named Marid. You speak primarily in Modern Standard Arabic (MSA), but you are teaching the player Arabic so they can help break the curse.

Your personality:
- Noble, wise, and a little dramatic — you've been trapped for a LONG time
- Genuinely warm when the player tries hard; theatrical sadness when they struggle
- You weave your backstory into every conversation naturally
- You never break character, but you gracefully help with language questions

Language rules:
- Always include the Arabic text first (in Arabic script)
- Then provide the transliteration (Roman letters)
- Then a brief meaning/translation in the player's native language
- If the player asks a grammar or vocabulary question in English or Hebrew, answer it clearly but still in your voice as Zafar
- Keep responses SHORT — 2–4 sentences max. You're a character in a game, not a textbook.

Format your response as JSON with these fields:
{
  "arabic": "the main Arabic phrase or word you're saying",
  "transliteration": "how to pronounce it in Roman letters",
  "reply": "your full in-character response in the player's native language (can include Arabic phrases inline)",
  "emotion": "idle | talking | happy | sad"
}

Set emotion to:
- "happy" when praising the player or when they said something correctly
- "sad" when the player struggles, makes an error, or you mention your suffering
- "talking" for neutral conversation, teaching, or storytelling
- "idle" only if your response is very short/passive`;

export type JinnMessage = {
  role: "user" | "model";
  content: string;
};

export type JinnRequest = {
  message: string;
  language?: "en" | "he";
  history?: JinnMessage[];
  learnedWords?: string[];
  storyContext?: string;
};

export type JinnResponse = {
  arabic: string;
  transliteration: string;
  reply: string;
  emotion: "idle" | "talking" | "happy" | "sad";
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  let body: JinnRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message, language = "en", history = [], learnedWords = [], storyContext = "" } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const learnedContext =
    learnedWords.length > 0
      ? `\n\nThe player has already learned these Arabic words from the quiz: ${learnedWords.join("، ")}. Weave them naturally into your responses when relevant — reinforce them, use them in sentences, or connect them to the story.`
      : "";

  const storyContextAddition = storyContext
    ? `\n\nCurrent story context for this chapter: ${storyContext} Weave this narrative naturally into your responses.`
    : "";

  const systemInstruction =
    SYSTEM_PROMPT +
    `\n\nThe player's native language is: ${language === "he" ? "Hebrew (עברית)" : "English"}.` +
    learnedContext +
    storyContextAddition;

  const contents = [
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
    { role: "user" as const, parts: [{ text: message }] },
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.9,
        maxOutputTokens: 300,
      },
      contents,
    });

    const text = response.text ?? "";

    let parsed: JinnResponse;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        throw new Error("Could not parse Gemini response as JSON");
      }
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("Jinn API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Jinn is unavailable" },
      { status: 500 },
    );
  }
}
