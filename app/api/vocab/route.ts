import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { vocab } from "@/lib/db/schema";
import {
  normalizeArabic, newVocab, reviewSchedule, mergeVocab, mergeWordLists,
  type VocabWord, type VocabSource, type CaptureInput,
} from "@/lib/srs";

export const dynamic = "force-dynamic";

type Row = typeof vocab.$inferSelect;

function toClient(r: Row): VocabWord {
  return {
    arabic: r.arabic,
    translit: r.translit,
    meaning: r.meaning,
    lang: r.lang,
    source: r.source as VocabSource,
    starred: r.starred === 1,
    firstSeen: r.firstSeen.toISOString(),
    lastSeen: r.lastSeen.toISOString(),
    seenCount: r.seenCount,
    level: r.level,
    due: r.due.toISOString(),
    reps: r.reps,
    lapses: r.lapses,
    lastReviewed: r.lastReviewed ? r.lastReviewed.toISOString() : undefined,
  };
}

function toRow(userId: string, w: VocabWord) {
  return {
    userId,
    arabic: w.arabic,
    translit: w.translit,
    meaning: w.meaning,
    lang: w.lang,
    source: w.source,
    starred: w.starred ? 1 : 0,
    level: w.level,
    reps: w.reps,
    lapses: w.lapses,
    seenCount: w.seenCount,
    firstSeen: new Date(w.firstSeen),
    lastSeen: new Date(w.lastSeen),
    due: new Date(w.due),
    lastReviewed: w.lastReviewed ? new Date(w.lastReviewed) : null,
  };
}

async function upsert(userId: string, w: VocabWord) {
  const row = toRow(userId, w);
  await db
    .insert(vocab)
    .values(row)
    .onConflictDoUpdate({
      target: [vocab.userId, vocab.arabic],
      set: {
        translit: row.translit,
        meaning: row.meaning,
        lang: row.lang,
        source: row.source,
        starred: row.starred,
        level: row.level,
        reps: row.reps,
        lapses: row.lapses,
        seenCount: row.seenCount,
        lastSeen: row.lastSeen,
        due: row.due,
        lastReviewed: row.lastReviewed,
      },
    });
}

async function getRow(userId: string, arabic: string): Promise<Row | undefined> {
  const [row] = await db.select().from(vocab).where(and(eq(vocab.userId, userId), eq(vocab.arabic, arabic)));
  return row;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(vocab).where(eq(vocab.userId, session.user.id));
  return NextResponse.json({ words: rows.map(toClient) });
}

type Body =
  | { op: "sync"; words: VocabWord[] }
  | { op: "capture"; word: CaptureInput }
  | { op: "star"; arabic: string }
  | { op: "review"; arabic: string; correct: boolean }
  | { op: "remove"; arabic: string };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  let body: Body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── two-way sync (merge local into server, return the merged set) ──
  if (body.op === "sync") {
    const serverRows = await db.select().from(vocab).where(eq(vocab.userId, userId));
    const serverWords = serverRows.map(toClient);
    const serverMap = new Map(serverWords.map((w) => [w.arabic, w]));
    for (const local of body.words ?? []) {
      const key = normalizeArabic(local.arabic);
      if (!key) continue;
      const sv = serverMap.get(key);
      await upsert(userId, sv ? mergeVocab(sv, { ...local, arabic: key }) : { ...local, arabic: key });
    }
    const merged = mergeWordLists(serverWords, (body.words ?? []).map((w) => ({ ...w, arabic: normalizeArabic(w.arabic) })));
    return NextResponse.json({ words: merged });
  }

  if (body.op === "capture") {
    const key = normalizeArabic(body.word.arabic);
    if (!key) return NextResponse.json({ ok: true });
    const existing = await getRow(userId, key);
    if (existing) {
      await db.update(vocab).set({
        lastSeen: new Date(),
        seenCount: existing.seenCount + 1,
        translit: existing.translit || body.word.translit || "",
        meaning: existing.meaning || body.word.meaning || "",
      }).where(and(eq(vocab.userId, userId), eq(vocab.arabic, key)));
    } else {
      await upsert(userId, newVocab(body.word));
    }
    return NextResponse.json({ ok: true });
  }

  if (body.op === "star") {
    const key = normalizeArabic(body.arabic);
    const existing = await getRow(userId, key);
    if (existing) {
      await db.update(vocab).set({ starred: existing.starred === 1 ? 0 : 1 })
        .where(and(eq(vocab.userId, userId), eq(vocab.arabic, key)));
    }
    return NextResponse.json({ ok: true });
  }

  if (body.op === "review") {
    const key = normalizeArabic(body.arabic);
    const existing = await getRow(userId, key);
    if (existing) {
      const { level, due } = reviewSchedule(existing.level, body.correct);
      await db.update(vocab).set({
        level,
        due: new Date(due),
        reps: existing.reps + (body.correct ? 1 : 0),
        lapses: existing.lapses + (body.correct ? 0 : 1),
        lastReviewed: new Date(),
      }).where(and(eq(vocab.userId, userId), eq(vocab.arabic, key)));
    }
    return NextResponse.json({ ok: true });
  }

  if (body.op === "remove") {
    const key = normalizeArabic(body.arabic);
    await db.delete(vocab).where(and(eq(vocab.userId, userId), eq(vocab.arabic, key)));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown op" }, { status: 400 });
}
