"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Lock, Check, X, Volume2, Trophy, Shirt } from "lucide-react";
import FarisCharacter from "@/components/faris/FarisCharacter";
import { speakJinn } from "@/lib/speech";
import { useSettings } from "@/lib/useSettings";
import { useAlbum } from "@/lib/useAlbum";
import { useProgress } from "@/lib/useProgress";
import { useWcProgress } from "@/lib/useWcProgress";
import {
  arabicScore,
  arabicResultPhrase,
  isSameDay,
  POSITION_AR,
  POSITION_EN,
  type WCData,
  type WCMatch,
  type WCTeam,
  type WCOutcome,
  type WCPlayer,
  type WCSquad,
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

const NAF = "var(--font-noto-naskh), serif";

type Modal =
  | { kind: "team"; team: WCTeam; group: string | null }
  | { kind: "match"; match: WCMatch }
  | null;

export default function AlbumPage() {
  const { settings } = useSettings();
  const { album, collectTeam, predictMatch, collectMatch } = useAlbum();
  const { progress, addXp } = useProgress();
  const { progress: wc, loaded: wcLoaded } = useWcProgress();

  const [data, setData] = useState<WCData | null>(null);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [tab, setTab] = useState<"teams" | "matches">("teams");

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

  // which group each team is in (from the fixtures)
  const groupByTeam = useMemo(() => {
    const m = new Map<string, string | null>();
    if (data) {
      for (const match of data.matches) {
        if (!m.has(match.home.code)) m.set(match.home.code, match.group);
        if (!m.has(match.away.code)) m.set(match.away.code, match.group);
      }
    }
    return m;
  }, [data]);

  const openTeam = useCallback(
    (team: WCTeam) => {
      setModal({ kind: "team", team, group: groupByTeam.get(team.code) ?? null });
    },
    [groupByTeam],
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

  // gate: the live album is the final chapter — unlocked after The Basics
  if (wcLoaded && !wc.basicsDone) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center flex flex-col items-center gap-4">
          <div className="w-[90px] aspect-[260/390]">
            <FarisCharacter state="idle" />
          </div>
          <Lock className="h-6 w-6 text-amber-300/50" />
          <h1 className="text-xl font-black text-amber-50">Finish training first</h1>
          <p className="text-sm text-amber-200/60">
            The live World Cup album is the final chapter. Complete <span className="font-bold text-green-300">The Basics</span> to unlock it.
          </p>
          <div className="flex gap-2">
            <Link href="/play/worldcup" className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-amber-300/70 hover:bg-white/5 transition">
              Journey
            </Link>
            <Link href="/play/worldcup/basics" className="rounded-2xl px-5 py-2.5 text-sm font-bold text-green-950" style={{ background: "#fde047" }}>
              Start The Basics →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="relative w-full flex flex-col gap-6 px-4 sm:px-8 lg:px-16 py-6">
        {/* nav */}
        <div className="flex items-center gap-3">
          <Link
            href="/play/worldcup"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Journey
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400/60 ml-auto">
            ⚽ World Cup Album
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
            <h1 className="text-2xl font-black text-amber-50">World Cup Album</h1>
            <p
              className="text-base text-amber-200/70"
              style={{ fontFamily: NAF, direction: "rtl" }}
            >
              ألبوم كأس العالم
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

        {/* ── TABS ── */}
        {data && (
          <div className="flex gap-1 rounded-2xl p-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {([
              { id: "teams" as const, label: "Teams", count: `${teamsCollected}/${data.teams.length}` },
              { id: "matches" as const, label: "Matches", count: `${matchesCollected}/${data.matches.length}` },
            ]).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-xl py-3 text-lg font-bold transition ${tab === t.id ? "text-green-950" : "text-amber-300/60 hover:text-amber-200"
                  }`}
                style={{ background: tab === t.id ? "#fde047" : "transparent" }}
              >
                {t.label} <span className="opacity-60 font-semibold">· {t.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── TEAMS TAB ── */}
        {data && tab === "teams" && (
          <section>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
              {data.teams.map((t) => {
                const got = !!album.teams[t.code];
                return (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => openTeam(t)}
                    className="group relative flex aspect-[4/3] items-end justify-center overflow-hidden rounded-2xl transition hover:scale-[1.03]"
                    style={{
                      background: got ? "#0a1f14" : "rgba(255,255,255,0.03)",
                      border: got ? "1px solid rgba(34,197,94,0.4)" : "1px dashed rgba(255,255,255,0.12)",
                    }}
                  >
                    {got ? (
                      <>
                        {/* flag fills the card */}
                        {t.flag ? (
                          <span
                            className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
                            style={{ fontSize: "5rem", transform: "scale(1.55)" }}
                          >
                            {t.flag}
                          </span>
                        ) : (
                          <span
                            className="pointer-events-none absolute inset-0 flex items-center justify-center text-3xl font-black text-white/25"
                            style={{ background: "linear-gradient(135deg,#1f7a42,#14532d)" }}
                          >
                            {t.abbr}
                          </span>
                        )}
                        {/* legibility scrim */}
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)" }}
                        />
                        {t.arab && <span className="absolute top-1 right-1.5 text-base drop-shadow">⭐</span>}
                        <div className="relative z-10 w-full px-1.5 pb-2 text-center">
                          <p
                            className="text-2xl sm:text-3xl font-black text-white leading-tight"
                            style={{ fontFamily: NAF, direction: "rtl", textShadow: "0 1px 4px rgba(0,0,0,0.95)" }}
                          >
                            {t.arabic}
                          </p>
                          <p className="text-sm text-white/80 italic leading-tight">{t.translit}</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                        <Lock className="h-6 w-6 text-amber-300/30" />
                        <span className="px-1.5 text-base font-medium text-amber-300/50 leading-tight text-center">{t.english}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── MATCHES TAB ── */}
        {data && tab === "matches" && (
          <section className="flex flex-col gap-5">
            {todayMatches.length > 0 && (
              <div>
                <p className="text-base font-semibold uppercase tracking-widest text-green-400/60 mb-3">
                  ⚽ Today&apos;s matches
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {todayMatches.map((m) => (
                    <MatchCard key={m.id} m={m} album={album} highlight onOpen={() => setModal({ kind: "match", match: m })} />
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-base font-semibold uppercase tracking-widest text-amber-400/50 mb-3">
                All matches
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedMatches.map((m) => (
                  <MatchCard key={m.id} m={m} album={album} onOpen={() => setModal({ kind: "match", match: m })} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ── MODALS ── */}
      {modal?.kind === "team" && (
        <TeamProfileModal
          team={modal.team}
          group={modal.group}
          collected={!!album.teams[modal.team.code]}
          voice={settings.arabicVoice}
          onCollect={() => onTeamCorrect(modal.team)}
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
      <Flag t={m.home} className="text-4xl flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-lg font-bold text-amber-50" style={{ fontFamily: NAF, direction: "rtl" }}>
          <span className="truncate">{m.home.arabic}</span>
          <span className="text-amber-300/40 text-base">×</span>
          <span className="truncate">{m.away.arabic}</span>
        </div>
        <p className="text-sm text-amber-300/50 mt-1">
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
      <Flag t={m.away} className="text-4xl flex-shrink-0" />
    </button>
  );
}

/* ──────────────────────────────────────────────────────────
   Team earning modal — recognise the Arabic name
   ────────────────────────────────────────────────────────── */
/* ──────────────────────────────────────────────────────────
   Team profile — a living phrasebook: nation + real squad with
   positions in Arabic. Collect by naming a player's position.
   ────────────────────────────────────────────────────────── */
function TeamProfileModal({
  team,
  group,
  collected,
  voice,
  onCollect,
  onClose,
}: {
  team: WCTeam;
  group: string | null;
  collected: boolean;
  voice: string;
  onCollect: () => void;
  onClose: () => void;
}) {
  const [squad, setSquad] = useState<WCSquad | null>(null);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<WCPlayer | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  const say = (t: string) => speakJinn(t, voice as never);

  useEffect(() => {
    if (!team.idTeam) { setLoading(false); return; }
    let active = true;
    fetch(`/api/worldcup/team/${team.idTeam}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((s: WCSquad) => {
        if (!active) return;
        setSquad(s);
        if (s.players.length) setTarget(s.players[Math.floor(Math.random() * s.players.length)]);
      })
      .catch(() => { })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [team.idTeam]);

  const grouped = useMemo(() => {
    const g: WCPlayer[][] = [[], [], [], []];
    squad?.players.forEach((p) => g[p.position].push(p));
    return g;
  }, [squad]);

  const choosePos = (i: number) => {
    if (picked != null || !target) return;
    setPicked(i);
    if (i === target.position) onCollect();
  };

  const revealSquad = collected || picked != null;

  return (
    <Overlay onClose={onClose} size="2xl">
      <div className="flex flex-col gap-4 max-h-[92vh]">
        {/* ── header ── */}
        <div className="flex items-center gap-3">
          <Flag t={team} className="text-7xl" />
          <div className="flex-1 min-w-0">
            <button type="button" onClick={() => say(team.arabic)} className="flex items-center gap-2 group">
              <span className="text-4xl font-black text-amber-50" style={{ fontFamily: NAF, direction: "rtl" }}>{team.arabic}</span>
              <Volume2 className="h-5 w-5 text-amber-300/40 group-hover:text-amber-200" />
            </button>
            <p className="text-base text-amber-300/55 italic">{team.translit} · {team.english}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {group && (
                <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-amber-200/70" style={{ background: "rgba(255,255,255,0.06)" }} dir="rtl">
                  {group}
                </span>
              )}
              {team.arab && (
                <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-yellow-300/80" style={{ background: "rgba(253,224,71,0.12)" }}>
                  ⭐ Arab nation
                </span>
              )}
              {collected && (
                <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-green-300" style={{ background: "rgba(34,197,94,0.14)" }}>
                  <Check className="h-3.5 w-3.5" /> Collected
                </span>
              )}
            </div>
          </div>
        </div>

        {loading && <p className="text-sm text-amber-300/50 text-center py-4">Loading squad…</p>}

        {/* ── no squad (offline / curated) ── */}
        {!loading && !squad && (
          <div className="text-center flex flex-col items-center gap-3 py-2">
            <p className="text-sm text-amber-200/60">Squad list is unavailable right now.</p>
            {!collected && (
              <button type="button" onClick={onCollect} className="rounded-2xl px-5 py-2.5 text-sm font-bold text-green-950" style={{ background: "#fde047" }}>
                Add to album · +5 XP
              </button>
            )}
          </div>
        )}

        {/* ── collect gate: name a player's position ── */}
        {!collected && squad && target && (
          <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <p className="text-base text-amber-200/75 text-center">
              Collect this team — <span className="font-bold">ما مركزه؟</span> what position does he play?
            </p>
            <button type="button" onClick={() => say(target.name)} className="flex items-center justify-center gap-2.5 group">
              {target.photo ? (
                <span className="relative">
                  <span className="block h-16 w-16 overflow-hidden rounded-full border-2 border-white/40" style={{ background: "rgba(255,255,255,0.12)" }}>
                    <Image
                      src={target.photo}
                      alt=""
                      width={320}
                      height={420}
                      quality={90}
                      sizes="90px"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: "center top", transform: "scale(2.6)", transformOrigin: "center top" }}
                    />
                  </span>
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-black text-white border border-white/50">{target.number}</span>
                </span>
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-amber-200">{target.number}</span>
              )}
              <span className="text-3xl font-black text-amber-50" style={{ fontFamily: NAF, direction: "rtl" }}>{target.name}</span>
              <Volume2 className="h-5 w-5 text-amber-300/40 group-hover:text-amber-200" />
            </button>
            <div className="grid grid-cols-2 gap-2">
              {POSITION_AR.map((pos, i) => {
                const isTarget = target.position === i;
                const isPicked = picked === i;
                const show = picked != null;
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => choosePos(i)}
                    disabled={show}
                    className="rounded-xl px-2 py-3 text-center transition"
                    style={{
                      background: show && isTarget ? "rgba(34,197,94,0.2)" : isPicked ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
                      border: show && isTarget ? "1px solid rgba(34,197,94,0.6)" : isPicked ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <span className="block text-2xl font-bold text-amber-100" style={{ fontFamily: NAF, direction: "rtl" }}>{pos}</span>
                    <span className="block text-sm text-amber-300/45">{POSITION_EN[i]}</span>
                  </button>
                );
              })}
            </div>
            {picked != null && picked !== target.position && (
              <p className="flex items-center justify-center gap-1 text-sm text-red-300/80">
                <X className="h-4 w-4" /> It&apos;s {POSITION_EN[target.position]} — see the squad below, then retry.
              </p>
            )}
          </div>
        )}

        {/* ── squad on the pitch (tap a shirt to hear the name) ── */}
        {squad && revealSquad && (
          <div className="overflow-y-auto pr-1">
            <p className="text-base text-amber-300/55 mb-3 text-center">
              Tap a shirt to hear the name · positions shown in Arabic
            </p>
            <Pitch grouped={grouped} onTap={say} />
          </div>
        )}
      </div>
    </Overlay>
  );
}

/* ──────────────────────────────────────────────────────────
   Football pitch — squad arranged in position lines (FW→GK).
   ────────────────────────────────────────────────────────── */
function Pitch({ grouped, onTap }: { grouped: WCPlayer[][]; onTap: (name: string) => void }) {
  const lanes = [3, 2, 1, 0]; // forwards on top → goalkeeper at the bottom
  return (
    <div
      className="relative rounded-2xl p-4 overflow-hidden"
      style={{
        background: "repeating-linear-gradient(180deg, #1f7a42 0 40px, #1b6e3a 40px 80px)",
        border: "2px solid rgba(255,255,255,0.25)",
      }}
    >
      {/* field markings */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-3 right-3 top-1/2 h-px" style={{ background: "rgba(255,255,255,0.22)" }} />
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{ width: 110, height: 110, transform: "translate(-50%,-50%)", border: "2px solid rgba(255,255,255,0.2)" }}
        />
        <div
          className="absolute left-1/2 top-0"
          style={{ width: 150, height: 40, transform: "translateX(-50%)", borderLeft: "2px solid rgba(255,255,255,0.18)", borderRight: "2px solid rgba(255,255,255,0.18)", borderBottom: "2px solid rgba(255,255,255,0.18)" }}
        />
        <div
          className="absolute left-1/2 bottom-0"
          style={{ width: 150, height: 40, transform: "translateX(-50%)", borderLeft: "2px solid rgba(255,255,255,0.18)", borderRight: "2px solid rgba(255,255,255,0.18)", borderTop: "2px solid rgba(255,255,255,0.18)" }}
        />
      </div>

      {/* position lines */}
      <div className="relative flex flex-col gap-3">
        {lanes.map((pos) => (
          <div key={pos} className="flex flex-col gap-2 py-1">
            {/* tappable position label (Arabic + English) */}
            <button
              type="button"
              onClick={() => onTap(POSITION_AR[pos])}
              className="self-start flex items-center gap-2 rounded-full px-3 py-1 transition hover:bg-black/40"
              style={{ background: "rgba(0,0,0,0.3)" }}
            >
              <Volume2 className="h-4 w-4 text-white/60" />
              <span className="text-2xl font-black text-white" style={{ fontFamily: NAF, direction: "rtl" }}>{POSITION_AR[pos]}</span>
              <span className="text-sm font-semibold uppercase tracking-wide text-white/55">{POSITION_EN[pos]}</span>
            </button>

            <div className="flex flex-wrap items-start justify-center gap-x-5 gap-y-4">
              {grouped[pos].length === 0 ? (
                <span className="text-base text-white/30">—</span>
              ) : (
                grouped[pos].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onTap(p.name)}
                    className="flex w-[104px] flex-col items-center gap-1.5 transition hover:scale-110"
                  >
                    {p.photo ? (
                      <span className="relative">
                        <span className="block h-[88px] w-[88px] overflow-hidden rounded-full border-2 border-white/70" style={{ background: "rgba(255,255,255,0.12)" }}>
                          <Image
                            src={p.photo}
                            alt=""
                            width={360}
                            height={470}
                            quality={90}
                            sizes="130px"
                            className="h-full w-full object-cover"
                            style={{ objectPosition: "center top", transform: "scale(2.6)", transformOrigin: "center top" }}
                          />
                        </span>
                        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white border border-white/50">{p.number}</span>
                      </span>
                    ) : (
                      <span className="relative inline-flex">
                        <Shirt className="h-[84px] w-[84px] text-red-600" fill="currentColor" strokeWidth={1.25} />
                        <span className="absolute inset-0 flex items-center justify-center pt-3 text-2xl font-black text-white">{p.number}</span>
                      </span>
                    )}
                    <span className="text-base font-semibold leading-tight text-center text-white" style={{ fontFamily: NAF, direction: "rtl", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                      {p.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
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
              className={`flex items-center gap-1.5 text-sm font-bold ${correct ? "text-green-300" : "text-red-300/80"
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
function Overlay({ children, onClose, size = "sm" }: { children: ReactNode; onClose: () => void; size?: "sm" | "md" | "xl" | "2xl" }) {
  const max = size === "2xl" ? "max-w-6xl" : size === "xl" ? "max-w-3xl" : size === "md" ? "max-w-md" : "max-w-sm";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,3,12,0.75)" }}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${max} rounded-3xl p-6`}
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
