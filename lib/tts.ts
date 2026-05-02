export const JINN_VOICES = ["Charon", "Fenrir", "Orus", "Puck", "Kore", "Aoede", "Leda"] as const;
export type JinnVoice = (typeof JINN_VOICES)[number];
export const DEFAULT_VOICE: JinnVoice = "Charon";
