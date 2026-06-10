"use client";

export type FarisState = "idle" | "talking" | "happy" | "sad";

export default function FarisCharacter({ state }: { state: FarisState }) {
  const isSad = state === "sad";
  const isHappy = state === "happy";
  const isTalking = state === "talking";

  const auraColor =
    state === "idle"    ? "#22c55e" :
    state === "talking" ? "#fbbf24" :
    state === "happy"   ? "#fde047" :
    "#94a3b8";

  return (
    <svg viewBox="0 0 260 390" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
      <defs>
        <style>{`
          @keyframes far-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-9px); }
          }
          @keyframes far-blink {
            0%, 87%, 100% { transform: scaleY(1); }
            92% { transform: scaleY(0.05); }
          }
          @keyframes far-jaw {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.35) translateY(2px); }
          }
          @keyframes far-ball-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes far-ball-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-16px); }
          }
          @keyframes far-confetti {
            0% { opacity: 1; transform: translateY(0) rotate(0deg); }
            100% { opacity: 0; transform: translateY(40px) rotate(180deg); }
          }
          @keyframes far-glint {
            0% { opacity: 1; transform: scale(0.3); }
            100% { opacity: 0; transform: scale(1.7); }
          }
          @keyframes far-wave {
            0% { opacity: 0.65; transform: scale(0.75); }
            100% { opacity: 0; transform: scale(1.8); }
          }
          @keyframes far-sweat {
            0% { opacity: 0.9; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(16px); }
          }
          .far-body { animation: far-float 3.1s ease-in-out infinite; }
          .far-eye-l { transform-origin: 113px 95px; animation: far-blink 4.3s ease-in-out infinite; }
          .far-eye-r { transform-origin: 147px 95px; animation: far-blink 4.3s ease-in-out infinite 0.5s; }
          .far-mouth-anim { transform-origin: 130px 123px; animation: ${isTalking ? "far-jaw 0.5s ease-in-out infinite" : "none"}; }
          .far-ball { transform-origin: 130px 318px; animation: ${
            isHappy ? "far-ball-bounce 0.6s ease-in-out infinite" : "far-ball-spin 6s linear infinite"
          }; }
          .far-confetti-1 { animation: far-confetti 1.2s ease-in infinite; }
          .far-confetti-2 { animation: far-confetti 1.2s ease-in infinite 0.4s; }
          .far-confetti-3 { animation: far-confetti 1.2s ease-in infinite 0.8s; }
          .far-glint-1 { animation: far-glint 1.1s ease-out infinite; }
          .far-glint-2 { animation: far-glint 1.1s ease-out infinite 0.5s; }
          .far-wave-1 { animation: far-wave 1.2s ease-out infinite; }
          .far-wave-2 { animation: far-wave 1.2s ease-out infinite 0.4s; }
          .far-sweat { animation: far-sweat 1.4s ease-in infinite; }
        `}</style>

        <radialGradient id="far-skin" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#c88a5e" />
          <stop offset="100%" stopColor="#9a6030" />
        </radialGradient>
        <linearGradient id="far-jersey" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <radialGradient id="far-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={auraColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={auraColor} stopOpacity="0" />
        </radialGradient>
        <filter id="far-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* aura */}
      <ellipse cx="130" cy="210" rx="108" ry="140" fill="url(#far-aura)" />

      <g className="far-body" filter="url(#far-shadow)">

        {/* ── LEGS ── */}
        <rect x="108" y="248" width="17" height="58" rx="8" fill="url(#far-skin)" />
        <rect x="135" y="248" width="17" height="58" rx="8" fill="url(#far-skin)" />
        {/* socks */}
        <rect x="107" y="294" width="19" height="20" rx="5" fill="#15803d" />
        <rect x="134" y="294" width="19" height="20" rx="5" fill="#15803d" />
        <rect x="107" y="296" width="19" height="4" fill="#fde047" />
        <rect x="134" y="296" width="19" height="4" fill="#fde047" />
        {/* cleats */}
        <ellipse cx="114" cy="318" rx="13" ry="7" fill="#1a1a1a" />
        <ellipse cx="146" cy="318" rx="13" ry="7" fill="#1a1a1a" />

        {/* ── SHORTS ── */}
        <path d="M 100 222 L 160 222 L 158 256 L 135 256 L 130 240 L 125 256 L 102 256 Z" fill="#f5f5f5" />
        <path d="M 100 222 L 160 222 L 159 230 L 101 230 Z" fill="#e2e2e2" />

        {/* ── JERSEY / TORSO ── */}
        <path d="M 98 150 C 92 172 92 200 96 226 L 164 226 C 168 200 168 172 162 150 Z" fill="url(#far-jersey)" />
        {/* jersey side stripe gold */}
        <path d="M 98 152 L 103 152 L 100 226 L 96 226 Z" fill="#fde047" opacity="0.85" />
        <path d="M 157 152 L 162 152 L 164 226 L 160 226 Z" fill="#fde047" opacity="0.85" />
        {/* collar */}
        <path d="M 118 150 L 130 162 L 142 150" fill="#15803d" stroke="#fde047" strokeWidth="1.5" strokeLinejoin="round" />
        {/* number 10 */}
        <text x="130" y="200" textAnchor="middle" fontSize="34" fontWeight="900" fill="#fde047" fontFamily="Arial, sans-serif">10</text>

        {/* ── NECK ── */}
        <path d="M 119 137 Q 130 141 141 137 L 143 151 Q 130 155 117 151 Z" fill="url(#far-skin)" />

        {/* ── ARMS + CAPTAIN ARMBAND ── */}
        {state === "idle" && (
          <>
            <path d="M 98 156 Q 78 184 76 214" stroke="url(#far-skin)" strokeWidth="14" strokeLinecap="round" fill="none" />
            {/* short sleeve */}
            <path d="M 98 154 Q 88 162 84 174" stroke="url(#far-jersey)" strokeWidth="20" strokeLinecap="round" fill="none" />
            {/* armband */}
            <rect x="80" y="172" width="11" height="7" rx="2" fill="#fde047" transform="rotate(28 85 175)" />
            <ellipse cx="75" cy="218" rx="9" ry="8" fill="url(#far-skin)" />
            <path d="M 162 156 Q 182 184 184 214" stroke="url(#far-skin)" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M 162 154 Q 172 162 176 174" stroke="url(#far-jersey)" strokeWidth="20" strokeLinecap="round" fill="none" />
            <ellipse cx="185" cy="218" rx="9" ry="8" fill="url(#far-skin)" />
          </>
        )}
        {state === "talking" && (
          <>
            {/* left hand on hip */}
            <path d="M 98 156 Q 82 176 92 196" stroke="url(#far-skin)" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M 98 154 Q 90 162 86 174" stroke="url(#far-jersey)" strokeWidth="20" strokeLinecap="round" fill="none" />
            <rect x="82" y="172" width="11" height="7" rx="2" fill="#fde047" transform="rotate(30 87 175)" />
            <ellipse cx="94" cy="198" rx="9" ry="8" fill="url(#far-skin)" />
            {/* right arm pointing forward (coaching) */}
            <path d="M 162 156 Q 196 150 206 128" stroke="url(#far-skin)" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M 162 154 Q 172 158 178 166" stroke="url(#far-jersey)" strokeWidth="20" strokeLinecap="round" fill="none" />
            <ellipse cx="208" cy="124" rx="9" ry="8" fill="url(#far-skin)" transform="rotate(-25 208 124)" />
            <line x1="210" y1="119" x2="216" y2="110" stroke="url(#far-skin)" strokeWidth="7" strokeLinecap="round" />
          </>
        )}
        {state === "happy" && (
          <>
            {/* both fists pumped up */}
            <path d="M 98 156 Q 70 130 60 102" stroke="url(#far-skin)" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M 98 154 Q 88 146 82 136" stroke="url(#far-jersey)" strokeWidth="20" strokeLinecap="round" fill="none" />
            <rect x="78" y="134" width="11" height="7" rx="2" fill="#fde047" transform="rotate(-45 83 137)" />
            <circle cx="58" cy="98" r="10" fill="url(#far-skin)" />
            <path d="M 162 156 Q 190 130 200 102" stroke="url(#far-skin)" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M 162 154 Q 172 146 178 136" stroke="url(#far-jersey)" strokeWidth="20" strokeLinecap="round" fill="none" />
            <circle cx="202" cy="98" r="10" fill="url(#far-skin)" />
          </>
        )}
        {state === "sad" && (
          <>
            {/* both hands on hips, head down */}
            <path d="M 98 156 Q 80 178 96 198" stroke="url(#far-skin)" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M 98 154 Q 90 162 86 174" stroke="url(#far-jersey)" strokeWidth="20" strokeLinecap="round" fill="none" />
            <rect x="82" y="172" width="11" height="7" rx="2" fill="#fde047" transform="rotate(30 87 175)" />
            <ellipse cx="98" cy="200" rx="9" ry="8" fill="url(#far-skin)" />
            <path d="M 162 156 Q 180 178 164 198" stroke="url(#far-skin)" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M 162 154 Q 170 162 174 174" stroke="url(#far-jersey)" strokeWidth="20" strokeLinecap="round" fill="none" />
            <ellipse cx="162" cy="200" rx="9" ry="8" fill="url(#far-skin)" />
          </>
        )}

        {/* ── HEAD ── */}
        <ellipse cx="130" cy={isSad ? "95" : "92"} rx="35" ry="39" fill="url(#far-skin)" />

        {/* ── HAIR ── */}
        <path d="M 96 88 Q 92 54 130 50 Q 168 54 164 88 Q 158 70 130 67 Q 102 70 96 88 Z" fill="#1c1008" />
        <path d="M 96 88 Q 100 76 110 72 L 106 86 Z" fill="#2a1810" />
        <path d="M 164 88 Q 160 76 150 72 L 154 86 Z" fill="#2a1810" />

        {/* ── EARS ── */}
        <ellipse cx="95" cy="96" rx="6" ry="8" fill="url(#far-skin)" />
        <ellipse cx="165" cy="96" rx="6" ry="8" fill="url(#far-skin)" />

        {/* ── EYEBROWS ── */}
        {isSad ? (
          <>
            <path d="M 107 80 Q 112 77 118 80" stroke="#2a1810" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 142 80 Q 148 77 153 80" stroke="#2a1810" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : isHappy ? (
          <>
            <path d="M 107 76 Q 112 71 118 74" stroke="#2a1810" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 142 74 Q 148 71 153 76" stroke="#2a1810" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M 107 79 Q 113 75 118 77" stroke="#2a1810" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 142 77 Q 148 75 153 79" stroke="#2a1810" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* ── EYES ── */}
        <g className="far-eye-l">
          <ellipse cx="113" cy="95" rx="8" ry="9" fill="white" />
          <ellipse cx="113" cy="96" rx="5" ry="5.5" fill="#1a0800" />
          <circle cx="116" cy="93" r="2" fill="white" />
        </g>
        <g className="far-eye-r">
          <ellipse cx="147" cy="95" rx="8" ry="9" fill="white" />
          <ellipse cx="147" cy="96" rx="5" ry="5.5" fill="#1a0800" />
          <circle cx="150" cy="93" r="2" fill="white" />
        </g>

        {/* ── NOSE ── */}
        <path d="M 127 108 Q 130 113 133 108" stroke="#a06030" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* ── MOUTH ── */}
        <g className="far-mouth-anim">
          {isSad ? (
            <path d="M 118 126 Q 130 120 142 126" stroke="#7a3010" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : isHappy ? (
            <>
              <path d="M 113 121 Q 130 137 147 121" stroke="#7a3010" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 117 123 Q 130 135 143 123" fill="#7a1010" opacity="0.55" />
              <path d="M 119 124 Q 130 129 141 124" fill="white" opacity="0.9" />
            </>
          ) : isTalking ? (
            <>
              <path d="M 118 122 Q 130 126 142 122" stroke="#7a3010" strokeWidth="2" fill="none" strokeLinecap="round" />
              <ellipse cx="130" cy="127" rx="9" ry="5" fill="#5a2010" opacity="0.7" />
            </>
          ) : (
            <path d="M 117 123 Q 130 131 143 123" stroke="#7a3010" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
        </g>

      </g>{/* end far-body */}

      {/* ── FOOTBALL (does not float with body, spins/bounces) ── */}
      <g className="far-ball">
        <circle cx="130" cy="318" r="16" fill="white" stroke="#cbd5e1" strokeWidth="1" />
        {/* pentagon panels */}
        <polygon points="130,308 135,312 133,318 127,318 125,312" fill="#1a1a1a" />
        <polygon points="120,314 124,316 123,321 118,321 116,317" fill="#1a1a1a" opacity="0.85" />
        <polygon points="140,314 144,317 142,321 137,321 136,316" fill="#1a1a1a" opacity="0.85" />
        <path d="M 125 327 L 130 324 L 135 327 L 133 331 L 127 331 Z" fill="#1a1a1a" opacity="0.7" />
      </g>

      {/* ── STATE EXTRAS ── */}
      {isHappy && (
        <>
          {/* confetti */}
          <g className="far-confetti-1" style={{ transformOrigin: "60px 70px" }}>
            <rect x="57" y="67" width="6" height="9" rx="1" fill="#22c55e" />
          </g>
          <g className="far-confetti-2" style={{ transformOrigin: "200px 64px" }}>
            <rect x="197" y="61" width="6" height="9" rx="1" fill="#fde047" />
          </g>
          <g className="far-confetti-3" style={{ transformOrigin: "100px 56px" }}>
            <rect x="97" y="53" width="6" height="9" rx="1" fill="#ef4444" />
          </g>
          <g className="far-confetti-1" style={{ transformOrigin: "165px 58px" }}>
            <rect x="162" y="55" width="6" height="9" rx="1" fill="#3b82f6" />
          </g>
          <g className="far-confetti-2" style={{ transformOrigin: "40px 120px" }}>
            <rect x="37" y="117" width="6" height="9" rx="1" fill="#fde047" />
          </g>
          {/* glints */}
          <g className="far-glint-1" style={{ transformOrigin: "48px 90px" }}>
            <circle cx="48" cy="90" r="4" fill="#fde047" opacity="0.9" />
          </g>
          <g className="far-glint-2" style={{ transformOrigin: "212px 92px" }}>
            <circle cx="212" cy="92" r="4" fill="#fde047" opacity="0.9" />
          </g>
        </>
      )}
      {isSad && (
        <>
          {/* sweat drops */}
          <g className="far-sweat" style={{ transformOrigin: "160px 92px" }}>
            <ellipse cx="160" cy="92" rx="3" ry="4.5" fill="#93c5fd" opacity="0.85" />
          </g>
          <g className="far-sweat" style={{ transformOrigin: "100px 100px" }}>
            <ellipse cx="100" cy="100" rx="2.5" ry="4" fill="#93c5fd" opacity="0.7" />
          </g>
        </>
      )}
      {isTalking && (
        <>
          <g className="far-wave-1" style={{ transformOrigin: "220px 116px" }}>
            <circle cx="220" cy="116" r="12" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.65" />
          </g>
          <g className="far-wave-2" style={{ transformOrigin: "220px 116px" }}>
            <circle cx="220" cy="116" r="21" stroke="#fbbf24" strokeWidth="1.5" fill="none" opacity="0.3" />
          </g>
        </>
      )}
    </svg>
  );
}
