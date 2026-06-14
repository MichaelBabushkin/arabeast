"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Volume2, Check, X, RotateCcw, Users } from "lucide-react";
import FarisCharacter, { type FarisState } from "@/components/faris/FarisCharacter";
import { speakJinn } from "@/lib/speech";
import { useSettings } from "@/lib/useSettings";
import { useProgress } from "@/lib/useProgress";
import { POSITION_AR, POSITION_EN, type WCData, type WCTeam, type WCSquad, type WCPlayer } from "@/lib/worldcup";

const NAF = "var(--font-noto-naskh), serif";
const QUIZ_LEN = 8;

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

type Question =
  | { kind: "name"; player: WCPlayer; options: string[] }
  | { kind: "face"; player: WCPlayer; options: WCPlayer[] }
  | { kind: "position"; player: WCPlayer };

function buildQuiz(players: WCPlayer[], n = QUIZ_LEN): Question[] {
  const pool = shuffle(players).slice(0, Math.min(n, players.length));
  return pool.map((player) => {
    const others = players.filter((p) => p.id !== player.id);
    const r = Math.random();
    if (r < 0.4) {
      const names = shuffle([player.name, ...shuffle(others).slice(0, 3).map((p) => p.name)]);
      return { kind: "name", player, options: names };
    }
    if (r < 0.8) {
      const faces = shuffle([player, ...shuffle(others).slice(0, 3)]);
      return { kind: "face", player, options: faces };
    }
    return { kind: "position", player };
  });
}

/** Square FIFA flag. */
function FlagImg({ code, className }: { code: string; className?: string }) {
  return <img src={`https://api.fifa.com/api/v3/picture/flags-sq-4/${code}`} alt="" className={className} />;
}

function Avatar({ player, size = 96 }: { player: WCPlayer; size?: number }) {
  return (
    <span
      className="block overflow-hidden rounded-2xl border-2 border-white/70"
      style={{ width: size, height: size, background: "rgba(255,255,255,0.1)" }}
    >
      {player.photo ? (
        <Image
          src={player.photo}
          alt=""
          width={Math.round(size * 3)}
          height={Math.round(size * 3.8)}
          quality={90}
          sizes={`${size * 1.5}px`}
          className="h-full w-full object-cover"
          style={{ objectPosition: "center top", transform: "scale(3)", transformOrigin: "center top" }}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-2xl font-black text-amber-200/60">{player.number}</span>
      )}
    </span>
  );
}

type Phase = "pick" | "loading" | "quiz" | "result" | "error";

export default function PlayersGamePage() {
  const { settings } = useSettings();
  const { progress, addXp } = useProgress();
  const say = useCallback((t: string) => speakJinn(t, settings.arabicVoice), [settings.arabicVoice]);

  const [data, setData] = useState<WCData | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [team, setTeam] = useState<WCTeam | null>(null);

  const [quiz, setQuiz] = useState<Question[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<string | number | null>(null);
  const [score, setScore] = useState(0);
  const [faris, setFaris] = useState<FarisState>("idle");

  useEffect(() => {
    fetch("/api/worldcup")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: WCData) => setData(d))
      .catch(() => { });
  }, []);

  const teams = useMemo(
    () => (data ? [...data.teams].sort((a, b) => a.english.localeCompare(b.english)) : []),
    [data],
  );

  const startTeam = useCallback(async (t: WCTeam) => {
    setTeam(t);
    setPhase("loading");
    try {
      const res = await fetch(`/api/worldcup/team/${t.idTeam}`);
      if (!res.ok) throw new Error();
      const squad: WCSquad = await res.json();
      const withPhotos = squad.players.filter((p) => p.photo);
      const pool = withPhotos.length >= 4 ? withPhotos : squad.players;
      if (pool.length < 4) throw new Error();
      setQuiz(buildQuiz(pool));
      setQIdx(0);
      setPicked(null);
      setScore(0);
      setFaris("idle");
      setPhase("quiz");
    } catch {
      setPhase("error");
    }
  }, []);

  const q = quiz[qIdx];

  const choose = (value: string | number, correct: boolean) => {
    if (picked != null) return;
    setPicked(value);
    setFaris(correct ? "happy" : "sad");
    if (correct) setScore((s) => s + 1);
    if (q) say(q.player.name);
  };

  const next = () => {
    if (qIdx + 1 >= quiz.length) {
      addXp(progress.xp + score * 6);
      setPhase("result");
    } else {
      setQIdx((i) => i + 1);
      setPicked(null);
      setFaris("idle");
    }
  };

  const passed = score / QUIZ_LEN >= 0.6;

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
            ⚽ Guess the Player
          </p>
        </div>

        {/* ── PICK A TEAM ── */}
        {phase === "pick" && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-green-400" />
              <div>
                <h1 className="text-2xl font-black text-amber-50">Guess the Player</h1>
                <p className="text-sm text-amber-200/60">Pick a nation, then test your eye on its real squad — names &amp; positions in Arabic.</p>
              </div>
            </div>
            {!data && <p className="text-sm text-amber-300/50">Loading teams…</p>}
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
              {teams.map((t) => (
                <button
                  key={t.code}
                  type="button"
                  onClick={() => startTeam(t)}
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-2xl p-2 transition hover:scale-[1.03]"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <FlagImg code={t.code} className="h-8 w-8 rounded object-cover" />
                  <span className="text-sm font-bold text-amber-100 leading-tight text-center" style={{ fontFamily: NAF, direction: "rtl" }}>{t.arabic}</span>
                  <span className="text-[10px] text-amber-300/40 leading-none">{t.english}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {phase === "loading" && (
          <p className="text-sm text-amber-300/50 text-center py-10">Loading {team?.english} squad…</p>
        )}

        {phase === "error" && (
          <div className="text-center flex flex-col items-center gap-3 py-10">
            <p className="text-sm text-amber-200/60">Couldn&apos;t load that squad. Try another team.</p>
            <button type="button" onClick={() => setPhase("pick")} className="rounded-2xl px-5 py-2.5 text-sm font-bold text-green-950" style={{ background: "#fde047" }}>
              Back to teams
            </button>
          </div>
        )}

        {/* ── QUIZ ── */}
        {phase === "quiz" && q && team && (
          <section className="mx-auto w-full max-w-xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlagImg code={team.code} className="h-5 w-5 rounded object-cover" />
                <span className="text-sm font-bold text-amber-100" style={{ fontFamily: NAF, direction: "rtl" }}>{team.arabic}</span>
              </div>
              <span className="text-xs font-semibold text-amber-300/50">{qIdx + 1} / {quiz.length} · score {score}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${((qIdx + 1) / quiz.length) * 100}%`, background: "#22c55e" }} />
            </div>

            {/* ── question: NAME (photo → pick Arabic name) ── */}
            {q.kind === "name" && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-[56px] flex-shrink-0 aspect-[260/390]"><FarisCharacter state={faris} /></div>
                  <div className="flex-1 flex flex-col items-center gap-2 rounded-2xl py-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-xs text-amber-300/50">Who is this player?</p>
                    <Avatar player={q.player} size={108} />
                    <span className="text-xs text-amber-300/40">#{q.player.number} · {POSITION_EN[q.player.position]}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((name) => {
                    const isCorrect = name === q.player.name;
                    const show = picked != null;
                    const isPicked = picked === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        disabled={show}
                        onClick={() => choose(name, isCorrect)}
                        className="flex items-center justify-between rounded-xl px-4 py-3 text-right transition"
                        style={optionStyle(show, isCorrect, isPicked)}
                      >
                        <span>{show && isCorrect ? <Check className="h-4 w-4 text-green-300" /> : show && isPicked ? <X className="h-4 w-4 text-red-300" /> : null}</span>
                        <span className="text-lg font-bold text-amber-100" style={{ fontFamily: NAF, direction: "rtl" }}>{name}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── question: FACE (Arabic name → pick photo) ── */}
            {q.kind === "face" && (
              <>
                <div className="flex flex-col items-center gap-2 rounded-2xl py-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-xs text-amber-300/50">Which one is…</p>
                  <button type="button" onClick={() => say(q.player.name)} className="flex items-center gap-2 group">
                    <span className="text-2xl font-black text-amber-50" style={{ fontFamily: NAF, direction: "rtl" }}>{q.player.name}</span>
                    <Volume2 className="h-4 w-4 text-amber-300/40 group-hover:text-amber-200" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {q.options.map((p) => {
                    const isCorrect = p.id === q.player.id;
                    const show = picked != null;
                    const isPicked = picked === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={show}
                        onClick={() => choose(p.id, isCorrect)}
                        className="relative flex flex-col items-center gap-1 rounded-2xl p-2 transition hover:scale-[1.03]"
                        style={optionStyle(show, isCorrect, isPicked)}
                      >
                        <Avatar player={p} size={88} />
                        <span className="text-[11px] text-amber-300/50">#{p.number}</span>
                        {show && isCorrect && <Check className="absolute top-1 right-1 h-4 w-4 text-green-300" />}
                        {show && isPicked && !isCorrect && <X className="absolute top-1 right-1 h-4 w-4 text-red-300" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── question: POSITION (photo+name → pick position) ── */}
            {q.kind === "position" && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-[56px] flex-shrink-0 aspect-[260/390]"><FarisCharacter state={faris} /></div>
                  <div className="flex-1 flex flex-col items-center gap-2 rounded-2xl py-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-xs text-amber-300/50">What position does he play?</p>
                    <Avatar player={q.player} size={88} />
                    <button type="button" onClick={() => say(q.player.name)} className="flex items-center gap-1.5 group">
                      <span className="text-lg font-black text-amber-50" style={{ fontFamily: NAF, direction: "rtl" }}>{q.player.name}</span>
                      <Volume2 className="h-3.5 w-3.5 text-amber-300/40 group-hover:text-amber-200" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {POSITION_AR.map((pos, i) => {
                    const isCorrect = i === q.player.position;
                    const show = picked != null;
                    const isPicked = picked === i;
                    return (
                      <button
                        key={pos}
                        type="button"
                        disabled={show}
                        onClick={() => choose(i, isCorrect)}
                        className="rounded-xl px-2 py-3 text-center transition"
                        style={optionStyle(show, isCorrect, isPicked)}
                      >
                        <span className="block text-xl font-bold text-amber-100" style={{ fontFamily: NAF, direction: "rtl" }}>{pos}</span>
                        <span className="block text-xs text-amber-300/45">{POSITION_EN[i]}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {picked != null && (
              <button type="button" onClick={next} className="rounded-2xl px-5 py-3 text-sm font-bold text-green-950" style={{ background: "#fde047" }}>
                {qIdx + 1 >= quiz.length ? "See results →" : "Next →"}
              </button>
            )}
          </section>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && (
          <section className="mx-auto w-full max-w-md flex flex-col items-center gap-4 text-center py-6">
            <div className="w-[110px] aspect-[260/390]"><FarisCharacter state={passed ? "happy" : "idle"} /></div>
            <h1 className="text-2xl font-black text-amber-50">{passed ? "ممتاز! Great eye!" : "Good try!"}</h1>
            <p className="text-5xl font-black" style={{ color: passed ? "#22c55e" : "#fbbf24" }}>
              {score}<span className="text-2xl text-amber-300/40"> / {quiz.length}</span>
            </p>
            <p className="text-xs text-green-300/70 font-semibold">+{score * 6} XP</p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <button type="button" onClick={() => team && startTeam(team)} className="flex items-center gap-1.5 rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-amber-300/70 hover:bg-white/5 transition">
                <RotateCcw className="h-4 w-4" /> Same team
              </button>
              <button type="button" onClick={() => setPhase("pick")} className="rounded-2xl px-5 py-2.5 text-sm font-bold text-green-950" style={{ background: "#fde047" }}>
                Pick another team →
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function optionStyle(show: boolean, isCorrect: boolean, isPicked: boolean): CSSProperties {
  if (show && isCorrect) return { background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.6)" };
  if (isPicked) return { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.5)" };
  return { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" };
}
