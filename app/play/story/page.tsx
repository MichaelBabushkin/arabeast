"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Lock } from "lucide-react";
import JinnCharacter from "@/components/jinn/JinnCharacter";
import JinnChat from "@/components/JinnChat";
import QamarCharacter from "@/components/qamar/QamarCharacter";
import QamarChat from "@/components/QamarChat";
import QuizCard from "@/components/QuizCard";
import GameOverModal from "@/components/GameOverModal";
import { CHAPTERS, type Chapter } from "@/lib/chapters";
import type { VocabEntry } from "@/lib/vocab";
import { useProgress } from "@/lib/useProgress";
import { Sparkles } from "lucide-react";

const MAX_HEARTS = 5;

// ── Chapter selection screen ────────────────────────────────────────────────
function ChapterSelect({ xp, onSelect }: { xp: number; onSelect: (c: Chapter) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/60">Story Mode</p>
        <h2 className="text-2xl font-black text-amber-50">Choose a Chapter</h2>
        <p className="text-sm text-amber-200/50 mt-1">Zafar will guide you through each one.</p>
      </div>
      {CHAPTERS.map((chapter) => {
        const unlocked = chapter.xpRequired <= xp;
        return (
          <button
            key={chapter.id}
            type="button"
            disabled={!unlocked}
            onClick={() => onSelect(chapter)}
            className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition ${
              unlocked ? "hover:scale-[1.01] cursor-pointer" : "cursor-not-allowed opacity-40"
            }`}
            style={{
              background: unlocked
                ? `linear-gradient(135deg, ${chapter.color}18 0%, rgba(0,0,0,0) 100%)`
                : "rgba(255,255,255,0.03)",
              border: `1px solid ${unlocked ? chapter.color + "40" : "rgba(255,255,255,0.07)"}`,
            }}
          >
            <span className="text-3xl">{chapter.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-amber-50 truncate">{chapter.title}</p>
              <p className="text-xs text-amber-300/50 mt-0.5">{chapter.subtitle}</p>
            </div>
            {unlocked ? (
              <ChevronRight className="h-5 w-5 flex-shrink-0" style={{ color: chapter.color }} />
            ) : (
              <div className="flex items-center gap-1 text-xs text-amber-500/60 flex-shrink-0">
                <Lock className="h-3.5 w-3.5" />
                <span>{chapter.xpRequired} XP</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Main story page inner (needs useSearchParams) ────────────────────────────
function StoryPageInner() {
  const searchParams = useSearchParams();
  const initialChapterId = searchParams.get("chapter");

  const { progress, addXp } = useProgress();
  const xp = progress.xp;
  const [hearts, setHearts]        = useState(MAX_HEARTS);
  const [quizKey, setQuizKey]      = useState(0);
  const [gameOver, setGameOver]    = useState(false);
  const [language, setLanguage]    = useState<"en" | "he">("en");
  type CharacterState = "idle" | "talking" | "happy" | "sad";
  const [characterState, setCharacterState] = useState<CharacterState>("idle");
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [phase, setPhase]          = useState<"select" | "story" | "quiz">("select");
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [quizCount, setQuizCount]  = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setCharacterTemporary = useCallback((state: CharacterState, ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCharacterState(state);
    timerRef.current = setTimeout(() => setCharacterState("idle"), ms);
  }, []);

  // Auto-select chapter from URL param
  useEffect(() => {
    if (!initialChapterId) return;
    const chapter = CHAPTERS.find((c) => c.id === initialChapterId);
    if (chapter && chapter.xpRequired <= xp) {
      setActiveChapter(chapter);
      setPhase("story");
      setCharacterTemporary("talking", 2500);
    }
  }, []);

  const handleSelectChapter = (chapter: Chapter) => {
    setActiveChapter(chapter);
    setPhase("story");
    setHearts(MAX_HEARTS);
    setQuizCount(0);
    setLearnedWords([]);
    setCharacterTemporary("talking", 2500);
  };

  const handleStartQuiz = () => {
    setPhase("quiz");
    setQuizKey((k) => k + 1);
    setCharacterTemporary("talking", 1800);
  };

  const handleXpChange = useCallback((newXp: number) => {
    if (newXp > xp) setCharacterTemporary("happy", 1800);
    addXp(newXp);
  }, [xp, addXp, setCharacterTemporary]);

  const handleHeartsChange = useCallback((newHearts: number) => {
    setHearts((prev) => {
      if (newHearts < prev) setCharacterTemporary("sad", 2200);
      return newHearts;
    });
  }, [setCharacterTemporary]);

  const handleOutOfHearts = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCharacterState("sad");
    setGameOver(true);
  }, []);

  const handleCorrectAnswer = useCallback((word: VocabEntry) => {
    setLearnedWords((prev) =>
      prev.includes(word.standardArabic) ? prev : [...prev, word.standardArabic],
    );
    setQuizCount((n) => n + 1);
    addXp(xp + 10, word, true);
  }, [xp, addXp]);

  const handleRestart = useCallback(() => {
    setHearts(MAX_HEARTS);
    setQuizKey((k) => k + 1);
    setGameOver(false);
    setCharacterState("talking");
  }, []);

  const handleCharacterStateChange = useCallback((state: CharacterState) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCharacterState(state);
  }, []);

  const handleBackToSelect = () => {
    setPhase("select");
    setActiveChapter(null);
    setCharacterState("idle");
  };

  return (
    <main className="min-h-screen flex flex-col">
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

        {/* top nav */}
        <div className="flex items-center gap-3">
          {phase !== "select" ? (
            <button
              type="button"
              onClick={handleBackToSelect}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Chapters
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Menu
            </Link>
          )}
          <div className="flex items-center gap-2 text-sm font-semibold ml-auto">
            <div
              className="flex items-center gap-1 rounded-full px-3 py-1"
              style={{ background: "rgba(212,160,23,0.15)" }}
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-amber-300">{xp} XP</span>
            </div>
          </div>
        </div>

        {/* ── chapter select ── */}
        {phase === "select" && (
          <ChapterSelect xp={xp} onSelect={handleSelectChapter} />
        )}

        {/* ── story + quiz ── */}
        {(phase === "story" || phase === "quiz") && activeChapter && (
          <>
            {/* chapter header */}
            <div
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{
                background: `linear-gradient(135deg, ${activeChapter.color}15 0%, rgba(0,0,0,0) 100%)`,
                border: `1px solid ${activeChapter.color}35`,
              }}
            >
              <span className="text-2xl">{activeChapter.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: activeChapter.color }}>
                  Chapter {activeChapter.number}
                </p>
                <p className="text-sm font-bold text-amber-50 truncate">{activeChapter.title}</p>
              </div>
              {quizCount > 0 && (
                <span className="text-xs text-amber-400/60 flex-shrink-0">{quizCount} correct</span>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">

              {/* jinn panel */}
              <div className="w-full md:w-[42%] flex flex-col items-center gap-4">
                <div className="w-full max-w-[260px] mx-auto aspect-[260/390]">
                  {activeChapter.characterId === "qamar" ? (
                    <QamarCharacter state={characterState} />
                  ) : (
                    <JinnCharacter state={characterState} />
                  )}
                </div>
                {activeChapter.characterId === "qamar" ? (
                  <QamarChat
                    language={language}
                    learnedWords={learnedWords}
                    onLanguageChange={setLanguage}
                    onQamarStateChange={handleCharacterStateChange}
                    storyContext={activeChapter.storyContext}
                    initialMonologue={activeChapter.openingMonologue}
                  />
                ) : (
                  <JinnChat
                    language={language}
                    learnedWords={learnedWords}
                    onLanguageChange={setLanguage}
                    onJinnStateChange={handleCharacterStateChange}
                    storyContext={activeChapter.storyContext}
                    initialMonologue={activeChapter.openingMonologue}
                  />
                )}
              </div>

              {/* right panel */}
              <div className="w-full md:flex-1 flex flex-col gap-4">
                {phase === "story" && (
                  <div
                    className="rounded-2xl px-5 py-4 space-y-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/60">
                      Chapter Goal
                    </p>
                    <p className="text-sm text-amber-100/80 leading-relaxed">
                      {activeChapter.storyContext}
                    </p>
                    <button
                      type="button"
                      onClick={handleStartQuiz}
                      className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-white font-semibold shadow-lg shadow-amber-900/40 transition hover:bg-amber-400"
                    >
                      Start Quiz — {activeChapter.subtitle}
                    </button>
                  </div>
                )}

                {phase === "quiz" && (
                  <QuizCard
                    hearts={hearts}
                    xp={xp}
                    quizKey={quizKey}
                    category={activeChapter.category}
                    onHeartsChange={handleHeartsChange}
                    onXpChange={handleXpChange}
                    onOutOfHearts={handleOutOfHearts}
                    onQuizLoaded={() => setCharacterTemporary("talking", 2200)}
                    onCorrectAnswer={handleCorrectAnswer}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <GameOverModal open={gameOver} onRestart={handleRestart} />
    </main>
  );
}

export default function StoryPage() {
  return (
    <Suspense>
      <StoryPageInner />
    </Suspense>
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
];
