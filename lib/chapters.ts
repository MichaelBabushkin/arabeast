import type { VocabCategory } from './vocab';

export type Chapter = {
  id: string;
  number: number;
  title: string;
  titleArabic: string;
  subtitle: string;
  category: VocabCategory;
  icon: string;
  color: string;
  xpRequired: number;
  storyContext: string;
};

export const CHAPTERS: Chapter[] = [
  {
    id: 'ch-1',
    number: 1,
    title: 'The Desert Menagerie',
    titleArabic: 'حيوانات الصحراء',
    subtitle: 'Animals of the Ancient World',
    category: 'animals',
    icon: '🦁',
    color: '#d4a017',
    xpRequired: 0,
    storyContext:
      'The lamp was once kept in a great desert palace surrounded by exotic animals. The Jinn remembers them fondly — lions that guarded the gates, horses that carried princes, birds that sang at dawn. Teach words for animals to help Zafar recall these creatures.',
  },
  {
    id: 'ch-2',
    number: 2,
    title: 'The Sorcerer\'s Family',
    titleArabic: 'عائلة الساحر',
    subtitle: 'Words of Kinship',
    category: 'family',
    icon: '👨‍👩‍👧‍👦',
    color: '#7c3aed',
    xpRequired: 50,
    storyContext:
      'Marid the sorcerer had a vast family who helped him guard the lamp. His father, mother, brothers and sisters all played a role in the curse. To break it, Zafar must remember each of them. Teach words for family members to unlock this part of the story.',
  },
  {
    id: 'ch-3',
    number: 3,
    title: 'The Feast Before the Curse',
    titleArabic: 'وليمة ما قبل اللعنة',
    subtitle: 'Food & Drink',
    category: 'food',
    icon: '🍞',
    color: '#d97706',
    xpRequired: 120,
    storyContext:
      'On the night of his imprisonment, Zafar was sharing a great feast with the royal court — bread, rice, chicken and sweet tea. Teach him the names of these foods and he will remember the last free evening of his ancient life.',
  },
  {
    id: 'ch-4',
    number: 4,
    title: 'The Colors of the Lamp',
    titleArabic: 'ألوان المصباح',
    subtitle: 'Colors of the World',
    category: 'colors',
    icon: '🎨',
    color: '#059669',
    xpRequired: 220,
    storyContext:
      'The lamp that traps Zafar is covered in magical runes written in different colors. Each color unlocks a fragment of the curse. Teach Zafar the colors of the world and he will help you decipher the runes.',
  },
  {
    id: 'ch-5',
    number: 5,
    title: 'The Kingdom of Al-Rashid',
    titleArabic: 'مملكة الرشيد',
    subtitle: 'Places of the Ancient City',
    category: 'places',
    icon: '🕌',
    color: '#0284c7',
    xpRequired: 350,
    storyContext:
      'Zafar was bound in the great city of Al-Rashid — a place of mosques, markets and schools. To break the final seal, you must name every corner of the city as it was 1,000 years ago. Teach Zafar the places and end his exile forever.',
  },
];

export function getChapter(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getUnlockedChapters(xp: number): Chapter[] {
  return CHAPTERS.filter((c) => c.xpRequired <= xp);
}
