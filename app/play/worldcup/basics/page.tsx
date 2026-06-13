"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, Check, X, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import FarisCharacter, { type FarisState } from "@/components/faris/FarisCharacter";
import { speakJinn } from "@/lib/speech";
import { useSettings } from "@/lib/useSettings";
import { useProgress } from "@/lib/useProgress";
import { useWcProgress } from "@/lib/useWcProgress";
import { BASICS, buildBasicsQuiz, formsOf, type QuizQuestion } from "@/lib/footballVocab";

const NAF = "var(--font-noto-naskh), serif";
const QUIZ_LEN = 10;

type Phase = "learn" | "quiz" | "result";

export default function BasicsPage() {
  const { settings } = useSettings();
  const { progress, addXp } = useProgress();
  const { recordBasicsQuiz } = useWcProgress();

  const [phase, setPhase] = useState<Phase>("learn");

  /* ── learn carousel ── */
  const [idx, setIdx] = useState(0);
  const word = BASICS[idx];
  const say = useCallback(
    (text: string) => speakJinn(text, settings.arabicVoice),
    [settings.arabicVoice],
  );

  /* ── quiz ── */
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const startQuiz = useCallback(() => {
    setQuiz(buildBasicsQuiz(QUIZ_LEN));
    setQIdx(0);
    setPicked(null);
    setScore(0);
    setPhase("quiz");
  }, []);

  const q = quiz[qIdx];
  const farisState: FarisState = useMemo(() => {
    if (phase === "quiz" && picked) return picked === q?.word.english ? "happy" : "sad";
    if (phase === "result") return score / QUIZ_LEN >= 0.7 ? "happy" : "idle";
    return "talking";
  }, [phase, picked, q, score]);

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const correct = opt === q.word.english;
    if (correct) setScore((s) => s + 1);
    say(q.prompt.arabic);
  };

  const next = () => {
    if (qIdx + 1 >= quiz.length) {
      const finalScore = score; // score already includes current (set on choose)
      recordBasicsQuiz(finalScore, quiz.length);
      addXp(progress.xp + finalScore * 5);
      setPhase("result");
    } else {
      setQIdx((i) => i + 1);
      setPicked(null);
    }
  };

  const passed = score / QUIZ_LEN >= 0.7;

  return (
    <main className="min-h-screen flex flex-col">
      <div className="relative mx-auto w-full max-w-xl flex flex-col gap-5 px-4 py-6">
        {/* nav */}
        <div className="flex items-center gap-3">
          <Link
            href="/play/worldcup"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Journey
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400/60 ml-auto">
            Chapter 1 · The Basics
          </p>
        </div>

        {/* ── LEARN ── */}
        {phase === "learn" && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-amber-50">Learn the words</h1>
              <span className="text-xs font-semibold text-amber-300/50">
                {idx + 1} / {BASICS.length}
              </span>
            </div>

            {/* progress bar */}
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${((idx + 1) / BASICS.length) * 100}%`, background: "#22c55e" }} />
            </div>

            {/* flashcard */}
            <div
              className="flex flex-col items-center gap-3 rounded-3xl px-6 py-10 text-center"
              style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(0,0,0,0) 100%)", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              <span className="text-6xl">{word.emoji}</span>
              <p className="text-5xl font-black text-amber-50 leading-tight" style={{ fontFamily: NAF, direction: "rtl" }}>
                {word.arabic}
              </p>
              <p className="text-base text-amber-300/60 italic">{word.translit}</p>
              <p className="text-lg font-semibold text-amber-100">{word.english}</p>

              {word.variants && word.variants.length > 0 && (
                <div className="flex flex-col items-center gap-1.5 mt-1">
                  <p className="text-[11px] uppercase tracking-widest text-amber-400/40">also said as</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {word.variants.map((v) => (
                      <button
                        key={v.arabic}
                        type="button"
                        onClick={() => say(v.arabic)}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:bg-white/5"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
                      >
                        <Volume2 className="h-3 w-3 text-amber-300/50" />
                        <span className="text-lg font-bold text-amber-100" style={{ fontFamily: NAF, direction: "rtl" }}>{v.arabic}</span>
                        <span className="text-[11px] text-amber-300/40 italic">{v.translit}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => say(word.arabic)}
                className="mt-1 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-green-950"
                style={{ background: "#fde047" }}
              >
                <Volume2 className="h-4 w-4" /> Hear it
              </button>
            </div>

            {/* carousel controls */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
                className="flex items-center gap-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-amber-300/70 disabled:opacity-30 hover:bg-white/5 transition"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>

              {idx + 1 < BASICS.length ? (
                <button
                  type="button"
                  onClick={() => { setIdx((i) => i + 1); say(BASICS[idx + 1].arabic); }}
                  className="flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-bold text-green-950"
                  style={{ background: "#22c55e" }}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startQuiz}
                  className="flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-bold text-green-950"
                  style={{ background: "#fde047" }}
                >
                  Start quiz →
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={startQuiz}
              className="mx-auto text-xs text-amber-300/40 hover:text-amber-300/70 transition"
            >
              Skip to quiz
            </button>
          </>
        )}

        {/* ── QUIZ ── */}
        {phase === "quiz" && q && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-amber-50">Quiz</h1>
              <span className="text-xs font-semibold text-amber-300/50">
                {qIdx + 1} / {quiz.length} · score {score}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${((qIdx + 1) / quiz.length) * 100}%`, background: "#22c55e" }} />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-[64px] flex-shrink-0 aspect-[260/390]">
                <FarisCharacter state={farisState} />
              </div>
              <div
                className="flex-1 rounded-2xl px-4 py-5 text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-xs text-amber-300/50 mb-1">What does this mean?</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">{q.word.emoji}</span>
                  <p className="text-4xl font-black text-amber-50" style={{ fontFamily: NAF, direction: "rtl" }}>
                    {q.prompt.arabic}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => say(q.prompt.arabic)}
                  className="mx-auto mt-2 flex items-center gap-1 text-xs text-amber-300/50 hover:text-amber-200"
                >
                  <Volume2 className="h-3.5 w-3.5" /> {q.prompt.translit}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt) => {
                const isCorrect = opt === q.word.english;
                const isPicked = picked === opt;
                const show = picked != null;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => choose(opt)}
                    disabled={show}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-left font-semibold text-amber-100 transition"
                    style={{
                      background: show && isCorrect
                        ? "rgba(34,197,94,0.18)"
                        : isPicked
                        ? "rgba(239,68,68,0.15)"
                        : "rgba(255,255,255,0.05)",
                      border: show && isCorrect
                        ? "1px solid rgba(34,197,94,0.6)"
                        : isPicked
                        ? "1px solid rgba(239,68,68,0.5)"
                        : "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {opt}
                    {show && isCorrect && <Check className="h-4 w-4 text-green-300" />}
                    {show && isPicked && !isCorrect && <X className="h-4 w-4 text-red-300" />}
                  </button>
                );
              })}
            </div>

            {picked && q.word.variants && q.word.variants.length > 0 && (
              <p className="text-center text-xs text-amber-300/50" style={{ direction: "rtl" }}>
                <span className="text-amber-400/40" style={{ direction: "ltr", display: "inline-block" }}>also said: </span>
                {formsOf(q.word).map((f) => f.arabic).join(" · ")}
              </p>
            )}

            {picked && (
              <button
                type="button"
                onClick={next}
                className="rounded-2xl px-5 py-3 text-sm font-bold text-green-950"
                style={{ background: "#fde047" }}
              >
                {qIdx + 1 >= quiz.length ? "See results →" : "Next question →"}
              </button>
            )}
          </>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && (
          <div className="flex flex-col items-center gap-4 text-center py-6">
            <div className="w-[110px] aspect-[260/390]">
              <FarisCharacter state={passed ? "happy" : "idle"} />
            </div>
            <h1 className="text-2xl font-black text-amber-50">
              {passed ? "مبروك! Well played!" : "Good effort!"}
            </h1>
            <p className="text-5xl font-black" style={{ color: passed ? "#22c55e" : "#fbbf24" }}>
              {score}<span className="text-2xl text-amber-300/40"> / {quiz.length}</span>
            </p>
            <p className="text-sm text-amber-200/60 max-w-xs">
              {passed
                ? "You've mastered the basics — the World Cup Album is now unlocked!"
                : "You need 70% to unlock the next chapter. Review the words and try again."}
            </p>
            <p className="text-xs text-green-300/70 font-semibold">+{score * 5} XP</p>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => { setPhase("learn"); setIdx(0); }}
                className="flex items-center gap-1.5 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-amber-300/70 hover:bg-white/5 transition"
              >
                <RotateCcw className="h-4 w-4" /> Review words
              </button>
              <button
                type="button"
                onClick={startQuiz}
                className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-amber-300/70 hover:bg-white/5 transition"
              >
                Retry quiz
              </button>
              {passed ? (
                <Link
                  href="/play/worldcup/album"
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-green-950"
                  style={{ background: "#fde047" }}
                >
                  Open the Album →
                </Link>
              ) : (
                <Link
                  href="/play/worldcup"
                  className="rounded-2xl px-5 py-2.5 text-sm font-bold text-green-950"
                  style={{ background: "#fde047" }}
                >
                  Back to Journey
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
