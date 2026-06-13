"use client";

import { useCallback, useEffect, useState } from "react";
import type { WCOutcome } from "@/lib/worldcup";

const STORAGE_KEY = "arabeast.album.v1";

export type MatchEntry = {
  predicted?: WCOutcome;     // outcome the player guessed (before result)
  correct?: boolean;         // was the prediction right (set when collected)
  collectedAt?: string;      // ISO — present once the card is in the album
};

export type AlbumState = {
  teams: Record<string, string>;        // teamCode -> collectedAt ISO
  matches: Record<string, MatchEntry>;  // matchId  -> entry
};

const EMPTY: AlbumState = { teams: {}, matches: {} };

function load(): AlbumState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<AlbumState>;
    return { teams: parsed.teams ?? {}, matches: parsed.matches ?? {} };
  } catch {
    return EMPTY;
  }
}

export function useAlbum() {
  const [album, setAlbum] = useState<AlbumState>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAlbum(load());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: AlbumState) => {
    setAlbum(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, []);

  const collectTeam = useCallback((code: string) => {
    setAlbum((prev) => {
      if (prev.teams[code]) return prev;
      const next: AlbumState = {
        ...prev,
        teams: { ...prev.teams, [code]: new Date().toISOString() },
      };
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const predictMatch = useCallback((id: string, outcome: WCOutcome) => {
    setAlbum((prev) => {
      const next: AlbumState = {
        ...prev,
        matches: { ...prev.matches, [id]: { ...prev.matches[id], predicted: outcome } },
      };
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const collectMatch = useCallback((id: string, correct: boolean | undefined) => {
    setAlbum((prev) => {
      if (prev.matches[id]?.collectedAt) return prev;
      const next: AlbumState = {
        ...prev,
        matches: {
          ...prev.matches,
          [id]: { ...prev.matches[id], correct, collectedAt: new Date().toISOString() },
        },
      };
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const reset = useCallback(() => persist(EMPTY), [persist]);

  return { album, loaded, collectTeam, predictMatch, collectMatch, reset };
}
