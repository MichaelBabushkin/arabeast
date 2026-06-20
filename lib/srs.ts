// Pure spaced-repetition + vocabulary helpers shared by the client hook
// (localStorage) and the server (/api/vocab). No "use client" — safe on both.

export type VocabSource =
  | "news" | "basics" | "advanced" | "quiz" | "conversation" | "worldcup" | "manual" | "category" | "phrase";

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
export type Grade = "again" | "hard" | "good" | "easy";

// days until next review, by level reached after answering (level 0 = due now)
export const INTERVAL_DAYS = [0, 1, 2, 4, 9, 18];
export const MAX_LEVEL = 5;
export const NEW_PER_DAY = 12; // cap on brand-new words introduced per day in review
const WRONG_DELAY_MS = 10 * 60 * 1000; // "Again" → comes back in 10 min

/**
 * Normalise an Arabic word to a stable dedup key: strip diacritics/tatweel,
 * unify alef/ya/hamza orthographic variants, and drop the definite article ال
 * (when a real stem remains) so e.g. الكلمة / كلمة and إيران / ايران collapse.
 * (Clitics and verb conjugations still differ — that needs a morphological
 * analyser/LLM and is a deeper enhancement.)
 */
export function normalizeArabic(w: string): string {
  let s = w
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭ]/g, "") // harakat / quranic marks
    .replace(/ـ/g, "")        // tatweel
    .replace(/[إأآٱ]/g, "ا") // alef-hamza / madda → bare alef
    .replace(/ى/g, "ي")      // alef maqsura → ya
    .replace(/ؤ/g, "و")      // waw-hamza → waw
    .replace(/ئ/g, "ي")      // ya-hamza → ya
    .replace(/ء/g, "")        // standalone hamza → drop
    .replace(/[^ء-ي]/g, "")  // keep Arabic letters only
    .trim();
  if (s.startsWith("ال") && s.length - 2 >= 3) s = s.slice(2); // strip ال, keep ≥3-letter stem
  return s;
}

/** New level + next due after a graded review (Anki-style 4 grades). */
export function reviewSchedule(level: number, grade: Grade, fromMs = Date.now()): { level: number; due: string; lapse: boolean } {
  let newLevel = level;
  let days = 0;
  let lapse = false;
  switch (grade) {
    case "again": newLevel = level <= 1 ? level : 1; lapse = true; break;
    case "hard":  newLevel = Math.max(1, level); days = Math.max(1, Math.round((INTERVAL_DAYS[Math.min(newLevel, MAX_LEVEL)] || 1) * 0.5)); break;
    case "good":  newLevel = Math.min(MAX_LEVEL, level + 1); days = INTERVAL_DAYS[newLevel] || 1; break;
    case "easy":  newLevel = Math.min(MAX_LEVEL, level + 2); days = Math.round((INTERVAL_DAYS[newLevel] || 1) * 1.4); break;
  }
  const due = grade === "again"
    ? new Date(fromMs + WRONG_DELAY_MS).toISOString()
    : new Date(fromMs + days * 86_400_000).toISOString();
  return { level: newLevel, due, lapse };
}

/** Short human label for when a grade would schedule the card next ("10m", "4d"). */
export function nextDueLabel(level: number, grade: Grade): string {
  const mins = Math.max(0, Math.round((Date.parse(reviewSchedule(level, grade).due) - Date.now()) / 60000));
  if (mins < 60) return `${mins}m`;
  const hrs = mins / 60;
  return hrs < 24 ? `${Math.round(hrs)}h` : `${Math.round(hrs / 24)}d`;
}

/** Build a review queue: all due words, but cap brand-new (level 0) words for the day. */
export function buildReviewQueue(words: VocabWord[], newToday: number): VocabWord[] {
  const allowNew = Math.max(0, NEW_PER_DAY - newToday);
  const out: VocabWord[] = [];
  let usedNew = 0;
  for (const w of dueWords(words)) {
    if (w.level === 0) {
      if (usedNew >= allowNew) continue;
      usedNew += 1;
    }
    out.push(w);
  }
  return out;
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
