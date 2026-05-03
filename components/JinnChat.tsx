"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Volume2 } from "lucide-react";
import type { JinnMessage, JinnResponse } from "@/app/api/jinn/route";
import { JINN_VOICES, type JinnVoice } from "@/lib/tts";
import { getJinnVoice, setJinnVoice, speakJinn } from "@/lib/speech";
import MicInput from "@/components/MicInput";

type ChatMessage = {
  role: "user" | "jinn";
  text: string;
  arabic?: string;
  transliteration?: string;
};

type Props = {
  language: "en" | "he";
  learnedWords: string[];
  onLanguageChange: (lang: "en" | "he") => void;
  onJinnStateChange: (state: "idle" | "talking" | "happy" | "sad") => void;
  storyContext?: string;
  initialMonologue?: string;
};

const VOICE_LABELS: Record<string, string> = {
  "ar-SA-HamedNeural":   "Hamed (SA)",
  "ar-SA-ZariyahNeural": "Zariyah (SA)",
  "ar-EG-ShakirNeural":  "Shakir (EG)",
  "ar-EG-SalmaNeural":   "Salma (EG)",
  "ar-LB-RamiNeural":    "Rami (LB)",
  "ar-JO-TaimNeural":    "Taim (JO)",
};

const INITIAL_MESSAGE: ChatMessage = {
  role: "jinn",
  text: "I speak only in Arabic. Ask me anything, or say a word in Arabic to begin…",
  arabic: "أهلاً بك يا صديقي",
  transliteration: "Ahlan bika ya sadiqi",
};

export default function JinnChat({ language, learnedWords, onLanguageChange, onJinnStateChange, storyContext, initialMonologue }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const initial: ChatMessage = initialMonologue
    ? { role: "jinn", text: initialMonologue }
    : INITIAL_MESSAGE;

  const [messages, setMessages] = useState<ChatMessage[]>([initial]);
  const [apiHistory, setApiHistory] = useState<JinnMessage[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<JinnVoice>(getJinnVoice());

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // auto-scroll on new messages or thinking indicator
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleVoiceChange = (voice: JinnVoice) => {
    setSelectedVoice(voice);
    setJinnVoice(voice);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setLoading(true);
    onJinnStateChange("talking");

    const newApiHistory: JinnMessage[] = [...apiHistory, { role: "user", content: trimmed }];

    try {
      const res = await fetch("/api/jinn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, language, history: apiHistory, learnedWords, storyContext }),
      });

      if (!res.ok) throw new Error("Jinn unavailable");

      const data: JinnResponse = await res.json();

      onJinnStateChange(data.emotion);

      setMessages((prev) => [
        ...prev,
        { role: "jinn", text: data.reply, arabic: data.arabic, transliteration: data.transliteration },
      ]);

      if (data.arabic) speakJinn(data.arabic);

      setApiHistory([...newApiHistory, { role: "model", content: data.reply }]);
    } catch {
      onJinnStateChange("sad");
      setMessages((prev) => [...prev, { role: "jinn", text: "The lamp flickers… something went wrong. Try again." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">

      {/* ── controls row: language toggle + voice picker ── */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex overflow-hidden rounded-xl border border-white/10 text-xs font-semibold">
          {(["en", "he"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onLanguageChange(l)}
              className={`px-3 py-1 transition ${
                language === l
                  ? "bg-amber-500/25 text-amber-200"
                  : "text-amber-300/40 hover:text-amber-300/70"
              }`}
            >
              {l === "en" ? "EN" : "עב"}
            </button>
          ))}
        </div>

        <select
          value={selectedVoice}
          onChange={(e) => handleVoiceChange(e.target.value as JinnVoice)}
          className="max-w-[120px] truncate rounded-lg border border-white/10 bg-transparent px-2 py-1 text-xs text-amber-300/60 outline-none"
        >
          {JINN_VOICES.map((v) => (
            <option key={v} value={v} style={{ background: "#0d0618" }}>
              {VOICE_LABELS[v] ?? v}
            </option>
          ))}
        </select>
      </div>

      {/* ── conversation history ── */}
      <div
        className="flex max-h-[300px] flex-col gap-3 overflow-y-auto rounded-2xl px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(212,160,23,0.18)",
          scrollbarWidth: "none",
        }}
      >
        {messages.map((msg, i) =>
          msg.role === "jinn" ? (
            <div key={i} className="space-y-0.5">
              {msg.arabic && (
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="text-xl font-bold leading-snug text-amber-100"
                    style={{ fontFamily: "var(--font-noto-naskh), serif", direction: "rtl" }}
                  >
                    {msg.arabic}
                  </p>
                  <button
                    type="button"
                    onClick={() => speakJinn(msg.arabic!)}
                    className="mt-1 flex-shrink-0 text-amber-400/40 transition hover:text-amber-300"
                    aria-label="Replay"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {msg.transliteration && (
                <p className="text-xs italic text-amber-300/45">{msg.transliteration}</p>
              )}
              <p className="text-sm leading-relaxed text-amber-50/75">{msg.text}</p>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <p className="max-w-[80%] rounded-xl bg-white/[0.07] px-3 py-1.5 text-sm text-amber-200/70">
                {msg.text}
              </p>
            </div>
          )
        )}

        {/* thinking dots */}
        {loading && (
          <div className="flex items-center gap-1 py-1">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="h-1.5 w-1.5 rounded-full bg-amber-400/50"
                style={{ animation: `bounce 1s ${delay}ms ease-in-out infinite` }}
              />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── input bar ── */}
      <div
        className="flex items-center gap-2 rounded-2xl px-3 py-2"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,160,23,0.2)" }}
      >
        <MicInput onTranscript={(t) => sendMessage(t)} disabled={loading} />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          disabled={loading}
          placeholder={loading ? "Zafar is thinking…" : "Speak to the Jinn…"}
          className="flex-1 bg-transparent text-sm text-amber-50 placeholder:text-amber-300/40 outline-none"
          dir="auto"
        />
        <button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition"
          style={{
            background:
              loading || !input.trim() ? "rgba(212,160,23,0.1)" : "rgba(212,160,23,0.3)",
          }}
          aria-label="Send"
        >
          <Send className="h-4 w-4 text-amber-300" />
        </button>
      </div>
    </div>
  );
}
