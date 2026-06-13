import teamsRaw from "@/data/wc-teams-arabic.json";

/* ──────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────── */

export type WCTeam = {
  code: string;
  english: string;
  aliases: string[];
  arabic: string;
  translit: string;
  flag: string;
  arab: boolean;
};

export type WCStatus = "SCHEDULED" | "TIMED" | "IN_PLAY" | "FINISHED";
export type WCOutcome = "HOME" | "AWAY" | "DRAW";

export type WCMatch = {
  id: string;
  utcDate: string;        // ISO
  status: WCStatus;
  stage: string;          // e.g. "GROUP_STAGE", "LAST_16"
  group: string | null;   // e.g. "Group A"
  home: WCTeam;
  away: WCTeam;
  score: { home: number | null; away: number | null };
  winner: WCOutcome | null;
};

export type WCData = {
  source: "live" | "curated";
  fetchedAt: string;
  teams: WCTeam[];
  matches: WCMatch[];
};

/* ──────────────────────────────────────────────────────────
   Team mapping + lookup (pure, client-safe)
   ────────────────────────────────────────────────────────── */

export const WC_TEAMS = teamsRaw as WCTeam[];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

const TEAM_BY_NAME = new Map<string, WCTeam>();
for (const t of WC_TEAMS) {
  TEAM_BY_NAME.set(norm(t.english), t);
  TEAM_BY_NAME.set(norm(t.code), t);
  for (const a of t.aliases) TEAM_BY_NAME.set(norm(a), t);
}

/** Resolve an external (English) team name to our Arabic-aware team. */
export function resolveTeam(name: string): WCTeam {
  const hit = TEAM_BY_NAME.get(norm(name));
  if (hit) return hit;
  // synthesise a minimal entry for teams not in our curated map
  return {
    code: norm(name).slice(0, 3).toUpperCase() || "UNK",
    english: name,
    aliases: [],
    arabic: name,
    translit: name,
    flag: "🏳️",
    arab: false,
  };
}

export function getTeamByCode(code: string): WCTeam | undefined {
  return WC_TEAMS.find((t) => t.code === code);
}

/* ──────────────────────────────────────────────────────────
   Arabic-numeral helpers (pure, client-safe)
   ────────────────────────────────────────────────────────── */

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicNumerals(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

/** "٢ – ٠" style score, or "—" if not played yet. */
export function arabicScore(home: number | null, away: number | null): string {
  if (home == null || away == null) return "—";
  return `${toArabicNumerals(home)} – ${toArabicNumerals(away)}`;
}

/** Spoken Arabic phrase for a finished result, from the winner's side. */
export function arabicResultPhrase(m: WCMatch): string {
  if (m.score.home == null || m.score.away == null) return "";
  const h = toArabicNumerals(m.score.home);
  const a = toArabicNumerals(m.score.away);
  if (m.winner === "DRAW") return `تعادل ${m.home.arabic} مع ${m.away.arabic} ${h} - ${a}`;
  const w = m.winner === "HOME" ? m.home : m.away;
  return `فاز ${w.arabic} ${h} - ${a}`;
}

/* ──────────────────────────────────────────────────────────
   Date helpers
   ────────────────────────────────────────────────────────── */

export function isSameDay(iso: string, ref: Date = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

/* ──────────────────────────────────────────────────────────
   Data provider — live (football-data.org) with curated fallback
   Server-side only (uses FOOTBALL_API_KEY). Cached in-memory.
   ────────────────────────────────────────────────────────── */

type RawFD = {
  matches?: Array<{
    id: number;
    utcDate: string;
    status: string;
    stage: string;
    group: string | null;
    homeTeam: { name: string };
    awayTeam: { name: string };
    score: {
      winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
      fullTime: { home: number | null; away: number | null };
    };
  }>;
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cache: { at: number; data: WCData } | null = null;

function mapStatus(s: string): WCStatus {
  if (s === "FINISHED" || s === "AWARDED") return "FINISHED";
  if (s === "IN_PLAY" || s === "PAUSED") return "IN_PLAY";
  if (s === "TIMED") return "TIMED";
  return "SCHEDULED";
}

function mapWinner(w: string | null): WCOutcome | null {
  if (w === "HOME_TEAM") return "HOME";
  if (w === "AWAY_TEAM") return "AWAY";
  if (w === "DRAW") return "DRAW";
  return null;
}

async function fetchLive(apiKey: string): Promise<WCData | null> {
  try {
    const res = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
      headers: { "X-Auth-Token": apiKey },
      // Next caches the upstream fetch; we still keep our own TTL layer.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const raw = (await res.json()) as RawFD;
    if (!raw.matches?.length) return null;

    const matches: WCMatch[] = raw.matches.map((m) => ({
      id: String(m.id),
      utcDate: m.utcDate,
      status: mapStatus(m.status),
      stage: m.stage,
      group: m.group,
      home: resolveTeam(m.homeTeam.name),
      away: resolveTeam(m.awayTeam.name),
      score: { home: m.score.fullTime.home, away: m.score.fullTime.away },
      winner: mapWinner(m.score.winner),
    }));

    const present = new Set<string>();
    const teams: WCTeam[] = [];
    for (const m of matches) {
      for (const t of [m.home, m.away]) {
        if (!present.has(t.code)) {
          present.add(t.code);
          teams.push(t);
        }
      }
    }

    return { source: "live", fetchedAt: new Date().toISOString(), teams, matches };
  } catch {
    return null;
  }
}

/* ── Curated fallback: keeps the album alive without an API key. ──
   Fixtures are generated relative to "now" so there is always a
   played match (yesterday), a match today, and an upcoming one. */

function curatedData(): WCData {
  const pick = (code: string) => getTeamByCode(code)!;
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const at = (offsetDays: number, hour: number) => {
    const d = new Date(now + offsetDays * day);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  const fixtures: Array<{
    h: string; a: string; off: number; hr: number;
    sh: number | null; sa: number | null; group: string;
  }> = [
    { h: "MAR", a: "ESP", off: -1, hr: 18, sh: 2, sa: 0, group: "Group A" },
    { h: "BRA", a: "KSA", off: -1, hr: 21, sh: 1, sa: 1, group: "Group B" },
    { h: "ARG", a: "EGY", off: 0,  hr: 18, sh: null, sa: null, group: "Group C" },
    { h: "FRA", a: "TUN", off: 0,  hr: 21, sh: null, sa: null, group: "Group D" },
    { h: "POR", a: "ALG", off: 1,  hr: 18, sh: null, sa: null, group: "Group E" },
    { h: "GER", a: "JPN", off: 1,  hr: 21, sh: null, sa: null, group: "Group F" },
    { h: "ENG", a: "SEN", off: 2,  hr: 18, sh: null, sa: null, group: "Group G" },
    { h: "NED", a: "QAT", off: 2,  hr: 21, sh: null, sa: null, group: "Group H" },
  ];

  const matches: WCMatch[] = fixtures.map((f, i) => {
    const played = f.sh != null && f.sa != null;
    return {
      id: `curated-${i}`,
      utcDate: at(f.off, f.hr),
      status: played ? "FINISHED" : f.off === 0 ? "TIMED" : "SCHEDULED",
      stage: "GROUP_STAGE",
      group: f.group,
      home: pick(f.h),
      away: pick(f.a),
      score: { home: f.sh, away: f.sa },
      winner: played ? (f.sh! > f.sa! ? "HOME" : f.sh! < f.sa! ? "AWAY" : "DRAW") : null,
    };
  });

  const present = new Set<string>();
  const teams: WCTeam[] = [];
  for (const m of matches) {
    for (const t of [m.home, m.away]) {
      if (!present.has(t.code)) { present.add(t.code); teams.push(t); }
    }
  }

  return { source: "curated", fetchedAt: new Date().toISOString(), teams, matches };
}

/** Cached entry point used by the API route. */
export async function getWorldCupData(): Promise<WCData> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;

  const apiKey = process.env.FOOTBALL_API_KEY;
  const data = (apiKey && (await fetchLive(apiKey))) || curatedData();

  cache = { at: Date.now(), data };
  return data;
}
