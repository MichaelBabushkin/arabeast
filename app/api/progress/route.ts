import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { userProgress, wordProgress } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [progress] = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, session.user.id));

  // Return defaults if no row yet
  return NextResponse.json(progress ?? {
    userId: session.user.id,
    xp: 0,
    streakDays: 0,
    lastPlayedAt: null,
    completedChapters: [],
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { xp?: number; completedChapter?: string; wordId?: string; correct?: boolean };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userId = session.user.id;
  const now = new Date();

  // Upsert userProgress
  const [existing] = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId));

  const todayStr = now.toDateString();
  const lastPlayedStr = existing?.lastPlayedAt?.toDateString();
  const yesterdayStr = new Date(now.getTime() - 86400000).toDateString();

  let streakDays = existing?.streakDays ?? 0;
  if (lastPlayedStr !== todayStr) {
    // played yesterday → extend streak; gap → reset to 1
    streakDays = lastPlayedStr === yesterdayStr ? streakDays + 1 : 1;
  }

  const completedChapters = existing?.completedChapters ?? [];
  if (body.completedChapter && !completedChapters.includes(body.completedChapter)) {
    completedChapters.push(body.completedChapter);
  }

  await db
    .insert(userProgress)
    .values({
      userId,
      xp: body.xp ?? 0,
      streakDays,
      lastPlayedAt: now,
      completedChapters,
    })
    .onConflictDoUpdate({
      target: userProgress.userId,
      set: {
        xp: body.xp ?? existing?.xp ?? 0,
        streakDays,
        lastPlayedAt: now,
        completedChapters,
      },
    });

  // Track per-word progress if provided
  if (body.wordId !== undefined && body.correct !== undefined) {
    const [existingWord] = await db
      .select()
      .from(wordProgress)
      .where(and(eq(wordProgress.userId, userId), eq(wordProgress.wordId, body.wordId)));

    await db
      .insert(wordProgress)
      .values({
        userId,
        wordId: body.wordId,
        timesCorrect: body.correct ? 1 : 0,
        timesWrong: body.correct ? 0 : 1,
        lastSeenAt: now,
        nextReviewAt: now,
      })
      .onConflictDoUpdate({
        target: [wordProgress.userId, wordProgress.wordId],
        set: {
          timesCorrect: body.correct
            ? (existingWord?.timesCorrect ?? 0) + 1
            : existingWord?.timesCorrect ?? 0,
          timesWrong: !body.correct
            ? (existingWord?.timesWrong ?? 0) + 1
            : existingWord?.timesWrong ?? 0,
          lastSeenAt: now,
        },
      });
  }

  return NextResponse.json({ ok: true });
}
