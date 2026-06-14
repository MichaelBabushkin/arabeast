"use client";

export type LaylaState = "idle" | "talking" | "happy" | "sad";

export default function LaylaCharacter({ state }: { state: LaylaState }) {
  const isSad = state === "sad";
  const isHappy = state === "happy";
  const isTalking = state === "talking";

  const auraColor =
    state === "idle"    ? "#c084fc" :
    state === "talking" ? "#f0abfc" :
    state === "happy"   ? "#f472b6" :
    "#94a3b8";

  return (
    <svg viewBox="0 0 260 390" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
      <defs>
        <style>{`
          @keyframes lay-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes lay-blink { 0%,92%,100%{transform:scaleY(1)} 96%{transform:scaleY(0.08)} }
          @keyframes lay-jaw { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.35) translateY(1px)} }
          @keyframes lay-spark { 0%{opacity:1;transform:scale(0.4) translateY(0)} 100%{opacity:0;transform:scale(1.6) translateY(-22px)} }
          @keyframes lay-twinkle { 0%,100%{opacity:0.25} 50%{opacity:0.95} }
          @keyframes lay-tear { 0%{opacity:0.9;transform:translateY(0)} 100%{opacity:0;transform:translateY(18px)} }
          @keyframes lay-wave { 0%{opacity:0.7;transform:scale(0.7)} 100%{opacity:0;transform:scale(1.7)} }
          .lay-body { animation: lay-float 3.6s ease-in-out infinite; }
          .lay-eyelid-l { transform-origin: 115px 103px; animation: lay-blink 5s ease-in-out infinite; }
          .lay-eyelid-r { transform-origin: 145px 103px; animation: lay-blink 5s ease-in-out infinite 0.4s; }
          .lay-mouth { transform-origin: 130px 138px; animation: ${isTalking ? "lay-jaw 0.5s ease-in-out infinite" : "none"}; }
          .lay-tw-1 { animation: lay-twinkle 2.6s ease-in-out infinite; }
          .lay-tw-2 { animation: lay-twinkle 2.6s ease-in-out infinite 0.6s; }
          .lay-tw-3 { animation: lay-twinkle 2.6s ease-in-out infinite 1.2s; }
          .lay-tw-4 { animation: lay-twinkle 2.6s ease-in-out infinite 1.8s; }
          .lay-spark-1 { animation: lay-spark 1.1s ease-out infinite; }
          .lay-spark-2 { animation: lay-spark 1.1s ease-out infinite 0.4s; }
          .lay-spark-3 { animation: lay-spark 1.1s ease-out infinite 0.8s; }
          .lay-tear-l { animation: lay-tear 1.2s ease-in infinite; }
          .lay-tear-r { animation: lay-tear 1.2s ease-in infinite 0.4s; }
          .lay-wave-1 { animation: lay-wave 1.3s ease-out infinite; }
          .lay-wave-2 { animation: lay-wave 1.3s ease-out infinite 0.45s; }
        `}</style>

        <radialGradient id="lay-skin" cx="44%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#eec7a3" />
          <stop offset="78%" stopColor="#dcab83" />
          <stop offset="100%" stopColor="#c68f63" />
        </radialGradient>
        <linearGradient id="lay-hair" x1="20%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#1a0e08" />
          <stop offset="50%" stopColor="#251510" />
          <stop offset="100%" stopColor="#9b8794" />
        </linearGradient>
        <linearGradient id="lay-lock" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1f120c" />
          <stop offset="55%" stopColor="#2a1812" />
          <stop offset="100%" stopColor="#a892a0" />
        </linearGradient>
        <linearGradient id="lay-hair-front" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#241410" />
          <stop offset="100%" stopColor="#140b07" />
        </linearGradient>
        <linearGradient id="lay-top" x1="0%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#4c4c55" />
          <stop offset="42%" stopColor="#2b2b31" />
          <stop offset="58%" stopColor="#41414a" />
          <stop offset="100%" stopColor="#242429" />
        </linearGradient>
        <radialGradient id="lay-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={auraColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={auraColor} stopOpacity="0" />
        </radialGradient>
        <filter id="lay-shadow"><feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.22" /></filter>
      </defs>

      <ellipse cx="130" cy="210" rx="110" ry="142" fill="url(#lay-aura)" />

      <g className="lay-body" filter="url(#lay-shadow)">

        {/* ── HAIR (back) — long, voluminous, wavy edges, ombré to mauve ── */}
        <path
          d="M 76 80 C 44 110 44 170 52 240 C 57 296 64 338 74 362
             C 70 330 70 296 80 268 C 70 300 78 338 86 364 L 112 364
             C 96 322 88 252 90 184 C 92 132 106 98 130 90
             C 154 98 168 132 170 184 C 172 252 166 322 150 364 L 176 364
             C 184 338 192 300 182 268 C 192 296 192 330 188 362
             C 198 338 205 296 210 240 C 218 170 218 110 186 80
             C 168 60 92 60 76 80 Z"
          fill="url(#lay-hair)"
        />
        {/* crown sheen + volume highlights */}
        <path d="M 96 84 Q 130 68 166 86" stroke="#5a3a28" strokeWidth="9" fill="none" opacity="0.4" strokeLinecap="round" />
        <path d="M 84 110 Q 76 170 84 232" stroke="#43291a" strokeWidth="6" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M 178 112 Q 188 172 178 236" stroke="#43291a" strokeWidth="6" fill="none" opacity="0.5" strokeLinecap="round" />

        {/* ── TIE-DYE TOP (bust) with a soft V-neck ── */}
        <path d="M 112 188 L 148 188 L 130 226 Z" fill="url(#lay-skin)" />
        <path
          d="M 60 250 C 70 212 96 192 114 188 L 130 218 L 146 188
             C 164 192 190 212 200 250 C 203 300 199 342 194 364 L 66 364
             C 61 342 57 300 60 250 Z"
          fill="url(#lay-top)"
        />
        <path d="M 92 240 Q 86 300 96 360" stroke="#5c5c66" strokeWidth="6" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M 168 240 Q 174 300 164 360" stroke="#5c5c66" strokeWidth="6" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M 130 230 Q 130 300 130 362" stroke="#1c1c20" strokeWidth="7" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M 114 188 q -3 16 2 30" stroke="#56565f" strokeWidth="2" fill="none" opacity="0.7" />
        <path d="M 146 188 q 3 16 -2 30" stroke="#56565f" strokeWidth="2" fill="none" opacity="0.7" />
        <circle cx="130" cy="252" r="2.4" fill="#9aa0aa" opacity="0.75" />
        <circle cx="130" cy="270" r="2.4" fill="#9aa0aa" opacity="0.65" />

        {/* ── NECK ── */}
        <path d="M 116 152 L 114 188 Q 130 198 146 188 L 144 152 Z" fill="url(#lay-skin)" />
        <path d="M 116 156 Q 130 172 144 156" stroke="#bd8a5e" strokeWidth="5" fill="none" opacity="0.35" strokeLinecap="round" />
        <path d="M 116 190 Q 130 206 144 190" stroke="#f0c64e" strokeWidth="1.4" fill="none" opacity="0.85" />
        <circle cx="130" cy="202" r="1.8" fill="#f0c64e" />

        {/* ── ARMS / HANDS per state ── */}
        {state === "happy" && (
          <>
            <path d="M 66 250 Q 52 220 50 196" stroke="url(#lay-top)" strokeWidth="20" strokeLinecap="round" fill="none" />
            <ellipse cx="49" cy="192" rx="10" ry="8" fill="url(#lay-skin)" transform="rotate(20 49 192)" />
            <path d="M 194 250 Q 208 220 210 196" stroke="url(#lay-top)" strokeWidth="20" strokeLinecap="round" fill="none" />
            <ellipse cx="211" cy="192" rx="10" ry="8" fill="url(#lay-skin)" transform="rotate(-20 211 192)" />
          </>
        )}
        {state === "talking" && (
          <>
            <path d="M 196 252 Q 212 226 214 200" stroke="url(#lay-top)" strokeWidth="20" strokeLinecap="round" fill="none" />
            <ellipse cx="216" cy="196" rx="10" ry="8" fill="url(#lay-skin)" transform="rotate(-22 216 196)" />
          </>
        )}

        {/* ── FACE ── */}
        <path
          d="M 91 100 C 89 122 92 142 102 154 C 110 163 122 167 130 167
             C 138 167 150 163 158 154 C 168 142 171 122 169 100
             C 169 74 152 60 130 60 C 108 60 91 74 91 100 Z"
          fill="url(#lay-skin)"
        />
        <path d="M 99 132 Q 106 150 122 160" stroke="#c68f63" strokeWidth="3" fill="none" opacity="0.25" strokeLinecap="round" />
        <path d="M 161 132 Q 154 150 138 160" stroke="#c68f63" strokeWidth="3" fill="none" opacity="0.25" strokeLinecap="round" />
        <ellipse cx="106" cy="126" rx="8.5" ry="5.5" fill="#e08a78" opacity="0.2" />
        <ellipse cx="154" cy="126" rx="8.5" ry="5.5" fill="#e08a78" opacity="0.2" />

        {/* ── HAIR (front) — side part sweeping across the forehead ── */}
        <path d="M 88 96 C 90 60 112 48 134 47 C 162 49 178 70 180 102
                 C 172 78 150 70 134 78 C 116 100 100 86 96 80 C 92 84 89 90 88 96 Z"
              fill="url(#lay-hair-front)" />

        {/* ── SUNGLASSES pushed up high on the crown ── */}
        <g transform="translate(0,-1)">
          <rect x="97" y="37" width="31" height="17" rx="6.5" fill="#16161b" stroke="#000" strokeWidth="1" />
          <rect x="134" y="37" width="31" height="17" rx="6.5" fill="#16161b" stroke="#000" strokeWidth="1" />
          <rect x="125" y="41" width="11" height="4" rx="2" fill="#26262c" />
          <path d="M 97 41 L 88 38" stroke="#16161b" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 165 41 L 174 38" stroke="#16161b" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 101 41 L 112 41 L 105 51 L 100 51 Z" fill="#3a3a48" opacity="0.55" />
          <path d="M 138 41 L 149 41 L 142 51 L 137 51 Z" fill="#3a3a48" opacity="0.55" />
        </g>

        {/* ── EYEBROWS (full, softly arched) ── */}
        {isSad ? (
          <>
            <path d="M 104 93 Q 114 90 123 94" stroke="#231309" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <path d="M 137 94 Q 146 90 156 93" stroke="#231309" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          </>
        ) : isHappy ? (
          <>
            <path d="M 104 90 Q 114 85 124 89" stroke="#231309" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <path d="M 136 89 Q 146 85 156 90" stroke="#231309" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M 104 91 Q 114 87 124 91" stroke="#231309" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <path d="M 136 91 Q 146 87 156 91" stroke="#231309" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* ── EYES (almond, brown, set a touch closer) ── */}
        <path d="M 105 103 Q 115 96.5 125 103 Q 115 110 105 103 Z" fill="#fbf6ef" />
        <circle cx="115" cy="103" r="5" fill="#5a3617" />
        <circle cx="115" cy="103" r="2.4" fill="#1c0f06" />
        <circle cx="116.8" cy="101.2" r="1.4" fill="#fff" />
        <path d="M 135 103 Q 145 96.5 155 103 Q 145 110 135 103 Z" fill="#fbf6ef" />
        <circle cx="145" cy="103" r="5" fill="#5a3617" />
        <circle cx="145" cy="103" r="2.4" fill="#1c0f06" />
        <circle cx="146.8" cy="101.2" r="1.4" fill="#fff" />
        <path className="lay-eyelid-l" d="M 104 102 Q 115 95 126 102" stroke="#1c0f06" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path className="lay-eyelid-r" d="M 134 102 Q 145 95 156 102" stroke="#1c0f06" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <line x1="104" y1="102" x2="101" y2="100" stroke="#1c0f06" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="156" y1="102" x2="159" y2="100" stroke="#1c0f06" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 107 109 Q 115 112 123 109" stroke="#7a5436" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M 137 109 Q 145 112 153 109" stroke="#7a5436" strokeWidth="1" fill="none" opacity="0.6" />

        {/* ── NOSE ── */}
        <path d="M 128 104 Q 126 120 124 126" stroke="#c68f63" strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round" />
        <path d="M 124 127 Q 130 132 136 127" stroke="#b8835a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="130" cy="126" rx="4.5" ry="2.4" fill="#d49a6e" opacity="0.4" />

        {/* ── LIPS ── */}
        <g className="lay-mouth">
          {isSad ? (
            <path d="M 119 141 Q 130 136 141 141" stroke="#b56258" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          ) : isHappy ? (
            <>
              <path d="M 114 136 Q 130 150 146 136 Q 130 142 114 136 Z" fill="#c6726a" />
              <path d="M 117 138 Q 130 147 143 138" fill="#a84d46" opacity="0.5" />
              <path d="M 120 139 Q 130 143 140 139" fill="#fff" opacity="0.85" />
            </>
          ) : isTalking ? (
            <>
              <path d="M 120 134 Q 130 138 140 134" stroke="#b56258" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              <ellipse cx="130" cy="139" rx="8" ry="5" fill="#9a3f3a" opacity="0.75" />
              <path d="M 122 137 Q 130 134 138 137" fill="#c6726a" />
            </>
          ) : (
            <>
              {/* warm relaxed smile: upturned corners, fuller lower lip */}
              <path d="M 117 134 Q 122 130 126 133 Q 130 130 134 133 Q 138 130 143 134 Q 130 138 117 134 Z" fill="#c6726a" />
              <path d="M 118 135 Q 130 147 142 135 Q 130 141 118 135 Z" fill="#bd6a62" />
              <path d="M 116 134 Q 130 139 144 134" stroke="#9c4a44" strokeWidth="1" fill="none" opacity="0.6" />
              <path d="M 115 133 Q 116 137 120 138" stroke="#b56258" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              <path d="M 145 133 Q 144 137 140 138" stroke="#b56258" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            </>
          )}
        </g>

        {/* ── FRONT SIDE HAIR — continuous curtains from the temples, draping over the shoulders ── */}
        <path d="M 88 76 C 70 108 64 172 68 244 C 69 286 75 324 86 346
                 C 90 332 92 300 92 268 C 94 200 96 140 94 100
                 C 92 88 90 82 88 76 Z" fill="url(#lay-lock)" />
        <path d="M 172 76 C 190 108 196 172 192 244 C 191 286 185 324 174 346
                 C 170 332 168 300 168 268 C 166 200 164 140 166 100
                 C 168 88 170 82 172 76 Z" fill="url(#lay-lock)" />
        {/* inner strands for depth */}
        <path d="M 80 132 Q 74 232 84 322" stroke="#160d08" strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M 180 132 Q 186 232 176 322" stroke="#160d08" strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round" />
        {/* tinsel woven into the lower ends — short streaks + sparkle dots */}
        <g>
          <path className="lay-tw-1" d="M 76 248 l 5 13" stroke="#f0c8de" strokeWidth="1.4" strokeLinecap="round" />
          <path className="lay-tw-3" d="M 83 294 l 4 13" stroke="#dfe2f2" strokeWidth="1.4" strokeLinecap="round" />
          <circle className="lay-tw-2" cx="80" cy="274" r="1.3" fill="#fff" />
          <circle className="lay-tw-4" cx="86" cy="320" r="1.3" fill="#f0c8de" />
          <circle className="lay-tw-1" cx="74" cy="230" r="1.1" fill="#dfe2f2" />
          <path className="lay-tw-2" d="M 184 248 l -5 13" stroke="#dfe2f2" strokeWidth="1.4" strokeLinecap="round" />
          <path className="lay-tw-4" d="M 177 294 l -4 13" stroke="#f0c8de" strokeWidth="1.4" strokeLinecap="round" />
          <circle className="lay-tw-1" cx="180" cy="274" r="1.3" fill="#fff" />
          <circle className="lay-tw-3" cx="174" cy="320" r="1.3" fill="#dfe2f2" />
          <circle className="lay-tw-2" cx="186" cy="230" r="1.1" fill="#f0c8de" />
        </g>

      </g>{/* end body */}

      {/* ── STATE EXTRAS ── */}
      {isHappy && (
        <>
          <g className="lay-spark-1" style={{ transformOrigin: "44px 80px" }}>
            <circle cx="44" cy="80" r="4.5" fill="#f9a8d4" />
            <line x1="44" y1="73" x2="44" y2="69" stroke="#f9a8d4" strokeWidth="2" strokeLinecap="round" />
            <line x1="51" y1="77" x2="54" y2="74" stroke="#f9a8d4" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g className="lay-spark-2" style={{ transformOrigin: "216px 74px" }}>
            <circle cx="216" cy="74" r="4" fill="#f0abfc" />
            <line x1="216" y1="67" x2="216" y2="64" stroke="#f0abfc" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g className="lay-spark-3" style={{ transformOrigin: "52px 152px" }}>
            <circle cx="52" cy="152" r="3.5" fill="#fbcfe8" />
          </g>
        </>
      )}
      {isSad && (
        <>
          <g className="lay-tear-l" style={{ transformOrigin: "110px 116px" }}>
            <ellipse cx="110" cy="116" rx="3" ry="4.5" fill="#93c5fd" opacity="0.85" />
          </g>
          <g className="lay-tear-r" style={{ transformOrigin: "150px 116px" }}>
            <ellipse cx="150" cy="116" rx="3" ry="4.5" fill="#93c5fd" opacity="0.85" />
          </g>
        </>
      )}
      {isTalking && (
        <>
          <g className="lay-wave-1" style={{ transformOrigin: "224px 196px" }}>
            <circle cx="224" cy="196" r="12" stroke="#f0abfc" strokeWidth="2" fill="none" opacity="0.7" />
          </g>
          <g className="lay-wave-2" style={{ transformOrigin: "224px 196px" }}>
            <circle cx="224" cy="196" r="21" stroke="#f0abfc" strokeWidth="1.5" fill="none" opacity="0.35" />
          </g>
        </>
      )}
    </svg>
  );
}
