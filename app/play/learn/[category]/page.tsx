"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, Sparkles, RefreshCw } from "lucide-react";
import { speakJinn } from "@/lib/speech";
import { useSettings } from "@/lib/useSettings";
import { useVocab } from "@/lib/useVocab";
import { isLearnCategory, LEARN_CATEGORY_META } from "@/lib/learnCategories";
import type { LearnWord } from "@/app/api/learn/route";

const NAF = "var(--font-noto-naskh), serif";

interface LearnCategoryPageProps {
  params: Promise<{ category: string }>;
}

export default function LearnCategoryPage({ params }: LearnCategoryPageProps) {
  const { category } = React.use(params);
  const { settings } = useSettings();
  const { capture } = useVocab();

  const [words, setWords] = useState<LearnWord[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);

  const categoryExists = isLearnCategory(category);
  const categoryMeta = categoryExists ? LEARN_CATEGORY_META[category] : null;

  const lastFetchRef = React.useRef<string>("");

  const fetchWords = async (currentExcludes: string[] = [], langOverride?: "en" | "he") => {
    if (!categoryExists) return;

    const activeLang = langOverride || settings.language;
    const fetchKey = `${category}:${activeLang}:${currentExcludes.join(",")}`;
    if (lastFetchRef.current === fetchKey) return;
    lastFetchRef.current = fetchKey;

    try {
      const isInitial = currentExcludes.length === 0;
      if (isInitial) {
        setLoading(true);
      } else {
        setMoreLoading(true);
      }
      setError(false);

      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: category,
          language: activeLang,
          exclude: currentExcludes,
        }),
      });

      if (!res.ok) throw new Error();

      const newWords: LearnWord[] = await res.json();
      
      setWords((prev) => {
        const nextWords = isInitial ? newWords : [...(prev || []), ...newWords];
        // Auto-capture words into vocabulary system
        newWords.forEach((w) => {
          capture({
            arabic: w.arabic,
            translit: w.translit,
            meaning: w.meaning,
            lang: activeLang,
            source: "category",
          });
        });
        return nextWords;
      });
    } catch (err) {
      console.error(err);
      setError(true);
      lastFetchRef.current = ""; // Reset ref on error to allow retry
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  };

  useEffect(() => {
    let activeLang = settings.language;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("arabeast-settings");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.language) activeLang = parsed.language;
        }
      } catch {
        // ignore fallback errors
      }
    }
    fetchWords([], activeLang);
  }, [category, settings.language]);

  const say = (text: string) => {
    speakJinn(text, settings.arabicVoice);
  };

  if (!categoryExists || !categoryMeta) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-3xl p-8 border border-red-500/20 bg-red-950/20 flex flex-col gap-4">
          <span className="text-4xl">⚠️</span>
          <h1 className="text-2xl font-bold text-amber-50">Category Not Found</h1>
          <p className="text-sm text-amber-200/60">
            The category slug &quot;{category}&quot; does not exist in our vocabulary taxonomy.
          </p>
          <Link
            href="/play/learn"
            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-teal-300 hover:bg-white/5 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
        </div>
      </main>
    );
  }

  const activeWord = words && words[cardIndex] ? words[cardIndex] : null;

  return (
    <main className="min-h-screen flex flex-col">
      <div className="relative w-full max-w-6xl mx-auto flex flex-col gap-6 px-4 sm:px-8 py-6">
        {/* nav */}
        <div className="flex items-center gap-3">
          <Link
            href="/play/learn"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-teal-300/60 hover:bg-white/5 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Categories
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400/60 ml-auto">
            {categoryMeta.emoji} {categoryMeta.en}
          </p>
        </div>

        {/* header */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          style={{
            background: "linear-gradient(135deg, #07221f 0%, #0d9488 100%)",
            border: "1px solid rgba(45,212,191,0.3)",
            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
          }}
        >
          <div className="relative flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-3xl bg-teal-900/40 border border-teal-400/30">
              {categoryMeta.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full text-teal-950 mb-1" style={{ background: "#2dd4bf" }}>
                LEARNING TOPIC
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {categoryMeta.en}
              </h1>
              {settings.language === "he" && (
                <p className="text-xs font-bold text-teal-200/65 mt-0.5" dir="rtl">
                  נושא: {categoryMeta.he}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col text-right justify-center gap-1.5 rounded-2xl p-4 lg:max-w-xs w-full" style={{ background: "rgba(15,23,42,0.45)", border: "1px solid rgba(45,212,191,0.15)" }}>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-bold text-teal-400/80 uppercase tracking-wider">Arabic Topic</span>
              <button 
                type="button" 
                onClick={() => say(categoryMeta.ar)} 
                className="text-teal-300/40 hover:text-teal-200 transition"
                aria-label="Read topic name aloud"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-1">
              <span className="block text-2xl font-black text-teal-100" style={{ fontFamily: NAF, direction: "rtl" }}>
                {categoryMeta.ar}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl p-6 border border-red-500/20 bg-red-950/20 text-center flex flex-col items-center gap-3">
            <p className="text-sm text-red-300">Could not generate category words. Please check your connection.</p>
            <button
              onClick={() => fetchWords([])}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500/20 border border-teal-500/40 px-4 py-2 text-sm font-semibold text-teal-300 hover:bg-teal-500/30 transition animate-fade-in"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        )}

        {loading && !error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400" />
            <p className="text-sm text-teal-300/60">Asking Gemini for the best words in {categoryMeta.en}…</p>
          </div>
        )}

        {words && words.length > 0 && (
          <div className="flex flex-col gap-8">
            {/* Flashcard View */}
            <div className="flex flex-col items-center gap-4 w-full">
              <div 
                onClick={() => setRevealed(!revealed)}
                className="group w-full max-w-md aspect-[3/2] rounded-3xl cursor-pointer relative shadow-2xl flex flex-col items-center justify-center p-8 select-none transition hover:scale-[1.01]"
                style={{
                  background: "linear-gradient(135deg, rgba(13,148,136,0.18) 0%, rgba(20,80,90,0.1) 100%)",
                  border: "1px solid rgba(45,212,191,0.25)",
                }}
              >
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-10 blur-2xl bg-teal-400" />
                <div className="absolute top-4 right-4 bg-teal-400/10 border border-teal-400/20 text-teal-300/80 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                  CARD {cardIndex + 1} / {words.length}
                </div>
                
                {activeWord && (
                  <div className="flex flex-col items-center text-center gap-4 w-full">
                    {/* Arabic word & sound */}
                    <div className="flex items-center gap-3">
                      <span className="text-4xl sm:text-5xl font-black text-teal-50" style={{ fontFamily: NAF, direction: "rtl" }}>
                        {activeWord.arabic}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          say(activeWord.arabic);
                        }}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-400/10 border border-teal-400/25 text-teal-300 hover:bg-teal-400/25 transition"
                        aria-label="Listen"
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Transliteration */}
                    <span className="text-sm italic text-teal-200/50">
                      {activeWord.translit}
                    </span>

                    {/* Meaning (reveal or click-to-reveal) */}
                    <div className="mt-2 min-h-[40px] flex items-center justify-center">
                      {revealed ? (
                        <span className="text-xl sm:text-2xl font-bold text-amber-100 animate-fade-in">
                          {activeWord.meaning}
                        </span>
                      ) : (
                        <span className="text-xs uppercase font-bold tracking-widest text-teal-300/35 group-hover:text-teal-300/60 transition-colors">
                          Tap to reveal meaning
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation controls */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={cardIndex === 0}
                  onClick={() => {
                    setCardIndex(cardIndex - 1);
                    setRevealed(false);
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-teal-300/70 hover:bg-white/5 transition disabled:opacity-30"
                >
                  Prev
                </button>
                <span className="text-xs text-teal-200/40 font-mono">
                  {cardIndex + 1} / {words.length}
                </span>
                <button
                  type="button"
                  disabled={cardIndex === words.length - 1}
                  onClick={() => {
                    setCardIndex(cardIndex + 1);
                    setRevealed(false);
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-teal-300/70 hover:bg-white/5 transition disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>

            {/* List Overview */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-teal-300/50 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-teal-400" />
                  Vocabulary List
                </h2>
                <span className="text-xs text-teal-200/40 font-semibold uppercase">
                  Saved to My Words
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {words.map((w, idx) => (
                  <button
                    key={`${w.arabic}-${idx}`}
                    type="button"
                    onClick={() => {
                      setCardIndex(idx);
                      setRevealed(true);
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                    className={`flex items-center gap-3 rounded-2xl p-4 text-left transition ${
                      cardIndex === idx
                        ? "bg-teal-500/10 border border-teal-400/40"
                        : "bg-white/[0.02] border border-white/[0.06] hover:bg-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1.5">
                        <span className="text-lg font-black text-amber-50" style={{ fontFamily: NAF, direction: "rtl" }}>
                          {w.arabic}
                        </span>
                        <span className="text-[11px] text-teal-300/40 italic truncate">
                          {w.translit}
                        </span>
                      </div>
                      <span className="text-sm text-teal-200/70 line-clamp-1">
                        {w.meaning}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        say(w.arabic);
                      }}
                      className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-teal-400/5 border border-teal-400/15 text-teal-300/60 hover:text-teal-200 hover:bg-teal-400/15 transition"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </button>
                ))}
              </div>

              {/* More Words Action */}
              <div className="flex items-center justify-center pt-4">
                <button
                  type="button"
                  disabled={moreLoading}
                  onClick={() => fetchWords(Array.from(words.map((w) => w.arabic)))}
                  className="flex items-center gap-2 rounded-2xl bg-teal-500/15 border border-teal-500/35 px-6 py-3 text-sm font-bold text-teal-200 hover:bg-teal-500/25 transition disabled:opacity-50"
                >
                  {moreLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-300" />
                      Loading more…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 text-teal-400" />
                      Get More Words
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
