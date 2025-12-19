import vocab from '@/data/modern-standard-arabic.json';

export type VocabEntry = {
  id: string;
  english: string;
  standardArabic: string;
  standardArabicTransliteration: string;
  audio?: string;
};

const vocabCache: VocabEntry[] = vocab;

export function getVocabulary(): VocabEntry[] {
  return vocabCache;
}

export type QuizItem = {
  target: VocabEntry;
  options: VocabEntry[];
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getRandomQuiz(): QuizItem {
  const list = getVocabulary();
  if (list.length < 4) {
    throw new Error('Need at least 4 vocab entries to build a quiz');
  }

  const target = list[Math.floor(Math.random() * list.length)];
  const distractors = shuffle(list.filter((entry) => entry.id !== target.id)).slice(0, 3);
  const options = shuffle([target, ...distractors]);

  return { target, options };
}
