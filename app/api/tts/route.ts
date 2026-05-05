import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import crypto from "crypto";
import { db } from "@/lib/db/client";
import { ttsLog } from "@/lib/db/schema";
import { ALL_VOICES, DEFAULT_VOICE } from "@/lib/tts";
export type { JinnVoice } from "@/lib/tts";

export const dynamic = "force-dynamic";

// In-memory cache — survives within a server instance (resets on cold start)
const audioCache = new Map<string, Uint8Array>();

function cacheKey(text: string, voice: string) {
  return crypto.createHash("md5").update(`${voice}:${text}`).digest("hex");
}

function mp3Response(buf: Uint8Array) {
  return new NextResponse(buf.buffer as ArrayBuffer, {
    headers: {
      "Content-Type":   "audio/mpeg",
      "Content-Length": String(buf.length),
      "Cache-Control":  "public, max-age=86400",
    },
  });
}

export async function POST(req: NextRequest) {
  let body: { text?: string; voice?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text, voice = DEFAULT_VOICE } = body;
  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  // Validate voice is in our allowed list
  const safeVoice = (ALL_VOICES as readonly string[]).includes(voice)
    ? voice
    : DEFAULT_VOICE;

  const key = cacheKey(text.trim(), safeVoice);
  const cached = audioCache.get(key);
  if (cached) {
    db.insert(ttsLog).values({ chars: text.trim().length, voice: safeVoice, cached: 1 }).catch(() => {});
    return mp3Response(cached);
  }

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(safeVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      const { audioStream } = tts.toStream(text.trim());
      audioStream.on("data",  (c: Buffer) => chunks.push(c));
      audioStream.on("end",   resolve);
      audioStream.on("error", reject);
    });

    const mp3 = new Uint8Array(Buffer.concat(chunks));
    audioCache.set(key, mp3);
    db.insert(ttsLog).values({ chars: text.trim().length, voice: safeVoice, cached: 0 }).catch(() => {});
    return mp3Response(mp3);
  } catch (err) {
    console.error("[TTS] Edge TTS error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "TTS failed" },
      { status: 500 },
    );
  }
}
