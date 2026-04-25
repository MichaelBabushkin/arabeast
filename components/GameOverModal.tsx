"use client";

import { HeartCrack } from "lucide-react";

type GameOverModalProps = {
  open: boolean;
  onRestart: () => void;
};

export default function GameOverModal({ open, onRestart }: GameOverModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(5,2,16,0.8)", backdropFilter: "blur(6px)" }}>
      <div className="max-w-md w-full p-8 text-center space-y-5 rounded-3xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,160,23,0.25)" }}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(225,29,72,0.15)" }}>
          <HeartCrack className="h-9 w-9 text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-amber-50">The Curse Wins… For Now</h2>
        <p className="text-amber-200/70 text-sm leading-relaxed">You ran out of hearts. The Jinn waits patiently — take a breath and try again.</p>
        <button
          type="button"
          onClick={onRestart}
          className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-white font-semibold transition hover:bg-amber-400"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
