"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  normalizeArabic, newVocab, reviewSchedule,
  type VocabWord, type CaptureInput,
} from "@/lib/srs";

// Re-export the pure helpers/types so existing imports (the My Words page) keep working.
export {
  normalizeArabic, bucketOf, dueWords, vocabStats, MAX_LEVEL,
} from "@/lib/srs";
export type { VocabWord, VocabSource, CaptureInput, MasteryBucket } from "@/lib/srs";

const STORAGE_KEY = "arabeast.vocab.v1";

function load(): VocabWord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VocabWord[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(words: VocabWord[]) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(words)); } catch { /* ignore quota/private mode */ }
}

/**
 * Offline-first vocabulary store.
 *  - Anonymous users: localStorage only.
 *  - Signed-in users: localStorage is a write-through cache; on sign-in we
 *    two-way sync (merge local → server, pull server → local), and every
 *    mutation is also sent to /api/vocab so it's durable + cross-device.
 */
export function useVocab() {
  const { status } = useSession();
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loaded, setLoaded] = useState(false);

  const authedRef = useRef(false);
  const syncedRef = useRef(false);

  // initial localStorage load (instant)
  useEffect(() => {
    setWords(load());
    setLoaded(true);
  }, []);

  // two-way sync once authenticated
  useEffect(() => {
    authedRef.current = status === "authenticated";
    if (status === "unauthenticated") syncedRef.current = false;
    if (status !== "authenticated" || syncedRef.current) return;
    syncedRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/vocab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ op: "sync", words: load() }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { words: VocabWord[] };
        setWords(data.words);
        saveLocal(data.words);
      } catch { /* stay on local copy */ }
    })();
  }, [status]);

  const postOp = useCallback((body: object) => {
    if (!authedRef.current) return;
    fetch("/api/vocab", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => {});
  }, []);

  const capture = useCallback((input: CaptureInput) => {
    const key = normalizeArabic(input.arabic);
    if (!key) return;
    setWords((prev) => {
      const now = new Date().toISOString();
      const existing = prev.find((w) => w.arabic === key);
      const next = existing
        ? prev.map((w) =>
            w.arabic === key
              ? { ...w, lastSeen: now, seenCount: w.seenCount + 1, translit: w.translit || input.translit || "", meaning: w.meaning || input.meaning || "" }
              : w,
          )
        : [newVocab(input), ...prev];
      saveLocal(next);
      return next;
    });
    postOp({ op: "capture", word: input });
  }, [postOp]);

  const toggleStar = useCallback((arabic: string) => {
    const key = normalizeArabic(arabic);
    setWords((prev) => {
      const next = prev.map((w) => (w.arabic === key ? { ...w, starred: !w.starred } : w));
      saveLocal(next);
      return next;
    });
    postOp({ op: "star", arabic: key });
  }, [postOp]);

  const review = useCallback((arabic: string, correct: boolean) => {
    const key = normalizeArabic(arabic);
    setWords((prev) => {
      const now = new Date().toISOString();
      const next = prev.map((w) => {
        if (w.arabic !== key) return w;
        const { level, due } = reviewSchedule(w.level, correct);
        return { ...w, level, due, reps: w.reps + (correct ? 1 : 0), lapses: w.lapses + (correct ? 0 : 1), lastReviewed: now };
      });
      saveLocal(next);
      return next;
    });
    postOp({ op: "review", arabic: key, correct });
  }, [postOp]);

  const remove = useCallback((arabic: string) => {
    const key = normalizeArabic(arabic);
    setWords((prev) => {
      const next = prev.filter((w) => w.arabic !== key);
      saveLocal(next);
      return next;
    });
    postOp({ op: "remove", arabic: key });
  }, [postOp]);

  return { words, loaded, capture, toggleStar, review, remove };
}
