"use client";

import { useCallback, useEffect, useState } from "react";
import type { VocabEntry } from "./vocab";

export type Progress = {
  xp: number;
  streakDays: number;
  completedChapters: string[];
};

const FALLBACK: Progress = { xp: 0, streakDays: 0, completedChapters: [] };

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setProgress({
          xp: data.xp ?? 0,
          streakDays: data.streakDays ?? 0,
          completedChapters: data.completedChapters ?? [],
        });
      })
      .finally(() => setLoaded(true));
  }, []);

  const addXp = useCallback(async (newXp: number, word?: VocabEntry, correct?: boolean) => {
    setProgress((prev) => ({ ...prev, xp: newXp }));
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        xp: newXp,
        ...(word && correct !== undefined ? { wordId: word.id, correct } : {}),
      }),
    });
  }, []);

  const completeChapter = useCallback(async (chapterId: string, currentXp: number) => {
    setProgress((prev) => ({
      ...prev,
      completedChapters: prev.completedChapters.includes(chapterId)
        ? prev.completedChapters
        : [...prev.completedChapters, chapterId],
    }));
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xp: currentXp, completedChapter: chapterId }),
    });
  }, []);

  return { progress, loaded, addXp, completeChapter };
}
