"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { QuizItem, VocabCategory, VocabEntry } from "@/lib/vocab";
import { speakArabic } from "@/lib/speech";
import { RefreshCw, Volume2 } from "lucide-react";


type QuizCardProps = {
  hearts: number;
  xp: number;
  quizKey: number;
  category?: VocabCategory;
  onHeartsChange: (value: number) => void;
  onXpChange: (value: number) => void;
  onOutOfHearts: () => void;
  onQuizLoaded?: (target: VocabEntry) => void;
  onCorrectAnswer?: (word: VocabEntry) => void;
  onWrongAnswer?: (word: VocabEntry) => void;
};

export default function QuizCard({
  hearts,
  xp,
  quizKey,
  category,
  onHeartsChange,
  onXpChange,
  onOutOfHearts,
  onQuizLoaded,
  onCorrectAnswer,
  onWrongAnswer,
}: QuizCardProps) {
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQuiz = async () => {
    setLoading(true);
    setSelectedId(null);
    setIsCorrect(null);
    setError(null);

    try {
      const url = category ? `/api/quiz?category=${category}` : "/api/quiz";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch quiz");
      }
      const data = (await res.json()) as QuizItem;
      setQuiz(data);
      onQuizLoaded?.(data.target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [quizKey]);

  const playOptionAudio = (option: VocabEntry) => {
    if (option.audio) {
      const audio = new Audio(option.audio);
      audio.play().catch(() => speakArabic(option.standardArabic));
      return;
    }
    speakArabic(option.standardArabic);
  };

  const handleSelect = (option: VocabEntry) => {
    if (!quiz || selectedId || hearts <= 0) return;
    setSelectedId(option.id);
    const correct = option.id === quiz.target.id;
    setIsCorrect(correct);

    if (correct) {
      onXpChange(xp + 10);
      onCorrectAnswer?.(option);
    } else {
      onWrongAnswer?.(option);
      const nextHearts = Math.max(0, hearts - 1);
      onHeartsChange(nextHearts);
      if (nextHearts <= 0) {
        onOutOfHearts();
      }
    }
  };

  const showNext = selectedId !== null && hearts > 0;

  const renderOption = (option: VocabEntry) => {
    const isChosen = selectedId === option.id;
    const correctChoice = quiz && option.id === quiz.target.id;
    const success = isChosen && isCorrect;
    const failure = isChosen && isCorrect === false;

    const base = "w-full rounded-2xl border px-4 py-3 text-right transition text-lg font-semibold";
    let variant = "bg-white/5 border-white/10 hover:border-amber-400/40 text-amber-50";

    if (success) variant = "bg-emerald-900/40 border-emerald-400/60 text-emerald-200";
    if (failure) variant = "bg-rose-900/40 border-rose-400/60 text-rose-200";
    if (!isChosen && selectedId && correctChoice) variant = "bg-emerald-900/30 border-emerald-400/40 text-emerald-200";

    return (
      <button
        key={option.id}
        type="button"
        disabled={!!selectedId || loading || hearts <= 0}
        onClick={() => handleSelect(option)}
        className={`${base} ${variant}`}
      >
        <div className="mb-2 flex items-center justify-between gap-3 text-sm text-amber-300/70">
          <span className="text-left">{option.standardArabicTransliteration}</span>
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              playOptionAudio(option);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                playOptionAudio(option);
              }
            }}
            className="flex cursor-pointer items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-amber-300/80 hover:border-amber-400/50 hover:text-amber-300"
            aria-label={`Play audio for ${option.standardArabic}`}
          >
            <Volume2 className="h-4 w-4" />
            Play
          </div>
        </div>
        <div className="flex items-start gap-3">
          {option.image && (
            <Image
              src={option.image}
              alt={`${option.english} illustration`}
              width={64}
              height={64}
              className="h-16 w-16 rounded-xl border border-emerald-50 object-cover shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          )}
          <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-noto-naskh), serif" }}>
            {option.standardArabic}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="game-card p-6 space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/70 mb-1">Choose the Arabic word for</p>
        <p className="text-4xl font-black text-amber-50">{quiz?.target.english ?? <span className="opacity-0">_</span>}</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-900/30 px-4 py-3 text-amber-200">
          {error}
        </div>
      )}

      <div className="grid gap-3">
        {loading || !quiz ? (
          <div className="flex items-center justify-center py-10 text-amber-300/50">Loading question…</div>
        ) : (
          quiz.options.map(renderOption)
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={loadQuiz}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-amber-300/80 hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4" />
          Shuffle
        </button>
        {showNext && (
          <button
            type="button"
            onClick={loadQuiz}
            className="rounded-2xl bg-amber-500 px-6 py-3 text-white font-semibold shadow-lg shadow-amber-900/50 transition hover:bg-amber-400"
          >
            Next Question →
          </button>
        )}
      </div>
    </div>
  );
}
