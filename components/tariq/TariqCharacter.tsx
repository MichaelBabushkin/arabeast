"use client";

export type TariqState = "idle" | "talking" | "happy" | "sad";

export default function TariqCharacter({ state }: { state: TariqState }) {
  const isSad = state === "sad";
  const isHappy = state === "happy";
  const isTalking = state === "talking";

  const auraColor =
    state === "idle"    ? "#f59e0b" :
    state === "talking" ? "#60a5fa" :
    state === "happy"   ? "#fde68a" :
    "#94a3b8";

  return (
    <svg viewBox="0 0 260 390" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
      <defs>
        <style>{`
          @keyframes tar-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-9px); }
          }
          @keyframes tar-blink {
            0%, 86%, 100% { transform: scaleY(1); }
            91% { transform: scaleY(0.05); }
          }
          @keyframes tar-jaw {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.35) translateY(2px); }
          }
          @keyframes tar-star {
            0% { opacity: 1; transform: scale(0.3) translateY(0); }
            100% { opacity: 0; transform: scale(1.8) translateY(-25px); }
          }
          @keyframes tar-sand {
            0% { opacity: 0.7; transform: translateX(0) translateY(0); }
            100% { opacity: 0; transform: translateX(18px) translateY(22px); }
          }
          @keyframes tar-pulse {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.15); }
          }
          @keyframes tar-wave {
            0% { opacity: 0.65; transform: scale(0.75); }
            100% { opacity: 0; transform: scale(1.8); }
          }
          .tar-body { animation: tar-float 3.2s ease-in-out infinite; }
          .tar-eye-l { transform-origin: 113px 96px; animation: tar-blink 4.2s ease-in-out infinite; }
          .tar-eye-r { transform-origin: 147px 96px; animation: tar-blink 4.2s ease-in-out infinite 0.5s; }
          .tar-mouth-anim { transform-origin: 130px 124px; animation: ${isTalking ? "tar-jaw 0.5s ease-in-out infinite" : "none"}; }
          .tar-star-1 { animation: tar-star 1.0s ease-out infinite; }
          .tar-star-2 { animation: tar-star 1.0s ease-out infinite 0.32s; }
          .tar-star-3 { animation: tar-star 1.0s ease-out infinite 0.65s; }
          .tar-sand-1 { animation: tar-sand 1.4s ease-in infinite; }
          .tar-sand-2 { animation: tar-sand 1.4s ease-in infinite 0.5s; }
          .tar-compass { animation: tar-pulse 2s ease-in-out infinite; }
          .tar-wave-1 { animation: tar-wave 1.2s ease-out infinite; }
          .tar-wave-2 { animation: tar-wave 1.2s ease-out infinite 0.4s; }
        `}</style>

        <radialGradient id="tar-skin" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#c88a5e" />
          <stop offset="100%" stopColor="#9a6030" />
        </radialGradient>
        <linearGradient id="tar-robe" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#f5edd8" />
          <stop offset="100%" stopColor="#dfd0b0" />
        </linearGradient>
        <linearGradient id="tar-turban" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2a4a7a" />
          <stop offset="100%" stopColor="#1e3260" />
        </linearGradient>
        <radialGradient id="tar-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={auraColor} stopOpacity="0.28" />
          <stop offset="100%" stopColor={auraColor} stopOpacity="0" />
        </radialGradient>
        <filter id="tar-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* aura */}
      <ellipse cx="130" cy="210" rx="108" ry="138" fill="url(#tar-aura)" />

      <g className="tar-body" filter="url(#tar-shadow)">

        {/* ── ROBE SKIRT ── */}
        <path
          d={isSad
            ? "M 88 198 Q 78 258 74 358 L 186 358 Q 182 258 172 198 Z"
            : "M 88 198 Q 74 258 66 360 L 194 360 Q 186 258 172 198 Z"}
          fill="url(#tar-robe)"
        />
        {/* robe seam */}
        <line x1="130" y1="198" x2="130" y2="360" stroke="#c4b898" strokeWidth="1.5" opacity="0.5" />
        {/* robe hem */}
        <path d="M 68 346 Q 130 356 192 346" stroke="#c4b898" strokeWidth="1.5" fill="none" opacity="0.6" />

        {/* ── ROBE CHEST ── */}
        <path d="M 94 148 C 90 165 88 182 88 198 L 172 198 C 172 182 170 165 166 148 Z" fill="url(#tar-robe)" />
        {/* chest seam */}
        <line x1="130" y1="148" x2="130" y2="198" stroke="#c4b898" strokeWidth="1.5" opacity="0.5" />
        {/* collar v-shape */}
        <path d="M 118 148 L 130 168 L 142 148" fill="#dfd0b0" stroke="#c4b898" strokeWidth="1" strokeLinejoin="round" />

        {/* ── NECK ── */}
        <path d="M 119 136 Q 130 140 141 136 L 143 150 Q 130 154 117 150 Z" fill="url(#tar-skin)" />

        {/* ── ARMS ── */}
        {state === "idle" && (
          <>
            {/* arms slightly away from body, relaxed */}
            <path d="M 94 156 Q 74 184 72 212" stroke="url(#tar-robe)" strokeWidth="22" strokeLinecap="round" fill="none" />
            <path d="M 94 156 Q 74 184 72 212" stroke="url(#tar-skin)" strokeWidth="12" strokeLinecap="round" fill="none" />
            <ellipse cx="71" cy="216" rx="11" ry="9" fill="url(#tar-skin)" />
            <path d="M 166 156 Q 186 184 188 212" stroke="url(#tar-robe)" strokeWidth="22" strokeLinecap="round" fill="none" />
            <path d="M 166 156 Q 186 184 188 212" stroke="url(#tar-skin)" strokeWidth="12" strokeLinecap="round" fill="none" />
            <ellipse cx="189" cy="216" rx="11" ry="9" fill="url(#tar-skin)" />
            {/* compass held in right hand */}
            <g className="tar-compass">
              <circle cx="189" cy="228" r="9" fill="#1e3260" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="189" y1="222" x2="189" y2="228" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="195" y1="228" x2="189" y2="228" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </>
        )}
        {state === "talking" && (
          <>
            {/* left arm across body slightly */}
            <path d="M 94 156 Q 76 180 78 208" stroke="url(#tar-robe)" strokeWidth="22" strokeLinecap="round" fill="none" />
            <path d="M 94 156 Q 76 180 78 208" stroke="url(#tar-skin)" strokeWidth="12" strokeLinecap="round" fill="none" />
            <ellipse cx="77" cy="212" rx="11" ry="9" fill="url(#tar-skin)" />
            {/* right arm raised pointing to sky */}
            <path d="M 166 156 Q 200 140 208 108" stroke="url(#tar-robe)" strokeWidth="22" strokeLinecap="round" fill="none" />
            <path d="M 166 156 Q 200 140 208 108" stroke="url(#tar-skin)" strokeWidth="12" strokeLinecap="round" fill="none" />
            <ellipse cx="208" cy="104" rx="11" ry="9" fill="url(#tar-skin)" transform="rotate(-25 208 104)" />
            {/* pointing finger */}
            <line x1="210" y1="97" x2="213" y2="84" stroke="url(#tar-skin)" strokeWidth="8" strokeLinecap="round" />
          </>
        )}
        {state === "happy" && (
          <>
            {/* both arms wide open */}
            <path d="M 94 156 Q 62 126 48 98" stroke="url(#tar-robe)" strokeWidth="22" strokeLinecap="round" fill="none" />
            <path d="M 94 156 Q 62 126 48 98" stroke="url(#tar-skin)" strokeWidth="12" strokeLinecap="round" fill="none" />
            <ellipse cx="46" cy="94" rx="11" ry="9" fill="url(#tar-skin)" transform="rotate(25 46 94)" />
            <path d="M 166 156 Q 198 126 212 98" stroke="url(#tar-robe)" strokeWidth="22" strokeLinecap="round" fill="none" />
            <path d="M 166 156 Q 198 126 212 98" stroke="url(#tar-skin)" strokeWidth="12" strokeLinecap="round" fill="none" />
            <ellipse cx="214" cy="94" rx="11" ry="9" fill="url(#tar-skin)" transform="rotate(-25 214 94)" />
          </>
        )}
        {state === "sad" && (
          <>
            {/* arms hanging, slightly inward */}
            <path d="M 94 156 Q 84 198 84 235" stroke="url(#tar-robe)" strokeWidth="22" strokeLinecap="round" fill="none" />
            <path d="M 94 156 Q 84 198 84 235" stroke="url(#tar-skin)" strokeWidth="12" strokeLinecap="round" fill="none" />
            <ellipse cx="83" cy="239" rx="11" ry="9" fill="url(#tar-skin)" />
            <path d="M 166 156 Q 176 198 176 235" stroke="url(#tar-robe)" strokeWidth="22" strokeLinecap="round" fill="none" />
            <path d="M 166 156 Q 176 198 176 235" stroke="url(#tar-skin)" strokeWidth="12" strokeLinecap="round" fill="none" />
            <ellipse cx="177" cy="239" rx="11" ry="9" fill="url(#tar-skin)" />
          </>
        )}

        {/* ── HEAD ── */}
        <ellipse cx="130" cy={isSad ? "94" : "91"} rx="36" ry="40" fill="url(#tar-skin)" />

        {/* ── BEARD STUBBLE ── */}
        <path d="M 98 112 Q 106 126 130 132 Q 154 126 162 112" stroke="#7a4a20" strokeWidth="0" fill="#7a4a2040" />
        <ellipse cx="130" cy="122" rx="22" ry="8" fill="#7a4a2022" />

        {/* ── TURBAN BASE ── */}
        <ellipse cx="130" cy="63" rx="46" ry="30" fill="url(#tar-turban)" />
        {/* turban wrapping folds */}
        <path d="M 84 63 Q 100 52 130 48 Q 160 52 176 63" stroke="#3a5a9a" strokeWidth="4" fill="none" opacity="0.6" />
        <path d="M 86 69 Q 104 60 130 57 Q 156 60 174 69" stroke="#1a2a50" strokeWidth="3" fill="none" opacity="0.4" />
        <path d="M 90 76 Q 108 68 130 66 Q 152 68 170 76" stroke="#3a5a9a" strokeWidth="2.5" fill="none" opacity="0.5" />
        {/* turban side drape */}
        <path d="M 176 63 Q 182 72 178 86 Q 172 92 168 96" stroke="#1e3260" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M 176 63 Q 182 72 178 86 Q 172 92 168 96" stroke="#2a4a7a" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* turban front pin/gem */}
        <circle cx="130" cy="56" r="6" fill="#f59e0b" />
        <circle cx="130" cy="56" r="3.5" fill="#fde68a" />

        {/* ── EYEBROWS ── */}
        {isSad ? (
          <>
            <path d="M 107 80 Q 112 77 118 80" stroke="#5c3010" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 142 80 Q 148 77 153 80" stroke="#5c3010" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : isHappy ? (
          <>
            <path d="M 107 78 Q 112 73 118 76" stroke="#5c3010" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 142 76 Q 148 73 153 78" stroke="#5c3010" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M 107 80 Q 113 76 118 78" stroke="#5c3010" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 142 78 Q 148 76 153 80" stroke="#5c3010" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* ── EYES ── */}
        <g className="tar-eye-l">
          <ellipse cx="113" cy="96" rx="8" ry="9" fill="white" />
          <ellipse cx="113" cy="97" rx="5" ry="5.5" fill="#1a0800" />
          <circle cx="116" cy="94" r="2" fill="white" />
        </g>
        <g className="tar-eye-r">
          <ellipse cx="147" cy="96" rx="8" ry="9" fill="white" />
          <ellipse cx="147" cy="97" rx="5" ry="5.5" fill="#1a0800" />
          <circle cx="150" cy="94" r="2" fill="white" />
        </g>

        {/* ── NOSE ── */}
        <path d="M 127 110 Q 130 115 133 110" stroke="#a06030" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="130" cy="113" rx="4" ry="2" fill="#a06030" opacity="0.25" />

        {/* ── MOUTH ── */}
        <g className="tar-mouth-anim">
          {isSad ? (
            <path d="M 118 128 Q 130 122 142 128" stroke="#8b4820" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : isHappy ? (
            <>
              <path d="M 115 124 Q 130 136 145 124" stroke="#8b4820" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 118 126 Q 130 135 142 126" fill="#7a3010" opacity="0.5" />
            </>
          ) : isTalking ? (
            <>
              <path d="M 118 124 Q 130 128 142 124" stroke="#8b4820" strokeWidth="2" fill="none" strokeLinecap="round" />
              <ellipse cx="130" cy="129" rx="9" ry="5" fill="#5a2010" opacity="0.7" />
            </>
          ) : (
            <path d="M 117 126 Q 130 132 143 126" stroke="#8b4820" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
        </g>

        {/* ── EARS ── */}
        <ellipse cx="94" cy="98" rx="7" ry="9" fill="url(#tar-skin)" />
        <ellipse cx="166" cy="98" rx="7" ry="9" fill="url(#tar-skin)" />
        <ellipse cx="94" cy="98" rx="4" ry="6" fill="#a06030" opacity="0.4" />
        <ellipse cx="166" cy="98" rx="4" ry="6" fill="#a06030" opacity="0.4" />

      </g>{/* end tar-body */}

      {/* ── STATE EXTRAS ── */}
      {isHappy && (
        <>
          <g className="tar-star-1" style={{ transformOrigin: "43px 78px" }}>
            <polygon points="43,70 45,76 52,76 46,80 49,87 43,83 37,87 40,80 34,76 41,76" fill="#fde68a" opacity="0.95" />
          </g>
          <g className="tar-star-2" style={{ transformOrigin: "213px 68px" }}>
            <polygon points="213,60 215,66 222,66 216,70 219,77 213,73 207,77 210,70 204,66 211,66" fill="#fbbf24" opacity="0.9" />
          </g>
          <g className="tar-star-3" style={{ transformOrigin: "52px 148px" }}>
            <polygon points="52,142 54,148 60,148 55,152 57,158 52,154 47,158 49,152 44,148 50,148" fill="#f59e0b" opacity="0.8" />
          </g>
          {/* extra glints */}
          <g className="tar-star-1" style={{ transformOrigin: "200px 140px" }}>
            <circle cx="200" cy="140" r="3" fill="#fde68a" opacity="0.7" />
          </g>
        </>
      )}
      {isSad && (
        <>
          {/* drifting sand particles */}
          <g className="tar-sand-1" style={{ transformOrigin: "75px 240px" }}>
            <ellipse cx="75" cy="240" rx="5" ry="2" fill="#d4b060" opacity="0.6" transform="rotate(-20 75 240)" />
          </g>
          <g className="tar-sand-2" style={{ transformOrigin: "175px 255px" }}>
            <ellipse cx="175" cy="255" rx="4" ry="2" fill="#d4b060" opacity="0.5" transform="rotate(15 175 255)" />
          </g>
          <g className="tar-sand-1" style={{ transformOrigin: "95px 280px" }}>
            <ellipse cx="95" cy="280" rx="3" ry="1.5" fill="#d4b060" opacity="0.4" transform="rotate(-30 95 280)" />
          </g>
        </>
      )}
      {isTalking && (
        <>
          <g className="tar-wave-1" style={{ transformOrigin: "218px 102px" }}>
            <circle cx="218" cy="102" r="12" stroke="#60a5fa" strokeWidth="2" fill="none" opacity="0.65" />
          </g>
          <g className="tar-wave-2" style={{ transformOrigin: "218px 102px" }}>
            <circle cx="218" cy="102" r="21" stroke="#60a5fa" strokeWidth="1.5" fill="none" opacity="0.3" />
          </g>
        </>
      )}
    </svg>
  );
}
