"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GameOverModal from "@/components/GameOverModal";
import Header from "@/components/Header";
import JinnChat from "@/components/JinnChat";
import QuizCard from "@/components/QuizCard";
import JinnCharacter, { type JinnState } from "@/components/jinn/JinnCharacter";
import { useProgress } from "@/lib/useProgress";
import type { VocabEntry } from "@/lib/vocab";

const MAX_HEARTS = 5;

export default function QuizPage() {
  const { progress, addXp } = useProgress();

  const [hearts, setHearts]       = useState(MAX_HEARTS);
  const [quizKey, setQuizKey]     = useState(0);
  const [gameOver, setGameOver]   = useState(false);
  const [language, setLanguage]   = useState<"en" | "he">("en");
  const [jinnState, setJinnState] = useState<JinnState>("idle");
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setJinnTemporary = useCallback((state: JinnState, ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setJinnState(state);
    timerRef.current = setTimeout(() => setJinnState("idle"), ms);
  }, []);

  const handleXpChange = useCallback((newXp: number) => {
    if (newXp > progress.xp) setJinnTemporary("happy", 1800);
    addXp(newXp);
  }, [progress.xp, addXp, setJinnTemporary]);

  const handleHeartsChange = useCallback((newHearts: number) => {
    setHearts((prev) => {
      if (newHearts < prev) setJinnTemporary("sad", 2200);
      return newHearts;
    });
  }, [setJinnTemporary]);

  const handleOutOfHearts = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setJinnState("sad");
    setGameOver(true);
  }, []);

  const handleCorrectAnswer = useCallback((word: VocabEntry) => {
    setLearnedWords((prev) =>
      prev.includes(word.standardArabic) ? prev : [...prev, word.standardArabic],
    );
    addXp(progress.xp + 10, word, true);
  }, [progress.xp, addXp]);

  const handleWrongAnswer = useCallback((word: VocabEntry) => {
    addXp(progress.xp, word, false);
  }, [progress.xp, addXp]);

  const handleRestart = useCallback(() => {
    setHearts(MAX_HEARTS);
    setQuizKey((k) => k + 1);
    setGameOver(false);
    setJinnState("talking");
  }, []);

  const handleJinnStateChange = useCallback((state: JinnState) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setJinnState(state);
  }, []);

  const streakLabel = progress.streakDays > 0 ? `${progress.streakDays} day${progress.streakDays !== 1 ? "s" : ""}` : "–";

  return (
    <main className="min-h-screen flex flex-col">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.opacity }} />
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-5xl flex flex-col gap-5 px-4 py-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition">
            <ArrowLeft className="h-3.5 w-3.5" />
            Menu
          </Link>
          <div className="flex-1">
            <Header xp={progress.xp} hearts={hearts} streakLabel={streakLabel} maxHearts={MAX_HEARTS} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
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

          <div className="w-full md:flex-1">
            <QuizCard
              hearts={hearts}
              xp={progress.xp}
              quizKey={quizKey}
              onHeartsChange={handleHeartsChange}
              onXpChange={handleXpChange}
              onOutOfHearts={handleOutOfHearts}
              onQuizLoaded={() => setJinnTemporary("talking", 2200)}
              onCorrectAnswer={handleCorrectAnswer}
              onWrongAnswer={handleWrongAnswer}
            />
          </div>
        </div>
      </div>

      <GameOverModal open={gameOver} onRestart={handleRestart} />
    </main>
  );
}

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
];
