"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "arabeast.wc.v1";

export type WcProgress = {
  basicsDone: boolean;
  basicsBest: number;   // best quiz score (number correct)
  basicsTotal: number;  // out of how many
  advancedDone: boolean;
  advancedBest: number;
  advancedTotal: number;
};

const EMPTY: WcProgress = {
  basicsDone: false, basicsBest: 0, basicsTotal: 0,
  advancedDone: false, advancedBest: 0, advancedTotal: 0,
};

function load(): WcProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<WcProgress>) };
  } catch {
    return EMPTY;
  }
}

export function useWcProgress() {
  const [progress, setProgress] = useState<WcProgress>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(load());
    setLoaded(true);
  }, []);

  /** Record a Basics quiz result. Passing (≥70%) marks the chapter done. */
  const recordBasicsQuiz = useCallback((score: number, total: number) => {
    setProgress((prev) => {
      const next: WcProgress = {
        ...prev,
        basicsDone: prev.basicsDone || score / total >= 0.7,
        basicsBest: Math.max(prev.basicsBest, score),
        basicsTotal: total,
      };
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  /** Record an Advanced quiz result. Passing (≥70%) marks the chapter done. */
  const recordAdvancedQuiz = useCallback((score: number, total: number) => {
    setProgress((prev) => {
      const next: WcProgress = {
        ...prev,
        advancedDone: prev.advancedDone || score / total >= 0.7,
        advancedBest: Math.max(prev.advancedBest, score),
        advancedTotal: total,
      };
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { progress, loaded, recordBasicsQuiz, recordAdvancedQuiz };
}
