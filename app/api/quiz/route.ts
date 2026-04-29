import { NextRequest, NextResponse } from 'next/server';
import { getRandomQuiz, type VocabCategory } from '@/lib/vocab';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') as VocabCategory | null;
  try {
    const quiz = getRandomQuiz(category ?? undefined);
    return NextResponse.json(quiz, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to load quiz' },
      { status: 500 },
    );
  }
}
