"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Send } from "lucide-react";
import JinnCharacter from "@/components/jinn/JinnCharacter";
import QamarCharacter from "@/components/qamar/QamarCharacter";
import MicInput from "@/components/MicInput";
import { speakJinn } from "@/lib/speech";
import { JINN_VOICES, DEFAULT_VOICE, type JinnVoice } from "@/lib/tts";
import { useSettings } from "@/lib/useSettings";

const CHARACTER_GREETING: Record<"zafar" | "qamar", string> = {
  zafar: "أهلاً وسهلاً بك يا صديقي!",
  qamar: "حسناً، هل أنت مستعد؟",
};
import type { ConvResponse, ConvMessage } from "@/app/api/conversation/route";

const VOICE_LABELS: Record<string, string> = {
  "ar-SA-HamedNeural":   "Hamed (SA)",
  "ar-SA-ZariyahNeural": "Zariyah (SA)",
  "ar-EG-ShakirNeural":  "Shakir (EG)",
  "ar-EG-SalmaNeural":   "Salma (EG)",
  "ar-LB-RamiNeural":    "Rami (LB)",
  "ar-JO-TaimNeural":    "Taim (JO)",
};
import topicsRaw from "@/data/conversation-topics.json";

const MAX_EXCHANGES = 6;

type Topic = {
  id: string;
  title: string;
  titleArabic: string;
  icon: string;
  description: string;
  color: string;
  vocabulary: { arabic: string; transliteration: string; english: string }[];
  openerZafar: string;
  openerQamar: string;
};

const TOPICS = topicsRaw as Topic[];

type Exchange = {
  userMessage: string;
  reply: string;
  arabic: string;
  transliteration: string;
  emotion: "idle" | "talking" | "happy" | "sad";
  evaluation: {
    usedArabic: boolean;
    correct: boolean;
    score: 0 | 1;
    feedback: string;
  };
};

type CharacterState = "idle" | "talking" | "happy" | "sad";
type Phase = "topics" | "character" | "session" | "summary";

const STARS = [
  { top: "4%",  left: "8%",  size: "2px",   opacity: 0.7 },
  { top: "8%",  left: "22%", size: "1.5px", opacity: 0.5 },
  { top: "3%",  left: "45%", size: "2px",   opacity: 0.6 },
  { top: "12%", left: "68%", size: "1px",   opacity: 0.8 },
  { top: "6%",  left: "82%", size: "2.5px", opacity: 0.4 },
  { top: "15%", left: "92%", size: "1.5px", opacity: 0.6 },
  { top: "22%", left: "5%",  size: "1px",   opacity: 0.5 },
  { top: "28%", left: "55%", size: "1.5px", opacity: 0.7 },
];

export default function ConversationPage() {
  const [phase, setPhase] = useState<Phase>("topics");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<"zafar" | "qamar">("zafar");
  const [characterState, setCharacterState] = useState<CharacterState>("idle");
  const { settings, update: updateSettings } = useSettings();
  const [language, setLanguage] = useState<"en" | "he">(settings.language);
  const [selectedVoice, setSelectedVoice] = useState<JinnVoice>(DEFAULT_VOICE);

  // sync language from settings once loaded
  useEffect(() => { setLanguage(settings.language); }, [settings.language]);

  // session state
  const [opener, setOpener] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [apiHistory, setApiHistory] = useState<ConvMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setCharacterTemporary = useCallback((state: CharacterState, ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCharacterState(state);
    timerRef.current = setTimeout(() => setCharacterState("idle"), ms);
  }, []);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [exchanges, loading, opener]);

  // speak Arabic greeting when session starts
  useEffect(() => {
    if (phase === "session" && opener) {
      setCharacterTemporary("talking", 3000);
      speakJinn(CHARACTER_GREETING[selectedCharacter], selectedVoice);
    }
  }, [phase, opener]);

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setPhase("character");
  };

  const handleSelectCharacter = (character: "zafar" | "qamar") => {
    setSelectedCharacter(character);
    const defaultVoice = settings.arabicVoice;
    setSelectedVoice(defaultVoice);
    if (!selectedTopic) return;
    const openerText = character === "qamar" ? selectedTopic.openerQamar : selectedTopic.openerZafar;
    setOpener(openerText);
    setExchanges([]);
    setApiHistory([]);
    setExchangeCount(0);
    setInput("");
    setPhase("session");
  };

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !selectedTopic) return;

    setInput("");
    setLoading(true);
    const nextExchange = exchangeCount + 1;

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          topicId: selectedTopic.id,
          characterId: selectedCharacter,
          history: apiHistory,
          language,
          exchangeNumber: nextExchange,
          maxExchanges: MAX_EXCHANGES,
        }),
      });

      if (!res.ok) throw new Error("Conversation unavailable");

      const data: ConvResponse = await res.json();

      setCharacterTemporary(data.emotion, 2500);
      speakJinn(data.arabic, selectedVoice);

      const newExchange: Exchange = {
        userMessage: trimmed,
        reply: data.reply,
        arabic: data.arabic,
        transliteration: data.transliteration,
        emotion: data.emotion,
        evaluation: data.evaluation,
      };

      setExchanges((prev) => [...prev, newExchange]);
      setApiHistory((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "model", content: data.reply },
      ]);
      setExchangeCount(nextExchange);

      if (nextExchange >= MAX_EXCHANGES) {
        setTimeout(() => setPhase("summary"), 2000);
      }
    } catch {
      setCharacterTemporary("sad", 2500);
      setExchanges((prev) => [
        ...prev,
        {
          userMessage: trimmed,
          reply: selectedCharacter === "qamar"
            ? "حسناً… الأثير السحري مشوش الآن. The magical ether is congested — please try again."
            : "المصباح يرتجف… The lamp flickers. Please try again in a moment.",
          arabic: "",
          transliteration: "",
          emotion: "sad",
          evaluation: { usedArabic: false, correct: false, score: 0, feedback: "Connection failed — your message was not counted." },
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [loading, selectedTopic, selectedCharacter, exchangeCount, apiHistory, language, selectedVoice, setCharacterTemporary]);

  const totalScore = exchanges.reduce((sum, e) => sum + e.evaluation.score, 0);

  const handleReset = () => {
    setPhase("topics");
    setSelectedTopic(null);
    setExchanges([]);
    setApiHistory([]);
    setExchangeCount(0);
    setOpener("");
    setCharacterState("idle");
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* stars */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.opacity }} />
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-4xl flex flex-col gap-5 px-4 py-6">

        {/* nav */}
        <div className="flex items-center gap-3">
          {phase === "topics" ? (
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Menu
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (phase === "character") setPhase("topics");
                else if (phase === "session") setPhase("character");
                else handleReset();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/50 ml-auto">
            Conversation Mode
          </p>
        </div>

        {/* ── TOPIC SELECT ── */}
        {phase === "topics" && (
          <div className="flex flex-col gap-4">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-black text-amber-50">Choose a Topic</h2>
              <p className="text-sm text-amber-200/50 mt-1">
                Your teacher will guide you through {MAX_EXCHANGES} exchanges.
              </p>
            </div>
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleSelectTopic(topic)}
                className="flex items-center gap-5 rounded-3xl p-5 text-left transition hover:scale-[1.01]"
                style={{
                  background: `linear-gradient(135deg, ${topic.color}18 0%, rgba(0,0,0,0) 100%)`,
                  border: `1px solid ${topic.color}40`,
                }}
              >
                <span className="text-4xl flex-shrink-0">{topic.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="font-bold text-amber-50">{topic.title}</p>
                    <p
                      className="text-sm text-amber-300/50"
                      style={{ fontFamily: "var(--font-noto-naskh), serif" }}
                    >
                      {topic.titleArabic}
                    </p>
                  </div>
                  <p className="text-sm text-amber-200/55 mt-0.5">{topic.description}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {topic.vocabulary.slice(0, 4).map((v) => (
                      <span
                        key={v.arabic}
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{ background: `${topic.color}20`, color: topic.color }}
                      >
                        {v.arabic}
                      </span>
                    ))}
                    {topic.vocabulary.length > 4 && (
                      <span className="text-xs text-amber-300/30 py-0.5">
                        +{topic.vocabulary.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── CHARACTER SELECT ── */}
        {phase === "character" && selectedTopic && (
          <div className="flex flex-col gap-4">
            <div className="text-center mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/60">
                {selectedTopic.icon} {selectedTopic.title}
              </p>
              <h2 className="text-2xl font-black text-amber-50">Choose Your Teacher</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Zafar */}
              <button
                type="button"
                onClick={() => handleSelectCharacter("zafar")}
                className="flex flex-col gap-3 rounded-3xl p-5 text-left transition hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, rgba(212,160,23,0.16) 0%, rgba(120,60,10,0.10) 100%)",
                  border: "1px solid rgba(212,160,23,0.35)",
                }}
              >
                <div className="mx-auto w-[120px] aspect-[260/390]">
                  <JinnCharacter state="idle" />
                </div>
                <div>
                  <p className="font-bold text-amber-50 text-lg">Zafar</p>
                  <p className="text-xs text-amber-400/60 mb-1">Ancient Jinn · 1,000 years imprisoned</p>
                  <p className="text-sm text-amber-200/55">
                    Warm, patient, and encouraging. Celebrates every attempt. Perfect if you&apos;re just starting out.
                  </p>
                </div>
              </button>
              {/* Qamar */}
              <button
                type="button"
                onClick={() => handleSelectCharacter("qamar")}
                className="flex flex-col gap-3 rounded-3xl p-5 text-left transition hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, rgba(124,58,237,0.16) 0%, rgba(60,0,120,0.10) 100%)",
                  border: "1px solid rgba(124,58,237,0.35)",
                }}
              >
                <div className="mx-auto w-[120px] aspect-[260/390]">
                  <QamarCharacter state="idle" />
                </div>
                <div>
                  <p className="font-bold text-amber-50 text-lg">Qamar</p>
                  <p className="text-xs text-purple-400/60 mb-1">Scholar Fox Spirit · 7 languages mastered</p>
                  <p className="text-sm text-amber-200/55">
                    Witty, sarcastic, secretly delighted when you succeed. For learners who want a challenge.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── SESSION ── */}
        {phase === "session" && selectedTopic && (
          <div className="flex flex-col md:flex-row gap-6 items-start">

            {/* character panel */}
            <div className="w-full md:w-[36%] flex flex-col items-center gap-3">
              <div className="w-full max-w-[200px] mx-auto aspect-[260/390]">
                {selectedCharacter === "qamar" ? (
                  <QamarCharacter state={characterState} />
                ) : (
                  <JinnCharacter state={characterState} />
                )}
              </div>
              {/* vocab reference */}
              <div
                className="w-full rounded-2xl px-3 py-3 flex flex-col gap-1.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50 mb-0.5">
                  {selectedTopic.icon} Vocab
                </p>
                {selectedTopic.vocabulary.slice(0, 6).map((v) => (
                  <div key={v.arabic} className="flex items-baseline gap-1.5">
                    <span
                      className="text-sm font-bold text-amber-100 leading-tight"
                      style={{ fontFamily: "var(--font-noto-naskh), serif", direction: "rtl" }}
                    >
                      {v.arabic}
                    </span>
                    <span className="text-xs text-amber-300/40 italic flex-1 truncate">{v.transliteration}</span>
                    <span className="text-xs text-amber-200/50 flex-shrink-0">{v.english}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* chat panel */}
            <div className="w-full md:flex-1 flex flex-col gap-3">
              {/* controls: language + voice */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex overflow-hidden rounded-xl border border-white/10 text-xs font-semibold">
                  {(["en", "he"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLanguage(l)}
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
                  onChange={(e) => {
                    const v = e.target.value as JinnVoice;
                    setSelectedVoice(v);
                    updateSettings({ arabicVoice: v });
                  }}
                  className="max-w-[130px] truncate rounded-lg border border-white/10 bg-transparent px-2 py-1 text-xs text-amber-300/60 outline-none"
                >
                  {JINN_VOICES.map((v) => (
                    <option key={v} value={v} style={{ background: "#0d0618" }}>
                      {VOICE_LABELS[v] ?? v}
                    </option>
                  ))}
                </select>
              </div>

              {/* progress bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(exchangeCount / MAX_EXCHANGES) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-amber-300/50 font-semibold flex-shrink-0">
                  {exchangeCount} / {MAX_EXCHANGES}
                </span>
              </div>

              {/* messages */}
              <div
                className="flex flex-col gap-3 overflow-y-auto rounded-2xl px-4 py-3"
                style={{
                  minHeight: "260px",
                  maxHeight: "380px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(212,160,23,0.18)",
                  scrollbarWidth: "none",
                }}
              >
                {/* opener */}
                {opener && (
                  <div className="space-y-0.5">
                    <p className="text-sm leading-relaxed text-amber-50/80">{opener}</p>
                  </div>
                )}

                {exchanges.map((ex, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    {/* user bubble + evaluation */}
                    <div className="flex justify-end items-start gap-2">
                      <div className="flex flex-col items-end gap-1 max-w-[80%]">
                        <div
                          className="rounded-xl bg-white/[0.07] px-3 py-1.5 text-sm text-amber-200/70"
                        >
                          {ex.userMessage}
                        </div>
                        <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          ex.evaluation.score === 1
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}>
                          {ex.evaluation.score === 1 ? (
                            <CheckCircle className="h-3 w-3 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 flex-shrink-0" />
                          )}
                          <span>{ex.evaluation.feedback}</span>
                        </div>
                      </div>
                    </div>
                    {/* character reply */}
                    <div className="space-y-0.5">
                      {ex.arabic && (
                        <p
                          className="text-xl font-bold leading-snug text-amber-100"
                          style={{ fontFamily: "var(--font-noto-naskh), serif", direction: "rtl" }}
                        >
                          {ex.arabic}
                        </p>
                      )}
                      {ex.transliteration && (
                        <p className="text-xs italic text-amber-300/45">{ex.transliteration}</p>
                      )}
                      <p className="text-sm leading-relaxed text-amber-50/75">{ex.reply}</p>
                    </div>
                  </div>
                ))}

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

              {/* input */}
              {exchangeCount < MAX_EXCHANGES && (
                <div
                  className="flex items-center gap-2 rounded-2xl px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,160,23,0.2)" }}
                >
                  <MicInput
                    onTranscript={(t) => sendMessage(t)}
                    disabled={loading}
                    lang={language === "he" ? "he-IL" : "en-US"}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                    disabled={loading}
                    placeholder={loading ? "Thinking…" : "Type or speak in Arabic…"}
                    className="flex-1 bg-transparent text-sm text-amber-50 placeholder:text-amber-300/40 outline-none"
                    dir="auto"
                  />
                  <button
                    type="button"
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim()}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition"
                    style={{
                      background: loading || !input.trim()
                        ? "rgba(212,160,23,0.1)"
                        : "rgba(212,160,23,0.3)",
                    }}
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4 text-amber-300" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SUMMARY ── */}
        {phase === "summary" && selectedTopic && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-[140px] aspect-[260/390]">
              {selectedCharacter === "qamar" ? (
                <QamarCharacter state={totalScore >= 4 ? "happy" : totalScore >= 2 ? "talking" : "sad"} />
              ) : (
                <JinnCharacter state={totalScore >= 4 ? "happy" : totalScore >= 2 ? "talking" : "sad"} />
              )}
            </div>

            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/60 mb-1">
                Session Complete · {selectedTopic.icon} {selectedTopic.title}
              </p>
              <h2 className="text-4xl font-black text-amber-50">
                {totalScore}
                <span className="text-2xl text-amber-300/50">/{MAX_EXCHANGES}</span>
              </h2>
              <p className="text-sm text-amber-200/55 mt-1">
                {totalScore >= 5
                  ? "Outstanding — you're a natural!"
                  : totalScore >= 4
                  ? "Great work — keep it up!"
                  : totalScore >= 2
                  ? "Good start — practice makes perfect."
                  : "Don't give up — every word learned is progress."}
              </p>
            </div>

            {/* exchange breakdown */}
            <div
              className="w-full rounded-2xl px-4 py-3 flex flex-col gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50 mb-1">
                Exchange Breakdown
              </p>
              {exchanges.map((ex, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {ex.evaluation.score === 1 ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-amber-200/70 truncate">
                      <span className="text-amber-300/50 mr-1">You:</span>{ex.userMessage}
                    </p>
                    <p className="text-xs text-amber-300/40 mt-0.5">{ex.evaluation.feedback}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* vocab learned */}
            <div
              className="w-full rounded-2xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50 mb-2">
                Phrases Practiced
              </p>
              <div className="flex flex-wrap gap-2">
                {exchanges
                  .filter((e) => e.arabic)
                  .slice(0, 6)
                  .map((e, i) => (
                    <span
                      key={i}
                      className="rounded-full px-3 py-1 text-sm font-medium text-amber-100"
                      style={{
                        fontFamily: "var(--font-noto-naskh), serif",
                        background: "rgba(212,160,23,0.12)",
                        border: "1px solid rgba(212,160,23,0.2)",
                      }}
                    >
                      {e.arabic}
                    </span>
                  ))}
              </div>
            </div>

            {/* actions */}
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => handleSelectCharacter(selectedCharacter)}
                className="rounded-2xl px-5 py-3 text-sm font-bold text-amber-900 transition hover:brightness-110"
                style={{ background: "#d4a017" }}
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => setPhase("topics")}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-amber-300/70 hover:bg-white/5 transition"
              >
                New Topic
              </button>
              <Link
                href="/"
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-amber-300/70 hover:bg-white/5 transition"
              >
                Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
