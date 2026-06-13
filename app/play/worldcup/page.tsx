"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Sparkles, Check, X, Volume2, Trophy } from "lucide-react";
import FarisCharacter from "@/components/faris/FarisCharacter";
import { speakJinn } from "@/lib/speech";
import { useSettings } from "@/lib/useSettings";
import { useAlbum } from "@/lib/useAlbum";
import { useProgress } from "@/lib/useProgress";
import {
  arabicScore,
  arabicResultPhrase,
  isSameDay,
  type WCData,
  type WCMatch,
  type WCTeam,
  type WCOutcome,
} from "@/lib/worldcup";

/** Emoji flag when we have one, otherwise the FIFA tricode as a badge. */
function Flag({ t, className }: { t: WCTeam; className?: string }) {
  if (t.flag) return <span className={className}>{t.flag}</span>;
  return (
    <span
      className={`inline-flex items-center justify-center rounded bg-white/10 px-1.5 font-black tracking-tight text-amber-200/80 ${className ?? ""}`}
      style={{ fontSize: "0.5em", lineHeight: 1.6 }}
    >
      {t.abbr}
    </span>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

const NAF = "var(--font-noto-naskh), serif";

type Modal =
  | { kind: "team"; team: WCTeam; options: string[] }
  | { kind: "match"; match: WCMatch }
  | null;

export default function WorldCupPage() {
  const { settings } = useSettings();
  const { album, collectTeam, predictMatch, collectMatch } = useAlbum();
  const { progress, addXp } = useProgress();

  const [data, setData] = useState<WCData | null>(null);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState<Modal>(null);

  useEffect(() => {
    fetch("/api/worldcup")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: WCData) => setData(d))
      .catch(() => setError(true));
  }, []);

  const sortedMatches = useMemo(
    () => (data ? [...data.matches].sort((a, b) => a.utcDate.localeCompare(b.utcDate)) : []),
    [data],
  );
  const todayMatches = useMemo(
    () => sortedMatches.filter((m) => isSameDay(m.utcDate)),
    [sortedMatches],
  );

  const teamsCollected = data ? data.teams.filter((t) => album.teams[t.code]).length : 0;
  const matchesCollected = data
    ? data.matches.filter((m) => album.matches[m.id]?.collectedAt).length
    : 0;
  const total = data ? data.teams.length + data.matches.length : 0;
  const collected = teamsCollected + matchesCollected;

  const openTeam = useCallback(
    (team: WCTeam) => {
      if (!data) return;
      const distractors = shuffle(data.teams.filter((t) => t.code !== team.code))
        .slice(0, 3)
        .map((t) => t.arabic);
      setModal({ kind: "team", team, options: shuffle([team.arabic, ...distractors]) });
    },
    [data],
  );

  const onTeamCorrect = useCallback(
    (team: WCTeam) => {
      collectTeam(team.code);
      speakJinn(team.arabic, settings.arabicVoice);
      addXp(progress.xp + 5);
    },
    [collectTeam, addXp, progress.xp, settings.arabicVoice],
  );

  const onPredict = useCallback(
    (id: string, outcome: WCOutcome) => {
      predictMatch(id, outcome);
      setModal(null);
    },
    [predictMatch],
  );

  const onCollectMatch = useCallback(
    (m: WCMatch) => {
      const predicted = album.matches[m.id]?.predicted;
      const correct = predicted != null ? predicted === m.winner : undefined;
      collectMatch(m.id, correct);
      speakJinn(arabicResultPhrase(m), settings.arabicVoice);
      addXp(progress.xp + 10 + (correct ? 10 : 0));
      setModal(null);
    },
    [album.matches, collectMatch, addXp, progress.xp, settings.arabicVoice],
  );

  return (
    <main className="min-h-screen flex flex-col">
      <div className="relative mx-auto w-full max-w-4xl flex flex-col gap-6 px-4 py-6">
        {/* nav */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Menu
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400/60 ml-auto">
            ⚽ Mundial Album
          </p>
        </div>

        {/* header */}
        <div
          className="relative overflow-hidden rounded-3xl p-5 flex items-center gap-4"
          style={{
            background:
              "linear-gradient(110deg, rgba(34,197,94,0.22) 0%, rgba(21,128,61,0.12) 50%, rgba(253,224,71,0.14) 100%)",
            border: "1px solid rgba(253,224,71,0.4)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            aria-hidden
            style={{ background: "repeating-linear-gradient(90deg, #fff 0 18px, transparent 18px 36px)" }}
          />
          <div className="w-[70px] flex-shrink-0 aspect-[260/390]">
            <FarisCharacter state="idle" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-amber-50">Album al-Mundial</h1>
            <p
              className="text-base text-amber-200/70"
              style={{ fontFamily: NAF, direction: "rtl" }}
            >
              ألبوم المونديال
            </p>
            <p className="text-sm text-amber-200/60 mt-1">
              Collect a card for every team and match — earned in Arabic.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-center justify-center px-4">
            <Trophy className="h-6 w-6 text-yellow-300 mb-1" />
            <p className="text-xl font-black text-amber-50">{collected}</p>
            <p className="text-[10px] text-amber-300/50">of {total}</p>
          </div>
        </div>

        {data?.source === "curated" && (
          <p className="-mt-3 text-[11px] text-amber-300/40">
            Showing sample fixtures — live FIFA data is momentarily unavailable.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-300/80">Could not load World Cup data. Please try again.</p>
        )}
        {!data && !error && <p className="text-sm text-amber-300/50">Loading the tournament…</p>}

        {/* ── TODAY ── */}
        {todayMatches.length > 0 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-400/60 mb-3">
              ⚽ Today&apos;s matches
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todayMatches.map((m) => (
                <MatchCard key={m.id} m={m} album={album} highlight onOpen={() => setModal({ kind: "match", match: m })} />
              ))}
            </div>
          </section>
        )}

        {/* ── TEAMS ── */}
        {data && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50 mb-3">
              Teams · {teamsCollected}/{data.teams.length}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {data.teams.map((t) => {
                const got = !!album.teams[t.code];
                return (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => (got ? speakJinn(t.arabic, settings.arabicVoice) : openTeam(t))}
                    className="relative flex flex-col items-center gap-1 rounded-2xl px-2 py-3 transition hover:scale-[1.03]"
                    style={{
                      background: got ? "rgba(34,197,94,0.10)" : "rgba(255,255,255,0.03)",
                      border: got ? "1px solid rgba(34,197,94,0.35)" : "1px dashed rgba(255,255,255,0.12)",
                    }}
                  >
                    {got && t.arab && (
                      <span className="absolute top-1.5 right-1.5 text-[10px]">⭐</span>
                    )}
                    <span className="text-3xl" style={{ filter: got ? "none" : "grayscale(1) opacity(0.35)" }}>
                      {got ? <Flag t={t} /> : <Lock className="h-6 w-6 text-amber-300/30" />}
                    </span>
                    {got ? (
                      <>
                        <span className="text-sm font-bold text-amber-100 leading-tight text-center" style={{ fontFamily: NAF, direction: "rtl" }}>
                          {t.arabic}
                        </span>
                        <span className="text-[10px] text-amber-300/40 italic text-center leading-none">{t.translit}</span>
                      </>
                    ) : (
                      <span className="text-[11px] text-amber-300/40">{t.english}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── MATCHES ── */}
        {data && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50 mb-3">
              Matches · {matchesCollected}/{data.matches.length}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedMatches.map((m) => (
                <MatchCard key={m.id} m={m} album={album} onOpen={() => setModal({ kind: "match", match: m })} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── MODALS ── */}
      {modal?.kind === "team" && (
        <TeamModal
          team={modal.team}
          options={modal.options}
          voice={settings.arabicVoice}
          onCorrect={() => onTeamCorrect(modal.team)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "match" && (
        <MatchModal
          m={modal.match}
          album={album}
          voice={settings.arabicVoice}
          onPredict={(o) => onPredict(modal.match.id, o)}
          onCollect={() => onCollectMatch(modal.match)}
          onClose={() => setModal(null)}
        />
      )}
    </main>
  );
}

/* ──────────────────────────────────────────────────────────
   Match card (grid tile)
   ────────────────────────────────────────────────────────── */
function MatchCard({
  m,
  album,
  highlight,
  onOpen,
}: {
  m: WCMatch;
  album: ReturnType<typeof useAlbum>["album"];
  highlight?: boolean;
  onOpen: () => void;
}) {
  const entry = album.matches[m.id];
  const done = !!entry?.collectedAt;
  const finished = m.status === "FINISHED";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-2 rounded-2xl px-3 py-3 text-left transition hover:scale-[1.01]"
      style={{
        background: done
          ? "rgba(253,224,71,0.08)"
          : highlight
          ? "rgba(34,197,94,0.12)"
          : "rgba(255,255,255,0.03)",
        border: done
          ? "1px solid rgba(253,224,71,0.4)"
          : highlight
          ? "1px solid rgba(34,197,94,0.4)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Flag t={m.home} className="text-2xl flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-bold text-amber-50" style={{ fontFamily: NAF, direction: "rtl" }}>
          <span className="truncate">{m.home.arabic}</span>
          <span className="text-amber-300/40 text-xs">×</span>
          <span className="truncate">{m.away.arabic}</span>
        </div>
        <p className="text-[11px] text-amber-300/40 mt-0.5">
          {done ? (
            <span className="font-bold text-yellow-300" style={{ direction: "rtl" }}>
              {arabicScore(m.score.home, m.score.away)}
              {entry?.correct && " ✨"}
            </span>
          ) : finished ? (
            "النتيجة جاهزة · Result ready →"
          ) : entry?.predicted ? (
            "توقعت · awaiting result"
          ) : (
            "توقع النتيجة · Predict →"
          )}
        </p>
      </div>
      <Flag t={m.away} className="text-2xl flex-shrink-0" />
    </button>
  );
}

/* ──────────────────────────────────────────────────────────
   Team earning modal — recognise the Arabic name
   ────────────────────────────────────────────────────────── */
function TeamModal({
  team,
  options,
  voice,
  onCorrect,
  onClose,
}: {
  team: WCTeam;
  options: string[];
  voice: string;
  onCorrect: () => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const choose = (opt: string) => {
    if (won) return;
    setPicked(opt);
    if (opt === team.arabic) {
      setWon(true);
      onCorrect();
    }
  };

  return (
    <Overlay onClose={onClose}>
      {won ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <Sparkles className="h-7 w-7 text-yellow-300" />
          <Flag t={team} className="text-6xl" />
          <p className="text-2xl font-black text-amber-50" style={{ fontFamily: NAF, direction: "rtl" }}>
            {team.arabic}
          </p>
          <p className="text-sm text-amber-300/60 italic">{team.translit} · {team.english}</p>
          <button
            type="button"
            onClick={() => speakJinn(team.arabic, voice as never)}
            className="flex items-center gap-1.5 text-xs text-amber-300/60 hover:text-amber-200"
          >
            <Volume2 className="h-4 w-4" /> Hear it
          </button>
          <p className="text-xs font-bold text-green-300 mt-1">Card collected! +5 XP</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 rounded-2xl px-5 py-2.5 text-sm font-bold text-green-950"
            style={{ background: "#fde047" }}
          >
            Add to album
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <Flag t={team} className="text-6xl" />
          <p className="text-sm text-amber-200/70">
            Faris asks: which one is <span className="font-bold text-amber-100">{team.english}</span> in Arabic?
          </p>
          <div className="grid grid-cols-2 gap-2 w-full">
            {options.map((opt) => {
              const wrong = picked === opt && opt !== team.arabic;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => choose(opt)}
                  className="rounded-xl px-3 py-3 text-lg font-bold text-amber-100 transition"
                  style={{
                    background: wrong ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
                    border: wrong ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.12)",
                    fontFamily: NAF,
                    direction: "rtl",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {picked && picked !== team.arabic && (
            <p className="flex items-center gap-1 text-xs text-red-300/80">
              <X className="h-3.5 w-3.5" /> Not quite — try again!
            </p>
          )}
        </div>
      )}
    </Overlay>
  );
}

/* ──────────────────────────────────────────────────────────
   Match modal — predict (pre-match) or reveal+collect (finished)
   ────────────────────────────────────────────────────────── */
function MatchModal({
  m,
  album,
  voice,
  onPredict,
  onCollect,
  onClose,
}: {
  m: WCMatch;
  album: ReturnType<typeof useAlbum>["album"];
  voice: string;
  onPredict: (o: WCOutcome) => void;
  onCollect: () => void;
  onClose: () => void;
}) {
  const entry = album.matches[m.id];
  const finished = m.status === "FINISHED";
  const done = !!entry?.collectedAt;
  const predicted = entry?.predicted;

  const Heading = (
    <div className="flex items-center justify-center gap-3 text-center">
      <div className="flex flex-col items-center">
        <Flag t={m.home} className="text-4xl" />
        <span className="text-sm font-bold text-amber-100" style={{ fontFamily: NAF, direction: "rtl" }}>{m.home.arabic}</span>
      </div>
      <span className="text-amber-300/40 font-black">ضد</span>
      <div className="flex flex-col items-center">
        <Flag t={m.away} className="text-4xl" />
        <span className="text-sm font-bold text-amber-100" style={{ fontFamily: NAF, direction: "rtl" }}>{m.away.arabic}</span>
      </div>
    </div>
  );

  // ── finished: reveal + collect ──
  if (finished) {
    const correct = predicted != null ? predicted === m.winner : undefined;
    return (
      <Overlay onClose={onClose}>
        <div className="flex flex-col items-center gap-4 text-center">
          {Heading}
          <p className="text-4xl font-black text-yellow-300" style={{ direction: "rtl" }}>
            {arabicScore(m.score.home, m.score.away)}
          </p>
          <button
            type="button"
            onClick={() => speakJinn(arabicResultPhrase(m), voice as never)}
            className="flex items-center gap-1.5 text-sm text-amber-300/70 hover:text-amber-200"
            style={{ fontFamily: NAF, direction: "rtl" }}
          >
            <Volume2 className="h-4 w-4" /> {arabicResultPhrase(m)}
          </button>

          {predicted != null && (
            <p
              className={`flex items-center gap-1.5 text-sm font-bold ${
                correct ? "text-green-300" : "text-red-300/80"
              }`}
            >
              {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {correct ? "Your prediction was right! +10 bonus ✨" : "Prediction missed"}
            </p>
          )}

          {!done ? (
            <button
              type="button"
              onClick={onCollect}
              className="rounded-2xl px-5 py-2.5 text-sm font-bold text-green-950"
              style={{ background: "#fde047" }}
            >
              Collect card · +{10 + (correct ? 10 : 0)} XP
            </button>
          ) : (
            <p className="text-xs text-amber-300/50">Already in your album ✓</p>
          )}
        </div>
      </Overlay>
    );
  }

  // ── upcoming: predict ──
  return (
    <Overlay onClose={onClose}>
      <div className="flex flex-col items-center gap-4 text-center">
        {Heading}
        <p className="text-sm text-amber-200/70">
          {predicted ? "You predicted:" : "من سيفوز؟ · Who will win? Predict in Arabic:"}
        </p>
        <div className="flex flex-col gap-2 w-full">
          {([
            { o: "HOME" as const, label: `يفوز ${m.home.arabic}`, sub: `${m.home.english} win` },
            { o: "DRAW" as const, label: "تعادل", sub: "Draw" },
            { o: "AWAY" as const, label: `يفوز ${m.away.arabic}`, sub: `${m.away.english} win` },
          ]).map(({ o, label, sub }) => {
            const chosen = predicted === o;
            return (
              <button
                key={o}
                type="button"
                onClick={() => onPredict(o)}
                className="flex items-center justify-between rounded-xl px-4 py-3 transition"
                style={{
                  background: chosen ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.05)",
                  border: chosen ? "1px solid rgba(34,197,94,0.5)" : "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <span className="text-lg font-bold text-amber-100" style={{ fontFamily: NAF, direction: "rtl" }}>
                  {label}
                </span>
                <span className="text-[11px] text-amber-300/40">{sub}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-amber-300/40">Come back after the match to collect the result card.</p>
      </div>
    </Overlay>
  );
}

/* ── shared overlay shell ── */
function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,3,12,0.75)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl p-6"
        style={{ background: "#140b22", border: "1px solid rgba(212,160,23,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-amber-300/40 hover:text-amber-200"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
