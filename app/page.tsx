"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameOverModal from "@/components/GameOverModal";
import Header from "@/components/Header";
import JinnChat from "@/components/JinnChat";
import QuizCard from "@/components/QuizCard";
import JinnCharacter, { type JinnState } from "@/components/jinn/JinnCharacter";
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

export default function HomePage() {
  const [hearts, setHearts]   = useState(MAX_HEARTS);
  const [xp, setXp]           = useState(0);
  const [quizKey, setQuizKey] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [language, setLanguage] = useState<"en" | "he">("en");

  const [jinnState, setJinnState] = useState<JinnState>("idle");
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  const jinnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setJinnTemporary = useCallback((state: JinnState, durationMs: number) => {
    if (jinnTimerRef.current) clearTimeout(jinnTimerRef.current);
    setJinnState(state);
    jinnTimerRef.current = setTimeout(() => setJinnState("idle"), durationMs);
  }, []);

  useEffect(() => () => { if (jinnTimerRef.current) clearTimeout(jinnTimerRef.current); }, []);

  // ── quiz callbacks ─────────────────────────────────────────────────────────

  const handleQuizLoaded = useCallback((_target: VocabEntry) => {
    setJinnTemporary("talking", 2200);
  }, [setJinnTemporary]);

  const handleXpChange = useCallback((newXp: number) => {
    setXp((prev) => {
      if (newXp > prev) setJinnTemporary("happy", 1800);
      return newXp;
    });
  }, [setJinnTemporary]);

  const handleHeartsChange = useCallback((newHearts: number) => {
    setHearts((prev) => {
      if (newHearts < prev) setJinnTemporary("sad", 2200);
      return newHearts;
    });
  }, [setJinnTemporary]);

  const handleOutOfHearts = useCallback(() => {
    if (jinnTimerRef.current) clearTimeout(jinnTimerRef.current);
    setJinnState("sad");
    setGameOver(true);
  }, []);

  const handleCorrectAnswer = useCallback((word: VocabEntry) => {
    setLearnedWords((prev) =>
      prev.includes(word.standardArabic) ? prev : [...prev, word.standardArabic],
    );
  }, []);

  const handleRestart = useCallback(() => {
    setHearts(MAX_HEARTS);
    setXp(0);
    setQuizKey((k) => k + 1);
    setGameOver(false);
    setJinnState("talking");
  }, []);

  // ── jinn chat callback (from conversation panel) ───────────────────────────

  const handleJinnStateChange = useCallback((state: "idle" | "talking" | "happy" | "sad") => {
    if (jinnTimerRef.current) clearTimeout(jinnTimerRef.current);
    setJinnState(state);
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* decorative stars */}
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

        <Header xp={xp} hearts={hearts} streakLabel="3 days" maxHearts={MAX_HEARTS} />

        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* ── Jinn panel ── */}
          <div className="w-full md:w-[42%] flex flex-col items-center gap-4">
            <div className="w-full max-w-[260px] mx-auto aspect-[260/390]">
              <JinnCharacter state={jinnState} />
            </div>
            <JinnChat
              language={language}
              learnedWords={learnedWords}
              onLanguageChange={setLanguage}
              onJinnStateChange={handleJinnStateChange}
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
              onCorrectAnswer={handleCorrectAnswer}
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
