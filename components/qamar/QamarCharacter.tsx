"use client";

export type QamarState = "idle" | "talking" | "happy" | "sad";

function QamarDefs() {
  return (
    <defs>
      <filter id="qamar-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      
      <filter id="qamar-shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#451a03" floodOpacity="0.4" />
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
        0%, 100% { transform: scale(1); }
        50%      { transform: scale(1.05); }
      }
      @keyframes qamar-flip {
        0%       { transform: translateY(0) rotate(0deg); }
        50%      { transform: translateY(-30px) rotate(180deg); }
        100%     { transform: translateY(0) rotate(360deg); }
      }
      @keyframes qamar-sparkle-fade {
        0%, 100% { opacity: 0; transform: scale(0.5); }
        50%      { opacity: 1; transform: scale(1.2); }
      }
      .qamar-float { animation: qamar-float 3.2s ease-in-out infinite; transform-origin: 130px 195px; }
      .qamar-talking .qamar-ears { animation: qamar-ear-twitch 0.4s ease-in-out infinite; transform-origin: 130px 120px; }
      .qamar-talking .qamar-body { transform: translateY(4px) scale(1.02); transition: transform 0.3s; transform-origin: 130px 195px; }
      .qamar-talking .qamar-quill { transform: rotate(-10deg) translate(-5px, 5px); transition: transform 0.3s; }
      .qamar-happy { animation: qamar-flip 1s ease-in-out; transform-origin: 130px 195px; }
      .qamar-sad .qamar-body { transform: translateY(15px); transition: transform 0.5s; }
      .qamar-sad .qamar-ears { transform: rotate(180deg) translateY(-40px); transition: transform 0.5s; transform-origin: 130px 120px; }
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
        {/* Magic carpet */}
        <g transform="translate(130, 340)">
          <path d="M-80,0 L80,0 L90,20 L-90,20 Z" fill="#991b1b" filter="url(#qamar-shadow)" />
          <path d="M-75,5 L75,5 L82,15 L-82,15 Z" fill="#b91c1c" />
          <path d="M-70,10 L70,10" stroke="#fcd34d" strokeWidth="2" strokeDasharray="5,5" />
          <path d="M-90,20 L-95,28 M-80,20 L-85,28 M-70,20 L-75,28 M-60,20 L-65,28 M90,20 L95,28 M80,20 L85,28 M70,20 L75,28 M60,20 L65,28" stroke="#fcd34d" strokeWidth="2" />
        </g>

        <g className="qamar-body">
          {/* Bushy tail */}
          <path d="M160,280 C190,300 240,290 230,230 C220,180 180,200 170,230 C160,260 170,270 160,280 Z" fill="#fbbf24" />
          <path d="M165,275 C190,290 230,280 220,235 C215,200 185,210 180,235 C175,255 180,265 165,275 Z" fill="#d97706" />

          {/* Torso */}
          <ellipse cx="130" cy="240" rx="35" ry="50" fill="#fde68a" />
          
          {/* Henna patterns on body */}
          <path d="M115,220 Q130,240 145,220 M110,240 Q130,260 150,240 M115,260 Q130,280 145,260" fill="none" stroke="#92400e" strokeWidth="1.5" />

          {/* Quill arm */}
          <g className="qamar-quill">
            <ellipse cx="100" cy="240" rx="12" ry="25" fill="#fde68a" transform="rotate(30, 100, 240)" />
            <path d="M85,270 C60,240 70,170 100,160 C90,190 100,240 85,270 Z" fill="#fde68a" />
            <path d="M85,270 L95,285" stroke="#d97706" strokeWidth="3" />
            <circle cx="95" cy="285" r="4" fill="#1e3a8a" />
          </g>

          {/* Other arm */}
          <ellipse cx="160" cy="240" rx="12" ry="25" fill="#fde68a" transform="rotate(-30, 160, 240)" />

          {/* Amulet */}
          <polygon points="130,210 120,230 130,250 140,230" fill="#7c3aed" filter="url(#qamar-shadow)" />
          <polygon points="130,215 125,230 130,245 135,230" fill="#a78bfa" />
          <path d="M130,170 L130,210" stroke="#fcd34d" strokeWidth="2" />
        </g>

        {/* Head Group */}
        <g className="qamar-head">
          {/* Ears */}
          <g className="qamar-ears">
            <path d="M110,100 C70,20 20,-10 40,70 C50,110 80,120 110,100 Z" fill="#fde68a" filter="url(#qamar-glow)" />
            <path d="M105,95 C75,35 40,15 50,70 C55,100 75,110 105,95 Z" fill="#d97706" />
            
            <path d="M150,100 C190,20 240,-10 220,70 C210,110 180,120 150,100 Z" fill="#fde68a" filter="url(#qamar-glow)" />
            <path d="M155,95 C185,35 220,15 210,70 C205,100 185,110 155,95 Z" fill="#d97706" />
          </g>

          {/* Face */}
          <ellipse cx="130" cy="130" rx="45" ry="35" fill="#fde68a" filter="url(#qamar-shadow)" />

          {/* Eyes */}
          <ellipse cx="110" cy="125" rx="8" ry="12" fill="#1a0a00" />
          <ellipse cx="150" cy="125" rx="8" ry="12" fill="#1a0a00" />
          <circle cx="112" cy="122" r="3" fill="#fef08a" />
          <circle cx="152" cy="122" r="3" fill="#fef08a" />
          
          {/* Eye expression */}
          {state === "sad" && (
            <>
              <path d="M100,115 Q110,110 120,120" stroke="#92400e" strokeWidth="2" fill="none" />
              <path d="M140,120 Q150,110 160,115" stroke="#92400e" strokeWidth="2" fill="none" />
            </>
          )}
          {state !== "sad" && (
            <>
              <path d="M100,115 Q110,105 120,115" stroke="#92400e" strokeWidth="2" fill="none" />
              <path d="M140,115 Q150,105 160,115" stroke="#92400e" strokeWidth="2" fill="none" />
            </>
          )}

          {/* Nose */}
          <ellipse cx="130" cy="145" rx="6" ry="4" fill="#d97706" />

          {/* Mouth */}
          {state === "happy" && <path d="M120,155 Q130,165 140,155" fill="none" stroke="#1a0a00" strokeWidth="2" />}
          {state === "talking" && <ellipse cx="130" cy="155" rx="5" ry="8" fill="#1a0a00" />}
          {state === "idle" && <path d="M120,155 Q130,160 140,152" fill="none" stroke="#1a0a00" strokeWidth="2" />}
          {state === "sad" && <path d="M120,155 Q130,145 140,155" fill="none" stroke="#1a0a00" strokeWidth="2" />}
        </g>

        {/* Sparkles when happy */}
        {state === "happy" && (
          <g>
            <circle cx="50" cy="80" r="4" fill="#fbbf24" className="qamar-sparkle" style={{animationDelay: "0s"}} />
            <circle cx="210" cy="150" r="3" fill="#fbbf24" className="qamar-sparkle" style={{animationDelay: "0.2s"}} />
            <circle cx="80" cy="250" r="5" fill="#fbbf24" className="qamar-sparkle" style={{animationDelay: "0.4s"}} />
            <circle cx="200" cy="280" r="4" fill="#fbbf24" className="qamar-sparkle" style={{animationDelay: "0.1s"}} />
            <circle cx="130" cy="50" r="6" fill="#fbbf24" className="qamar-sparkle" style={{animationDelay: "0.3s"}} />
          </g>
        )}
      </g>
    </svg>
  );
}
