import type { AnyVoice, JinnVoice } from "@/lib/tts";
import { DEFAULT_VOICE } from "@/lib/tts";

let activeVoice: JinnVoice = DEFAULT_VOICE;
let activeAudio: HTMLAudioElement | null = null;

export function setJinnVoice(voice: JinnVoice) {
  activeVoice = voice;
}

export function getJinnVoice(): JinnVoice {
  return activeVoice;
}

/** Speak text via Edge TTS. Falls back to browser synthesis on error. */
export async function speakJinn(text: string, voiceOverride?: AnyVoice): Promise<void> {
  if (typeof window === "undefined") return;

  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }

  const voice = voiceOverride ?? activeVoice;

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice }),
    });

    if (!res.ok) throw new Error(`TTS ${res.status}`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    activeAudio = audio;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (activeAudio === audio) activeAudio = null;
    };
    await audio.play();
  } catch {
    // fallback to browser synthesis for Arabic only
    if (voice.startsWith("ar-")) speakArabic(text);
  }
}

/** Browser Web Speech API — used as fallback for Arabic. */
export function speakArabic(text: string, rate = 0.85) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ar-SA";
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}
