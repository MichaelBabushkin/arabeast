// News data layer. Strategy per source:
//  - "direct": fetch the RSS/XML ourselves and parse it (DW, BBC — reliable,
//    no rate limit, work on Vercel).
//  - "rss2json": go through the rss2json proxy (for sources that block
//    datacenter IPs directly, e.g. Al Arabiya). Best-effort.
// Sources are merged, de-duplicated and sorted; empty results are never cached.

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  sourceAr: string;
  thumbnail: string | null;
  pubDate: string; // ISO
};

type Source = {
  id: string;
  name: string;
  nameAr: string;
  feed: string;
  kind: "direct" | "rss2json";
};

const SOURCES: Source[] = [
  { id: "dw", name: "DW Arabic", nameAr: "دويتشه فيله", feed: "https://rss.dw.com/rdf/rss-ar-all", kind: "direct" },
  { id: "bbc", name: "BBC Arabic", nameAr: "بي بي سي", feed: "https://feeds.bbci.co.uk/arabic/rss.xml", kind: "direct" },
  { id: "alarabiya", name: "Al Arabiya", nameAr: "العربية", feed: "https://www.alarabiya.net/feed/rss2/ar.xml", kind: "rss2json" },
];

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/g, " ");
}

function clean(s: string): string {
  return decodeEntities(s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// BBC's RSS thumbnails come at width 240 (blurry when shown large). Their CDN
// serves any width, so bump it up for a sharp 16:9 card image.
function upscaleThumb(url: string | null): string | null {
  if (!url) return null;
  if (url.includes("ichef.bbci.co.uk")) return url.replace(/\/ws\/\d+\//, "/ws/1024/");
  return url;
}

function parseDate(d?: string): string {
  if (!d) return new Date().toISOString();
  const iso = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(d) ? d.replace(" ", "T") + "Z" : d;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? new Date().toISOString() : new Date(t).toISOString();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1] : "";
}

function attrUrl(block: string, ...tagNames: string[]): string | null {
  for (const t of tagNames) {
    const m = block.match(new RegExp(`<${t}[^>]*\\burl="([^"]+)"`, "i"));
    if (m) return m[1];
  }
  return null;
}

/* ── direct RSS/XML parsing ── */
function parseRss(xml: string, src: Source): NewsItem[] {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  const out: NewsItem[] = [];
  for (const b of blocks) {
    const title = clean(tag(b, "title"));
    const link = clean(tag(b, "link"));
    if (!title || title.length < 6 || !link) continue; // drop junk/branding items
    out.push({
      id: link,
      title,
      summary: clean(tag(b, "description")),
      link,
      source: src.name,
      sourceAr: src.nameAr,
      thumbnail: upscaleThumb(attrUrl(b, "media:thumbnail", "media:content", "enclosure")),
      pubDate: parseDate(tag(b, "pubDate") || tag(b, "dc:date")),
    });
  }
  return out;
}

async function fetchDirect(src: Source): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(src.feed, {
      headers: { "User-Agent": BROWSER_UA, Accept: "application/rss+xml,application/xml,text/xml,*/*" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return [];
    return parseRss(await res.text(), src);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/* ── rss2json proxy ── */
type Rss2JsonResp = {
  status?: string;
  items?: { title?: string; pubDate?: string; link?: string; guid?: string; thumbnail?: string; description?: string; content?: string }[];
};

async function fetchRss2Json(src: Source): Promise<NewsItem[]> {
  // Note: the `count` param REQUIRES an API key (rss2json 422s otherwise). With
  // no key we omit it and take the default (~10 items), which works fine.
  const key = process.env.RSS2JSON_API_KEY;
  const url =
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(src.feed)}` +
    (key ? `&api_key=${key}&count=25` : "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as Rss2JsonResp;
    if (json.status !== "ok" || !json.items?.length) return [];
    return json.items
      .filter((it) => it.title && it.link)
      .map((it) => ({
        id: it.guid || it.link!,
        title: clean(it.title!),
        summary: clean(it.description || it.content || ""),
        link: it.link!,
        source: src.name,
        sourceAr: src.nameAr,
        thumbnail: upscaleThumb(it.thumbnail || null),
        pubDate: parseDate(it.pubDate),
      }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

const FRESH_MS = 15 * 60 * 1000;       // reuse a source's items without refetching
const STALE_OK_MS = 6 * 60 * 60 * 1000; // if a refetch fails, keep last-good up to this long
const sourceCache = new Map<string, { at: number; items: NewsItem[] }>();

// Cache each source independently so one source rate-limiting (e.g. Al Arabiya
// via rss2json) never wipes it from the merged list — we fall back to its last
// known-good items instead.
async function getSource(src: Source): Promise<NewsItem[]> {
  const cached = sourceCache.get(src.id);
  if (cached && Date.now() - cached.at < FRESH_MS) return cached.items;

  const fresh = src.kind === "direct" ? await fetchDirect(src) : await fetchRss2Json(src);
  if (fresh.length > 0) {
    sourceCache.set(src.id, { at: Date.now(), items: fresh });
    return fresh;
  }
  // refetch failed — reuse last-known-good if it isn't too stale
  if (cached && Date.now() - cached.at < STALE_OK_MS) return cached.items;
  return [];
}

let inflight: Promise<NewsItem[]> | null = null;

export async function getNews(): Promise<NewsItem[]> {
  if (inflight) return inflight; // de-dupe concurrent callers (avoids bursting rss2json)
  inflight = (async () => {
    const results = await Promise.all(SOURCES.map(getSource));
    const seen = new Set<string>();
    const merged: NewsItem[] = [];
    for (const item of results.flat()) {
      if (seen.has(item.link)) continue;
      seen.add(item.link);
      merged.push(item);
    }
    merged.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
    return merged;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}
