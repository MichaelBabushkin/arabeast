"use client";

export type JinnState = "idle" | "talking" | "happy" | "sad";

// ─── Shared defs (gradients / filters) ────────────────────────────────────────
function JinnDefs() {
  return (
    <defs>
      <linearGradient id="jinn-skin" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%"   stopColor="#7ec8e3" />
        <stop offset="50%"  stopColor="#5aafd4" />
        <stop offset="100%" stopColor="#3d8eb8" />
      </linearGradient>
      <linearGradient id="jinn-body" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%"   stopColor="#6bbcd8" />
        <stop offset="100%" stopColor="#3880b0" />
      </linearGradient>
      <linearGradient id="jinn-gold" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#f5d060" />
        <stop offset="50%"  stopColor="#d4a017" />
        <stop offset="100%" stopColor="#9a7010" />
      </linearGradient>
      <linearGradient id="jinn-smoke" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#4a9fd4" stopOpacity="0.95" />
        <stop offset="80%"  stopColor="#3880b0" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#2060a0" stopOpacity="0" />
      </linearGradient>
      <filter id="jinn-shadow">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1a3a6a" floodOpacity="0.4" />
      </filter>
      <clipPath id="jinn-face-clip">
        <ellipse cx="130" cy="88" rx="58" ry="56" />
      </clipPath>
    </defs>
  );
}

// ─── Static base (tail + lamp + waistband + body + necklace + ears + head) ────
function JinnBase() {
  return (
    <>
      {/* smoke tail */}
      <path d="M105,268 C94,296 88,324 96,350 C108,364 130,360 130,360 C130,360 152,364 164,350 C172,324 166,296 155,268Z" fill="url(#jinn-smoke)" />
      <path d="M102,272 C86,296 74,322 76,350"  stroke="#5aafd4" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.45" />
      <path d="M158,272 C174,296 186,322 184,350" stroke="#5aafd4" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.45" />

      {/* lamp */}
      <g transform="translate(130,372)">
        <ellipse cx="0" cy="0" rx="44" ry="17" fill="url(#jinn-gold)" filter="url(#jinn-shadow)" />
        <path d="M-44,-1 C-58,-5 -66,-16 -60,-22 C-54,-28 -42,-20 -38,-10 C-35,-2 -40,3 -44,-1Z" fill="url(#jinn-gold)" />
        <path d="M38,-6 C52,-14 56,-26 50,-32 C44,-36 36,-30 37,-20 C38,-12 38,-6 38,-6Z" fill="url(#jinn-gold)" />
        <ellipse cx="5"  cy="-14" rx="18" ry="7" fill="#d4a017" />
        <ellipse cx="5"  cy="-20" rx="10" ry="5" fill="#f0c840" />
        <ellipse cx="-8" cy="-3"  rx="12" ry="5" fill="#f5e070" opacity="0.55" transform="rotate(-10)" />
      </g>

      {/* waistband */}
      <path d="M68,248 C68,241 96,236 130,236 C164,236 192,241 192,248 L192,264 C192,271 164,276 130,276 C96,276 68,271 68,264Z" fill="#8b1a2a" />
      <path d="M68,255 C68,249 96,245 130,245 C164,245 192,249 192,255 C192,261 164,265 130,265 C96,265 68,261 68,255Z" fill="url(#jinn-gold)" opacity="0.85" />

      {/* body */}
      <ellipse cx="130" cy="192" rx="88" ry="66" fill="url(#jinn-body)" />
      <ellipse cx="112" cy="166" rx="42" ry="28" fill="#a0d8f0" opacity="0.22" />

      {/* necklace */}
      <path d="M72,140 C88,132 108,128 130,128 C152,128 172,132 188,140 L182,150 C168,142 150,138 130,138 C110,138 92,142 78,150Z" fill="#111122" />

      {/* belly jewel */}
      <ellipse cx="130" cy="200" rx="15" ry="12" fill="url(#jinn-gold)" />
      <ellipse cx="128" cy="197" rx="9"  ry="7"  fill="#f5e070" opacity="0.8" />

      {/* ears */}
      <path d="M72,92 C56,82 46,64 52,50 C58,40 68,44 72,58 C76,68 76,82 72,92Z"   fill="url(#jinn-skin)" />
      <path d="M188,92 C204,82 214,64 208,50 C202,40 192,44 188,58 C184,68 184,82 188,92Z" fill="url(#jinn-skin)" />

      {/* head */}
      <ellipse cx="130" cy="88" rx="58" ry="56" fill="url(#jinn-skin)" filter="url(#jinn-shadow)" />
      <ellipse cx="114" cy="65" rx="30" ry="22" fill="#b0e0f8" opacity="0.28" />

      {/* topknot */}
      <ellipse cx="130" cy="34" rx="13" ry="9" fill="#111122" />
      <path d="M130,34 C128,18 136,8 142,5 C148,2 152,6 148,12 C144,18 136,22 130,28" stroke="#111122" strokeWidth="7" strokeLinecap="round" fill="none" />
      <circle cx="148" cy="11" r="6" fill="#111122" />

      {/* earring */}
      <circle cx="192" cy="96" r="7" fill="none" stroke="url(#jinn-gold)" strokeWidth="3.5" />
      <circle cx="192" cy="96" r="2" fill="url(#jinn-gold)" />

      {/* nose (shared) */}
      <circle cx="130" cy="99" r="11" fill="#4a9fd4" />
      <circle cx="130" cy="97" r="9"  fill="#5aafd4" />
      <ellipse cx="124" cy="103" rx="4" ry="3" fill="#2a70a0" opacity="0.65" />
      <ellipse cx="136" cy="103" rx="4" ry="3" fill="#2a70a0" opacity="0.65" />
      <ellipse cx="127" cy="94"  rx="4" ry="3" fill="#a0daf8" opacity="0.55" />
    </>
  );
}

// ─── ARM VARIANTS ─────────────────────────────────────────────────────────────
function CrossedArms() {
  return (
    <>
      <ellipse cx="196" cy="172" rx="36" ry="46" fill="url(#jinn-body)" transform="rotate(12,196,172)" />
      <ellipse cx="64"  cy="172" rx="36" ry="46" fill="url(#jinn-body)" transform="rotate(-12,64,172)" />
      <path d="M48,200 C60,190 90,188 120,192 C148,196 165,205 175,215 C162,228 140,228 118,224 C92,220 62,222 48,215Z"  fill="#5aafd4" />
      <path d="M212,200 C200,190 170,188 140,192 C112,196 95,205 85,215 C98,228 120,228 142,224 C168,220 198,222 212,215Z" fill="#4a9fd4" />
      <path d="M75,198 C90,194 110,192 130,193"  stroke="#8ed8f0" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M185,198 C170,194 150,192 130,193" stroke="#7ecce8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.3" />
      <ellipse cx="55"  cy="207" rx="20" ry="10" fill="url(#jinn-gold)" transform="rotate(-12,55,207)" />
      <ellipse cx="205" cy="207" rx="20" ry="10" fill="url(#jinn-gold)" transform="rotate(12,205,207)" />
      <ellipse cx="52"  cy="204" rx="10" ry="4"  fill="#f5e070" opacity="0.65" transform="rotate(-12,52,204)" />
      <ellipse cx="202" cy="204" rx="10" ry="4"  fill="#f5e070" opacity="0.65" transform="rotate(12,202,204)" />
    </>
  );
}

function GestureArms() {
  return (
    <>
      {/* left arm — relaxed down */}
      <ellipse cx="58" cy="192" rx="34" ry="46" fill="url(#jinn-body)" transform="rotate(5,58,192)" />
      <path d="M32,218 C28,236 26,252 30,266 C38,272 52,270 56,262 C58,248 56,232 52,222Z" fill="url(#jinn-skin)" />
      <ellipse cx="40" cy="263" rx="18" ry="9" fill="url(#jinn-gold)" transform="rotate(5,40,263)" />
      {/* right arm — raised, pointing finger */}
      <ellipse cx="202" cy="158" rx="34" ry="46" fill="url(#jinn-body)" transform="rotate(-20,202,158)" />
      <g className="jinn-hand-bob">
        <path d="M224,140 C230,122 230,104 228,90 C220,82 208,84 205,94 C203,106 205,126 210,144Z" fill="url(#jinn-skin)" />
        <path d="M216,88 C214,72 216,58 220,52 C226,48 232,52 232,60 C232,70 228,82 224,90Z"   fill="url(#jinn-skin)" />
        <path d="M206,92 C200,82 200,74 204,70 C208,68 212,72 212,80Z" fill="url(#jinn-skin)" />
        <path d="M204,100 C196,94 194,86 198,82 C202,80 206,84 206,92Z" fill="url(#jinn-skin)" />
        <ellipse cx="218" cy="138" rx="18" ry="9" fill="url(#jinn-gold)" transform="rotate(-20,218,138)" />
      </g>
    </>
  );
}

function RaisedArms() {
  return (
    <>
      <ellipse cx="54"  cy="142" rx="34" ry="44" fill="url(#jinn-body)" transform="rotate(-35,54,142)" />
      <path d="M28,100 C32,88 40,78 50,72 C62,82 66,96 62,110 C52,116 38,112 28,100Z" fill="url(#jinn-skin)" />
      <ellipse cx="46" cy="66" rx="18" ry="14" fill="url(#jinn-skin)" />
      <path d="M36,58 C32,48 36,42 42,46 C44,52 44,58 40,62" fill="url(#jinn-skin)" stroke="#3898b8" strokeWidth="1" />
      <path d="M44,54 C42,44 46,38 52,42 C54,48 54,56 52,62" fill="url(#jinn-skin)" stroke="#3898b8" strokeWidth="1" />
      <path d="M54,54 C54,44 58,40 62,44 C64,50 62,58 60,62" fill="url(#jinn-skin)" stroke="#3898b8" strokeWidth="1" />
      <ellipse cx="44" cy="74" rx="18" ry="9" fill="url(#jinn-gold)" transform="rotate(-20,44,74)" />

      <ellipse cx="206" cy="142" rx="34" ry="44" fill="url(#jinn-body)" transform="rotate(35,206,142)" />
      <path d="M232,100 C228,88 220,78 210,72 C198,82 194,96 198,110 C208,116 222,112 232,100Z" fill="url(#jinn-skin)" />
      <ellipse cx="214" cy="66" rx="18" ry="14" fill="url(#jinn-skin)" />
      <path d="M224,58 C228,48 224,42 218,46 C216,52 216,58 220,62" fill="url(#jinn-skin)" stroke="#3898b8" strokeWidth="1" />
      <path d="M216,54 C218,44 214,38 208,42 C206,48 206,56 208,62" fill="url(#jinn-skin)" stroke="#3898b8" strokeWidth="1" />
      <path d="M206,54 C206,44 202,40 198,44 C196,50 198,58 200,62" fill="url(#jinn-skin)" stroke="#3898b8" strokeWidth="1" />
      <ellipse cx="216" cy="74" rx="18" ry="9" fill="url(#jinn-gold)" transform="rotate(20,216,74)" />
    </>
  );
}

function DroopingArms() {
  return (
    <>
      <ellipse cx="56"  cy="192" rx="34" ry="46" fill="url(#jinn-body)" transform="rotate(8,56,192)" />
      <path d="M32,215 C28,232 26,250 28,266 C36,274 50,272 56,264 C58,248 56,232 52,218Z"   fill="url(#jinn-skin)" />
      <ellipse cx="42"  cy="262" rx="18" ry="9" fill="url(#jinn-gold)" transform="rotate(5,42,262)" />
      <ellipse cx="204" cy="192" rx="34" ry="46" fill="url(#jinn-body)" transform="rotate(-8,204,192)" />
      <path d="M228,215 C232,232 234,250 232,266 C224,274 210,272 204,264 C202,248 204,232 208,218Z" fill="url(#jinn-skin)" />
      <ellipse cx="218" cy="262" rx="18" ry="9" fill="url(#jinn-gold)" transform="rotate(-5,218,262)" />
    </>
  );
}

// ─── FACE VARIANTS ────────────────────────────────────────────────────────────
function IdleFace() {
  return (
    <>
      {/* eyebrows */}
      <path d="M78,66 C86,57 98,55 110,60"  stroke="#111122" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M150,60 C162,55 174,57 182,66" stroke="#111122" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* eyes with blink */}
      <g className="jinn-blink">
        <ellipse cx="100" cy="85" rx="17" ry="18" fill="white" />
        <ellipse cx="100" cy="87" rx="11" ry="12" fill="#1a5080" />
        <circle  cx="100" cy="88" r="6.5" fill="#080e18" />
        <circle  cx="105" cy="82" r="4.5" fill="white" opacity="0.95" />
        <ellipse cx="100" cy="85" rx="17" ry="18" fill="none" stroke="#111122" strokeWidth="2.5" />
        <ellipse cx="160" cy="85" rx="17" ry="18" fill="white" />
        <ellipse cx="160" cy="87" rx="11" ry="12" fill="#1a5080" />
        <circle  cx="160" cy="88" r="6.5" fill="#080e18" />
        <circle  cx="165" cy="82" r="4.5" fill="white" opacity="0.95" />
        <ellipse cx="160" cy="85" rx="17" ry="18" fill="none" stroke="#111122" strokeWidth="2.5" />
      </g>
      {/* grin */}
      <path d="M90,115 C98,130 113,138 130,138 C147,138 162,130 170,115 C158,112 146,110 130,110 C114,110 102,112 90,115Z" fill="#1a0808" />
      <path d="M90,115 C102,110 114,108 130,108 C146,108 158,110 170,115" stroke="#111122" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M93,117 C100,130 113,136 130,136 C147,136 160,130 167,117 C155,113 144,112 130,112 C116,112 105,113 93,117Z" fill="#f5f5f0" />
      <line x1="108" y1="112" x2="110" y2="131" stroke="#ddd" strokeWidth="1.5" opacity="0.7" />
      <line x1="130" y1="112" x2="130" y2="135" stroke="#ddd" strokeWidth="1.5" opacity="0.7" />
      <line x1="152" y1="112" x2="150" y2="131" stroke="#ddd" strokeWidth="1.5" opacity="0.7" />
      <path d="M94,132 C106,140 118,142 130,142 C142,142 154,140 166,132" stroke="#3d85b5" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* cheeks */}
      <ellipse cx="80"  cy="108" rx="12" ry="8" fill="#5090c0" opacity="0.3" />
      <ellipse cx="180" cy="108" rx="12" ry="8" fill="#5090c0" opacity="0.3" />
    </>
  );
}

function TalkingFace() {
  return (
    <>
      {/* eyebrows — expressive, raised */}
      <path d="M78,63 C86,54 98,52 110,57"  stroke="#111122" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M150,57 C162,52 174,54 182,63" stroke="#111122" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* eyes — attentive, no blink */}
      <ellipse cx="100" cy="82" rx="17" ry="19" fill="white" />
      <ellipse cx="100" cy="84" rx="11" ry="12" fill="#1a5080" />
      <circle  cx="100" cy="85" r="6.5" fill="#080e18" />
      <circle  cx="105" cy="79" r="4.5" fill="white" opacity="0.95" />
      <ellipse cx="100" cy="82" rx="17" ry="19" fill="none" stroke="#111122" strokeWidth="2.5" />
      <ellipse cx="160" cy="82" rx="17" ry="19" fill="white" />
      <ellipse cx="160" cy="84" rx="11" ry="12" fill="#1a5080" />
      <circle  cx="160" cy="85" r="6.5" fill="#080e18" />
      <circle  cx="165" cy="79" r="4.5" fill="white" opacity="0.95" />
      <ellipse cx="160" cy="82" rx="17" ry="19" fill="none" stroke="#111122" strokeWidth="2.5" />
      {/* upper lip — fixed */}
      <path d="M90,113 C102,108 114,106 130,106 C146,106 158,108 170,113" stroke="#111122" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* mouth interior */}
      <path d="M90,113 C98,128 113,136 130,136 C147,136 162,128 170,113 C158,110 146,108 130,108 C114,108 102,110 90,113Z" fill="#1a0808" />
      {/* animated jaw */}
      <g className="jinn-jaw" clipPath="url(#jinn-face-clip)">
        <path d="M93,115 C100,128 113,134 130,134 C147,134 160,128 167,115 C155,111 144,110 130,110 C116,110 105,111 93,115Z" fill="#f5f5f0" />
        <line x1="108" y1="110" x2="110" y2="129" stroke="#ddd" strokeWidth="1.5" opacity="0.7" />
        <line x1="130" y1="110" x2="130" y2="133" stroke="#ddd" strokeWidth="1.5" opacity="0.7" />
        <line x1="152" y1="110" x2="150" y2="129" stroke="#ddd" strokeWidth="1.5" opacity="0.7" />
        <path d="M94,130 C106,138 118,140 130,140 C142,140 154,138 166,130" stroke="#3d85b5" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
      {/* cheeks */}
      <ellipse cx="80"  cy="108" rx="12" ry="8" fill="#5090c0" opacity="0.3" />
      <ellipse cx="180" cy="108" rx="12" ry="8" fill="#5090c0" opacity="0.3" />
    </>
  );
}

function HappyFace() {
  return (
    <>
      {/* eyebrows — raised high */}
      <path d="M78,60 C86,50 98,48 110,53"  stroke="#111122" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M150,53 C162,48 174,50 182,60" stroke="#111122" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* eyes — wide open */}
      <ellipse cx="100" cy="84" rx="19" ry="21" fill="white" />
      <ellipse cx="100" cy="86" rx="12" ry="13" fill="#1a5888" />
      <circle  cx="100" cy="87" r="7"   fill="#080e18" />
      <circle  cx="106" cy="80" r="5"   fill="white" opacity="0.95" />
      <ellipse cx="100" cy="84" rx="19" ry="21" fill="none" stroke="#111122" strokeWidth="2.5" />
      <ellipse cx="160" cy="84" rx="19" ry="21" fill="white" />
      <ellipse cx="160" cy="86" rx="12" ry="13" fill="#1a5888" />
      <circle  cx="160" cy="87" r="7"   fill="#080e18" />
      <circle  cx="166" cy="80" r="5"   fill="white" opacity="0.95" />
      <ellipse cx="160" cy="84" rx="19" ry="21" fill="none" stroke="#111122" strokeWidth="2.5" />
      {/* big open laugh */}
      <path d="M86,112 C96,132 112,144 130,144 C148,144 164,132 174,112 C160,108 146,106 130,106 C114,106 100,108 86,112Z" fill="#1a0808" />
      <path d="M86,112 C100,107 114,105 130,105 C146,105 160,107 174,112" stroke="#111122" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M90,114 C100,132 112,142 130,142 C148,142 160,132 170,114 C156,110 144,108 130,108 C116,108 104,110 90,114Z" fill="#f5f5f0" />
      <line x1="110" y1="108" x2="112" y2="136" stroke="#ddd" strokeWidth="1.5" opacity="0.7" />
      <line x1="130" y1="108" x2="130" y2="140" stroke="#ddd" strokeWidth="1.5" opacity="0.7" />
      <line x1="150" y1="108" x2="148" y2="136" stroke="#ddd" strokeWidth="1.5" opacity="0.7" />
      <path d="M92,138 C106,146 118,148 130,148 C142,148 154,146 168,138" stroke="#4298c8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* rosy cheeks */}
      <ellipse cx="78"  cy="108" rx="14" ry="9" fill="#e879a8" opacity="0.25" />
      <ellipse cx="182" cy="108" rx="14" ry="9" fill="#e879a8" opacity="0.25" />
    </>
  );
}

function SadFace() {
  return (
    <>
      {/* eyebrows — inward sad */}
      <path d="M80,72 C88,78 98,78 108,74"  stroke="#111122" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M152,74 C162,78 172,78 180,72" stroke="#111122" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* eyes — heavy-lidded */}
      <ellipse cx="98"  cy="87" rx="19" ry="15" fill="white" />
      <ellipse cx="158" cy="87" rx="19" ry="15" fill="white" />
      <ellipse cx="98"  cy="90" rx="11" ry="10" fill="#1a4a70" />
      <ellipse cx="158" cy="90" rx="11" ry="10" fill="#1a4a70" />
      <circle  cx="98"  cy="91" r="6.5" fill="#080e18" />
      <circle  cx="158" cy="91" r="6.5" fill="#080e18" />
      <circle  cx="102" cy="86" r="3"   fill="white" opacity="0.7" />
      <circle  cx="162" cy="86" r="3"   fill="white" opacity="0.7" />
      {/* heavy upper eyelid */}
      <path d="M80,83 C88,78 108,78 116,83 C108,85 88,86 80,83Z"   fill="#4a90b0" opacity="0.7" />
      <path d="M140,83 C148,78 168,78 176,83 C168,85 148,86 140,83Z" fill="#4a90b0" opacity="0.7" />
      <ellipse cx="98"  cy="87" rx="19" ry="15" fill="none" stroke="#111122" strokeWidth="2.5" />
      <ellipse cx="158" cy="87" rx="19" ry="15" fill="none" stroke="#111122" strokeWidth="2.5" />
      {/* frown */}
      <path d="M96,124 C108,116 122,114 128,114 C134,114 148,116 160,124 C150,130 140,133 128,133 C116,133 106,130 96,124Z" fill="#1a0808" />
      <path d="M96,124 C108,117 122,115 128,115 C134,115 148,117 160,124" stroke="#111122" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <g className="jinn-cry-wobble">
        <path d="M99,126 C110,120 122,118 128,118 C134,118 146,120 157,126 C148,132 140,134 128,134 C116,134 108,132 99,126Z" fill="#f0ece0" />
        <path d="M100,130 C112,136 122,138 128,138 C134,138 144,136 156,130" stroke="#4890b0" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
      {/* flushed nostrils */}
      <ellipse cx="122" cy="105" rx="4" ry="3" fill="#b04040" opacity="0.5" />
      <ellipse cx="134" cy="105" rx="4" ry="3" fill="#b04040" opacity="0.5" />
      {/* worry lines */}
      <path d="M114,68 C118,63 122,65 126,63" stroke="#2a6890" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55" />
    </>
  );
}

// ─── EXTRAS ───────────────────────────────────────────────────────────────────
function Tears() {
  return (
    <>
      {/* left tear streams */}
      <path className="jinn-tear-stream"        d="M87,100 C84,116 83,130 85,148 C86,158 90,164 93,170" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path className="jinn-tear-stream jinn-tear-d2" d="M90,100 C88,116 87,132 90,150 C91,160 95,168 97,174" stroke="#bfdbfe" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* right tear streams */}
      <path className="jinn-tear-stream jinn-tear-r"  d="M169,100 C172,116 173,130 171,148 C170,158 166,164 163,170" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path className="jinn-tear-stream jinn-tear-r2" d="M166,100 C168,116 169,132 166,150 C165,160 161,168 159,174" stroke="#bfdbfe" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* falling drops */}
      <ellipse className="jinn-drop jinn-drop-d1" cx="86"  cy="172" rx="4"   ry="5.5" fill="#93c5fd" opacity="0" />
      <ellipse className="jinn-drop jinn-drop-d2" cx="91"  cy="178" rx="3.5" ry="5"   fill="#bfdbfe" opacity="0" />
      <ellipse className="jinn-drop jinn-drop-d3" cx="170" cy="172" rx="4"   ry="5.5" fill="#93c5fd" opacity="0" />
      <ellipse className="jinn-drop jinn-drop-d4" cx="165" cy="178" rx="3.5" ry="5"   fill="#bfdbfe" opacity="0" />
    </>
  );
}

function Sparkles() {
  return (
    <>
      <g className="jinn-spark" style={{ transformOrigin: "24px 86px" }}>
        <line x1="24" y1="78"  x2="24" y2="70"  stroke="#f5d060" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="24" y1="94"  x2="24" y2="102" stroke="#f5d060" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="16" y1="86"  x2="8"  y2="86"  stroke="#f5d060" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="86"  x2="40" y2="86"  stroke="#f5d060" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="18" y1="80"  x2="12" y2="74"  stroke="#f5d060" strokeWidth="2"   strokeLinecap="round" />
        <line x1="30" y1="92"  x2="36" y2="98"  stroke="#f5d060" strokeWidth="2"   strokeLinecap="round" />
        <line x1="30" y1="80"  x2="36" y2="74"  stroke="#f5d060" strokeWidth="2"   strokeLinecap="round" />
        <line x1="18" y1="92"  x2="12" y2="98"  stroke="#f5d060" strokeWidth="2"   strokeLinecap="round" />
      </g>
      <g className="jinn-spark" style={{ transformOrigin: "236px 72px", animationDelay: "0.35s" }}>
        <line x1="236" y1="64" x2="236" y2="56" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="236" y1="80" x2="236" y2="88" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="228" y1="72" x2="220" y2="72" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="244" y1="72" x2="252" y2="72" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="230" y1="66" x2="224" y2="60" stroke="#7dd3fc" strokeWidth="2"   strokeLinecap="round" />
        <line x1="242" y1="78" x2="248" y2="84" stroke="#7dd3fc" strokeWidth="2"   strokeLinecap="round" />
      </g>
    </>
  );
}

function SpeechWaves() {
  return (
    <g transform="translate(62,118)">
      <path className="jinn-speech-w1" d="M0,0 Q-10,-6 -20,0 Q-30,6 -40,0"   stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
      <path className="jinn-speech-w2" d="M0,0 Q-12,-8 -24,0 Q-36,8 -48,0"   stroke="#a78bfa" strokeWidth="2"   strokeLinecap="round" fill="none" opacity="0.7" />
      <path className="jinn-speech-w3" d="M0,0 Q-14,-10 -28,0 Q-42,10 -56,0" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
    </g>
  );
}

function MagicParticles({ state }: { state: JinnState }) {
  const dim = state === "sad";
  return (
    <>
      <circle className="jinn-md1" cx="28"  cy="158" r="3"   fill={dim ? "#6b7280" : "#f5d060"} opacity={dim ? 0.4 : 0.9} />
      <circle className="jinn-md2" cx="232" cy="145" r="2.5" fill={dim ? "#6b7280" : "#7dd3fc"} opacity={dim ? 0.35 : 0.8} />
      <circle className="jinn-md3" cx="222" cy="188" r="3.5" fill={dim ? "#6b7280" : "#c4b5fd"} opacity={dim ? 0.3 : 0.7} />
      <circle className="jinn-md4" cx="22"  cy="195" r="2.5" fill={dim ? "#6b7280" : "#c4b5fd"} opacity={dim ? 0.3 : 0.7} />
    </>
  );
}

// ─── AURA color per state ─────────────────────────────────────────────────────
const AURA: Record<JinnState, string> = {
  idle:    "#3b82f6",
  talking: "#8b5cf6",
  happy:   "#22c55e",
  sad:     "#6b7280",
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function JinnCharacter({ state }: { state: JinnState }) {
  const bodyClass = state === "sad" ? "jinn-sob" : "jinn-float";

  return (
    <svg
      viewBox="0 0 260 390"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-2xl"
      aria-label="Jinn character"
    >
      <JinnDefs />

      {/* aura */}
      <radialGradient id="jinn-aura-fill" cx="50%" cy="60%" r="50%">
        <stop offset="0%"   stopColor={AURA[state]} stopOpacity="0.4" />
        <stop offset="100%" stopColor={AURA[state]} stopOpacity="0" />
      </radialGradient>
      <ellipse cx="130" cy="310" rx="90" ry="55" fill="url(#jinn-aura-fill)" />

      <g className={bodyClass}>
        <JinnBase />

        {state === "idle"    && <CrossedArms />}
        {state === "talking" && <GestureArms />}
        {state === "happy"   && <RaisedArms />}
        {state === "sad"     && <DroopingArms />}

        {state === "idle"    && <IdleFace />}
        {state === "talking" && <TalkingFace />}
        {state === "happy"   && <HappyFace />}
        {state === "sad"     && <SadFace />}

        {state === "sad"     && <Tears />}
        {state === "happy"   && <Sparkles />}
        {state === "talking" && <SpeechWaves />}

        <MagicParticles state={state} />
      </g>
    </svg>
  );
}
