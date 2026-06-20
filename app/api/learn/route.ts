import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { withRetry } from "@/lib/retry";
import { isLearnCategory, LEARN_CATEGORY_META } from "@/lib/learnCategories";

export const dynamic = "force-dynamic";

export type LearnWord = {
  arabic: string;
  translit: string;
  meaning: string;
};

type ScrapedWord = {
  arabic: string;
  translit: string;
  meaningHe: string;
};

// Memory cache for fully parsed categories from Madrasa
const parsedCategoryCache = new Map<string, ScrapedWord[]>();

function decodeHtml(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseMadrasaHtml(html: string): ScrapedWord[] {
  const cards: ScrapedWord[] = [];
  const cardRegex = /<article class="result-card">([\s\S]*?)<\/article>/g;
  
  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    const cardHtml = match[1];
    
    // 1. Hebrew meaning/gloss from heading
    const headingMatch = cardHtml.match(/<h3 class="result-card__heading">([\s\S]*?)<\/h3>/);
    if (!headingMatch) continue;
    let meaningHe = decodeHtml(headingMatch[1].replace(/<\/?[^>]+(>|$)/g, ""));
    
    // 2. Arabic script
    const arabicMatch = cardHtml.match(/<div class="result-card__arabic"[^>]*>([\s\S]*?)<\/div>/);
    if (!arabicMatch) continue;
    const arabic = decodeHtml(arabicMatch[1].replace(/<\/?[^>]+(>|$)/g, ""));
    
    // 3. Transliteration
    const translitMatch = cardHtml.match(/<div class="result-card__transliteration"[^>]*>([\s\S]*?)<\/div>/);
    if (!translitMatch) continue;
    let translit = decodeHtml(translitMatch[1].replace(/<\/?[^>]+(>|$)/g, ""));
    // Strip Arabic combining diacritics from Hebrew transliteration to prevent font rendering corruption
    translit = translit.replace(/[\u064B-\u065F\u0670]/g, "");
    
    // 4. Optional description definition details
    const defMatch = cardHtml.match(/<p class="result-card__definition"[^>]*>([\s\S]*?)<\/p>/);
    if (defMatch) {
      const def = decodeHtml(defMatch[1].replace(/<\/?[^>]+(>|$)/g, ""));
      if (def) {
        meaningHe = `${meaningHe} (${def})`;
      }
    }
    
    // Also clean up Arabic diacritics from Hebrew meaning if any exist
    meaningHe = meaningHe.replace(/[\u064B-\u065F\u0670]/g, "");
    
    cards.push({ arabic, translit, meaningHe });
  }
  return cards;
}

export async function POST(req: NextRequest) {
  let body: { categoryId?: string; language?: "en" | "he"; exclude?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { categoryId, language = "en", exclude = [] } = body;
  if (!categoryId) {
    return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
  }

  if (!isLearnCategory(categoryId)) {
    return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
  }

  const categoryMeta = LEARN_CATEGORY_META[categoryId];

  // 1. Fetch from Madrasa (or read cache)
  let fullList: ScrapedWord[] = [];
  if (parsedCategoryCache.has(categoryId)) {
    fullList = parsedCategoryCache.get(categoryId)!;
  } else {
    try {
      const res = await withRetry(async () => {
        const response = await fetch(`https://milon.madrasafree.com/label.asp?id=${categoryMeta.madrasaId}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        if (!response.ok) throw new Error(`Madrasa returned status ${response.status}`);
        return response;
      });

      const html = await res.text();
      fullList = parseMadrasaHtml(html);
      
      if (fullList.length > 0) {
        parsedCategoryCache.set(categoryId, fullList);
      } else {
        throw new Error("No words parsed from Madrasa HTML");
      }
    } catch (err) {
      console.error(`Failed to fetch/parse Madrasa category ${categoryId}:`, err);
      return NextResponse.json({ error: "Failed to load category words from Madrasa" }, { status: 500 });
    }
  }

  // 2. Exclude already shown words
  const normalizeWord = (w: string) => w.trim();
  const excludedSet = new Set(exclude.map(normalizeWord));
  const filteredList = fullList.filter((w) => !excludedSet.has(normalizeWord(w.arabic)));

  // 3. Slice first 12 remaining words
  const selectedWords = filteredList.slice(0, 12);

  // If there are no words left, return empty list
  if (selectedWords.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  // 4. Handle language translations
  if (language === "he") {
    // Direct map
    const result: LearnWord[] = selectedWords.map((w) => ({
      arabic: w.arabic,
      translit: w.translit,
      meaning: w.meaningHe,
    }));
    return NextResponse.json(result, { status: 200 });
  } else {
    // English language: translate Hebrew meanings/glosses to English using Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const systemInstruction = `You are a precise Hebrew-to-English translator.
You will receive a JSON array of Hebrew words or phrases.
Translate each term to its natural, concise English equivalent (1-4 words).
Keep the exact same order as the input array.
Respond ONLY with a valid JSON array of strings, representing the English translations.
Do not wrap your response in markdown code blocks like \`\`\`json. Respond with the raw JSON string only.`;

    const ai = new GoogleGenAI({ apiKey });

    try {
      const inputData = selectedWords.map((w) => w.meaningHe);

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: "gemini-3.1-flash-lite-preview",
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 600,
          },
          contents: [{ role: "user" as const, parts: [{ text: JSON.stringify(inputData) }] }],
        }),
      );

      const out = response.text ?? "";
      let translatedMeanings: string[];
      try {
        translatedMeanings = JSON.parse(out);
      } catch {
        const match = out.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) translatedMeanings = JSON.parse(match[1]);
        else throw new Error("Could not parse Gemini translation response as JSON");
      }

      if (!Array.isArray(translatedMeanings)) {
        throw new Error("Translation response is not an array");
      }

      const result: LearnWord[] = selectedWords.map((w, index) => ({
        arabic: w.arabic,
        translit: w.translit,
        meaning: translatedMeanings[index] || w.meaningHe,
      }));

      return NextResponse.json(result, { status: 200 });
    } catch (err) {
      console.error("Gemini translation error for learn category:", err);
      // Fallback: return with Hebrew meanings if translation fails
      const fallback: LearnWord[] = selectedWords.map((w) => ({
        arabic: w.arabic,
        translit: w.translit,
        meaning: w.meaningHe, // fallback to Hebrew
      }));
      return NextResponse.json(fallback, { status: 200 });
    }
  }
}
