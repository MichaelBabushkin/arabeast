"use client";

import { Flame, Heart, Sparkles } from "lucide-react";

type HeaderProps = {
  xp: number;
  hearts: number;
  streakLabel?: string;
  maxHearts?: number;
};

export default function Header({ xp, hearts, streakLabel = "3 days", maxHearts = 5 }: HeaderProps) {
  const filledHearts = Array.from({ length: maxHearts }, (_, idx) => idx < hearts);

  return (
    <header
      className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">🕌</span>
        <div>
          <p className="text-xs text-amber-400/60 font-medium tracking-widest uppercase">Arabeast</p>
          <p className="text-base font-bold text-amber-50">The Jinn&apos;s Curse</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold">
        <div className="flex items-center gap-1 rounded-full px-3 py-1" style={{ background: "rgba(212,160,23,0.15)" }}>
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-amber-300">{xp} XP</span>
        </div>
        <div className="flex items-center gap-1 rounded-full px-3 py-1" style={{ background: "rgba(234,88,12,0.15)" }}>
          <Flame className="h-4 w-4 text-orange-400" />
          <span className="text-orange-300">{streakLabel}</span>
        </div>
        <div className="flex items-center gap-1 rounded-full px-3 py-1" style={{ background: "rgba(225,29,72,0.15)" }}>
          {filledHearts.map((filled, idx) => (
            <Heart
              key={`heart-${idx}`}
              className={`h-4 w-4 ${filled ? "fill-rose-400 text-rose-400" : "text-rose-800"}`}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
