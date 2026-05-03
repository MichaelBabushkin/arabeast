// Arabic voices — Saudi dialect (MSA closest match)
export const JINN_VOICES = [
  "ar-SA-HamedNeural",    // Zafar default — deep Saudi male
  "ar-SA-ZariyahNeural",  // Qamar default — Saudi female
  "ar-EG-ShakirNeural",   // Egyptian male — widely understood
  "ar-EG-SalmaNeural",    // Egyptian female
  "ar-LB-RamiNeural",     // Lebanese male
  "ar-JO-TaimNeural",     // Jordanian male
] as const;

export type JinnVoice = (typeof JINN_VOICES)[number];
export const DEFAULT_VOICE: JinnVoice = "ar-SA-HamedNeural";
export const DEFAULT_QAMAR_VOICE: JinnVoice = "ar-SA-ZariyahNeural";
