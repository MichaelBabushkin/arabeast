"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, Check, X, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import FarisCharacter, { type FarisState } from "@/components/faris/FarisCharacter";
import { speakJinn } from "@/lib/speech";
import { useSettings } from "@/lib/useSettings";
import { useProgress } from "@/lib/useProgress";
import { useWcProgress } from "@/lib/useWcProgress";
import { ADVANCED, buildAdvancedQuiz, type SentenceQuestion } from "@/lib/footballVocab";

const NAF = "var(--font-noto-naskh), serif";
const QUIZ_LEN = 8;

type Phase = "learn" | "quiz" | "result";

export default function AdvancedPage() {
  const { settings } = useSettings();
  const { progress, addXp } = useProgress();
  const { recordAdvancedQuiz } = useWcProgress();

  const [phase, setPhase] = useState<Phase>("learn");

  const [idx, setIdx] = useState(0);
  const sentence = ADVANCED[idx];
  const say = useCallback(
    (text: string) => speakJinn(text, settings.arabicVoice),
    [settings.arabicVoice],
  );

  const [quiz, setQuiz] = useState<SentenceQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const startQuiz = useCallback(() => {
    setQuiz(buildAdvancedQuiz(QUIZ_LEN));
    setQIdx(0);
    setPicked(null);
    setScore(0);
    setPhase("quiz");
  }, []);

  const q = quiz[qIdx];
  const farisState: FarisState = useMemo(() => {
    if (phase === "quiz" && picked) return picked === q?.sentence.english ? "happy" : "sad";
    if (phase === "result") return score / QUIZ_LEN >= 0.7 ? "happy" : "idle";
    return "talking";
  }, [phase, picked, q, score]);

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === q.sentence.english) setScore((s) => s + 1);
    say(q.sentence.arabic);
  };

  const next = () => {
    if (qIdx + 1 >= quiz.length) {
      recordAdvancedQuiz(score, quiz.length);
      addXp(progress.xp + score * 7);
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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400/60 ml-auto">
            Chapter 2 · Advanced
          </p>
        </div>

        {/* ── LEARN ── */}
        {phase === "learn" && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-amber-50">Learn the sentences</h1>
              <span className="text-xs font-semibold text-amber-300/50">
                {idx + 1} / {ADVANCED.length}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${((idx + 1) / ADVANCED.length) * 100}%`, background: "#a78bfa" }} />
            </div>

            <div
              className="flex flex-col items-center gap-4 rounded-3xl px-6 py-10 text-center"
              style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(0,0,0,0) 100%)", border: "1px solid rgba(167,139,250,0.3)" }}
            >
              <p className="text-3xl font-black text-amber-50 leading-snug" style={{ fontFamily: NAF, direction: "rtl" }}>
                {sentence.arabic}
              </p>
              <p className="text-sm text-amber-300/60 italic">{sentence.translit}</p>
              <p className="text-lg font-semibold text-amber-100">{sentence.english}</p>
              <button
                type="button"
                onClick={() => say(sentence.arabic)}
                className="mt-1 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-purple-950"
                style={{ background: "#c4b5fd" }}
              >
                <Volume2 className="h-4 w-4" /> Hear it
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
                className="flex items-center gap-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-amber-300/70 disabled:opacity-30 hover:bg-white/5 transition"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              {idx + 1 < ADVANCED.length ? (
                <button
                  type="button"
                  onClick={() => { setIdx((i) => i + 1); say(ADVANCED[idx + 1].arabic); }}
                  className="flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-bold text-purple-950"
                  style={{ background: "#a78bfa" }}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startQuiz}
                  className="flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-bold text-purple-950"
                  style={{ background: "#c4b5fd" }}
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
              <div className="h-full rounded-full transition-all" style={{ width: `${((qIdx + 1) / quiz.length) * 100}%`, background: "#a78bfa" }} />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-[64px] flex-shrink-0 aspect-[260/390]">
                <FarisCharacter state={farisState} />
              </div>
              <div
                className="flex-1 rounded-2xl px-4 py-5 text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-xs text-amber-300/50 mb-2">What does this sentence mean?</p>
                <p className="text-2xl font-black text-amber-50 leading-snug" style={{ fontFamily: NAF, direction: "rtl" }}>
                  {q.sentence.arabic}
                </p>
                <button
                  type="button"
                  onClick={() => say(q.sentence.arabic)}
                  className="mx-auto mt-2 flex items-center gap-1 text-xs text-amber-300/50 hover:text-amber-200"
                >
                  <Volume2 className="h-3.5 w-3.5" /> {q.sentence.translit}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt) => {
                const isCorrect = opt === q.sentence.english;
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

            {picked && (
              <button
                type="button"
                onClick={next}
                className="rounded-2xl px-5 py-3 text-sm font-bold text-purple-950"
                style={{ background: "#c4b5fd" }}
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
              {passed ? "ممتاز! Excellent!" : "Good effort!"}
            </h1>
            <p className="text-5xl font-black" style={{ color: passed ? "#a78bfa" : "#fbbf24" }}>
              {score}<span className="text-2xl text-amber-300/40"> / {quiz.length}</span>
            </p>
            <p className="text-sm text-amber-200/60 max-w-xs">
              {passed
                ? "You can read real football sentences now — you're ready for the live World Cup!"
                : "You need 70% to complete this chapter. Review the sentences and try again."}
            </p>
            <p className="text-xs text-purple-300/70 font-semibold">+{score * 7} XP</p>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => { setPhase("learn"); setIdx(0); }}
                className="flex items-center gap-1.5 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-amber-300/70 hover:bg-white/5 transition"
              >
                <RotateCcw className="h-4 w-4" /> Review
              </button>
              <button
                type="button"
                onClick={startQuiz}
                className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-amber-300/70 hover:bg-white/5 transition"
              >
                Retry quiz
              </button>
              <Link
                href="/play/worldcup"
                className="rounded-2xl px-5 py-2.5 text-sm font-bold text-purple-950"
                style={{ background: "#c4b5fd" }}
              >
                Back to Journey
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
