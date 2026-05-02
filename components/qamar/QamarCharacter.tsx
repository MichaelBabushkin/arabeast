"use client";

export type QamarState = "idle" | "talking" | "happy" | "sad";

function QamarDefs() {
  return (
    <defs>
      <filter id="qamar-ear-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="7" result="blur" />
        <feColorMatrix in="blur" type="matrix"
          values="1.5 0.8 0 0 0.1  0.9 0.6 0 0 0.05  0 0 0 0 0  0 0 0 0.85 0" result="goldBlur" />
        <feMerge>
          <feMergeNode in="goldBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="qamar-shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#451a03" floodOpacity="0.4" />
      </filter>
      <filter id="qamar-amulet-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function QamarStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes qamar-float {
        0%, 100% { transform: translateY(-6px); }
        50%      { transform: translateY(0px); }
      }
      @keyframes qamar-ear-twitch {
        0%, 100% { transform: scaleX(1) scaleY(1); }
        50%      { transform: scaleX(1.06) scaleY(1.04); }
      }
      @keyframes qamar-flip {
        0%   { transform: translateY(0) rotate(0deg); }
        50%  { transform: translateY(-28px) rotate(180deg); }
        100% { transform: translateY(0) rotate(360deg); }
      }
      @keyframes qamar-sparkle-fade {
        0%, 100% { opacity: 0; transform: scale(0.4); }
        50%      { opacity: 1; transform: scale(1.2); }
      }
      .qamar-float { animation: qamar-float 3.2s ease-in-out infinite; transform-origin: 130px 210px; }
      .qamar-talking .qamar-ears { animation: qamar-ear-twitch 0.4s ease-in-out infinite; transform-origin: 130px 110px; }
      .qamar-talking .qamar-body-group { transform: translateX(4px); transition: transform 0.3s; }
      .qamar-talking .qamar-quill-group { transform: rotate(-12deg) translate(-4px, 4px); transition: transform 0.3s; transform-origin: 80px 255px; }
      .qamar-happy { animation: qamar-flip 1s ease-in-out forwards; transform-origin: 130px 210px; }
      .qamar-sad .qamar-body-group { transform: translateY(12px); transition: transform 0.5s; }
      .qamar-sad .qamar-ears { transform: rotate(18deg) translateY(8px); transition: transform 0.5s; transform-origin: 130px 110px; }
      .qamar-sparkle { animation: qamar-sparkle-fade 1.5s infinite; }
    `}} />
  );
}

export default function QamarCharacter({ state }: { state: QamarState }) {
  const rootClass = state === "happy" ? "qamar-happy" : state === "sad" ? "qamar-sad" : state === "talking" ? "qamar-talking" : "";
  const containerClass = state !== "happy" ? "qamar-float" : "";

  return (
    <svg viewBox="0 0 260 390" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl" aria-label="Qamar character">
      <QamarDefs />
      <QamarStyles />

      <g className={`${containerClass} ${rootClass}`}>

        {/* ── Magic carpet (she sits on it) ── */}
        <g transform="translate(130, 280)">
          <path d="M-82,0 L82,0 L92,25 L-92,25 Z" fill="#991b1b" filter="url(#qamar-shadow)" />
          <path d="M-76,3 L76,3 L84,22 L-84,22 Z" fill="#b91c1c" />
          <path d="M-68,12 L68,12" stroke="#fcd34d" strokeWidth="1.5" strokeDasharray="5,4" />
          <rect x="-74" y="4" width="9" height="9" rx="1" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
          <rect x="65" y="4" width="9" height="9" rx="1" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
          <polygon points="0,-2 6,11 0,18 -6,11" fill="none" stroke="#fcd34d" strokeWidth="1" />
          {([-88,-78,-68,-58,-48,-38,-28,-18,-8,2,12,22,32,42,52,62,72,82,88] as number[]).map((x, i) => (
            <line key={i} x1={x} y1="25" x2={x - 2} y2="36" stroke="#fcd34d" strokeWidth="1.5" strokeLinecap="round" />
          ))}
        </g>

        {/* ── Bushy tail (behind body) ── */}
        <path d="M163,242 C194,256 246,244 244,196 C242,160 212,153 198,178 C185,202 198,232 163,242 Z" fill="#f59e0b" />
        <path d="M167,237 C192,248 237,237 235,198 C233,169 210,164 199,184 C189,204 200,226 167,237 Z" fill="#fbbf24" />
        <path d="M197,153 C204,140 220,138 224,153 C216,157 206,160 197,153 Z" fill="#fde68a" />
        <path d="M203,146 C208,136 217,135 220,146 C214,149 207,151 203,146 Z" fill="#fff8e1" opacity="0.7" />

        {/* ── Body group ── */}
        <g className="qamar-body-group">
          <ellipse cx="130" cy="218" rx="40" ry="50" fill="#fde68a" />
          <path d="M116,198 Q130,216 144,198" fill="none" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M112,220 Q130,238 148,220" fill="none" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M116,242 Q130,255 144,242" fill="none" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />

          {/* Right arm */}
          <ellipse cx="165" cy="232" rx="13" ry="24" fill="#fde68a" transform="rotate(-22, 165, 232)" />
          <ellipse cx="173" cy="252" rx="10" ry="7" fill="#fde68a" />

          {/* Left arm */}
          <ellipse cx="95" cy="230" rx="13" ry="24" fill="#fde68a" transform="rotate(22, 95, 230)" />
          <ellipse cx="87" cy="250" rx="10" ry="7" fill="#fde68a" />

          {/* Amulet */}
          <path d="M130,178 L130,208" stroke="#fcd34d" strokeWidth="1.5" />
          <polygon points="130,204 121,218 130,232 139,218" fill="#7c3aed" filter="url(#qamar-amulet-glow)" />
          <polygon points="130,209 125,218 130,227 135,218" fill="#a78bfa" />
          <circle cx="127" cy="212" r="2.5" fill="white" opacity="0.45" />
        </g>

        {/* ── Oversized calligraphy quill ── */}
        <g className="qamar-quill-group">
          <line x1="84" y1="258" x2="40" y2="96" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
          <path d="M84,258 C74,243 59,207 40,96 C51,119 62,160 74,204 C80,228 83,246 84,258 Z" fill="#fde68a" />
          <path d="M84,258 C94,242 98,206 90,163 C84,131 67,110 40,96 C57,115 72,150 80,196 C83,220 84,246 84,258 Z" fill="#f0c060" opacity="0.9" />
          <path d="M73,226 L55,213 M68,208 L50,196 M63,190 L46,180 M57,172 L43,163 M52,156 L40,148" stroke="#92400e" strokeWidth="1" opacity="0.45" />
          <path d="M78,226 L93,216 M76,206 L90,198 M72,188 L86,181 M67,170 L80,164 M62,153 L74,148" stroke="#92400e" strokeWidth="1" opacity="0.45" />
          <ellipse cx="43" cy="101" rx="5" ry="10" fill="#1e3a8a" transform="rotate(-65, 43, 101)" />
          <ellipse cx="42" cy="95" rx="3" ry="6" fill="#172554" transform="rotate(-65, 42, 95)" />
          <circle cx="37" cy="92" r="2.5" fill="#1e3a8a" opacity="0.7" />
          <circle cx="42" cy="86" r="1.5" fill="#1e3a8a" opacity="0.5" />
          <circle cx="35" cy="86" r="1" fill="#1e3a8a" opacity="0.4" />
        </g>

        {/* ── Head ── */}
        <g className="qamar-head">
          {/* Ears behind face */}
          <g className="qamar-ears">
            <path d="M106,94 C78,36 28,6 47,70 C56,104 78,116 106,94 Z" fill="#fde68a" filter="url(#qamar-ear-glow)" />
            <path d="M101,89 C80,44 45,22 56,70 C62,96 78,108 101,89 Z" fill="#d97706" />
            <path d="M154,94 C182,36 232,6 213,70 C204,104 182,116 154,94 Z" fill="#fde68a" filter="url(#qamar-ear-glow)" />
            <path d="M159,89 C180,44 215,22 204,70 C198,96 182,108 159,89 Z" fill="#d97706" />
          </g>

          {/* Face */}
          <ellipse cx="130" cy="126" rx="46" ry="40" fill="#fde68a" filter="url(#qamar-shadow)" />

          {/* Eyebrows */}
          {state === "sad" ? (
            <>
              <path d="M106,105 Q114,100 122,107" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M138,107 Q146,100 154,105" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M106,108 Q114,102 122,108" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M138,108 Q146,102 154,108" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* Eyes */}
          <ellipse cx="114" cy="120" rx="9" ry="11" fill="#1a0a00" />
          <ellipse cx="146" cy="120" rx="9" ry="11" fill="#1a0a00" />
          <circle cx="117" cy="116" r="3.5" fill="#fef08a" />
          <circle cx="149" cy="116" r="3.5" fill="#fef08a" />
          <ellipse cx="114" cy="121" rx="5" ry="7" fill="#2a0a00" />
          <ellipse cx="146" cy="121" rx="5" ry="7" fill="#2a0a00" />

          {/* Nose */}
          <ellipse cx="130" cy="140" rx="6" ry="4" fill="#d97706" />
          <path d="M127,140 Q130,144 133,140" fill="none" stroke="#92400e" strokeWidth="1" />

          {/* Cheek blush */}
          <circle cx="100" cy="133" r="6" fill="#d97706" opacity="0.25" />
          <circle cx="160" cy="133" r="6" fill="#d97706" opacity="0.25" />

          {/* Mouth */}
          {state === "happy"   && <path d="M118,150 Q130,163 142,150" fill="none" stroke="#1a0a00" strokeWidth="2.5" strokeLinecap="round" />}
          {state === "talking" && <ellipse cx="130" cy="151" rx="6" ry="8" fill="#1a0a00" />}
          {state === "idle"    && <path d="M118,150 Q130,157 142,148" fill="none" stroke="#1a0a00" strokeWidth="2" strokeLinecap="round" />}
          {state === "sad"     && <path d="M118,152 Q130,144 142,152" fill="none" stroke="#1a0a00" strokeWidth="2" strokeLinecap="round" />}
        </g>

        {/* ── Sparkles (happy) ── */}
        {state === "happy" && (
          <g>
            <circle cx="48"  cy="80"  r="5" fill="#fbbf24" className="qamar-sparkle" style={{ animationDelay: "0s" }} />
            <circle cx="215" cy="140" r="4" fill="#fbbf24" className="qamar-sparkle" style={{ animationDelay: "0.25s" }} />
            <circle cx="75"  cy="260" r="6" fill="#fbbf24" className="qamar-sparkle" style={{ animationDelay: "0.5s" }} />
            <circle cx="205" cy="270" r="4" fill="#fbbf24" className="qamar-sparkle" style={{ animationDelay: "0.15s" }} />
            <circle cx="130" cy="45"  r="7" fill="#fbbf24" className="qamar-sparkle" style={{ animationDelay: "0.35s" }} />
            <circle cx="38"  cy="185" r="3" fill="#fbbf24" className="qamar-sparkle" style={{ animationDelay: "0.6s" }} />
          </g>
        )}
      </g>
    </svg>
  );
}
