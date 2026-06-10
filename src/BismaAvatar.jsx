import React from "react";

// Fully custom animated vector Bisma — blue/purple hair, pink beret, bunny friend.
// Animates via CSS classes: blinking, waving arm, talking mouth, hair sway, bobbing.
export default function BismaAvatar({ size = 280, speaking = false, waving = false }) {
  return (
    <svg
      className={"avatar" + (speaking ? " is-speaking" : "") + (waving ? " is-waving" : "")}
      width={size}
      height={size * 1.2}
      viewBox="0 0 400 480"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Bisma, your animated English tutor"
    >
      <defs>
        <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b8cff" />
          <stop offset="0.45" stopColor="#6a5ae8" />
          <stop offset="1" stopColor="#9b3fd9" />
        </linearGradient>
        <linearGradient id="hairFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d9bff" />
          <stop offset="1" stopColor="#7b54e8" />
        </linearGradient>
        <linearGradient id="beretGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff77c0" />
          <stop offset="1" stopColor="#e8408f" />
        </linearGradient>
        <linearGradient id="dressGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f1ff" />
          <stop offset="1" stopColor="#cabcf2" />
        </linearGradient>
        <radialGradient id="irisGrad" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#7fa8ff" />
          <stop offset="0.6" stopColor="#4a55c4" />
          <stop offset="1" stopColor="#211e56" />
        </radialGradient>
      </defs>

      {/* ---------- back hair ---------- */}
      <g className="av-hair-back">
        <path
          fill="url(#hairGrad)"
          d="M200,62
             C 116,62 78,128 80,198
             C 81,242 70,290 56,330
             C 50,348 58,360 76,352
             C 84,348 92,338 97,328
             C 99,352 92,372 84,388
             C 78,402 88,412 102,404
             C 118,394 128,376 133,356
             L 140,250 L 260,250 L 267,356
             C 272,376 282,394 298,404
             C 312,412 322,402 316,388
             C 308,372 301,352 303,328
             C 308,338 316,348 324,352
             C 342,360 350,348 344,330
             C 330,290 319,242 320,198
             C 322,128 284,62 200,62 Z"
        />
      </g>

      {/* ---------- body ---------- */}
      <g className="av-body">
        {/* neck */}
        <rect x="186" y="288" width="28" height="26" rx="12" fill="#ffdfc9" />
        {/* dress */}
        <path
          fill="url(#dressGrad)"
          stroke="#b9a6e8"
          strokeWidth="2"
          d="M159,308
             C 172,300 228,300 241,308
             C 268,322 284,372 290,428
             C 291,440 282,448 270,448
             L 130,448
             C 118,448 109,440 110,428
             C 116,372 132,322 159,308 Z"
        />
        {/* collar */}
        <path d="M173,306 Q200,330 227,306 Q214,318 200,318 Q186,318 173,306 Z" fill="#8e6fe0" />
        {/* bow */}
        <g className="av-bow">
          <path d="M200,322 L172,308 C 164,320 166,332 176,338 Z" fill="#ff5db1" />
          <path d="M200,322 L228,308 C 236,320 234,332 224,338 Z" fill="#ff5db1" />
          <circle cx="200" cy="324" r="9" fill="#ff8ed0" />
        </g>
        {/* left arm (her right) — resting */}
        <path
          d="M163,318 C 144,332 132,362 128,392 C 127,402 134,408 143,405 C 152,402 158,372 166,348 Z"
          fill="url(#dressGrad)"
          stroke="#b9a6e8"
          strokeWidth="2"
        />
        <circle cx="136" cy="399" r="11" fill="#ffdfc9" />
      </g>

      {/* ---------- waving arm (her left) ---------- */}
      <g className="av-arm-wave">
        <path
          d="M240,312 C 268,318 300,300 330,264 C 338,254 332,243 322,247 C 302,256 272,288 240,296 Z"
          fill="url(#dressGrad)"
          stroke="#b9a6e8"
          strokeWidth="2"
        />
        <circle cx="334" cy="254" r="14" fill="#ffdfc9" />
        <text x="352" y="232" fontSize="26" fill="#fff" opacity="0.85">✦</text>
      </g>

      {/* ---------- head ---------- */}
      <g className="av-head">
        <ellipse cx="200" cy="196" rx="108" ry="100" fill="#ffe9da" />

        {/* eyes */}
        <g className="av-eye av-eye-l">
          <ellipse cx="153" cy="218" rx="26" ry="33" fill="#fff" />
          <circle cx="153" cy="222" r="21" fill="url(#irisGrad)" />
          <circle cx="153" cy="224" r="9" fill="#16143c" />
          <circle cx="146" cy="212" r="7" fill="#fff" />
          <circle cx="161" cy="230" r="3.5" fill="#fff" opacity="0.9" />
          <path d="M126,196 Q150,178 180,192" stroke="#3b2a6b" strokeWidth="7" fill="none" strokeLinecap="round" />
        </g>
        <g className="av-eye av-eye-r">
          <ellipse cx="247" cy="218" rx="26" ry="33" fill="#fff" />
          <circle cx="247" cy="222" r="21" fill="url(#irisGrad)" />
          <circle cx="247" cy="224" r="9" fill="#16143c" />
          <circle cx="240" cy="212" r="7" fill="#fff" />
          <circle cx="255" cy="230" r="3.5" fill="#fff" opacity="0.9" />
          <path d="M220,196 Q244,178 274,192" stroke="#3b2a6b" strokeWidth="7" fill="none" strokeLinecap="round" />
        </g>

        {/* brows */}
        <path d="M128,172 Q152,162 176,170" stroke="#5d4a9e" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M224,170 Q248,162 272,172" stroke="#5d4a9e" strokeWidth="5" fill="none" strokeLinecap="round" />

        {/* blush */}
        <ellipse cx="118" cy="256" rx="17" ry="10" fill="#ff9fbe" opacity="0.65" />
        <ellipse cx="282" cy="256" rx="17" ry="10" fill="#ff9fbe" opacity="0.65" />

        {/* mouth: smile + talking mouth */}
        <g className="av-mouth">
          <path className="av-smile" d="M184,266 Q200,282 216,266" stroke="#d4577a" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse className="av-talk" cx="200" cy="272" rx="13" ry="10" fill="#a83a5c" />
          <ellipse className="av-talk-tongue" cx="200" cy="277" rx="8" ry="5" fill="#ff8aa8" />
        </g>

        {/* bangs */}
        <path
          className="av-bangs"
          fill="url(#hairFront)"
          d="M200,64
             C 122,64 92,124 94,186
             C 110,168 118,150 124,132
             C 132,152 128,170 122,186
             C 142,176 152,156 158,134
             C 166,156 162,176 154,192
             C 174,182 186,162 192,138
             C 200,160 198,180 190,196
             C 212,186 224,164 228,140
             C 238,162 234,182 226,196
             C 246,188 258,168 262,146
             C 272,164 270,182 264,196
             C 282,186 292,168 294,150
             C 302,164 304,178 304,188
             C 308,124 278,64 200,64 Z"
        />
        {/* side strands */}
        <path className="av-strand av-strand-l" fill="url(#hairFront)"
          d="M96,170 C 86,210 88,262 100,300 C 106,318 122,314 120,296 C 114,254 112,212 118,178 Z" />
        <path className="av-strand av-strand-r" fill="url(#hairFront)"
          d="M304,170 C 314,210 312,262 300,300 C 294,318 278,314 280,296 C 286,254 288,212 282,178 Z" />
      </g>

      {/* ---------- beret ---------- */}
      <g className="av-beret">
        <ellipse cx="198" cy="74" rx="116" ry="44" fill="url(#beretGrad)" transform="rotate(-7 198 74)" />
        <ellipse cx="198" cy="80" rx="104" ry="30" fill="#d63384" opacity="0.35" transform="rotate(-7 198 80)" />
        <circle cx="196" cy="32" r="12" fill="#ff8ed0" />
      </g>

      {/* ---------- bunny friend ---------- */}
      <g className="av-bunny">
        <ellipse cx="330" cy="436" rx="34" ry="28" fill="#fff" stroke="#e8d8f4" strokeWidth="2" />
        <ellipse cx="314" cy="392" rx="9" ry="26" fill="#fff" stroke="#e8d8f4" strokeWidth="2" transform="rotate(-12 314 392)" />
        <ellipse cx="344" cy="392" rx="9" ry="26" fill="#fff" stroke="#e8d8f4" strokeWidth="2" transform="rotate(10 344 392)" />
        <ellipse cx="314" cy="394" rx="4" ry="16" fill="#ffc9e3" transform="rotate(-12 314 394)" />
        <ellipse cx="344" cy="394" rx="4" ry="16" fill="#ffc9e3" transform="rotate(10 344 394)" />
        <circle cx="318" cy="432" r="3.4" fill="#3a3158" />
        <circle cx="342" cy="432" r="3.4" fill="#3a3158" />
        <path d="M325,442 Q330,447 335,442" stroke="#3a3158" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="306" cy="441" rx="7" ry="4.5" fill="#ffafd2" />
        <ellipse cx="354" cy="441" rx="7" ry="4.5" fill="#ffafd2" />
      </g>
    </svg>
  );
}
