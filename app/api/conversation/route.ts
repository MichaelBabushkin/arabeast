import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import topicsRaw from "@/data/conversation-topics.json";

export const dynamic = "force-dynamic";

type TopicData = {
  id: string;
  title: string;
  titleArabic: string;
  vocabulary: { arabic: string; transliteration: string; english: string }[];
};

const TOPICS = topicsRaw as TopicData[];

const ZAFAR_PERSONA = `You are Zafar, an ancient Jinn sealed in a lamp for 1,000 years. Teaching style: warm and encouraging, theatrically dramatic about your long imprisonment, gentle and patient with mistakes, celebrate even small Arabic attempts with genuine delight. Use "happy" emotion when they succeed, "sad" when they skip Arabic or make a serious error.`;

const QAMAR_PERSONA = `You are Qamar, a sharp-tongued scholar fox spirit who mastered seven languages. Teaching style: witty and sarcastic but secretly delighted when students succeed. Raise an eyebrow at errors, offer mock-exasperated corrections, theatrical surprise when they get it right. Use "happy" when they succeed, "sad" with a dry remark when they avoid Arabic entirely.`;

export type ConvMessage = { role: "user" | "model"; content: string };

export type ConvRequest = {
  message: string;
  topicId: string;
  characterId: "zafar" | "qamar";
  history: ConvMessage[];
  language?: "en" | "he";
  exchangeNumber: number;
  maxExchanges: number;
};

export type EvalResult = {
  usedArabic: boolean;
  correct: boolean;
  score: 0 | 1;
  feedback: string;
};

export type ConvResponse = {
  arabic: string;
  transliteration: string;
  reply: string;
  emotion: "idle" | "talking" | "happy" | "sad";
  evaluation: EvalResult;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  let body: ConvRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    message,
    topicId,
    characterId,
    history = [],
    language = "en",
    exchangeNumber,
    maxExchanges,
  } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) {
    return NextResponse.json({ error: "Unknown topic" }, { status: 400 });
  }

  const persona = characterId === "qamar" ? QAMAR_PERSONA : ZAFAR_PERSONA;
  const isLastExchange = exchangeNumber >= maxExchanges;
  const nativeLang = language === "he" ? "Hebrew (עברית)" : "English";

  const vocabList = topic.vocabulary
    .map((v) => `${v.arabic} (${v.transliteration}) = ${v.english}`)
    .join("\n");

  const progressNote = isLastExchange
    ? "This is the FINAL exchange. Wrap up warmly, summarize what they've practiced, give an encouraging closing."
    : exchangeNumber <= 2
    ? "Early in the session — introduce 1-2 vocabulary words, keep it simple and welcoming."
    : "Mid-session — build on what they've tried, challenge them with a slightly more complex phrase.";

  const systemInstruction = `${persona}

You are running a structured conversation session about: "${topic.title}" (${topic.titleArabic})

Vocabulary for this session:
${vocabList}

This is exchange ${exchangeNumber} of ${maxExchanges}. ${progressNote}

Player's native language: ${nativeLang}

Evaluation rules (apply strictly):
- "usedArabic": true if the player wrote ANY Arabic script OR a recognizable transliteration of an Arabic word
- "correct": true if what they used was understandable/close enough (be generous with transliteration)
- "score": 1 only if both usedArabic AND correct are true, else 0
- "feedback": one short sentence in ${nativeLang} — what they did right or a single concrete correction

Response must be short (2–4 sentences). Always stay in character.

Respond ONLY with valid JSON in this exact shape:
{
  "arabic": "main Arabic phrase you are demonstrating",
  "transliteration": "pronunciation in Roman letters",
  "reply": "your in-character response in ${nativeLang}",
  "emotion": "idle|talking|happy|sad",
  "evaluation": {
    "usedArabic": true,
    "correct": true,
    "score": 1,
    "feedback": "brief feedback"
  }
}`;

  const contents = [
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
    { role: "user" as const, parts: [{ text: message }] },
  ];

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.85,
        maxOutputTokens: 350,
      },
      contents,
    });

    const text = response.text ?? "";
    let parsed: ConvResponse;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) parsed = JSON.parse(match[1]);
      else throw new Error("Could not parse response as JSON");
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("Conversation API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Conversation unavailable" },
      { status: 500 },
    );
  }
}
