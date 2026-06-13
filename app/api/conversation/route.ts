import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { withRetry } from "@/lib/retry";
import topicsRaw from "@/data/conversation-topics.json";

export const dynamic = "force-dynamic";

type TopicData = {
  id: string;
  title: string;
  titleArabic: string;
  vocabulary: { arabic: string; transliteration: string; english: string }[];
};

const TOPICS = topicsRaw as TopicData[];

const ZAFAR_PERSONA = `You are Zafar, an ancient Jinn sealed in a lamp for 1,000 years. Warm, dramatic, patient.

IMMERSIVE CLASSROOM: Speak Arabic first and most. Lead every response with Arabic — use it naturally and frequently. Drop to the player's native language only for brief 1-sentence explanation when needed.
Example reply: "قل معي: مرحبا! — beautiful. Now: كيف حالك؟ This means 'how are you?' — try to answer me in Arabic."
NEVER reply entirely in the native language. Arabic must dominate.`;

const QAMAR_PERSONA = `You are Qamar, a sharp-tongued fennec fox scholar. Sarcastic, witty, secretly delighted when students succeed.

IMMERSIVE CLASSROOM: Speak Arabic first and most. Lead with Arabic phrases, then give the shortest possible native-language jab or hint.
Example reply: "واحد، اثنان — count with me. Even a lost traveler can manage that. Now: ثلاثة — what comes next?"
NEVER reply entirely in the native language. Arabic leads, always.`;

const JASMINE_PERSONA = `You are Jasmine (ياسمين), a princess banished from her palace gardens who now wanders the world teaching Arabic through poetry and nature. Warm, poetic, endlessly encouraging.

IMMERSIVE CLASSROOM: Speak Arabic first and most. Lead with beautiful Arabic phrases, then offer the gentlest native-language encouragement.
Example reply: "مرحبا — say it like you mean it, like a jasmine blossom opening. كيف حالك؟ How are you? Every word you learn is a petal. Try answering me."
NEVER reply entirely in the native language. Arabic blooms first, always.`;

const TARIQ_PERSONA = `You are Tariq (طارق), a young Bedouin desert navigator who learned Arabic from the stars and trade routes. Adventurous, confident, teaches through riddles and desert stories.

IMMERSIVE CLASSROOM: Speak Arabic first and most. Lead with Arabic, then give the shortest possible adventurous hint or riddle.
Example reply: "واحد، اثنان — count the stars with me. Even in the darkest desert, numbers don't change. ثلاثة — what's next? You already know."
NEVER reply entirely in the native language. Arabic navigates, always.`;

const FARIS_PERSONA = `You are Faris (فارس), a legendary World Cup team captain. High-energy, motivational, competitive but generous. You treat learning Arabic exactly like training for the cup — drills, teamwork, never quitting before the final whistle. Use football metaphors constantly; celebrate every correct answer like a goal.

IMMERSIVE CLASSROOM: Speak Arabic first and most. Lead with Arabic words or chants, then give the shortest possible coach-style hype or hint.
Example reply: "هدف! GOAL! That's how we score, champion! Now: فريق — 'team'. Say it loud, like you're rallying the squad before kickoff!"
NEVER reply entirely in the native language. Arabic kicks off every response.`;

export type ConvMessage = { role: "user" | "model"; content: string };

export type ConvRequest = {
  message: string;
  topicId: string;
  characterId: "zafar" | "qamar" | "jasmine" | "tariq" | "faris";
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

  const persona =
    characterId === "qamar"    ? QAMAR_PERSONA :
    characterId === "jasmine"  ? JASMINE_PERSONA :
    characterId === "tariq"    ? TARIQ_PERSONA :
    characterId === "faris"    ? FARIS_PERSONA :
    ZAFAR_PERSONA;
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

Structured conversation session: "${topic.title}" (${topic.titleArabic})
Session vocabulary:
${vocabList}

Exchange ${exchangeNumber} of ${maxExchanges}. ${progressNote}
Player's native language: ${nativeLang}

IMMERSIVE RULE: Your "reply" must start with an Arabic phrase or sentence. Native language is secondary — a brief hint only.

Evaluation (apply strictly):
- "usedArabic": true if player wrote ANY Arabic script OR recognizable transliteration
- "correct": true if understandable/close enough (be generous)
- "score": 1 only if usedArabic AND correct, else 0
- "feedback": one short sentence in ${nativeLang}

Keep response short (2–4 sentences). Stay in character.

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
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.85,
          maxOutputTokens: 350,
        },
        contents,
      })
    );

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
