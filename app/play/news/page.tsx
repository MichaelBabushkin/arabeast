"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, Sparkles, ExternalLink, X, Newspaper, ChevronLeft, ChevronRight, HelpCircle, Check } from "lucide-react";
import { speakJinn } from "@/lib/speech";
import { useSettings } from "@/lib/useSettings";
import ArabicGloss from "@/components/ArabicGloss";
import type { NewsItem } from "@/lib/news";
import type { NewsAssist } from "@/app/api/news/assist/route";
import type { WordGloss } from "@/app/api/news/word/route";
import type { NewsQuiz } from "@/app/api/news/quiz/route";

const NAF = "var(--font-noto-naskh), serif";

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - Date.parse(iso)) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const PAGE_SIZE = 12;

// keep only Arabic letters for the lookup (strip punctuation/diacritics edges)
const arabicOnly = (w: string) => w.replace(/[^ء-ي]/g, "");

/** Arabic text whose words are individually tappable (for tap-to-translate). */
function TappableArabic({ text, onWord, className, style }: { text: string; onWord: (w: string) => void; className?: string; style?: CSSProperties }) {
  const parts = text.split(/(\s+)/);
  return (
    <span className={className} dir="rtl" style={style}>
      {parts.map((p, i) => {
        if (/^\s+$/.test(p)) return <span key={i}>{p}</span>;
        const word = arabicOnly(p);
        if (!word) return <span key={i}>{p}</span>;
        return (
          <span
            key={i}
            onClick={(e) => { e.stopPropagation(); onWord(word); }}
            className="cursor-pointer rounded px-0.5 transition hover:bg-sky-400/25 hover:text-white"
          >
            {p}
          </span>
        );
      })}
    </span>
  );
}

export default function NewsPage() {
  const { settings, update } = useSettings();
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState<NewsItem | null>(null);
  const [source, setSource] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { items: NewsItem[] }) => setItems(d.items))
      .catch(() => setError(true));
  }, []);

  const say = useCallback((t: string) => speakJinn(t, settings.arabicVoice), [settings.arabicVoice]);

  // sources present (with counts) for the filter bar
  const sources = useMemo(() => {
    const map = new Map<string, { name: string; nameAr: string; count: number }>();
    for (const it of items ?? []) {
      const e = map.get(it.source) ?? { name: it.source, nameAr: it.sourceAr, count: 0 };
      e.count += 1;
      map.set(it.source, e);
    }
    return Array.from(map.values());
  }, [items]);

  const filtered = useMemo(
    () => (items ?? []).filter((i) => source === "all" || i.source === source),
    [items, source],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // reset to page 1 when the filter changes
  useEffect(() => { setPage(1); }, [source]);

  const goPage = (p: number) => {
    setPage(p);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen flex flex-col">
      <div className="relative w-full max-w-6xl mx-auto flex flex-col gap-6 px-4 sm:px-8 py-6">
        {/* nav */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Menu
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300/60 ml-auto">📰 Arabic News</p>
        </div>

        {/* header */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          style={{
            background: "linear-gradient(135deg, #071324 0%, #0c203b 50%, #153561 100%)",
            border: "1px solid rgba(14,165,233,0.3)",
            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
          }}
        >
          {/* radial glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, #0284c7 0%, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }}
          />

          <div className="relative flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
            <div 
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-sky-950/50" 
              style={{ 
                background: "linear-gradient(135deg, rgba(14,165,233,0.2) 0%, rgba(14,165,233,0.05) 100%)", 
                border: "1px solid rgba(14,165,233,0.4)" 
              }}
            >
              <Newspaper className="h-8 w-8 text-sky-300" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full text-sky-950 mb-2" style={{ background: "#7dd3fc" }}>
                WORLD NEWS • الأخبار
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Read the News in Arabic
              </h1>
              <p className="text-sm text-sky-200/50 mt-1.5 max-w-xl">
                Real Modern Standard Arabic headlines updated daily. Tap any story to hear the pronunciation, translate key vocabulary, and get instant explanations.
              </p>
            </div>
          </div>

          {/* translation / phrase box */}
          <div 
            className="relative flex flex-col justify-center gap-1.5 rounded-2xl p-4 sm:p-5 lg:max-w-xs w-full text-right animate-fade-in"
            style={{ 
              background: "rgba(15,23,42,0.45)", 
              border: "1px solid rgba(14,165,233,0.15)",
              backdropFilter: "blur(12px)"
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
              <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">Arabic Phrase</span>
              <button 
                type="button" 
                onClick={() => say("اقرأ الأخبار بالعربية")} 
                className="text-sky-300/40 hover:text-sky-200 transition"
                aria-label="Read header Arabic aloud"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-1">
              <span 
                className="block text-2xl font-black text-amber-100 leading-none select-all" 
                style={{ fontFamily: NAF, direction: "rtl" }}
              >
                اقرأ الأخبار بالعربية
              </span>
              <span className="block text-[11px] text-sky-200/40 italic mt-1 font-medium">
                iqra' al-akhbār bi-l-'arabiyya
              </span>
              <span className="block text-xs font-semibold text-sky-200/75 mt-0.5">
                {settings.language === "he" ? '"קרא את החדשות בערבית"' : '"Read the news in Arabic"'}
              </span>
            </div>
          </div>

          {/* language toggle */}
          <div className="flex flex-row lg:flex-col items-center gap-2 self-end lg:self-center">
            <span className="text-[10px] font-bold text-sky-200/45 uppercase tracking-widest lg:block hidden">Language</span>
            <div className="flex overflow-hidden rounded-xl border border-white/10 text-xs font-bold bg-slate-950/40">
              {(["en", "he"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => update({ language: l })}
                  className={`px-3 py-2 transition ${settings.language === l ? "bg-sky-500/30 text-white border-b-2 border-sky-400" : "text-sky-200/50 hover:text-sky-100"}`}
                >
                  {l === "en" ? "ENGLISH" : "עברית"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-300/80">Could not load the news right now. Please try again.</p>}
        {!items && !error && <p className="text-sm text-amber-300/50">Loading today&apos;s headlines…</p>}

        {/* source filter */}
        {items && items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <SourceChip en="All" active={source === "all"} count={items.length} onClick={() => setSource("all")} />
            {sources.map((s) => (
              <SourceChip key={s.name} ar={s.nameAr} en={s.name} active={source === s.name} count={s.count} onClick={() => setSource(s.name)} />
            ))}
          </div>
        )}

        {/* list */}
        {items && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pageItems.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setOpen(it)}
                className="group flex flex-col overflow-hidden rounded-3xl text-right transition hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Thumb item={it} />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="rounded-full px-2 py-0.5 font-semibold text-sky-200/80" style={{ background: "rgba(125,185,255,0.12)" }}>
                      <ArabicGloss ar={it.sourceAr} en={it.source} enClassName="text-[10px] opacity-60" />
                    </span>
                    <span className="text-amber-300/40">{timeAgo(it.pubDate)}</span>
                  </div>
                  <h2 className="text-lg font-bold text-amber-50 leading-snug" style={{ fontFamily: NAF, direction: "rtl" }}>{it.title}</h2>
                  {it.summary && <p className="text-sm text-amber-200/55 leading-snug line-clamp-2" style={{ fontFamily: NAF, direction: "rtl" }}>{it.summary}</p>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* pagination */}
        {items && pageCount > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => goPage(safePage - 1)}
              disabled={safePage <= 1}
              className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-sky-200/70 disabled:opacity-30 hover:bg-white/5 transition"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <span className="text-sm text-amber-200/60">Page {safePage} / {pageCount}</span>
            <button
              type="button"
              onClick={() => goPage(safePage + 1)}
              disabled={safePage >= pageCount}
              className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-sky-200/70 disabled:opacity-30 hover:bg-white/5 transition"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {open && <Reader item={open} language={settings.language} say={say} onClose={() => setOpen(null)} />}
    </main>
  );
}

/* ── source filter chip ── */
function SourceChip({ ar, en, count, active, onClick }: { ar?: string; en: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${active ? "text-sky-950" : "text-sky-200/70 hover:text-sky-100"}`}
      style={{ background: active ? "#7dd3fc" : "rgba(255,255,255,0.05)", border: active ? "1px solid #7dd3fc" : "1px solid rgba(255,255,255,0.12)" }}
    >
      {ar ? (
        <ArabicGloss ar={ar} en={en} enClassName={`text-[11px] ${active ? "text-sky-900/60" : "text-sky-200/45"}`} />
      ) : (
        <span>{en}</span>
      )}
      <span className={`text-[11px] ${active ? "text-sky-900/70" : "text-sky-200/40"}`}>{count}</span>
    </button>
  );
}

function sourceAccent(source: string): string {
  if (source.includes("BBC")) return "#7f1d1d";
  if (source.includes("DW")) return "#0c4a6e";
  if (source.includes("Arabiya")) return "#134e4a";
  return "#1e293b";
}

/* ── card thumbnail with placeholder + broken-image fallback ── */
function Thumb({ item }: { item: NewsItem }) {
  const [errored, setErrored] = useState(false);
  if (item.thumbnail && !errored) {
    return <img src={item.thumbnail} alt="" onError={() => setErrored(true)} className="aspect-video w-full object-cover" loading="lazy" />;
  }
  const accent = sourceAccent(item.source);
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent} 0%, #0a1322 100%)` }}>
      <Newspaper className="h-12 w-12 text-white/15" />
      <span className="absolute bottom-2 right-3 text-sm font-bold text-white/25" style={{ fontFamily: NAF, direction: "rtl" }}>{item.sourceAr}</span>
    </div>
  );
}

/* ── Article reader with read-aloud + AI assist ── */
function Reader({
  item,
  language,
  say,
  onClose,
}: {
  item: NewsItem;
  language: "en" | "he";
  say: (t: string) => void;
  onClose: () => void;
}) {
  const [assist, setAssist] = useState<NewsAssist | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  // tap-a-word translation
  const wordCache = useRef<Map<string, WordGloss>>(new Map());
  const [tapped, setTapped] = useState<{ word: string; translit?: string; meaning?: string; loading: boolean; failed?: boolean } | null>(null);

  // comprehension question
  const [quiz, setQuiz] = useState<NewsQuiz | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizFailed, setQuizFailed] = useState(false);
  const [quizPicked, setQuizPicked] = useState<number | null>(null);

  const fullText = `${item.title}\n\n${item.summary}`.trim();
  const enLang = language === "he" ? "Hebrew" : "English";

  const explain = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/news/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText, language }),
      });
      if (!res.ok) throw new Error();
      setAssist((await res.json()) as NewsAssist);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const onWord = async (word: string) => {
    const cached = wordCache.current.get(word);
    if (cached) { setTapped({ word, ...cached, loading: false }); return; }
    setTapped({ word, loading: true });
    try {
      const res = await fetch("/api/news/word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, context: fullText, language }),
      });
      if (!res.ok) throw new Error();
      const g = (await res.json()) as WordGloss;
      wordCache.current.set(word, g);
      setTapped({ word, ...g, loading: false });
    } catch {
      setTapped({ word, loading: false, failed: true });
    }
  };

  const loadQuiz = async () => {
    setQuizLoading(true);
    setQuizFailed(false);
    setQuizPicked(null);
    try {
      const res = await fetch("/api/news/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText, language }),
      });
      if (!res.ok) throw new Error();
      setQuiz((await res.json()) as NewsQuiz);
    } catch {
      setQuizFailed(true);
    } finally {
      setQuizLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4" style={{ background: "rgba(5,3,12,0.78)" }} onClick={onClose}>
      <div
        className="relative my-6 w-full max-w-2xl rounded-3xl p-6"
        style={{ background: "#0c1626", border: "1px solid rgba(125,185,255,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} className="absolute top-3 right-3 text-sky-200/50 hover:text-sky-100" aria-label="Close">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-[11px] mb-3">
          <span className="rounded-full px-2 py-0.5 font-semibold text-sky-200/80" style={{ background: "rgba(125,185,255,0.12)" }}>
            <ArabicGloss ar={item.sourceAr} en={item.source} enClassName="text-[10px] opacity-60" />
          </span>
          <span className="text-amber-300/40">{timeAgo(item.pubDate)}</span>
        </div>

        {item.thumbnail && (
          <img src={item.thumbnail} alt="" className="mb-4 aspect-video w-full rounded-2xl object-cover" />
        )}

        {/* title + read aloud (tap a word to translate) */}
        <div className="flex items-start gap-2">
          <button type="button" onClick={() => say(item.title)} className="mt-1 flex-shrink-0 text-sky-300/60 hover:text-sky-200" aria-label="Read title aloud">
            <Volume2 className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-black text-amber-50 leading-snug" dir="rtl">
            <TappableArabic text={item.title} onWord={onWord} style={{ fontFamily: NAF }} />
          </h1>
        </div>
        <p className="ml-7 mt-1 text-[11px] text-sky-300/40">Tap any word for its meaning.</p>

        {item.summary && (
          <div className="mt-3 flex items-start gap-2">
            <button type="button" onClick={() => say(item.summary)} className="mt-1 flex-shrink-0 text-sky-300/40 hover:text-sky-200" aria-label="Read summary aloud">
              <Volume2 className="h-4 w-4" />
            </button>
            <p className="text-lg text-amber-100/85 leading-relaxed" dir="rtl">
              <TappableArabic text={item.summary} onWord={onWord} style={{ fontFamily: NAF }} />
            </p>
          </div>
        )}

        {/* tapped-word gloss */}
        {tapped && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl p-3" style={{ background: "rgba(125,185,255,0.1)", border: "1px solid rgba(125,185,255,0.3)" }}>
            <button type="button" onClick={() => say(tapped.word)} className="flex-shrink-0 text-sky-300/60 hover:text-sky-200" aria-label="Read word aloud">
              <Volume2 className="h-4 w-4" />
            </button>
            <span className="text-2xl font-black text-sky-50" style={{ fontFamily: NAF, direction: "rtl" }}>{tapped.word}</span>
            {tapped.loading ? (
              <span className="text-sm text-sky-200/50">…</span>
            ) : tapped.failed ? (
              <span className="text-sm text-red-300/70">no result — tap again</span>
            ) : (
              <>
                <span className="text-xs italic text-sky-200/50">{tapped.translit}</span>
                <span className="ml-auto text-base font-semibold text-sky-100" dir={language === "he" ? "rtl" : "ltr"}>{tapped.meaning}</span>
              </>
            )}
            <button type="button" onClick={() => setTapped(null)} className="flex-shrink-0 text-sky-200/40 hover:text-sky-100" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* actions */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {!assist && (
            <button
              type="button"
              onClick={explain}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-sky-950 disabled:opacity-60"
              style={{ background: "#7dd3fc" }}
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Thinking…" : `Explain in ${enLang}`}
            </button>
          )}
          {!quiz && (
            <button
              type="button"
              onClick={loadQuiz}
              disabled={quizLoading}
              className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-sky-200/80 hover:bg-white/5 transition disabled:opacity-60"
            >
              <HelpCircle className="h-4 w-4" />
              {quizLoading ? "Writing…" : "Check understanding"}
            </button>
          )}
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-amber-300/70 hover:bg-white/5 transition"
          >
            <ExternalLink className="h-4 w-4" /> Full article
          </a>
        </div>

        {quizFailed && <p className="mt-3 text-sm text-red-300/80">Couldn&apos;t write a question right now — try again.</p>}

        {/* comprehension question */}
        {quiz && (
          <div className="mt-5 rounded-2xl p-4" style={{ background: "rgba(125,185,255,0.06)", border: "1px solid rgba(125,185,255,0.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="h-4 w-4 text-sky-300/70" />
              <p className="text-sm font-bold text-sky-100" dir={language === "he" ? "rtl" : "ltr"}>{quiz.question}</p>
            </div>
            <div className="flex flex-col gap-2">
              {quiz.options.map((opt, i) => {
                const show = quizPicked != null;
                const isCorrect = i === quiz.answer;
                const isPicked = quizPicked === i;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={show}
                    onClick={() => setQuizPicked(i)}
                    className="flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-amber-100 transition"
                    dir={language === "he" ? "rtl" : "ltr"}
                    style={{
                      background: show && isCorrect ? "rgba(34,197,94,0.18)" : isPicked ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
                      border: show && isCorrect ? "1px solid rgba(34,197,94,0.6)" : isPicked ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <span>{opt}</span>
                    {show && isCorrect && <Check className="h-4 w-4 flex-shrink-0 text-green-300" />}
                    {show && isPicked && !isCorrect && <X className="h-4 w-4 flex-shrink-0 text-red-300" />}
                  </button>
                );
              })}
            </div>
            {quizPicked != null && (
              <p className="mt-3 text-sm text-sky-200/70" dir={language === "he" ? "rtl" : "ltr"}>{quiz.explanation}</p>
            )}
          </div>
        )}

        {failed && <p className="mt-3 text-sm text-red-300/80">Couldn&apos;t generate help right now — try again.</p>}

        {/* AI assist result */}
        {assist && (
          <div className="mt-5 flex flex-col gap-4">
            <div className="rounded-2xl p-4" style={{ background: "rgba(125,185,255,0.08)", border: "1px solid rgba(125,185,255,0.2)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-300/60 mb-1">Translation</p>
              <p className="text-base text-sky-50 leading-relaxed" dir={language === "he" ? "rtl" : "ltr"}>{assist.translation}</p>
            </div>

            <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50">Simpler Arabic</p>
                <button type="button" onClick={() => say(assist.simplified)} className="text-amber-300/50 hover:text-amber-200" aria-label="Read aloud">
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-lg text-amber-100 leading-relaxed" style={{ fontFamily: NAF, direction: "rtl" }}>{assist.simplified}</p>
            </div>

            {assist.vocab?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50 mb-2">Key words</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {assist.vocab.map((v) => (
                    <button
                      key={v.arabic}
                      type="button"
                      onClick={() => say(v.arabic)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-white/5"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <Volume2 className="h-3.5 w-3.5 flex-shrink-0 text-amber-300/40" />
                      <span className="text-lg font-bold text-amber-100" style={{ fontFamily: NAF, direction: "rtl" }}>{v.arabic}</span>
                      <span className="text-[11px] text-amber-300/40 italic">{v.translit}</span>
                      <span className="ml-auto text-sm text-amber-200/70" dir={language === "he" ? "rtl" : "ltr"}>{v.meaning}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
