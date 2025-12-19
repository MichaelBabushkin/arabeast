"use client";

import { useState } from "react";
import GameOverModal from "@/components/GameOverModal";
import Header from "@/components/Header";
import QuizCard from "@/components/QuizCard";

const MAX_HEARTS = 5;

export default function HomePage() {
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [xp, setXp] = useState(0);
  const [quizKey, setQuizKey] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleOutOfHearts = () => {
    setGameOver(true);
  };

  const handleRestart = () => {
    setHearts(MAX_HEARTS);
    setXp(0);
    setQuizKey((k) => k + 1);
    setGameOver(false);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-6 sm:py-10">
      <Header xp={xp} hearts={hearts} streakLabel="3 days" maxHearts={MAX_HEARTS} />

      <section className="card p-6 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Daily drill</p>
        <h1 className="text-3xl font-black text-slate-900">Match the Arabic word</h1>
        <p className="text-slate-600">Tap the correct Arabic translation for the English word shown. Earn XP, keep your streak alive, and guard your hearts.</p>
      </section>

      <QuizCard
        hearts={hearts}
        xp={xp}
        quizKey={quizKey}
        onHeartsChange={setHearts}
        onXpChange={setXp}
        onOutOfHearts={handleOutOfHearts}
      />

      <GameOverModal open={gameOver} onRestart={handleRestart} />
    </main>
  );
}
