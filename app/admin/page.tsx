"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

type TtsStats = {
  totalCalls: number;
  apiCalls: number;
  cacheHits: number;
  totalChars: number;
  todayCalls: number;
  todayApiCalls: number;
  todayChars: number;
};

const FREE_TIER_CHARS = 1_000_000;

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full rounded-full h-2" style={{ background: "rgba(255,255,255,0.08)" }}>
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex flex-col gap-1"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50">{label}</p>
      <p className="text-2xl font-black text-amber-50">{value}</p>
      {sub && <p className="text-xs text-amber-300/40">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<TtsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tts/stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats(await res.json());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cacheRate = stats && stats.totalCalls > 0
    ? Math.round((stats.cacheHits / stats.totalCalls) * 100)
    : 0;

  const freeTierPct = stats
    ? Math.round((stats.totalChars / FREE_TIER_CHARS) * 100)
    : 0;

  return (
    <main className="min-h-screen flex flex-col px-5 py-8">
      <div className="mx-auto w-full max-w-2xl flex flex-col gap-8">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Link>
            <h1 className="text-lg font-black text-amber-50">TTS Usage</h1>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-900/20 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Free tier progress */}
            <div
              className="rounded-2xl px-5 py-5 flex flex-col gap-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,160,23,0.2)" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50">
                  Free tier — total chars synthesized
                </p>
                <span className={`text-xs font-bold ${freeTierPct > 80 ? "text-rose-400" : freeTierPct > 50 ? "text-amber-400" : "text-emerald-400"}`}>
                  {freeTierPct}%
                </span>
              </div>
              <Bar value={stats.totalChars} max={FREE_TIER_CHARS} color={freeTierPct > 80 ? "#f87171" : freeTierPct > 50 ? "#fbbf24" : "#34d399"} />
              <p className="text-sm text-amber-100/70">
                <span className="font-bold text-amber-200">{stats.totalChars.toLocaleString()}</span>
                <span className="text-amber-300/40"> / {FREE_TIER_CHARS.toLocaleString()} chars</span>
              </p>
            </div>

            {/* All-time stats */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50 mb-3">All time</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Stat label="API calls" value={stats.apiCalls.toLocaleString()} sub="billable requests" />
                <Stat label="Cache hits" value={stats.cacheHits.toLocaleString()} sub={`${cacheRate}% hit rate`} />
                <Stat label="Chars sent" value={stats.totalChars.toLocaleString()} sub="to Gemini TTS" />
              </div>
            </div>

            {/* Today */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/50 mb-3">Last 24 hours</p>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="API calls today" value={stats.todayApiCalls.toLocaleString()} />
                <Stat label="Chars today" value={stats.todayChars.toLocaleString()} />
              </div>
            </div>

            {freeTierPct > 80 && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-900/20 px-5 py-4">
                <p className="text-sm font-semibold text-rose-300">⚠ Over 80% of free tier used</p>
                <p className="text-xs text-rose-300/60 mt-1">Consider switching to Web Speech API fallback or a paid plan.</p>
              </div>
            )}
          </>
        )}

        {loading && !stats && (
          <div className="text-center text-amber-300/40 text-sm py-12">Loading…</div>
        )}
      </div>
    </main>
  );
}
