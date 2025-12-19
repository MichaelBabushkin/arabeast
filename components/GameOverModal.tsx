"use client";

import { HeartCrack } from "lucide-react";

type GameOverModalProps = {
  open: boolean;
  onRestart: () => void;
};

export default function GameOverModal({ open, onRestart }: GameOverModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="card max-w-md w-full p-6 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
          <HeartCrack className="h-8 w-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Game Over</h2>
        <p className="text-slate-600">You ran out of hearts. Take a breath and try again!</p>
        <button
          type="button"
          onClick={onRestart}
          className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-white font-semibold shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
