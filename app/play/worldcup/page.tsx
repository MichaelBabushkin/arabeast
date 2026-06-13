"use client";

import Link from "next/link";
import { ArrowLeft, Lock, Check, ChevronRight } from "lucide-react";
import FarisCharacter from "@/components/faris/FarisCharacter";
import { WC_LOGO_URL, HAS_WC_LOGO, WC_HOST_TAGLINE } from "@/lib/worldcupBranding";
import { useWcProgress } from "@/lib/useWcProgress";
import { BASICS, ADVANCED } from "@/lib/footballVocab";

export default function WorldCupHub() {
  const { progress, loaded } = useWcProgress();
  const basicsDone = loaded && progress.basicsDone;
  const advancedDone = loaded && progress.advancedDone;

  return (
    <main className="min-h-screen flex flex-col">
      <div className="relative w-full flex flex-col gap-6 px-4 sm:px-8 lg:px-16 py-6">
        {/* nav */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-amber-300/60 hover:bg-white/5 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Menu
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400/60 ml-auto">
            ⚽ World Cup
          </p>
        </div>

        {/* header */}
        <div
          className="relative overflow-hidden rounded-3xl p-5 sm:p-6 flex items-center gap-5"
          style={{
            background: "linear-gradient(115deg, #06210f 0%, #0f3d22 45%, #14532d 75%, #1c5a2e 100%)",
            border: "1px solid rgba(253,224,71,0.45)",
          }}
        >
          {/* pitch mowing stripes */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            aria-hidden
            style={{ background: "repeating-linear-gradient(90deg, #fff 0 22px, transparent 22px 44px)" }}
          />
          {/* stadium-light glow */}
          <div
            className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full"
            aria-hidden
            style={{ background: "radial-gradient(circle, rgba(253,224,71,0.25) 0%, transparent 70%)" }}
          />
          {/* faint football watermark */}
          <span className="pointer-events-none absolute -bottom-10 right-8 text-[130px] opacity-[0.06] select-none" aria-hidden>⚽</span>

          {HAS_WC_LOGO ? (
            <img
              src={WC_LOGO_URL}
              alt="FIFA World Cup 2026"
              className="relative h-20 sm:h-24 w-auto object-contain flex-shrink-0 drop-shadow-lg"
            />
          ) : (
            <div className="relative w-[72px] flex-shrink-0 aspect-[260/390]">
              <FarisCharacter state="idle" />
            </div>
          )}

          <div className="relative flex-1 min-w-0">
            <span
              className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full text-green-950 mb-1.5"
              style={{ background: "#fde047" }}
            >
              ⚽ {WC_HOST_TAGLINE}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Road to the Cup</h1>
            <p className="text-base sm:text-lg text-yellow-200/80" style={{ fontFamily: "var(--font-noto-naskh), serif", direction: "rtl" }}>
              الطريق إلى الكأس
            </p>
            <p className="text-sm text-green-100/70 mt-1">
              Train your football Arabic with Faris, then follow the real World Cup.
            </p>
          </div>
        </div>

        {/* journey */}
        <div className="grid gap-4 md:grid-cols-3">
          <ChapterCard
            n={1}
            title="The Basics"
            titleArabic="الأساسيات"
            desc={`Learn ${BASICS.length} essential football words, then prove it in a quiz.`}
            href="/play/worldcup/basics"
            color="#22c55e"
            status={basicsDone ? "done" : "open"}
            footer={
              basicsDone
                ? `Completed · best ${progress.basicsBest}/${progress.basicsTotal}`
                : `${BASICS.length} words · multiple-choice quiz`
            }
          />

          <ChapterCard
            n={2}
            title="Advanced"
            titleArabic="المستوى المتقدم"
            desc="Put the words together — read and understand full football sentences."
            href="/play/worldcup/advanced"
            color="#a78bfa"
            status={advancedDone ? "done" : "open"}
            footer={
              advancedDone
                ? `Completed · best ${progress.advancedBest}/${progress.advancedTotal}`
                : `${ADVANCED.length} sentences · comprehension quiz`
            }
          />

          <ChapterCard
            n={3}
            title="The Mundial Album"
            titleArabic="ألبوم المونديال"
            desc="Collect a card for every team and real match of the 2026 World Cup — live from FIFA."
            href={basicsDone ? "/play/worldcup/album" : undefined}
            color="#fde047"
            status={basicsDone ? "open" : "locked"}
            footer={basicsDone ? "Live · official FIFA data" : "Unlocks after The Basics"}
          />
        </div>
      </div>
    </main>
  );
}

function ChapterCard({
  n,
  title,
  titleArabic,
  desc,
  href,
  color,
  status,
  footer,
}: {
  n: number;
  title: string;
  titleArabic: string;
  desc: string;
  href?: string;
  color: string;
  status: "open" | "done" | "locked" | "soon";
  footer: string;
}) {
  const locked = status === "locked" || status === "soon";

  const inner = (
    <div
      className={`relative flex items-center gap-4 rounded-3xl p-5 transition ${
        href ? "hover:scale-[1.01]" : ""
      }`}
      style={{
        background: locked
          ? "rgba(255,255,255,0.03)"
          : `linear-gradient(135deg, ${color}1f 0%, rgba(0,0,0,0) 100%)`,
        border: locked ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${color}55`,
        opacity: locked ? 0.7 : 1,
      }}
    >
      {/* number / status badge */}
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-black"
        style={{ background: locked ? "rgba(255,255,255,0.06)" : `${color}30`, color: locked ? "#d6c89a" : color }}
      >
        {status === "done" ? <Check className="h-5 w-5" /> : locked ? <Lock className="h-4 w-4" /> : n}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h2 className="font-bold text-amber-50">{title}</h2>
          <span className="text-sm text-amber-300/50" style={{ fontFamily: "var(--font-noto-naskh), serif" }}>
            {titleArabic}
          </span>
        </div>
        <p className="text-sm text-amber-200/55 mt-0.5 leading-snug">{desc}</p>
        <p className="text-[11px] font-semibold mt-1.5" style={{ color: locked ? "rgba(214,200,154,0.5)" : color }}>
          {footer}
        </p>
      </div>

      {href && <ChevronRight className="h-5 w-5 text-amber-300/40 flex-shrink-0" />}
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
