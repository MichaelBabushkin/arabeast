"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import type { JinnMessage, JinnResponse } from "@/app/api/jinn/route";
import { speakArabic } from "@/lib/speech";
import MicInput from "@/components/MicInput";

type Props = {
  language?: "en" | "he";
  onJinnResponse: (res: JinnResponse) => void;
  onJinnThinking: () => void;
};

export default function JinnChat({ language = "en", onJinnResponse, onJinnThinking }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<JinnMessage[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    setInput("");
    setLoading(true);
    onJinnThinking();

    const newHistory: JinnMessage[] = [...history, { role: "user", content: text }];

    try {
      const res = await fetch("/api/jinn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language, history }),
      });

      if (!res.ok) throw new Error("Jinn is unavailable");

      const data: JinnResponse = await res.json();
      onJinnResponse(data);

      if (data.arabic) speakArabic(data.arabic);

      setHistory([...newHistory, { role: "model", content: data.reply }]);
    } catch {
      onJinnResponse({
        arabic: "",
        transliteration: "",
        reply: "The lamp flickers… something went wrong. Try again.",
        emotion: "sad",
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleTranscript = (text: string) => {
    setInput(text);
    sendMessage(text);
  };

  return (
    <div
      className="flex items-center gap-2 rounded-2xl px-3 py-2"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,160,23,0.2)" }}
    >
      <MicInput onTranscript={handleTranscript} disabled={loading} />

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
        style={{ background: loading || !input.trim() ? "rgba(212,160,23,0.1)" : "rgba(212,160,23,0.3)" }}
        aria-label="Send message to Jinn"
      >
        <Send className="h-4 w-4 text-amber-300" />
      </button>
    </div>
  );
}
