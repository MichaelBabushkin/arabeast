"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquareQuote, Volume2, Sparkles, Save, Check, History } from "lucide-react";
import { speakJinn } from "@/lib/speech";
import { useSettings } from "@/lib/useSettings";
import { useVocab } from "@/lib/useVocab";
import ArabicGloss from "@/components/ArabicGloss";
import type { HowToSay } from "@/app/api/howtosay/route";

const NAF = "var(--font-noto-naskh), serif";

export default function HowToSayPage() {
  const { settings } = useSettings();
  const { capture } = useVocab();

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<HowToSay | null>(null);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("arabeast.howtosay.v1");
        if (stored) setHistory(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const say = (phrase: string) => {
    speakJinn(phrase, settings.arabicVoice);
  };

  const handleTranslate = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(false);
    setResult(null);
    setSaved(false);

    try {
      const res = await fetch("/api/howtosay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, language: settings.language }),
      });

      if (!res.ok) throw new Error();

      const data: HowToSay = await res.json();
      setResult(data);

      // Save to query history
      if (typeof window !== "undefined") {
        setHistory((prev) => {
          const next = [trimmed, ...prev.filter((x) => x !== trimmed)].slice(0, 10);
          try {
            localStorage.setItem("arabeast.howtosay.v1", JSON.stringify(next));
          } catch {
            /* ignore */
          }
          return next;
        });
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTranslate(text);
  };

  const handleSaveWords = () => {
    if (!result) return;
    result.words.forEach((w) => {
      capture({
        arabic: w.arabic,
        translit: w.translit,
        meaning: w.meaning,
        lang: settings.language,
        source: "phrase",
      });
    });
    setSaved(true);
  };

  const isHebrew = settings.language === "he";

  return (
    <main className="min-h-screen flex flex-col">
      <div className="relative w-full max-w-6xl mx-auto flex flex-col gap-6 px-4 sm:px-8 py-6">
        {/* nav */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Menu
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400/60 ml-auto">
            <ArabicGloss ar="كيف أقول" en="How to Say" arClassName="text-rose-400/60 font-bold" />
          </p>
        </div>

        {/* header */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          style={{
            background: "linear-gradient(135deg, #4c0519 0%, #be123c 50%, #881337 100%)",
            border: "1px solid rgba(244,114,182,0.35)",
            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
          }}
        >
          {/* radial glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, #be123c 0%, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #f43f5e 0%, transparent 70%)" }}
          />

          <div className="relative flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
            <div 
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-rose-950/50" 
              style={{ 
                background: "linear-gradient(135deg, rgba(244,114,182,0.2) 0%, rgba(244,114,182,0.05) 100%)", 
                border: "1px solid rgba(244,114,182,0.4)" 
              }}
            >
              <MessageSquareQuote className="h-8 w-8 text-rose-300" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full text-rose-950 mb-2" style={{ background: "#f472b6" }}>
                HOW TO SAY IT • كيف تقول
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                How to Say it in Arabic
              </h1>
              <p className="text-sm text-rose-200/50 mt-1.5 max-w-xl">
                Type anything in English or Hebrew and find out the natural way to say it in Modern Standard Arabic. Get a complete literal back-translation and a word-by-word breakdown.
              </p>
            </div>
          </div>

          {/* translation / phrase box */}
          <div 
            className="relative flex flex-col justify-center gap-1.5 rounded-2xl p-4 sm:p-5 lg:max-w-xs w-full text-right animate-fade-in"
            style={{ 
              background: "rgba(15,23,42,0.45)", 
              border: "1px solid rgba(244,114,182,0.15)",
              backdropFilter: "blur(12px)"
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
              <span className="text-[10px] font-bold text-rose-400/80 uppercase tracking-wider">Arabic Phrase</span>
              <button 
                type="button" 
                onClick={() => say("كيف تقول ذلك بالعربية")} 
                className="text-rose-300/40 hover:text-rose-200 transition"
                aria-label="Read header Arabic aloud"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-1">
              <span 
                className="block text-2xl font-black text-rose-100 leading-none select-all" 
                style={{ fontFamily: NAF, direction: "rtl" }}
              >
                كيف تقول ذلك؟
              </span>
              <span className="block text-[11px] text-rose-200/45 italic mt-1 font-medium">
                kayfa taqoolu dhalik?
              </span>
              <span className="block text-xs font-semibold text-rose-200/75 mt-0.5">
                {isHebrew ? '"איך אומרים את זה?"' : '"How do you say that?"'}
              </span>
            </div>
          </div>
        </div>

        {/* main interactive search */}
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isHebrew ? "מה תרצו להגיד בערבית?..." : "What do you want to say in Arabic?..."}
              className="flex-1 rounded-2xl border border-white/10 px-4 py-3 bg-slate-900/60 text-white placeholder-rose-200/30 focus:outline-none focus:border-rose-400/50 text-base"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold px-6 py-3 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isHebrew ? "תרגם" : "Translate"}
            </button>
          </form>

          {/* recent queries history */}
          {history.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-rose-300/40 uppercase tracking-widest flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" />
                {isHebrew ? "חיפושים אחרונים" : "Recent Queries"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {history.map((h, i) => (
                  <button
                    key={`${h}-${i}`}
                    type="button"
                    onClick={() => {
                      setText(h);
                      handleTranslate(h);
                    }}
                    className="text-xs rounded-xl border border-white/5 bg-white/[0.02] px-3 py-1.5 text-rose-200/60 hover:bg-white/5 hover:text-rose-100 transition truncate max-w-[200px]"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl p-4 border border-red-500/20 bg-red-950/20 text-center">
              <p className="text-sm text-red-300">Could not complete translation. Please try again.</p>
            </div>
          )}

          {/* translation result */}
          {result && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* main translation card */}
              <div
                className="relative overflow-hidden rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(190,18,60,0.12) 0%, rgba(136,19,55,0.06) 100%)",
                  border: "1px solid rgba(244,114,182,0.25)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => say(result.arabic)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-400/10 border border-rose-400/25 text-rose-300 hover:bg-rose-400/25 transition"
                      aria-label="Listen to full phrase"
                    >
                      <Volume2 className="h-5 w-5" />
                    </button>
                    <span className="text-xs text-rose-300/50 italic font-mono select-all">
                      {result.translit}
                    </span>
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full text-rose-950 bg-rose-300">
                    TRANSLATION
                  </span>
                </div>

                <div className="text-center sm:text-right py-3">
                  <span
                    className="block text-4xl sm:text-5xl font-black text-rose-50 leading-normal"
                    style={{ fontFamily: NAF, direction: "rtl" }}
                  >
                    {result.arabic}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4 text-sm">
                  <div>
                    <span className="block text-[10px] font-bold text-rose-300/40 uppercase tracking-widest mb-1">
                      {isHebrew ? "תרגום מילולי" : "Literal Translation"}
                    </span>
                    <span className="font-semibold text-rose-100/90">{result.literal}</span>
                  </div>
                  {result.note && (
                    <div>
                      <span className="block text-[10px] font-bold text-rose-300/40 uppercase tracking-widest mb-1">
                        {isHebrew ? "הערת שימוש" : "Usage Note"}
                      </span>
                      <span className="text-rose-200/70">{result.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* word breakdown */}
              {result.words && result.words.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-rose-300/50">
                      {isHebrew ? "פירוק מילים" : "Word-by-word Breakdown"}
                    </h2>
                    <button
                      type="button"
                      onClick={handleSaveWords}
                      disabled={saved}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        saved
                          ? "bg-green-500/10 border border-green-500/30 text-green-300"
                          : "bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
                      }`}
                    >
                      {saved ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          {isHebrew ? "נשמר!" : "Saved!"}
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" />
                          {isHebrew ? "שמור מילים למילון שלי" : "Save words to Vocab"}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.words.map((w, i) => (
                      <div
                        key={`${w.arabic}-${i}`}
                        className="flex items-center justify-between gap-3 rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06]"
                      >
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-1.5">
                            <span className="text-xl font-bold text-amber-50" style={{ fontFamily: NAF, direction: "rtl" }}>
                              {w.arabic}
                            </span>
                            <span className="text-[11px] text-rose-300/40 italic truncate">
                              {w.translit}
                            </span>
                          </div>
                          <span className="text-sm text-rose-200/70 line-clamp-1" dir={isHebrew ? "rtl" : "ltr"}>
                            {w.meaning}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => say(w.arabic)}
                          className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-rose-400/5 border border-rose-400/15 text-rose-300/60 hover:text-rose-200 hover:bg-rose-400/15 transition"
                          aria-label={`Listen to ${w.arabic}`}
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
