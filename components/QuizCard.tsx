"use client";

import { useEffect, useState } from "react";
import type { QuizItem, VocabEntry } from "@/lib/vocab";
import { RefreshCw } from "lucide-react";

const MAX_HEARTS = 5;

type QuizCardProps = {
  hearts: number;
  xp: number;
  quizKey: number;
  onHeartsChange: (value: number) => void;
  onXpChange: (value: number) => void;
  onOutOfHearts: () => void;
};

export default function QuizCard({
  hearts,
  xp,
  quizKey,
  onHeartsChange,
  onXpChange,
  onOutOfHearts,
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
      const res = await fetch("/api/quiz", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to fetch quiz");
      }
      const data = (await res.json()) as QuizItem;
      setQuiz(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [quizKey]);

  const handleSelect = (option: VocabEntry) => {
    if (!quiz || selectedId || hearts <= 0) return;
    setSelectedId(option.id);
    const correct = option.id === quiz.target.id;
    setIsCorrect(correct);

    if (correct) {
      onXpChange(xp + 10);
    } else {
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
    let variant = "bg-white border-emerald-50 hover:border-emerald-200";

    if (success) variant = "bg-emerald-50 border-emerald-300 text-emerald-800";
    if (failure) variant = "bg-rose-50 border-rose-200 text-rose-700";
    if (!isChosen && selectedId && correctChoice) variant = "bg-emerald-50 border-emerald-200 text-emerald-700";

    return (
      <button
        key={option.id}
        type="button"
        disabled={!!selectedId || loading || hearts <= 0}
        onClick={() => handleSelect(option)}
        className={`${base} ${variant}`}
      >
        <p className="text-sm text-slate-500 text-left">{option.standardArabicTransliteration}</p>
        <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-noto-naskh), serif" }}>
          {option.standardArabic}
        </p>
      </button>
    );
  };

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">English word</p>
          <p className="text-3xl font-black text-slate-900">{quiz?.target.english ?? ""}</p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>Hearts: {hearts}/{MAX_HEARTS}</p>
          <p>XP: {xp}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          {error}
        </div>
      )}

      <div className="grid gap-3">
        {loading || !quiz ? (
          <div className="flex items-center justify-center py-10 text-slate-500">Loading question…</div>
        ) : (
          quiz.options.map(renderOption)
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={loadQuiz}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Shuffle
        </button>
        {showNext && (
          <button
            type="button"
            onClick={loadQuiz}
            className="rounded-2xl bg-emerald-500 px-6 py-3 text-white font-semibold shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}
