"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, Volume2 } from "lucide-react";
import { speakJinn } from "@/lib/speech";
import { useSettings } from "@/lib/useSettings";
import ArabicGloss from "@/components/ArabicGloss";
import { LEARN_CATEGORIES } from "@/lib/learnCategories";

const NAF = "var(--font-noto-naskh), serif";

export default function LearnCategoriesPickerPage() {
  const { settings, update } = useSettings();

  const say = (text: string) => {
    speakJinn(text, settings.arabicVoice);
  };

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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400/60 ml-auto">
            <ArabicGloss ar="مفردات" en="Vocabulary" arClassName="text-teal-400/60 font-bold" />
          </p>
        </div>

        {/* header */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          style={{
            background: "linear-gradient(135deg, #063c37 0%, #0d9488 50%, #115e59 100%)",
            border: "1px solid rgba(45,212,191,0.35)",
            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
          }}
        >
          {/* radial glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, #0d9488 0%, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #2dd4bf 0%, transparent 70%)" }}
          />

          <div className="relative flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
            <div 
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-teal-950/50" 
              style={{ 
                background: "linear-gradient(135deg, rgba(45,212,191,0.2) 0%, rgba(45,212,191,0.05) 100%)", 
                border: "1px solid rgba(45,212,191,0.4)" 
              }}
            >
              <LayoutGrid className="h-8 w-8 text-teal-300" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full text-teal-950 mb-2" style={{ background: "#2dd4bf" }}>
                LEARN BY CATEGORY • المفردات
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Browse Vocabulary by Theme
              </h1>
              <p className="text-sm text-teal-200/50 mt-1.5 max-w-xl">
                Choose from 39 vocabulary topics. Learn and retain essential words through AI-generated flashcards connected directly with your Spaced Repetition vocabulary system.
              </p>
            </div>
          </div>

          {/* translation / phrase box */}
          <div 
            className="relative flex flex-col justify-center gap-1.5 rounded-2xl p-4 sm:p-5 lg:max-w-xs w-full text-right animate-fade-in"
            style={{ 
              background: "rgba(15,23,42,0.45)", 
              border: "1px solid rgba(45,212,191,0.15)",
              backdropFilter: "blur(12px)"
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
              <span className="text-[10px] font-bold text-teal-400/80 uppercase tracking-wider">Arabic Phrase</span>
              <button 
                type="button" 
                onClick={() => say("تعلّم حسب الموضوع")} 
                className="text-teal-300/40 hover:text-teal-200 transition"
                aria-label="Read header Arabic aloud"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-1">
              <span 
                className="block text-2xl font-black text-teal-100 leading-none select-all" 
                style={{ fontFamily: NAF, direction: "rtl" }}
              >
                تعلَّم حسب الموضوع
              </span>
              <span className="block text-[11px] text-teal-200/45 italic mt-1 font-medium">
                ta'allam hasaba al-mawdoo'
              </span>
              <span className="block text-xs font-semibold text-teal-200/75 mt-0.5">
                {settings.language === "he" ? '"למד לפי נושאים"' : '"Learn by Category"'}
              </span>
            </div>
          </div>

          {/* language toggle */}
          <div className="flex flex-row lg:flex-col items-center gap-2 self-end lg:self-center">
            <span className="text-[10px] font-bold text-teal-200/45 uppercase tracking-widest lg:block hidden">Language</span>
            <div className="flex overflow-hidden rounded-xl border border-white/10 text-xs font-bold bg-slate-950/40">
              {(["en", "he"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => update({ language: l })}
                  className={`px-3 py-2 transition ${settings.language === l ? "bg-teal-500/30 text-white border-b-2 border-teal-400" : "text-teal-200/50 hover:text-teal-100"}`}
                >
                  {l === "en" ? "ENGLISH" : "עברית"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {LEARN_CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/play/learn/${c.id}`}
              className="group flex flex-col items-center text-center gap-3 rounded-3xl p-5 transition hover:scale-[1.03] hover:bg-white/5 hover:border-teal-400/40 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-20 w-20 rounded-full opacity-0 group-hover:opacity-10 blur-xl transition-opacity bg-teal-400" />
              <span className="text-4xl mb-1">{c.emoji}</span>
              <div className="flex flex-col gap-0.5 w-full">
                <span className="text-sm font-bold text-amber-50 group-hover:text-teal-300 transition-colors">
                  {c.en}
                </span>
                {settings.language === "he" && (
                  <span className="text-xs text-teal-200/50">
                    {c.he}
                  </span>
                )}
                <span
                  className="text-base font-semibold text-teal-400/80 mt-1 select-all"
                  style={{ fontFamily: NAF, direction: "rtl" }}
                >
                  <ArabicGloss ar={c.ar} en="" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
