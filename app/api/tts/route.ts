import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";
import { db } from "@/lib/db/client";
import { ttsLog } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

import { JINN_VOICES, DEFAULT_VOICE } from "@/lib/tts";
export type { JinnVoice } from "@/lib/tts";
export { JINN_VOICES };

// In-memory cache: saves repeated phrases from burning quota (reset on server restart)
const audioCache = new Map<string, Uint8Array>();

function cacheKey(text: string, voice: string) {
  return crypto.createHash("md5").update(`${voice}:${text}`).digest("hex");
}

function pcmToWav(base64: string, sampleRate = 24000): Buffer {
  const pcm = Buffer.from(base64, "base64");
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function wavResponse(wav: Uint8Array) {
  return new NextResponse(wav.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "audio/wav",
      "Content-Length": String(wav.length),
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

  let body: { text?: string; voice?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text, voice = DEFAULT_VOICE } = body;
  if (!text?.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });

  const key = cacheKey(text.trim(), voice);
  const cached = audioCache.get(key);
  if (cached) {
    console.log("[TTS] cache hit:", text.slice(0, 30));
    db.insert(ttsLog).values({ chars: text.trim().length, voice, cached: 1 }).catch(() => {});
    return wavResponse(cached);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ role: "user", parts: [{ text: text.trim() }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("No audio data in response");

    const wav = new Uint8Array(pcmToWav(audioData));
    audioCache.set(key, wav);
    db.insert(ttsLog).values({ chars: text.trim().length, voice, cached: 0 }).catch(() => {});
    console.log("[TTS] generated:", text.slice(0, 30), `(cache size: ${audioCache.size})`);
    return wavResponse(wav);
  } catch (err) {
    console.error("[TTS] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "TTS failed" },
      { status: 500 },
    );
  }
}
