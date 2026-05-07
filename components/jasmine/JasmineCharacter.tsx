"use client";

export type JasmineState = "idle" | "talking" | "happy" | "sad";

export default function JasmineCharacter({ state }: { state: JasmineState }) {
  const isSad = state === "sad";
  const isHappy = state === "happy";
  const isTalking = state === "talking";

  const auraColor =
    state === "idle"    ? "#2dd4bf" :
    state === "talking" ? "#a78bfa" :
    state === "happy"   ? "#f59e0b" :
    "#94a3b8";

  return (
    <svg viewBox="0 0 260 390" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
      <defs>
        <style>{`
          @keyframes jas-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes jas-blink {
            0%, 88%, 100% { transform: scaleY(1); }
            93% { transform: scaleY(0.06); }
          }
          @keyframes jas-jaw {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.4) translateY(2px); }
          }
          @keyframes jas-spark {
            0% { opacity: 1; transform: scale(0.4) translateY(0); }
            100% { opacity: 0; transform: scale(1.6) translateY(-22px); }
          }
          @keyframes jas-petal {
            0% { opacity: 0.9; transform: translateY(0) rotate(0deg); }
            100% { opacity: 0; transform: translateY(35px) rotate(55deg); }
          }
          @keyframes jas-tear {
            0% { opacity: 0.9; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(18px); }
          }
          @keyframes jas-wave {
            0% { opacity: 0.7; transform: scale(0.7); }
            100% { opacity: 0; transform: scale(1.7); }
          }
          .jas-body { animation: jas-float 3.4s ease-in-out infinite; }
          .jas-eye-l { transform-origin: 113px 97px; animation: jas-blink 4.5s ease-in-out infinite; }
          .jas-eye-r { transform-origin: 147px 97px; animation: jas-blink 4.5s ease-in-out infinite 0.6s; }
          .jas-mouth-anim { transform-origin: 130px 125px; animation: ${isTalking ? "jas-jaw 0.5s ease-in-out infinite" : "none"}; }
          .jas-spark-1 { animation: jas-spark 1.1s ease-out infinite; }
          .jas-spark-2 { animation: jas-spark 1.1s ease-out infinite 0.35s; }
          .jas-spark-3 { animation: jas-spark 1.1s ease-out infinite 0.7s; }
          .jas-petal-1 { animation: jas-petal 1.3s ease-in infinite; }
          .jas-petal-2 { animation: jas-petal 1.3s ease-in infinite 0.5s; }
          .jas-petal-3 { animation: jas-petal 1.3s ease-in infinite 0.9s; }
          .jas-tear-l { animation: jas-tear 1.2s ease-in infinite; }
          .jas-tear-r { animation: jas-tear 1.2s ease-in infinite 0.4s; }
          .jas-wave-1 { animation: jas-wave 1.3s ease-out infinite; }
          .jas-wave-2 { animation: jas-wave 1.3s ease-out infinite 0.45s; }
        `}</style>

        <radialGradient id="jas-skin" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e8b98e" />
          <stop offset="100%" stopColor="#c07a50" />
        </radialGradient>
        <linearGradient id="jas-dress" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <radialGradient id="jas-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={auraColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={auraColor} stopOpacity="0" />
        </radialGradient>
        <filter id="jas-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.22" />
        </filter>
        <filter id="jas-glow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* aura */}
      <ellipse cx="130" cy="210" rx="105" ry="135" fill="url(#jas-aura)" />

      <g className="jas-body" filter="url(#jas-shadow)">

        {/* ── SKIRT ── */}
        <path
          d={isSad
            ? "M 90 195 Q 75 255 70 355 L 190 355 Q 185 255 170 195 Z"
            : "M 90 195 Q 72 255 64 358 L 196 358 Q 188 255 170 195 Z"}
          fill="url(#jas-dress)"
        />
        {/* hem embroidery */}
        <path d="M 66 342 Q 130 352 194 342" stroke="#f59e0b" strokeWidth="1.8" fill="none" opacity="0.7" />
        <path d="M 72 348 Q 130 357 188 348" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.4" />

        {/* ── TORSO ── */}
        <path d="M 96 150 C 90 168 88 182 90 195 L 170 195 C 172 182 170 168 164 150 Z" fill="url(#jas-dress)" />
        {/* neckline v-cut */}
        <path d="M 118 150 L 130 162 L 142 150" fill="#0d9488" stroke="#0d9488" strokeWidth="1" strokeLinejoin="round" />
        {/* gold belt */}
        <rect x="88" y="186" width="84" height="9" rx="4.5" fill="#f59e0b" opacity="0.9" />
        {/* belt gem */}
        <ellipse cx="130" cy="190.5" rx="5" ry="4" fill="#2dd4bf" />

        {/* ── NECK ── */}
        <path d="M 118 138 Q 130 142 142 138 L 144 152 Q 130 156 116 152 Z" fill="url(#jas-skin)" />

        {/* ── NECKLACE ── */}
        <path d="M 112 154 Q 130 162 148 154" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.8" />
        <circle cx="130" cy="163" r="3.5" fill="#f59e0b" />
        <circle cx="120" cy="158" r="2" fill="#f59e0b" opacity="0.7" />
        <circle cx="140" cy="158" r="2" fill="#f59e0b" opacity="0.7" />

        {/* ── ARMS ── */}
        {state === "idle" && (
          <>
            <path d="M 96 158 Q 76 188 78 215" stroke="url(#jas-skin)" strokeWidth="15" strokeLinecap="round" fill="none" />
            <ellipse cx="76" cy="219" rx="10" ry="8" fill="url(#jas-skin)" />
            <path d="M 164 158 Q 184 188 182 215" stroke="url(#jas-skin)" strokeWidth="15" strokeLinecap="round" fill="none" />
            <ellipse cx="184" cy="219" rx="10" ry="8" fill="url(#jas-skin)" />
            {/* flower held in right hand */}
            <line x1="184" y1="215" x2="184" y2="232" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="184" cy="232" r="5" fill="white" opacity="0.9" />
            <circle cx="184" cy="232" r="2.5" fill="#fbbf24" />
          </>
        )}
        {state === "talking" && (
          <>
            {/* left arm down */}
            <path d="M 96 158 Q 76 188 78 215" stroke="url(#jas-skin)" strokeWidth="15" strokeLinecap="round" fill="none" />
            <ellipse cx="76" cy="219" rx="10" ry="8" fill="url(#jas-skin)" />
            {/* right arm gesturing forward-up */}
            <path d="M 164 158 Q 196 148 204 118" stroke="url(#jas-skin)" strokeWidth="15" strokeLinecap="round" fill="none" />
            <ellipse cx="204" cy="114" rx="10" ry="8" fill="url(#jas-skin)" transform="rotate(-20 204 114)" />
            {/* finger pointing up */}
            <line x1="206" y1="107" x2="209" y2="95" stroke="url(#jas-skin)" strokeWidth="7" strokeLinecap="round" />
          </>
        )}
        {state === "happy" && (
          <>
            {/* both arms raised wide */}
            <path d="M 96 158 Q 66 130 55 100" stroke="url(#jas-skin)" strokeWidth="15" strokeLinecap="round" fill="none" />
            <ellipse cx="53" cy="96" rx="10" ry="8" fill="url(#jas-skin)" transform="rotate(20 53 96)" />
            <path d="M 164 158 Q 194 130 205 100" stroke="url(#jas-skin)" strokeWidth="15" strokeLinecap="round" fill="none" />
            <ellipse cx="207" cy="96" rx="10" ry="8" fill="url(#jas-skin)" transform="rotate(-20 207 96)" />
          </>
        )}
        {state === "sad" && (
          <>
            {/* both arms hanging low */}
            <path d="M 96 158 Q 82 200 80 232" stroke="url(#jas-skin)" strokeWidth="15" strokeLinecap="round" fill="none" />
            <ellipse cx="79" cy="236" rx="10" ry="8" fill="url(#jas-skin)" />
            <path d="M 164 158 Q 178 200 180 232" stroke="url(#jas-skin)" strokeWidth="15" strokeLinecap="round" fill="none" />
            <ellipse cx="181" cy="236" rx="10" ry="8" fill="url(#jas-skin)" />
          </>
        )}

        {/* ── HAIR BACK ── */}
        <ellipse cx="130" cy="94" rx="47" ry="53" fill="#1c0a00" />

        {/* ── FACE ── */}
        <ellipse cx="130" cy={isSad ? "97" : "94"} rx="39" ry="44" fill="url(#jas-skin)" />

        {/* ── HAIR FRONT / UPDO ── */}
        <path d="M 84 80 Q 94 38 130 34 Q 166 38 176 80 Q 162 66 130 63 Q 98 66 84 80 Z" fill="#2d1200" />
        <ellipse cx="130" cy="34" rx="20" ry="15" fill="#2d1200" />
        {/* hair wisps framing face */}
        <path d="M 86 76 Q 80 62 83 50" stroke="#2d1200" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 174 76 Q 180 62 177 50" stroke="#2d1200" strokeWidth="6" fill="none" strokeLinecap="round" />

        {/* ── EYEBROWS ── */}
        {isSad ? (
          <>
            <path d="M 108 78 Q 114 75 119 78" stroke="#7c4a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 141 78 Q 146 75 152 78" stroke="#7c4a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : isHappy ? (
          <>
            <path d="M 108 76 Q 113 72 119 74" stroke="#7c4a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 141 74 Q 147 72 152 76" stroke="#7c4a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M 108 78 Q 113 75 119 77" stroke="#7c4a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 141 77 Q 147 75 152 78" stroke="#7c4a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* ── EYES ── */}
        <g className="jas-eye-l">
          <ellipse cx="113" cy="97" rx="8.5" ry="9.5" fill="white" />
          <ellipse cx="113" cy="98" rx="5.5" ry="6" fill="#1a0800" />
          <circle cx="116" cy="95" r="2" fill="white" />
        </g>
        <g className="jas-eye-r">
          <ellipse cx="147" cy="97" rx="8.5" ry="9.5" fill="white" />
          <ellipse cx="147" cy="98" rx="5.5" ry="6" fill="#1a0800" />
          <circle cx="150" cy="95" r="2" fill="white" />
        </g>
        {/* lashes */}
        <line x1="104" y1="89" x2="102" y2="85" stroke="#1a0800" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="113" y1="87" x2="113" y2="83" stroke="#1a0800" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="122" y1="89" x2="124" y2="85" stroke="#1a0800" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="138" y1="89" x2="136" y2="85" stroke="#1a0800" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="147" y1="87" x2="147" y2="83" stroke="#1a0800" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="156" y1="89" x2="158" y2="85" stroke="#1a0800" strokeWidth="1.5" strokeLinecap="round" />

        {/* ── BLUSH ── */}
        <ellipse cx="101" cy="110" rx="9" ry="6" fill="#e07060" opacity="0.22" />
        <ellipse cx="159" cy="110" rx="9" ry="6" fill="#e07060" opacity="0.22" />

        {/* ── NOSE ── */}
        <path d="M 127 110 Q 130 115 133 110" stroke="#b07850" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* ── MOUTH ── */}
        <g className="jas-mouth-anim">
          {isSad ? (
            <path d="M 118 128 Q 130 122 142 128" stroke="#c06060" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : isHappy ? (
            <>
              <path d="M 115 122 Q 130 135 145 122" stroke="#c06060" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 118 124 Q 130 134 142 124" fill="#d4524a" opacity="0.6" />
            </>
          ) : isTalking ? (
            <>
              <path d="M 118 124 Q 130 128 142 124" stroke="#c06060" strokeWidth="2" fill="none" strokeLinecap="round" />
              <ellipse cx="130" cy="129" rx="9" ry="5" fill="#8b2020" opacity="0.75" />
            </>
          ) : (
            <path d="M 118 124 Q 130 131 142 124" stroke="#c06060" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
        </g>

        {/* ── JASMINE FLOWER IN HAIR ── */}
        <g transform="translate(154, 42)" filter="url(#jas-glow)">
          {[0, 72, 144, 216, 288].map((a, i) => (
            <ellipse
              key={i}
              cx={Math.cos((a * Math.PI) / 180) * 7}
              cy={Math.sin((a * Math.PI) / 180) * 7}
              rx="4.5"
              ry="7"
              fill="white"
              opacity="0.95"
              transform={`rotate(${a + 90} ${Math.cos((a * Math.PI) / 180) * 7} ${Math.sin((a * Math.PI) / 180) * 7})`}
            />
          ))}
          <circle cx="0" cy="0" r="4" fill="#fbbf24" />
        </g>
        {/* second smaller flower */}
        <g transform="translate(144, 30)">
          {[0, 120, 240].map((a, i) => (
            <ellipse
              key={i}
              cx={Math.cos((a * Math.PI) / 180) * 4}
              cy={Math.sin((a * Math.PI) / 180) * 4}
              rx="3"
              ry="5"
              fill="white"
              opacity="0.8"
              transform={`rotate(${a + 90} ${Math.cos((a * Math.PI) / 180) * 4} ${Math.sin((a * Math.PI) / 180) * 4})`}
            />
          ))}
          <circle cx="0" cy="0" r="2.5" fill="#fbbf24" />
        </g>

        {/* ── EARRINGS ── */}
        <circle cx="91" cy="106" r="5" fill="#f59e0b" />
        <ellipse cx="91" cy="116" rx="3.5" ry="5.5" fill="#2dd4bf" />
        <circle cx="91" cy="122" r="2" fill="#f59e0b" />
        <circle cx="169" cy="106" r="5" fill="#f59e0b" />
        <ellipse cx="169" cy="116" rx="3.5" ry="5.5" fill="#2dd4bf" />
        <circle cx="169" cy="122" r="2" fill="#f59e0b" />

      </g>{/* end jas-body */}

      {/* ── STATE EXTRAS ── */}
      {isHappy && (
        <>
          <g className="jas-spark-1" style={{ transformOrigin: "45px 80px" }}>
            <circle cx="45" cy="80" r="5" fill="#fbbf24" opacity="0.9" />
            <line x1="45" y1="72" x2="45" y2="68" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            <line x1="53" y1="76" x2="56" y2="73" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            <line x1="53" y1="84" x2="56" y2="87" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g className="jas-spark-2" style={{ transformOrigin: "210px 70px" }}>
            <circle cx="210" cy="70" r="4" fill="#f0abfc" opacity="0.9" />
            <line x1="210" y1="63" x2="210" y2="60" stroke="#f0abfc" strokeWidth="2" strokeLinecap="round" />
            <line x1="217" y1="67" x2="220" y2="64" stroke="#f0abfc" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g className="jas-spark-3" style={{ transformOrigin: "55px 150px" }}>
            <circle cx="55" cy="150" r="3.5" fill="#5eead4" opacity="0.8" />
          </g>
          {/* petals scattering */}
          <g className="jas-petal-1" style={{ transformOrigin: "192px 130px" }}>
            <ellipse cx="192" cy="130" rx="4" ry="7" fill="white" opacity="0.8" transform="rotate(30 192 130)" />
          </g>
          <g className="jas-petal-2" style={{ transformOrigin: "63px 155px" }}>
            <ellipse cx="63" cy="155" rx="3.5" ry="6" fill="white" opacity="0.7" transform="rotate(-20 63 155)" />
          </g>
          <g className="jas-petal-3" style={{ transformOrigin: "205" }}>
            <ellipse cx="205" cy="155" rx="3" ry="5" fill="#fbbf24" opacity="0.6" transform="rotate(45 205 155)" />
          </g>
        </>
      )}
      {isSad && (
        <>
          <g className="jas-tear-l" style={{ transformOrigin: "110px 118px" }}>
            <ellipse cx="110" cy="118" rx="3" ry="4.5" fill="#93c5fd" opacity="0.85" />
            <path d="M 110 122 Q 108 132 111 138" stroke="#93c5fd" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
          </g>
          <g className="jas-tear-r" style={{ transformOrigin: "150px 118px" }}>
            <ellipse cx="150" cy="118" rx="3" ry="4.5" fill="#93c5fd" opacity="0.85" />
            <path d="M 150 122 Q 152 132 149 138" stroke="#93c5fd" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
          </g>
          {/* falling petals */}
          <g className="jas-petal-1" style={{ transformOrigin: "82px 195px" }}>
            <ellipse cx="82" cy="195" rx="4" ry="7" fill="white" opacity="0.45" transform="rotate(15 82 195)" />
          </g>
          <g className="jas-petal-2" style={{ transformOrigin: "178px 220px" }}>
            <ellipse cx="178" cy="220" rx="3.5" ry="6" fill="white" opacity="0.35" transform="rotate(-10 178 220)" />
          </g>
        </>
      )}
      {isTalking && (
        <>
          <g className="jas-wave-1" style={{ transformOrigin: "216px 105px" }}>
            <circle cx="216" cy="105" r="13" stroke="#2dd4bf" strokeWidth="2" fill="none" opacity="0.7" />
          </g>
          <g className="jas-wave-2" style={{ transformOrigin: "216px 105px" }}>
            <circle cx="216" cy="105" r="22" stroke="#2dd4bf" strokeWidth="1.5" fill="none" opacity="0.35" />
          </g>
        </>
      )}
    </svg>
  );
}
