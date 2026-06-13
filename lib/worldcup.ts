import teamsRaw from "@/data/wc-teams-arabic.json";

/* ──────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────── */

export type WCTeam = {
  code: string;          // FIFA IdCountry tricode (MEX, RSA, MAR…)
  english: string;
  arabic: string;        // official FIFA Arabic name when live
  translit: string;      // from our curated map (enrichment), else ""
  flag: string;          // emoji from curated map, else "" → render abbr badge
  abbr: string;          // FIFA 3-letter tricode, used when no emoji
  arab: boolean;         // Arab nation → ⭐ in the album
};

export type WCStatus = "SCHEDULED" | "TIMED" | "IN_PLAY" | "FINISHED";
export type WCOutcome = "HOME" | "AWAY" | "DRAW";

export type WCMatch = {
  id: string;
  utcDate: string;        // ISO
  status: WCStatus;
  stage: string;          // Arabic stage name when live
  group: string | null;   // Arabic group name when live
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
   Curated team enrichment (pure, client-safe)
   FIFA gives us official Arabic names + tricodes; we only use the
   curated map to add emoji flags, transliteration and the Arab flag.
   ────────────────────────────────────────────────────────── */

type CuratedTeam = {
  code: string; english: string; aliases: string[];
  arabic: string; translit: string; flag: string; arab: boolean;
};

export const WC_TEAMS = teamsRaw as CuratedTeam[];

const CURATED_BY_CODE = new Map<string, CuratedTeam>();
for (const t of WC_TEAMS) CURATED_BY_CODE.set(t.code, t);

export function getTeamByCode(code: string): CuratedTeam | undefined {
  return CURATED_BY_CODE.get(code);
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

/** Spoken Arabic phrase for a finished result. */
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
   Official FIFA data provider (no API key) with curated fallback.
   Server-side only. Cached in-memory.
   ────────────────────────────────────────────────────────── */

// 2026 FIFA World Cup (Canada/Mexico/USA)
const FIFA_COMPETITION = "17";
const FIFA_SEASON = "285023";
const FIFA_URL = (lang: string) =>
  `https://api.fifa.com/api/v3/calendar/matches?idCompetition=${FIFA_COMPETITION}&idSeason=${FIFA_SEASON}&count=200&language=${lang}`;

type FifaName = { Locale: string; Description: string };
type FifaTeam = {
  IdCountry: string;
  Abbreviation: string;
  TeamName: FifaName[];
  Score: number | null;
} | null;
type FifaMatch = {
  IdMatch: string;
  Date: string;
  IdStage: string;
  StageName: FifaName[];
  GroupName: FifaName[] | null;
  Home: FifaTeam;
  Away: FifaTeam;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
};
type FifaResponse = { Results: FifaMatch[] };

const desc = (arr?: FifaName[] | null) => arr?.[0]?.Description ?? "";

function buildTeam(t: NonNullable<FifaTeam>, englishName: string): WCTeam {
  const c = CURATED_BY_CODE.get(t.IdCountry);
  return {
    code: t.IdCountry,
    english: englishName || desc(t.TeamName),
    arabic: desc(t.TeamName),
    translit: c?.translit ?? "",
    flag: c?.flag ?? "",
    abbr: t.Abbreviation || t.IdCountry,
    arab: c?.arab ?? false,
  };
}

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { at: number; data: WCData } | null = null;

async function fetchFifa(): Promise<WCData | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const [arRes, enRes] = await Promise.all([
      fetch(FIFA_URL("ar"), {
        headers: { Accept: "application/json" },
        signal: controller.signal,
        next: { revalidate: 300 },
      }),
      fetch(FIFA_URL("en"), {
        headers: { Accept: "application/json" },
        signal: controller.signal,
        next: { revalidate: 300 },
      }),
    ]);
    if (!arRes.ok) return null;

    const arJson = (await arRes.json()) as FifaResponse;
    const enJson = enRes.ok ? ((await enRes.json()) as FifaResponse) : { Results: [] };
    if (!arJson.Results?.length) return null;

    // English names keyed by match id (for the team quiz prompt)
    const enNames = new Map<string, { home: string; away: string }>();
    for (const m of enJson.Results) {
      enNames.set(m.IdMatch, { home: desc(m.Home?.TeamName), away: desc(m.Away?.TeamName) });
    }

    const matches: WCMatch[] = [];
    for (const m of arJson.Results) {
      if (!m.Home || !m.Away) continue; // skip TBD knockout slots
      const en = enNames.get(m.IdMatch);
      const home = buildTeam(m.Home, en?.home ?? "");
      const away = buildTeam(m.Away, en?.away ?? "");
      const hs = m.HomeTeamScore ?? m.Home.Score ?? null;
      const as = m.AwayTeamScore ?? m.Away.Score ?? null;
      const finished = hs != null && as != null;
      matches.push({
        id: m.IdMatch,
        utcDate: m.Date,
        status: finished ? "FINISHED" : isSameDay(m.Date) ? "TIMED" : "SCHEDULED",
        stage: desc(m.StageName),
        group: desc(m.GroupName) || null,
        home,
        away,
        score: { home: hs, away: as },
        winner: finished ? (hs! > as! ? "HOME" : hs! < as! ? "AWAY" : "DRAW") : null,
      });
    }
    if (!matches.length) return null;

    const seen = new Set<string>();
    const teams: WCTeam[] = [];
    for (const m of matches) {
      for (const t of [m.home, m.away]) {
        if (!seen.has(t.code)) { seen.add(t.code); teams.push(t); }
      }
    }

    return { source: "live", fetchedAt: new Date().toISOString(), teams, matches };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/* ── Curated fallback: keeps the album alive if FIFA is unreachable.
   Fixtures are generated relative to "now" so there is always a played
   match (yesterday), one today, and upcoming ones. ── */

function curatedTeam(code: string): WCTeam {
  const c = getTeamByCode(code)!;
  return {
    code: c.code, english: c.english, arabic: c.arabic,
    translit: c.translit, flag: c.flag, abbr: c.code, arab: c.arab,
  };
}

function curatedData(): WCData {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const at = (offsetDays: number, hour: number) => {
    const d = new Date(now + offsetDays * day);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  const fixtures = [
    { h: "MAR", a: "ESP", off: -1, hr: 18, sh: 2, sa: 0, group: "المجموعة أ" },
    { h: "BRA", a: "KSA", off: -1, hr: 21, sh: 1, sa: 1, group: "المجموعة ب" },
    { h: "ARG", a: "EGY", off: 0,  hr: 18, sh: null, sa: null, group: "المجموعة ج" },
    { h: "FRA", a: "TUN", off: 0,  hr: 21, sh: null, sa: null, group: "المجموعة د" },
    { h: "POR", a: "ALG", off: 1,  hr: 18, sh: null, sa: null, group: "المجموعة هـ" },
    { h: "GER", a: "JPN", off: 1,  hr: 21, sh: null, sa: null, group: "المجموعة و" },
    { h: "ENG", a: "SEN", off: 2,  hr: 18, sh: null, sa: null, group: "المجموعة ز" },
    { h: "NED", a: "QAT", off: 2,  hr: 21, sh: null, sa: null, group: "المجموعة ح" },
  ] as const;

  const matches: WCMatch[] = fixtures.map((f, i) => {
    const played = f.sh != null && f.sa != null;
    return {
      id: `curated-${i}`,
      utcDate: at(f.off, f.hr),
      status: played ? "FINISHED" : f.off === 0 ? "TIMED" : "SCHEDULED",
      stage: "المرحلة الأولى",
      group: f.group,
      home: curatedTeam(f.h),
      away: curatedTeam(f.a),
      score: { home: f.sh, away: f.sa },
      winner: played ? (f.sh! > f.sa! ? "HOME" : f.sh! < f.sa! ? "AWAY" : "DRAW") : null,
    };
  });

  const seen = new Set<string>();
  const teams: WCTeam[] = [];
  for (const m of matches) {
    for (const t of [m.home, m.away]) {
      if (!seen.has(t.code)) { seen.add(t.code); teams.push(t); }
    }
  }

  return { source: "curated", fetchedAt: new Date().toISOString(), teams, matches };
}

/** Cached entry point used by the API route. */
export async function getWorldCupData(): Promise<WCData> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;
  const data = (await fetchFifa()) || curatedData();
  cache = { at: Date.now(), data };
  return data;
}
