"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_VOICE,
  DEFAULT_HEBREW_VOICE,
  DEFAULT_ENGLISH_VOICE,
  type JinnVoice,
  type HebrewVoice,
  type EnglishVoice,
} from "@/lib/tts";

export type Settings = {
  arabicVoice:  JinnVoice;
  hebrewVoice:  HebrewVoice;
  englishVoice: EnglishVoice;
  language:     "en" | "he";
};

const DEFAULTS: Settings = {
  arabicVoice:  DEFAULT_VOICE,
  hebrewVoice:  DEFAULT_HEBREW_VOICE,
  englishVoice: DEFAULT_ENGLISH_VOICE,
  language:     "en",
};

const KEY = "arabeast-settings";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setSettings({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch { /* ignore */ }
  }, []);

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  return { settings, update };
}
