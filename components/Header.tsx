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
    <header className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-card border border-emerald-50">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🕌</span>
        <div>
          <p className="text-sm text-slate-500">Arabeast</p>
          <p className="text-lg font-semibold text-slate-900">Arabic Quiz</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm font-semibold text-slate-800">
        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span>{xp} XP</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1">
          <Flame className="h-4 w-4 text-orange-500" />
          <span>{streakLabel}</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1">
          {filledHearts.map((filled, idx) => (
            <Heart
              key={`heart-${idx}`}
              className={`h-4 w-4 ${filled ? "fill-rose-500 text-rose-500" : "text-rose-200"}`}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
