import data from "@/data/football-vocab.json";

export type WordForm = {
  arabic: string;
  translit: string;
};

export type FootballWord = {
  id: string;
  arabic: string;
  translit: string;
  english: string;
  emoji: string;
  variants?: WordForm[]; // alternative ways to say the same word
};

/** All the ways to say a word: the primary form plus any variants. */
export function formsOf(word: FootballWord): WordForm[] {
  return [{ arabic: word.arabic, translit: word.translit }, ...(word.variants ?? [])];
}

export type FootballSentence = {
  id: string;
  arabic: string;
  translit: string;
  english: string;
};

export const BASICS = data.basics as FootballWord[];
export const ADVANCED = data.advanced as FootballSentence[];

export type QuizQuestion = {
  word: FootballWord;
  prompt: WordForm;  // the specific Arabic form shown (primary OR a variant)
  options: string[]; // English meanings, one correct
};

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

/** Build an n-question multiple-choice quiz (pick the English meaning).
 *  Words with variants are shown in a random form, so both spellings are tested. */
export function buildBasicsQuiz(n = 10): QuizQuestion[] {
  const words = shuffle(BASICS).slice(0, Math.min(n, BASICS.length));
  return words.map((word) => {
    const forms = formsOf(word);
    const prompt = forms[Math.floor(Math.random() * forms.length)];
    const distractors = shuffle(BASICS.filter((w) => w.id !== word.id))
      .slice(0, 3)
      .map((w) => w.english);
    return { word, prompt, options: shuffle([word.english, ...distractors]) };
  });
}

export type SentenceQuestion = {
  sentence: FootballSentence;
  options: string[]; // English meanings, one correct
};

/** Build a sentence-comprehension quiz: read the Arabic, pick the meaning. */
export function buildAdvancedQuiz(n = 8): SentenceQuestion[] {
  const sentences = shuffle(ADVANCED).slice(0, Math.min(n, ADVANCED.length));
  return sentences.map((sentence) => {
    const distractors = shuffle(ADVANCED.filter((s) => s.id !== sentence.id))
      .slice(0, 3)
      .map((s) => s.english);
    return { sentence, options: shuffle([sentence.english, ...distractors]) };
  });
}
