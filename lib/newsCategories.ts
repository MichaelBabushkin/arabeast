// News category taxonomy + free-signal mappers. Pure + client-safe (no server
// deps) so both lib/news.ts and the news page can import it.

export type CategoryId = "world" | "business" | "sports" | "tech" | "society" | "health" | "general";

export type Category = { id: CategoryId; en: string; ar: string; emoji: string };

export const CATEGORIES: Category[] = [
  { id: "world",    en: "Politics & World",  ar: "سياسة وعالم",    emoji: "🌍" },
  { id: "business", en: "Markets & Economy", ar: "اقتصاد وأسواق", emoji: "📈" },
  { id: "sports",   en: "Sports",            ar: "رياضة",          emoji: "⚽" },
  { id: "tech",     en: "Tech & Science",    ar: "علوم وتقنية",   emoji: "🔬" },
  { id: "society",  en: "Society & Culture", ar: "مجتمع وثقافة",  emoji: "🎭" },
  { id: "health",   en: "Health",            ar: "صحة",            emoji: "🩺" },
  { id: "general",  en: "General",           ar: "عام",            emoji: "📰" },
];

export const CATEGORY_META: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

// the categories the AI is allowed to assign (everything except the "general" fallback)
export const AI_CATEGORIES: CategoryId[] = CATEGORIES.filter((c) => c.id !== "general").map((c) => c.id);

export function isCategory(c: unknown): c is CategoryId {
  return typeof c === "string" && CATEGORIES.some((x) => x.id === c);
}

/** Map DW's Arabic <dc:subject> label to our taxonomy (politics before economy). */
export function dwSubjectToCat(s: string): CategoryId | null {
  if (!s) return null;
  if (/رياضة|كرة القدم/.test(s)) return "sports";
  if (/علوم|تكنولوجيا|تقنية|رقمي|بيئة/.test(s)) return "tech";
  if (/صحة|طب|وباء|فيروس/.test(s)) return "health";
  if (/ثقافة|فنون|موسيقى|سينما|أدب/.test(s)) return "society";
  if (/سياسة|عالم|دولي|دبلوماسي|حرب|نزاع|أمن/.test(s)) return "world";
  if (/اقتصاد|أسواق|مال|بورصة|نفط|تجارة/.test(s)) return "business";
  return null;
}

/** Map an Al Arabiya article URL's section path to our taxonomy. */
export function sectionToCat(link: string): CategoryId | null {
  const m = link.match(/alarabiya\.net\/([a-z0-9-]+)/i);
  const sec = (m ? m[1] : "").toLowerCase();
  if (!sec) return null;
  if (/sport/.test(sec)) return "sports";
  if (/aswaq|econom|business|market|money/.test(sec)) return "business";
  if (/science|technolog|tech|digital|space/.test(sec)) return "tech";
  if (/medicine|health/.test(sec)) return "health";
  if (/social-media|entertainment|culture|art|life|variety|tourism/.test(sec)) return "society";
  if (/politic|arab-and-world|world|saudi|gulf|iran|defense|military/.test(sec)) return "world";
  return null;
}
