"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import GameOverModal from "@/components/GameOverModal";
import Header from "@/components/Header";
import JinnChat from "@/components/JinnChat";
import QuizCard from "@/components/QuizCard";
import JinnCharacter, { type JinnState } from "@/components/jinn/JinnCharacter";
import type { JinnResponse } from "@/app/api/jinn/route";
import { speakArabic } from "@/lib/speech";
import type { VocabEntry } from "@/lib/vocab";

const MAX_HEARTS = 5;

const HAPPY_LINES = [
  "ممتاز! The curse weakens!",
  "أحسنت! My memory returns!",
  "نعم! Yes! You speak my language!",
  "Wonderful! We grow closer to breaking the seal!",
];

const SAD_LINES = [
  "لا لا لا… that is not right.",
  "The sorcerer laughs… try again.",
  "حاول مرة أخرى… do not give up.",
  "Wrong… but the lamp still glows. Try again.",
];

const IDLE_LINE = "I speak only in Arabic. Help me tell my story…";

export default function HomePage() {
  const [hearts, setHearts]     = useState(MAX_HEARTS);
  const [xp, setXp]             = useState(0);
  const [quizKey, setQuizKey]   = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [jinnState, setJinnState]     = useState<JinnState>("talking");
  const [jinnMessage, setJinnMessage] = useState(IDLE_LINE);
  const [lastArabic, setLastArabic]   = useState("");

  const jinnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setJinnTemporary = useCallback((state: JinnState, message: string, durationMs: number) => {
    if (jinnTimerRef.current) clearTimeout(jinnTimerRef.current);
    setJinnState(state);
    setJinnMessage(message);
    jinnTimerRef.current = setTimeout(() => {
      setJinnState("idle");
      setJinnMessage(IDLE_LINE);
    }, durationMs);
  }, []);

  useEffect(() => () => { if (jinnTimerRef.current) clearTimeout(jinnTimerRef.current); }, []);

  // ── callbacks ───────────────────────────────────────────────────────────────

  const handleQuizLoaded = useCallback((target: VocabEntry) => {
    if (jinnTimerRef.current) clearTimeout(jinnTimerRef.current);
    setJinnState("talking");
    setJinnMessage(`What is the Arabic word for… ${target.english}?`);
    jinnTimerRef.current = setTimeout(() => setJinnState("idle"), 2200);
  }, []);

  const handleXpChange = useCallback((newXp: number) => {
    setXp((prev) => {
      if (newXp > prev) {
        const line = HAPPY_LINES[Math.floor(Math.random() * HAPPY_LINES.length)];
        setJinnTemporary("happy", line, 1800);
      }
      return newXp;
    });
  }, [setJinnTemporary]);

  const handleHeartsChange = useCallback((newHearts: number) => {
    setHearts((prev) => {
      if (newHearts < prev) {
        const line = SAD_LINES[Math.floor(Math.random() * SAD_LINES.length)];
        setJinnTemporary("sad", line, 2200);
      }
      return newHearts;
    });
  }, [setJinnTemporary]);

  const handleOutOfHearts = useCallback(() => {
    if (jinnTimerRef.current) clearTimeout(jinnTimerRef.current);
    setJinnState("sad");
    setJinnMessage("The curse tightens… but do not despair. Begin again.");
    setGameOver(true);
  }, []);

  const handleJinnThinking = useCallback(() => {
    if (jinnTimerRef.current) clearTimeout(jinnTimerRef.current);
    setJinnState("talking");
    setJinnMessage("Hmm… let me think…");
  }, []);

  const handleJinnResponse = useCallback((res: JinnResponse) => {
    if (jinnTimerRef.current) clearTimeout(jinnTimerRef.current);
    setJinnState(res.emotion);
    const display = res.arabic
      ? `${res.arabic} — ${res.reply}`
      : res.reply;
    setJinnMessage(display);
    if (res.arabic) setLastArabic(res.arabic);
  }, []);

  const handleRestart = useCallback(() => {
    setHearts(MAX_HEARTS);
    setXp(0);
    setQuizKey((k) => k + 1);
    setGameOver(false);
    setJinnState("talking");
    setJinnMessage(IDLE_LINE);
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* ── decorative stars ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.opacity }}
          />
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-5xl flex flex-col gap-5 px-4 py-6">

        {/* ── header ── */}
        <Header xp={xp} hearts={hearts} streakLabel="3 days" maxHearts={MAX_HEARTS} />

        {/* ── game scene ── */}
        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* ── Jinn panel ── */}
          <div className="w-full md:w-[42%] flex flex-col items-center gap-4">
            <div className="w-full max-w-[280px] mx-auto aspect-[260/390]">
              <JinnCharacter state={jinnState} />
            </div>

            {/* dialogue box */}
            <div
              className="w-full rounded-2xl px-5 py-4 text-center transition-all duration-500"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(212,160,23,0.25)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 0 24px rgba(212,160,23,0.08)",
              }}
            >
              {/* ornamental top line */}
              <div className="flex items-center gap-2 mb-3 justify-center opacity-40">
                <div className="h-px flex-1 bg-amber-400" />
                <span className="text-amber-400 text-xs">✦</span>
                <div className="h-px flex-1 bg-amber-400" />
              </div>
              <p
                className="text-sm leading-relaxed transition-opacity duration-300"
                style={{ color: "#f0e8d0", fontStyle: "italic" }}
              >
                {jinnMessage}
              </p>
              <div className="flex items-center gap-2 mt-3 justify-center">
                <div className="h-px flex-1 bg-amber-400 opacity-40" />
                {lastArabic && (
                  <button
                    type="button"
                    onClick={() => speakArabic(lastArabic)}
                    className="flex items-center gap-1 rounded-full border border-amber-400/30 px-2 py-0.5 text-xs text-amber-400/70 hover:border-amber-400/60 hover:text-amber-300 transition"
                    aria-label="Replay Arabic audio"
                  >
                    <Volume2 className="h-3 w-3" />
                    replay
                  </button>
                )}
                {!lastArabic && <span className="text-amber-400 text-xs opacity-40">✦</span>}
                <div className="h-px flex-1 bg-amber-400 opacity-40" />
              </div>
            </div>

            {/* chat input */}
            <JinnChat
              language="en"
              onJinnThinking={handleJinnThinking}
              onJinnResponse={handleJinnResponse}
            />
          </div>

          {/* ── quiz panel ── */}
          <div className="w-full md:flex-1">
            <QuizCard
              hearts={hearts}
              xp={xp}
              quizKey={quizKey}
              onHeartsChange={handleHeartsChange}
              onXpChange={handleXpChange}
              onOutOfHearts={handleOutOfHearts}
              onQuizLoaded={handleQuizLoaded}
            />
          </div>
        </div>
      </div>

      <GameOverModal open={gameOver} onRestart={handleRestart} />
    </main>
  );
}

// static star positions (avoids hydration mismatch)
const STARS = [
  { top: "4%",  left: "8%",  size: "2px",   opacity: 0.7 },
  { top: "8%",  left: "22%", size: "1.5px", opacity: 0.5 },
  { top: "3%",  left: "45%", size: "2px",   opacity: 0.6 },
  { top: "12%", left: "68%", size: "1px",   opacity: 0.8 },
  { top: "6%",  left: "82%", size: "2.5px", opacity: 0.4 },
  { top: "15%", left: "92%", size: "1.5px", opacity: 0.6 },
  { top: "22%", left: "5%",  size: "1px",   opacity: 0.5 },
  { top: "18%", left: "35%", size: "2px",   opacity: 0.4 },
  { top: "28%", left: "55%", size: "1.5px", opacity: 0.7 },
  { top: "35%", left: "78%", size: "1px",   opacity: 0.6 },
  { top: "42%", left: "15%", size: "2px",   opacity: 0.3 },
  { top: "50%", left: "90%", size: "1.5px", opacity: 0.5 },
  { top: "60%", left: "3%",  size: "1px",   opacity: 0.4 },
  { top: "72%", left: "48%", size: "2px",   opacity: 0.3 },
  { top: "85%", left: "70%", size: "1.5px", opacity: 0.5 },
  { top: "92%", left: "25%", size: "1px",   opacity: 0.4 },
];
