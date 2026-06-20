// Pure spaced-repetition + vocabulary helpers shared by the client hook
// (localStorage) and the server (/api/vocab). No "use client" — safe on both.

export type VocabSource =
  | "news" | "basics" | "advanced" | "quiz" | "conversation" | "worldcup" | "manual";

export type VocabWord = {
  arabic: string;        // normalized key
  translit: string;
  meaning: string;
  lang: "en" | "he";
  source: VocabSource;
  starred: boolean;
  firstSeen: string;     // ISO
  lastSeen: string;      // ISO
  seenCount: number;
  // Leitner spaced-repetition:
  level: number;         // 0 = new … 5 = mastered
  due: string;           // ISO — next review
  reps: number;
  lapses: number;
  lastReviewed?: string; // ISO
};

export type CaptureInput = {
  arabic: string;
  translit?: string;
  meaning?: string;
  lang?: "en" | "he";
  source: VocabSource;
};

export type MasteryBucket = "new" | "learning" | "familiar" | "known";

// days until next review, by level reached after answering (level 0 = due now)
export const INTERVAL_DAYS = [0, 1, 2, 4, 9, 18];
export const MAX_LEVEL = 5;
const WRONG_DELAY_MS = 10 * 60 * 1000; // failed review → comes back in 10 min

/** Normalise an Arabic word to a stable key: strip diacritics, tatweel, punctuation. */
export function normalizeArabic(w: string): string {
  return w
    .replace(/[ً-ْٰ]/g, "") // harakat / tanwin / superscript alef
    .replace(/ـ/g, "")                 // tatweel
    .replace(/[^ء-ي]/g, "")       // keep only Arabic letters
    .trim();
}

/** New level + next due after a review. */
export function reviewSchedule(level: number, correct: boolean, fromMs = Date.now()): { level: number; due: string } {
  const newLevel = correct ? Math.min(MAX_LEVEL, level + 1) : Math.max(1, level - 1);
  const due = correct
    ? new Date(fromMs + (INTERVAL_DAYS[Math.min(newLevel, MAX_LEVEL)] ?? 0) * 86_400_000).toISOString()
    : new Date(fromMs + WRONG_DELAY_MS).toISOString();
  return { level: newLevel, due };
}

/** Build a fresh vocab entry from a capture (new word → due immediately). */
export function newVocab(input: CaptureInput, nowMs = Date.now()): VocabWord {
  const now = new Date(nowMs).toISOString();
  return {
    arabic: normalizeArabic(input.arabic),
    translit: input.translit ?? "",
    meaning: input.meaning ?? "",
    lang: input.lang ?? "en",
    source: input.source,
    starred: false,
    firstSeen: now,
    lastSeen: now,
    seenCount: 1,
    level: 0,
    due: now,
    reps: 0,
    lapses: 0,
  };
}

const maxIso = (a?: string, b?: string) => (a && b ? (a > b ? a : b) : a || b);

/** Reconcile two copies of the same word (e.g. local vs server). Keeps the more-learned one. */
export function mergeVocab(a: VocabWord, b: VocabWord): VocabWord {
  const primary = a.level >= b.level ? a : b;
  const other = primary === a ? b : a;
  return {
    ...primary,
    starred: a.starred || b.starred,
    translit: primary.translit || other.translit,
    meaning: primary.meaning || other.meaning,
    seenCount: Math.max(a.seenCount, b.seenCount),
    firstSeen: a.firstSeen < b.firstSeen ? a.firstSeen : b.firstSeen,
    lastSeen: a.lastSeen > b.lastSeen ? a.lastSeen : b.lastSeen,
    reps: Math.max(a.reps, b.reps),
    lapses: Math.max(a.lapses, b.lapses),
    lastReviewed: maxIso(a.lastReviewed, b.lastReviewed),
  };
}

/** Merge two word lists by `arabic` key (used for local↔server sync). */
export function mergeWordLists(a: VocabWord[], b: VocabWord[]): VocabWord[] {
  const map = new Map<string, VocabWord>();
  for (const w of a) map.set(w.arabic, w);
  for (const w of b) {
    const existing = map.get(w.arabic);
    map.set(w.arabic, existing ? mergeVocab(existing, w) : w);
  }
  return Array.from(map.values());
}

/* ── derived helpers for the UI ── */

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
