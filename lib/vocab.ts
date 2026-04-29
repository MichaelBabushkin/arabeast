import vocab from '@/data/modern-standard-arabic.json';

export type VocabCategory = 'animals' | 'family' | 'food' | 'colors' | 'places';

export type VocabEntry = {
  id: string;
  category: VocabCategory;
  english: string;
  standardArabic: string;
  standardArabicTransliteration: string;
  audio?: string;
  image?: string;
};

const vocabCache: VocabEntry[] = vocab as VocabEntry[];

export function getVocabulary(category?: VocabCategory): VocabEntry[] {
  if (category) return vocabCache.filter((e) => e.category === category);
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

export function getRandomQuiz(category?: VocabCategory): QuizItem {
  const list = getVocabulary(category);
  const all = getVocabulary();
  if (list.length < 1) throw new Error('No vocab entries for this category');
  if (all.length < 4) throw new Error('Need at least 4 vocab entries to build a quiz');

  const target = list[Math.floor(Math.random() * list.length)];
  const distractors = shuffle(all.filter((entry) => entry.id !== target.id)).slice(0, 3);
  const options = shuffle([target, ...distractors]);

  return { target, options };
}
