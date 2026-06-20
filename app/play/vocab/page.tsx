"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, Star, Trash2, BookMarked, Brain } from "lucide-react";
import { speakJinn } from "@/lib/speech";
import { useSettings } from "@/lib/useSettings";
import {
  useVocab, dueWords, vocabStats, bucketOf, MAX_LEVEL, buildReviewQueue, nextDueLabel,
  type VocabWord, type VocabSource, type MasteryBucket, type Grade,
} from "@/lib/useVocab";

const NAF = "var(--font-noto-naskh), serif";

const SOURCE_META: Record<VocabSource, { label: string; emoji: string }> = {
  news: { label: "News", emoji: "📰" },
  basics: { label: "World Cup", emoji: "⚽" },
  advanced: { label: "Advanced", emoji: "📝" },
  quiz: { label: "Quiz", emoji: "🎯" },
  conversation: { label: "Chat", emoji: "💬" },
  worldcup: { label: "World Cup", emoji: "⚽" },
  manual: { label: "Saved", emoji: "⭐" },
};

const BUCKET_META: Record<MasteryBucket, { label: string; color: string }> = {
  new: { label: "New", color: "#94a3b8" },
  learning: { label: "Learning", color: "#fbbf24" },
  familiar: { label: "Familiar", color: "#38bdf8" },
  known: { label: "Known", color: "#22c55e" },
};

type Filter = "all" | "starred" | "due" | MasteryBucket;

export default function VocabPage() {
  const { settings } = useSettings();
  const { words, loaded, newToday, toggleStar, review, remove } = useVocab();
  const say = useCallback((t: string) => speakJinn(t, settings.arabicVoice), [settings.arabicVoice]);

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<VocabWord[] | null>(null);

  const stats = useMemo(() => vocabStats(words), [words]);
  const reviewable = useMemo(() => buildReviewQueue(words, newToday).length, [words, newToday]);

  const filtered = useMemo(() => {
    const due = new Set(dueWords(words).map((w) => w.arabic));
    let list = words;
    if (filter === "starred") list = list.filter((w) => w.starred);
    else if (filter === "due") list = list.filter((w) => due.has(w.arabic));
    else if (filter !== "all") list = list.filter((w) => bucketOf(w.level) === filter);
    const q = query.trim();
    if (q) list = list.filter((w) => w.arabic.includes(q) || w.meaning.toLowerCase().includes(q.toLowerCase()) || w.translit.toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [words, filter, query]);

  const startReview = () => {
    const queue = buildReviewQueue(words, newToday);
    if (queue.length) setSession(queue);
  };

  if (session) {
    return <Review queue={session} say={say} onReview={review} onDone={() => setSession(null)} />;
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="relative w-full max-w-5xl mx-auto flex flex-col gap-6 px-4 sm:px-8 py-6">
        {/* nav */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Menu
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300/60 ml-auto">📚 My Words</p>
        </div>

        {/* header / dashboard */}
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6" style={{ background: "linear-gradient(115deg, #1e1233 0%, #2a1a4a 55%, #3a2168 100%)", border: "1px solid rgba(167,139,250,0.35)" }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
                <BookMarked className="h-7 w-7 text-violet-200" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-violet-50">My Vocabulary</h1>
                <p className="text-sm text-violet-200/60 mt-0.5">{stats.total} word{stats.total === 1 ? "" : "s"} collected from across the app.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={startReview}
              disabled={reviewable === 0}
              className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-violet-950 disabled:opacity-40"
              style={{ background: "#c4b5fd" }}
            >
              <Brain className="h-4 w-4" />
              {reviewable > 0 ? `Review ${reviewable}` : stats.due > 0 ? "Daily limit reached" : "Nothing due 🎉"}
            </button>
          </div>

          {/* mastery breakdown */}
          {stats.total > 0 && (
            <>
              <div className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                {(["new", "learning", "familiar", "known"] as MasteryBucket[]).map((b) =>
                  stats.buckets[b] > 0 ? (
                    <div key={b} style={{ width: `${(stats.buckets[b] / stats.total) * 100}%`, background: BUCKET_META[b].color }} />
                  ) : null,
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
                {(["new", "learning", "familiar", "known"] as MasteryBucket[]).map((b) => (
                  <span key={b} className="flex items-center gap-1.5 text-violet-100/70">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: BUCKET_META[b].color }} />
                    {BUCKET_META[b].label} · <span className="font-bold">{stats.buckets[b]}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* empty state */}
        {loaded && stats.total === 0 && (
          <div className="rounded-3xl p-8 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-lg font-bold text-amber-50">No words yet</p>
            <p className="text-sm text-amber-200/55 mt-1 max-w-md mx-auto">
              Words you meet are saved here automatically — tap a word in the <Link href="/play/news" className="text-violet-300 underline">News</Link>, or learn the <Link href="/play/worldcup/basics" className="text-violet-300 underline">Basics</Link> — then come back to review them.
            </p>
          </div>
        )}

        {/* filters + search */}
        {stats.total > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {([
              { id: "all" as Filter, label: `All ${stats.total}` },
              { id: "due" as Filter, label: `Due ${stats.due}` },
              { id: "starred" as Filter, label: `★ ${stats.starred}` },
              { id: "new" as Filter, label: BUCKET_META.new.label },
              { id: "learning" as Filter, label: BUCKET_META.learning.label },
              { id: "familiar" as Filter, label: BUCKET_META.familiar.label },
              { id: "known" as Filter, label: BUCKET_META.known.label },
            ]).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${filter === f.id ? "text-violet-950" : "text-violet-200/60 hover:text-violet-100"}`}
                style={{ background: filter === f.id ? "#c4b5fd" : "rgba(255,255,255,0.05)", border: filter === f.id ? "1px solid #c4b5fd" : "1px solid rgba(255,255,255,0.12)" }}
              >
                {f.label}
              </button>
            ))}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="ml-auto rounded-full bg-white/5 border border-white/12 px-4 py-1.5 text-sm text-amber-100 placeholder:text-amber-300/30 outline-none focus:border-violet-400/50"
            />
          </div>
        )}

        {/* word list */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filtered.map((w) => (
              <WordRow key={w.arabic} w={w} say={say} onStar={() => toggleStar(w.arabic)} onRemove={() => remove(w.arabic)} />
            ))}
          </div>
        )}
        {stats.total > 0 && filtered.length === 0 && (
          <p className="text-sm text-amber-300/40 text-center py-6">No words match this filter.</p>
        )}
      </div>
    </main>
  );
}

function LevelDots({ level }: { level: number }) {
  const color = BUCKET_META[bucketOf(level)].color;
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: MAX_LEVEL }).map((_, i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: i < level ? color : "rgba(255,255,255,0.15)" }} />
      ))}
    </span>
  );
}

function WordRow({ w, say, onStar, onRemove }: { w: VocabWord; say: (t: string) => void; onStar: () => void; onRemove: () => void }) {
  const src = SOURCE_META[w.source] ?? SOURCE_META.manual;
  return (
    <div className="group flex items-center gap-3 rounded-2xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <button type="button" onClick={() => say(w.arabic)} className="flex-shrink-0 text-violet-300/50 hover:text-violet-200" aria-label="Hear word">
        <Volume2 className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-amber-50" style={{ fontFamily: NAF, direction: "rtl" }}>{w.arabic}</span>
          {w.translit && <span className="text-[11px] italic text-amber-300/40">{w.translit}</span>}
        </div>
        <p className="truncate text-sm text-amber-200/70" dir={w.lang === "he" ? "rtl" : "ltr"}>{w.meaning || "—"}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <LevelDots level={w.level} />
        <span className="text-[10px] text-amber-300/40">{src.emoji} {src.label}</span>
      </div>
      <button type="button" onClick={onStar} className="flex-shrink-0" aria-label="Star">
        <Star className={`h-4 w-4 ${w.starred ? "fill-yellow-300 text-yellow-300" : "text-amber-300/30 hover:text-amber-300/60"}`} />
      </button>
      <button type="button" onClick={onRemove} className="flex-shrink-0 text-amber-300/0 group-hover:text-amber-300/30 hover:!text-red-300 transition" aria-label="Remove">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ── spaced-repetition review session (flashcards) ── */
function Review({ queue, say, onReview, onDone }: { queue: VocabWord[]; say: (t: string) => void; onReview: (arabic: string, grade: Grade) => void; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);

  const w = queue[idx];
  const done = idx >= queue.length;

  const answer = (grade: Grade) => {
    onReview(w.arabic, grade);
    if (grade !== "again") setCorrect((c) => c + 1);
    setRevealed(false);
    setIdx((i) => i + 1);
  };

  const GRADES: { grade: Grade; label: string; bg: string; border: string; color: string }[] = [
    { grade: "again", label: "Again", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.5)", color: "#fca5a5" },
    { grade: "hard",  label: "Hard",  bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.5)", color: "#fcd34d" },
    { grade: "good",  label: "Good",  bg: "rgba(56,189,248,0.15)", border: "rgba(56,189,248,0.5)", color: "#7dd3fc" },
    { grade: "easy",  label: "Easy",  bg: "rgba(34,197,94,0.18)", border: "rgba(34,197,94,0.6)", color: "#86efac" },
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <div className="relative w-full max-w-xl mx-auto flex flex-col gap-5 px-4 py-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onDone} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> My Words
          </button>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300/60 ml-auto">🧠 Review</p>
        </div>

        {!done ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300/50">{idx + 1} / {queue.length}</span>
              <span className="text-xs text-amber-300/40">{correct} correct</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${(idx / queue.length) * 100}%`, background: "#a78bfa" }} />
            </div>

            {/* flashcard */}
            <div className="flex flex-col items-center gap-4 rounded-3xl px-6 py-12 text-center" style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(0,0,0,0) 100%)", border: "1px solid rgba(167,139,250,0.3)" }}>
              <button type="button" onClick={() => say(w.arabic)} className="flex items-center gap-2 group">
                <span className="text-5xl font-black text-amber-50 leading-tight" style={{ fontFamily: NAF, direction: "rtl" }}>{w.arabic}</span>
                <Volume2 className="h-5 w-5 text-violet-300/40 group-hover:text-violet-200" />
              </button>
              {revealed ? (
                <>
                  <p className="text-base italic text-amber-300/60">{w.translit}</p>
                  <p className="text-xl font-semibold text-amber-100" dir={w.lang === "he" ? "rtl" : "ltr"}>{w.meaning || "—"}</p>
                </>
              ) : (
                <p className="text-sm text-amber-300/40">Do you remember what it means?</p>
              )}
            </div>

            {!revealed ? (
              <button type="button" onClick={() => setRevealed(true)} className="rounded-2xl px-5 py-3 text-sm font-bold text-violet-950" style={{ background: "#c4b5fd" }}>
                Show answer
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {GRADES.map((g) => (
                  <button
                    key={g.grade}
                    type="button"
                    onClick={() => answer(g.grade)}
                    className="flex flex-col items-center gap-0.5 rounded-2xl px-2 py-3 text-sm font-bold transition hover:brightness-110"
                    style={{ background: g.bg, border: `1px solid ${g.border}`, color: g.color }}
                  >
                    {g.label}
                    <span className="text-[10px] font-semibold opacity-70">{nextDueLabel(w.level, g.grade)}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
              <Brain className="h-8 w-8 text-violet-200" />
            </div>
            <h1 className="text-2xl font-black text-amber-50">Review complete!</h1>
            <p className="text-4xl font-black text-violet-300">{correct}<span className="text-xl text-amber-300/40"> / {queue.length}</span></p>
            <p className="text-sm text-amber-200/60 max-w-xs">Nicely done. Words you missed will come back sooner; the ones you knew will return later.</p>
            <button type="button" onClick={onDone} className="mt-1 rounded-2xl px-5 py-2.5 text-sm font-bold text-violet-950" style={{ background: "#c4b5fd" }}>
              Back to My Words
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
