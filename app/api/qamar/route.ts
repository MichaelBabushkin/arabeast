import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { withRetry } from "@/lib/retry";
import qamarSystemPromptData from "@/data/qamar-system-prompt.json";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = qamarSystemPromptData.systemPrompt;

export type QamarMessage = {
  role: "user" | "model";
  content: string;
};

export type QamarRequest = {
  message: string;
  language?: "en" | "he";
  history?: QamarMessage[];
  learnedWords?: string[];
  storyContext?: string;
};

export type QamarResponse = {
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

  let body: QamarRequest;
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
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.9,
          maxOutputTokens: 400,
        },
        contents,
      })
    );

    const text = response.text ?? "";

    let parsed: QamarResponse;
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
    console.error("Qamar API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Qamar is unavailable" },
      { status: 500 },
    );
  }
}
