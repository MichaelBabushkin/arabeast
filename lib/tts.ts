// Arabic voices — Saudi, Egyptian, Lebanese, Jordanian
export const ARABIC_VOICES = [
  "ar-SA-HamedNeural",    // deep Saudi male
  "ar-SA-ZariyahNeural",  // Saudi female
  "ar-EG-ShakirNeural",   // Egyptian male
  "ar-EG-SalmaNeural",    // Egyptian female
  "ar-LB-RamiNeural",     // Lebanese male
  "ar-JO-TaimNeural",     // Jordanian male
] as const;

export const HEBREW_VOICES = [
  "he-IL-AvriNeural",     // Israeli male
  "he-IL-HilaNeural",     // Israeli female
] as const;

export const ENGLISH_VOICES = [
  "en-US-GuyNeural",      // US male
  "en-US-JennyNeural",    // US female
  "en-GB-RyanNeural",     // UK male
  "en-GB-SoniaNeural",    // UK female
] as const;

// Legacy alias — code that still imports JINN_VOICES keeps working
export const JINN_VOICES = ARABIC_VOICES;

export const ALL_VOICES = [...ARABIC_VOICES, ...HEBREW_VOICES, ...ENGLISH_VOICES] as const;

export type JinnVoice    = (typeof ARABIC_VOICES)[number];
export type HebrewVoice  = (typeof HEBREW_VOICES)[number];
export type EnglishVoice = (typeof ENGLISH_VOICES)[number];
export type AnyVoice     = JinnVoice | HebrewVoice | EnglishVoice;

export const DEFAULT_VOICE:         JinnVoice    = "ar-SA-HamedNeural";
export const DEFAULT_QAMAR_VOICE:   JinnVoice    = "ar-SA-ZariyahNeural";
export const DEFAULT_HEBREW_VOICE:  HebrewVoice  = "he-IL-AvriNeural";
export const DEFAULT_ENGLISH_VOICE: EnglishVoice = "en-US-GuyNeural";

export const ARABIC_VOICE_LABELS: Record<string, string> = {
  "ar-SA-HamedNeural":   "Hamed (Saudi)",
  "ar-SA-ZariyahNeural": "Zariyah (Saudi)",
  "ar-EG-ShakirNeural":  "Shakir (Egyptian)",
  "ar-EG-SalmaNeural":   "Salma (Egyptian)",
  "ar-LB-RamiNeural":    "Rami (Lebanese)",
  "ar-JO-TaimNeural":    "Taim (Jordanian)",
};

export const HEBREW_VOICE_LABELS: Record<string, string> = {
  "he-IL-AvriNeural": "Avri (Israeli)",
  "he-IL-HilaNeural": "Hila (Israeli)",
};

export const ENGLISH_VOICE_LABELS: Record<string, string> = {
  "en-US-GuyNeural":   "Guy (US)",
  "en-US-JennyNeural": "Jenny (US)",
  "en-GB-RyanNeural":  "Ryan (UK)",
  "en-GB-SoniaNeural": "Sonia (UK)",
};

export const PREVIEW_SENTENCES: Record<string, string> = {
  arabic:  "مرحباً، كيف حالك؟",
  hebrew:  "שלום, כיצד אוכל לעזור לך?",
  english: "Hello, let me help you learn Arabic today.",
};
