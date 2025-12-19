import { NextResponse } from 'next/server';
import { getRandomQuiz } from '@/lib/vocab';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const quiz = getRandomQuiz();
    return NextResponse.json(quiz, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to load quiz' },
      { status: 500 },
    );
  }
}
