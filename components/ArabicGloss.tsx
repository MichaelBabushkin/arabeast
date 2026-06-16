"use client";

import { useSettings } from "@/lib/useSettings";

const NAF = "var(--font-noto-naskh), serif";

/**
 * An Arabic UI label with a small English gloss shown beside it when the
 * "show Arabic help" setting is on (default). Used for decorative/chrome
 * Arabic text across the app — NOT for learning content like the news itself.
 */
export default function ArabicGloss({
  ar,
  en,
  arClassName,
  enClassName,
}: {
  ar: string;
  en: string;
  arClassName?: string;
  enClassName?: string;
}) {
  const { settings } = useSettings();
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={arClassName} dir="rtl" style={{ fontFamily: NAF }}>{ar}</span>
      {settings.showArabicHelp && <span className={enClassName ?? "text-[11px] opacity-60"}>{en}</span>}
    </span>
  );
}
