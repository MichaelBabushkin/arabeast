// Vocabulary category taxonomy. Pure + client-safe (no server deps).

export type LearnCategoryId = string; // kebab-case slug

export type LearnCategory = {
  id: LearnCategoryId;
  madrasaId: number;
  en: string;
  he: string;
  ar: string;
  emoji: string;
};

export const LEARN_CATEGORIES: LearnCategory[] = [
  { id: "food", madrasaId: 5, en: "Food", he: "אוכל", ar: "طعام", emoji: "🍲" },
  { id: "home", madrasaId: 17, en: "Home", he: "בבית", ar: "في البيت", emoji: "🏠" },
  { id: "clothes", madrasaId: 15, en: "Clothes", he: "בגדים", ar: "ملابس", emoji: "👕" },
  { id: "expressions", madrasaId: 36, en: "Expressions", he: "ביטויים", ar: "تعبيرات", emoji: "💬" },
  { id: "animals-mammals", madrasaId: 33, en: "Mammals", he: "בעלי חיים - יונקים", ar: "حيوانات - ثدييات", emoji: "🦁" },
  { id: "animals-birds", madrasaId: 39, en: "Birds", he: "בעלי חיים - עופות", ar: "حيوانات - طيور", emoji: "🦅" },
  { id: "animals-other", madrasaId: 6, en: "Other Animals", he: "בעלי חיים - כל השאר", ar: "حيوانات - أخرى", emoji: "🦎" },
  { id: "greetings", madrasaId: 4, en: "Greetings", he: "ברכות", ar: "تحيات", emoji: "👋" },
  { id: "used-in-hebrew", madrasaId: 21, en: "Used in Hebrew", he: "בשימוש בעברית", ar: "مستعمل في العبرية", emoji: "🗣️" },
  { id: "human-body", madrasaId: 18, en: "Human Body", he: "גוף האדם", ar: "جسم الإنسان", emoji: "👤" },
  { id: "grammar", madrasaId: 31, en: "Grammar", he: "דקדוק", ar: "قواعد", emoji: "✍️" },
  { id: "religion-holidays", madrasaId: 20, en: "Religions & Holidays", he: "דתות וחגים", ar: "أديان وأعياد", emoji: "🕌" },
  { id: "time", madrasaId: 7, en: "Time", he: "זמן", ar: "زمن", emoji: "⏰" },
  { id: "materials", madrasaId: 28, en: "Materials", he: "חומרים", ar: "مواد", emoji: "🧱" },
  { id: "education", madrasaId: 24, en: "Education", he: "חינוך", ar: "تعليم", emoji: "🎓" },
  { id: "technology", madrasaId: 38, en: "Technology", he: "טכנולוגיה ומחשבים", ar: "تكنولوجيا وحواسيب", emoji: "💻" },
  { id: "vegetables", madrasaId: 34, en: "Vegetables", he: "ירקות", ar: "خضרוات", emoji: "🥕" },
  { id: "tools", madrasaId: 37, en: "Tools", he: "כלי עבודה", ar: "أدوات عمل", emoji: "🛠️" },
  { id: "economy", madrasaId: 16, en: "Economy", he: "כלכלה", ar: "اقتصاد", emoji: "💰" },
  { id: "science", madrasaId: 23, en: "Science", he: "מדע", ar: "علوم", emoji: "🔬" },
  { id: "music", madrasaId: 32, en: "Music", he: "מוסיקה", ar: "موسيقى", emoji: "🎵" },
  { id: "weather", madrasaId: 14, en: "Weather", he: "מזג אוויר", ar: "طقس", emoji: "🌦️" },
  { id: "numbers", madrasaId: 1, en: "Numbers", he: "מספרים", ar: "أرقام", emoji: "🔢" },
  { id: "countries", madrasaId: 29, en: "Countries", he: "מקומות - מדינות", ar: "بلدان", emoji: "🗺️" },
  { id: "cities", madrasaId: 30, en: "Cities", he: "מקומות - ערים", ar: "مدن", emoji: "🏙️" },
  { id: "places-other", madrasaId: 3, en: "Other Places", he: "מקומות - כל השאר", ar: "أماكن أخرى", emoji: "📍" },
  { id: "professions", madrasaId: 9, en: "Professions", he: "מקצועות", ar: "مهن", emoji: "💼" },
  { id: "family", madrasaId: 8, en: "Family", he: "משפחה", ar: "عائلة", emoji: "👪" },
  { id: "sports", madrasaId: 13, en: "Sports", he: "ספורט", ar: "رياضة", emoji: "⚽" },
  { id: "politics", madrasaId: 11, en: "Politics", he: "פוליטיקה", ar: "سياسة", emoji: "🏛️" },
  { id: "fruits", madrasaId: 35, en: "Fruits", he: "פירות", ar: "فواكه", emoji: "🍎" },
  { id: "army-security", madrasaId: 12, en: "Army & Security", he: "צבא וביטחון", ar: "جيש وأمن", emoji: "🛡️" },
  { id: "colors", madrasaId: 2, en: "Colors", he: "צבעים", ar: "ألوان", emoji: "🎨" },
  { id: "plants", madrasaId: 19, en: "Plants", he: "צמחים", ar: "نباتات", emoji: "🌿" },
  { id: "medicine", madrasaId: 22, en: "Medicine", he: "רפואה", ar: "طب", emoji: "🩺" },
  { id: "questions", madrasaId: 10, en: "Questions", he: "שאלות", ar: "أسئلة", emoji: "❓" },
  { id: "personal-names", madrasaId: 25, en: "Personal Names", he: "שמות פרטיים", ar: "أسماء شخصية", emoji: "🏷️" },
  { id: "transportation", madrasaId: 26, en: "Transportation", he: "תחבורה", ar: "وسائل النقل", emoji: "🚗" },
  { id: "communication", madrasaId: 27, en: "Communication", he: "תקשורת", ar: "اتصالات", emoji: "📞" },
];

export const LEARN_CATEGORY_META: Record<string, LearnCategory> = Object.fromEntries(
  LEARN_CATEGORIES.map((c) => [c.id, c])
);

export function isLearnCategory(c: unknown): c is LearnCategoryId {
  return typeof c === "string" && LEARN_CATEGORIES.some((x) => x.id === c);
}
