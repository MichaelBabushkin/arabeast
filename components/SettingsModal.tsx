"use client";

import { useState } from "react";
import { X, Volume2 } from "lucide-react";
import {
  ARABIC_VOICES, HEBREW_VOICES, ENGLISH_VOICES,
  ARABIC_VOICE_LABELS, HEBREW_VOICE_LABELS, ENGLISH_VOICE_LABELS,
  PREVIEW_SENTENCES,
  type JinnVoice, type HebrewVoice, type EnglishVoice, type AnyVoice,
} from "@/lib/tts";
import { speakJinn } from "@/lib/speech";
import { useSettings } from "@/lib/useSettings";

type Props = { onClose: () => void };

export default function SettingsModal({ onClose }: Props) {
  const { settings, update } = useSettings();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 flex flex-col gap-6 my-4"
        style={{ background: "#0d0618", border: "1px solid rgba(212,160,23,0.25)" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-300/40 hover:text-amber-300 transition"
          aria-label="Close settings"
        >
          <X className="h-4 w-4" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-amber-50">Settings</h2>
          <p className="text-xs text-amber-300/40 mt-0.5">Applies to all game modes</p>
        </div>

        {/* Language */}
        <div className="flex flex-col gap-2">
          <SectionLabel title="My Language" desc="Characters explain in this language when you need help." />
          <div className="flex overflow-hidden rounded-xl border border-white/10 text-sm font-semibold w-fit">
            {(["en", "he"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => update({ language: l })}
                className={`px-4 py-2 transition ${
                  settings.language === l
                    ? "bg-amber-500/25 text-amber-200"
                    : "text-amber-300/40 hover:text-amber-300/70"
                }`}
              >
                {l === "en" ? "English" : "עברית"}
              </button>
            ))}
          </div>
        </div>

        {/* Arabic help (UI label glosses) */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2 flex-1">
            <SectionLabel title="Arabic Help" desc="Show small English labels next to Arabic text in the app's interface." />
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.showArabicHelp}
            onClick={() => update({ showArabicHelp: !settings.showArabicHelp })}
            className="relative mt-0.5 h-6 w-11 flex-shrink-0 rounded-full transition"
            style={{ background: settings.showArabicHelp ? "#d4a017" : "rgba(255,255,255,0.15)" }}
            aria-label="Toggle Arabic help"
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
              style={{ left: settings.showArabicHelp ? "22px" : "2px" }}
            />
          </button>
        </div>

        {/* Arabic Voice */}
        <div className="flex flex-col gap-2">
          <SectionLabel title="Arabic Voice" desc="Click any voice to preview and select it." />
          <VoicePicker
            voices={ARABIC_VOICES as readonly string[]}
            labels={ARABIC_VOICE_LABELS}
            current={settings.arabicVoice}
            previewText={PREVIEW_SENTENCES.arabic}
            onSelect={(v) => update({ arabicVoice: v as JinnVoice })}
          />
        </div>

        {/* Hebrew Voice */}
        <div className="flex flex-col gap-2">
          <SectionLabel title="Hebrew Voice" desc="Used for Hebrew explanations from characters." />
          <VoicePicker
            voices={HEBREW_VOICES as readonly string[]}
            labels={HEBREW_VOICE_LABELS}
            current={settings.hebrewVoice}
            previewText={PREVIEW_SENTENCES.hebrew}
            onSelect={(v) => update({ hebrewVoice: v as HebrewVoice })}
          />
        </div>

        {/* English Voice */}
        <div className="flex flex-col gap-2">
          <SectionLabel title="English Voice" desc="Used for English explanations from characters." />
          <VoicePicker
            voices={ENGLISH_VOICES as readonly string[]}
            labels={ENGLISH_VOICE_LABELS}
            current={settings.englishVoice}
            previewText={PREVIEW_SENTENCES.english}
            onSelect={(v) => update({ englishVoice: v as EnglishVoice })}
          />
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <label className="text-xs font-semibold uppercase tracking-widest text-amber-400/60">
        {title}
      </label>
      <p className="text-xs text-amber-300/35 -mt-1">{desc}</p>
    </>
  );
}

function VoicePicker({
  voices, labels, current, previewText, onSelect,
}: {
  voices: readonly string[];
  labels: Record<string, string>;
  current: string;
  previewText: string;
  onSelect: (v: string) => void;
}) {
  const [playing, setPlaying] = useState<string | null>(null);

  const handleClick = async (v: string) => {
    onSelect(v);
    setPlaying(v);
    await speakJinn(previewText, v as AnyVoice);
    setPlaying(null);
  };

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {voices.map((v) => {
        const isActive = current === v;
        const isPlaying = playing === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => handleClick(v)}
            className={`flex items-center justify-between gap-1.5 rounded-xl px-3 py-2 text-xs text-left transition ${
              isActive ? "font-bold text-amber-900" : "text-amber-300/60 hover:bg-white/5"
            }`}
            style={isActive ? { background: "#d4a017" } : { border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="truncate">{labels[v] ?? v}</span>
            <Volume2
              className={`h-3 w-3 flex-shrink-0 ${isPlaying ? "opacity-100" : "opacity-40"}`}
              style={isPlaying ? { animation: "pulse 0.6s ease-in-out infinite" } : {}}
            />
          </button>
        );
      })}
    </div>
  );
}
