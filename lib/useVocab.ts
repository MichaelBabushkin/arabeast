"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "arabeast.vocab.v1";

export type VocabSource = "news" | "basics" | "advanced" | "quiz" | "conversation" | "worldcup" | "manual";

export type VocabWord = {
  arabic: string;        // key (cleaned surface form)
  translit: string;
  meaning: string;
  lang: "en" | "he";     // language `meaning` is written in
  source: VocabSource;
  starred: boolean;
  firstSeen: string;     // ISO
  lastSeen: string;      // ISO
  seenCount: number;
  // Leitner spaced-repetition:
  level: number;         // 0 = new … 5 = mastered
  due: string;           // ISO — when it's next due for review
  reps: number;          // successful reviews
  lapses: number;        // failed reviews
  lastReviewed?: string; // ISO
};

// days until next review, by level reached after answering (level 0 = due now)
const INTERVAL_DAYS = [0, 1, 2, 4, 9, 18];
export const MAX_LEVEL = 5;

/** Normalise an Arabic word to a stable key: strip diacritics, tatweel, punctuation. */
export function normalizeArabic(w: string): string {
  return w
    .replace(/[ً-ْٰ]/g, "") // harakat / tanwin / superscript alef
    .replace(/ـ/g, "")                 // tatweel
    .replace(/[^ء-ي]/g, "")       // keep only Arabic letters
    .trim();
}

function load(): VocabWord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VocabWord[]) : [];
  } catch {
    return [];
  }
}

function dueDate(level: number, from = Date.now()): string {
  const days = INTERVAL_DAYS[Math.min(level, MAX_LEVEL)] ?? 0;
  return new Date(from + days * 24 * 60 * 60 * 1000).toISOString();
}

export type CaptureInput = {
  arabic: string;
  translit?: string;
  meaning?: string;
  lang?: "en" | "he";
  source: VocabSource;
};

export function useVocab() {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setWords(load());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: VocabWord[]) => {
    setWords(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  /** Add a word on engagement (or bump it if already known). Returns silently. */
  const capture = useCallback((input: CaptureInput) => {
    const key = normalizeArabic(input.arabic);
    if (!key) return;
    setWords((prev) => {
      const now = new Date().toISOString();
      const existing = prev.find((w) => w.arabic === key);
      let next: VocabWord[];
      if (existing) {
        next = prev.map((w) =>
          w.arabic === key
            ? {
                ...w,
                lastSeen: now,
                seenCount: w.seenCount + 1,
                // fill in translit/meaning if we didn't have them
                translit: w.translit || input.translit || "",
                meaning: w.meaning || input.meaning || "",
              }
            : w,
        );
      } else {
        next = [
          {
            arabic: key,
            translit: input.translit ?? "",
            meaning: input.meaning ?? "",
            lang: input.lang ?? "en",
            source: input.source,
            starred: false,
            firstSeen: now,
            lastSeen: now,
            seenCount: 1,
            level: 0,
            due: now, // new words are due immediately
            reps: 0,
            lapses: 0,
          },
          ...prev,
        ];
      }
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const toggleStar = useCallback((arabic: string) => {
    const key = normalizeArabic(arabic);
    setWords((prev) => {
      const next = prev.map((w) => (w.arabic === key ? { ...w, starred: !w.starred } : w));
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  /** Record a review result and reschedule (Leitner). */
  const review = useCallback((arabic: string, correct: boolean) => {
    const key = normalizeArabic(arabic);
    setWords((prev) => {
      const now = new Date().toISOString();
      const next = prev.map((w) => {
        if (w.arabic !== key) return w;
        const level = correct ? Math.min(MAX_LEVEL, w.level + 1) : Math.max(1, w.level - 1);
        return {
          ...w,
          level,
          due: correct ? dueDate(level) : new Date(Date.now() + 10 * 60 * 1000).toISOString(), // wrong → 10 min
          reps: w.reps + (correct ? 1 : 0),
          lapses: w.lapses + (correct ? 0 : 1),
          lastReviewed: now,
        };
      });
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const remove = useCallback((arabic: string) => {
    const key = normalizeArabic(arabic);
    persist(words.filter((w) => w.arabic !== key));
  }, [words, persist]);

  return { words, loaded, capture, toggleStar, review, remove };
}

/* ── pure helpers for the UI ── */

export type MasteryBucket = "new" | "learning" | "familiar" | "known";

export function bucketOf(level: number): MasteryBucket {
  if (level <= 0) return "new";
  if (level <= 2) return "learning";
  if (level <= 4) return "familiar";
  return "known";
}

export function dueWords(words: VocabWord[]): VocabWord[] {
  const now = Date.now();
  return words
    .filter((w) => Date.parse(w.due) <= now)
    .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0) || Date.parse(a.due) - Date.parse(b.due));
}

export function vocabStats(words: VocabWord[]) {
  const buckets: Record<MasteryBucket, number> = { new: 0, learning: 0, familiar: 0, known: 0 };
  for (const w of words) buckets[bucketOf(w.level)] += 1;
  return {
    total: words.length,
    starred: words.filter((w) => w.starred).length,
    due: dueWords(words).length,
    buckets,
  };
}
