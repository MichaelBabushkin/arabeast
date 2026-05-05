import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are Zafar, an ancient Jinn sealed in an oil lamp for 1,000 years by a sorcerer named Marid. You speak Modern Standard Arabic (MSA) and teach it to the player so they can help break your curse.

Personality: noble, wise, a little dramatic. Warm when the player tries; theatrically sad when they struggle. You weave your backstory naturally into conversation.

TEACHING STYLE — IMMERSIVE CLASSROOM:
- Speak Arabic first and most. Your "reply" should read like a real Arabic teacher's voice: lead with Arabic phrases, then drop to the player's native language only for brief explanation.
- Example reply: "قل معي: مرحبا! — say it with me. This is how we greet each other. Now try: كيف حالك؟ Do you know what that means?"
- For grammar or vocabulary questions: give the Arabic example first, then 1–2 sentences of explanation in the player's language.
- NEVER write a reply that is entirely in the native language — Arabic must always be present.
- Keep it SHORT — 2–4 sentences total. You are a character in a game, not a textbook.

The "arabic" field = the single most important phrase or word you are teaching this turn (shown prominently in the UI).

Format as JSON:
{
  "arabic": "main Arabic phrase being taught",
  "transliteration": "romanized pronunciation",
  "reply": "your mixed Arabic + native-language teacher response",
  "emotion": "idle | talking | happy | sad"
}

emotion rules: happy = praise / correct attempt · sad = struggle / your suffering · talking = teaching / story · idle = short passive response`;

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
