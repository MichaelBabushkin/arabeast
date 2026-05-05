"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useProgress } from "@/lib/useProgress";
import { useSettings } from "@/lib/useSettings";
import JinnCharacter from "@/components/jinn/JinnCharacter";
import SettingsModal from "@/components/SettingsModal";
import { speakJinn } from "@/lib/speech";
import { BookOpen, MessageCircle, Settings, Swords, UserCircle2, ChevronRight, LogOut, Volume2 } from "lucide-react";
import { CHAPTERS } from "@/lib/chapters";

const SHOWCASE_WORDS = [
  { arabic: "مرحبا",   transliteration: "marhaba",  english: "Hello" },
  { arabic: "شكراً",   transliteration: "shukran",   english: "Thank you" },
  { arabic: "أسد",     transliteration: "asad",      english: "Lion" },
  { arabic: "قهوة",    transliteration: "qahwa",     english: "Coffee" },
  { arabic: "صديق",    transliteration: "sadeeq",    english: "Friend" },
  { arabic: "مدينة",   transliteration: "madina",    english: "City" },
];

function WordShowcase() {
  const { settings } = useSettings();
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50 mb-3">
        Words you&apos;ll learn
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SHOWCASE_WORDS.map((w) => (
          <div
            key={w.arabic}
            className="rounded-2xl px-4 py-3 flex flex-col gap-0.5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,160,23,0.12)" }}
          >
            <div className="flex items-start justify-between gap-1">
              <p
                className="text-2xl font-bold text-amber-100 leading-tight"
                style={{ fontFamily: "var(--font-noto-naskh), serif", direction: "rtl" }}
              >
                {w.arabic}
              </p>
              <button
                type="button"
                onClick={() => speakJinn(w.arabic, settings.arabicVoice)}
                className="mt-1 flex-shrink-0 text-amber-400/30 hover:text-amber-300 transition"
                aria-label={`Pronounce ${w.english}`}
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-amber-300/50 italic">{w.transliteration}</p>
            <p className="text-xs font-semibold text-amber-200/70">{w.english}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  const { progress } = useProgress();
  const unlockedCount = CHAPTERS.filter((c) => c.xpRequired <= progress.xp).length;
  const [showSettings, setShowSettings] = useState(false);

  return (
    <main className="min-h-screen flex flex-col">
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {/* stars */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.opacity }} />
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-4xl flex flex-col gap-12 px-5 py-8">

        {/* ── top nav ── */}
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🕌</span>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/70">Arabeast</p>
          </div>
          <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center h-8 w-8 rounded-xl border border-white/10 text-amber-300/50 hover:bg-white/5 hover:text-amber-300 transition"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-300/50">{session.user?.name ?? session.user?.email}</span>
              <button
                type="button"
                onClick={() => signOut()}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-amber-300/50 hover:bg-white/5 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/signin"
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-amber-300/60 hover:bg-white/5 transition"
            >
              <UserCircle2 className="h-4 w-4" />
              Sign in
            </Link>
          )}
          </div>
        </nav>

        {/* ── hero ── */}
        <section className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/60 mb-2">
                Learn Modern Standard Arabic
              </p>
              <h1 className="text-5xl sm:text-6xl font-black text-amber-50 leading-[1.05]">
                Arabic<br />
                <span style={{ color: "#d4a017" }}>unlocked.</span>
              </h1>
            </div>
            <p className="text-base text-amber-200/55 leading-relaxed max-w-sm">
              Build real vocabulary through stories, quizzes, and a talking Jinn who has waited 1,000 years for someone to speak to him.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/play/story"
                className="rounded-2xl px-5 py-3 text-sm font-bold text-amber-900 transition hover:brightness-110"
                style={{ background: "#d4a017" }}
              >
                Start Learning →
              </Link>
              <Link
                href="/play/quiz"
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-amber-300/70 hover:bg-white/5 transition"
              >
                Quick Quiz
              </Link>
            </div>
          </div>

          {/* small jinn */}
          <div className="flex-shrink-0 w-[140px] sm:w-[160px]" style={{ aspectRatio: "260/390" }}>
            <JinnCharacter state="idle" />
          </div>
        </section>

        {/* ── word showcase ── */}
        <WordShowcase />

        {/* ── game modes ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50 mb-3">
            Game modes
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <Link
              href="/play/story"
              className="group flex flex-col gap-3 rounded-3xl p-5 transition hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, rgba(212,160,23,0.16) 0%, rgba(120,60,10,0.10) 100%)",
                border: "1px solid rgba(212,160,23,0.3)",
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(212,160,23,0.2)", border: "1px solid rgba(212,160,23,0.25)" }}
                >
                  <BookOpen className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-amber-900" style={{ background: "#d4a017" }}>
                  STORY
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-50">Story Mode</h2>
                <p className="text-sm text-amber-200/55 mt-0.5 leading-snug">
                  5 chapters. Each one unlocks new vocabulary tied to Zafar&apos;s 1,000-year backstory.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400/60 font-medium">
                <span>{unlockedCount} / {CHAPTERS.length} chapters unlocked</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <Link
              href="/play/quiz"
              className="group flex flex-col gap-3 rounded-3xl p-5 transition hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <Swords className="h-5 w-5 text-amber-300/80" />
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-amber-900/80"
                  style={{ background: "rgba(212,160,23,0.55)" }}>
                  QUIZ
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-50">Quick Quiz</h2>
                <p className="text-sm text-amber-200/55 mt-0.5 leading-snug">
                  All 36 words, random order, 5 hearts. Race for XP — no chapter required.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400/60 font-medium">
                <span>Unlimited · all categories</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <Link
              href="/play/conversation"
              className="group flex flex-col gap-3 rounded-3xl p-5 transition hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, rgba(5,150,105,0.16) 0%, rgba(0,60,40,0.10) 100%)",
                border: "1px solid rgba(5,150,105,0.3)",
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(5,150,105,0.2)", border: "1px solid rgba(5,150,105,0.25)" }}
                >
                  <MessageCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-emerald-900"
                  style={{ background: "rgba(52,211,153,0.8)" }}>
                  CONVO
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-50">Conversation</h2>
                <p className="text-sm text-amber-200/55 mt-0.5 leading-snug">
                  6 guided exchanges with Zafar or Qamar. Speak Arabic, get evaluated in real time.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400/60 font-medium">
                <span>3 topics · choose your teacher</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>


      </div>
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
  { top: "42%", left: "15%", size: "2px",   opacity: 0.3 },
  { top: "50%", left: "90%", size: "1.5px", opacity: 0.5 },
  { top: "72%", left: "48%", size: "2px",   opacity: 0.3 },
  { top: "85%", left: "70%", size: "1.5px", opacity: 0.5 },
];
