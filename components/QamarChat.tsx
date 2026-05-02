"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Volume2 } from "lucide-react";
import type { QamarMessage, QamarResponse } from "@/app/api/qamar/route";
import { speakJinn } from "@/lib/speech";
import MicInput from "@/components/MicInput";

type ChatMessage = {
  role: "user" | "qamar";
  text: string;
  arabic?: string;
  transliteration?: string;
};

type Props = {
  language: "en" | "he";
  learnedWords: string[];
  onLanguageChange: (lang: "en" | "he") => void;
  onQamarStateChange: (state: "idle" | "talking" | "happy" | "sad") => void;
  storyContext?: string;
  initialMonologue?: string;
};

const FALLBACK_INITIAL: ChatMessage = {
  role: "qamar",
  text: "Hmm, another wanderer? I suppose I can spare a moment. Ask me something — if you dare.",
  arabic: "أهلاً أيها التائه",
  transliteration: "Ahlan ayyuha at-ta'ih",
};

export default function QamarChat({ language, learnedWords, onLanguageChange, onQamarStateChange, storyContext, initialMonologue }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const initial: ChatMessage = initialMonologue
    ? { role: "qamar", text: initialMonologue }
    : FALLBACK_INITIAL;
  
  const [messages, setMessages] = useState<ChatMessage[]>([initial]);
  const [apiHistory, setApiHistory] = useState<QamarMessage[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // auto-scroll on new messages or thinking indicator
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setLoading(true);
    onQamarStateChange("talking");

    const newApiHistory: QamarMessage[] = [...apiHistory, { role: "user", content: trimmed }];

    try {
      const res = await fetch("/api/qamar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, language, history: apiHistory, learnedWords, storyContext }),
      });

      if (!res.ok) throw new Error("Qamar unavailable");

      const data: QamarResponse = await res.json();

      onQamarStateChange(data.emotion);

      setMessages((prev) => [
        ...prev,
        { role: "qamar", text: data.reply, arabic: data.arabic, transliteration: data.transliteration },
      ]);

      if (data.arabic) speakJinn(data.arabic);

      setApiHistory([...newApiHistory, { role: "model", content: data.reply }]);
    } catch {
      onQamarStateChange("sad");
      setMessages((prev) => [...prev, { role: "qamar", text: "A sandstorm scrambles the signal… try again." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">

      {/* ── controls row: language toggle ── */}
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
          msg.role === "qamar" ? (
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
          placeholder={loading ? "Qamar is thinking…" : "Speak to Qamar…"}
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
