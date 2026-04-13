/**
 * creature-data.js
 * ================
 * Centralised creature SVG templates and static data for Capucine Rituel.
 * Contains all 16 SVGs (4 collections x 4 stages) with self-contained
 * defs (gradients, filters) and unique IDs to avoid cross-collection conflicts.
 *
 * Prefix legend:
 *   drg-  Dragon Classique
 *   fox-  Loup / Renard Magique
 *   trt-  Tortue Cristal
 *   grf-  Griffon Dore
 *
 * Usage:
 *   const svg = window.CREATURE_DATA.collections.dragon.stages.egg.svg(80);
 */

/* global window */
window.CREATURE_DATA = {

  /* ------------------------------------------------------------------ */
  /*  Collections                                                        */
  /* ------------------------------------------------------------------ */
  collections: {

    /* ==================== DRAGON CLASSIQUE ==================== */
    dragon: {
      name: 'Dragon Classique',
      emoji: '\uD83D\uDC09',
      theme: 'purple',
      glowColor: '#a855f7',
      unlockRequirement: 0,
      unlockLabel: 'Disponible d\u00e8s le d\u00e9part',
      tagline: 'Le gardien ancestral du savoir, n\u00e9 des flammes violettes',
      stages: {

        /* --- Dragon : Egg --- */
        egg: {
          name: '\u0152uf',
          xpRequired: 0,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 60 72" class="breathe">
  <defs>
    <radialGradient id="drg-eggPurple" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="60%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#4c1d95"/>
    </radialGradient>
    <radialGradient id="drg-eggPurpleGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e9d5ff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
    </radialGradient>
    <filter id="drg-glowPurple">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="30" cy="40" rx="22" ry="28" fill="url(#drg-eggPurple)" filter="url(#drg-glowPurple)"/>
  <ellipse cx="30" cy="36" rx="14" ry="16" fill="url(#drg-eggPurpleGlow)" class="egg-pulse"/>
  <ellipse cx="22" cy="28" rx="6" ry="10" fill="white" opacity="0.12" transform="rotate(-15,22,28)"/>
  <!-- Cracks -->
  <path d="M22 22 L26 30 L23 34 L27 40" stroke="#4c1d95" stroke-width="1.2" fill="none" opacity="0.6"/>
  <path d="M36 26 L33 32 L37 36" stroke="#4c1d95" stroke-width="1" fill="none" opacity="0.5"/>
  <path d="M28 18 L30 24" stroke="#4c1d95" stroke-width="0.8" fill="none" opacity="0.4"/>
  <!-- Inner glow through cracks -->
  <circle cx="25" cy="32" r="2" fill="#e9d5ff" opacity="0.5" class="egg-pulse"/>
  <circle cx="35" cy="33" r="1.5" fill="#e9d5ff" opacity="0.4" class="egg-pulse"/>
</svg>`;
          }
        },

        /* --- Dragon : Baby --- */
        baby: {
          name: 'B\u00e9b\u00e9',
          xpRequired: 20,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 70 80" class="breathe">
  <defs>
    <radialGradient id="drg-babyBody" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="70%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#6d28d9"/>
    </radialGradient>
    <radialGradient id="drg-babyBelly" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#e9d5ff"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </radialGradient>
    <filter id="drg-glowPurpleBaby">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Big round head -->
  <ellipse cx="35" cy="30" rx="18" ry="17" fill="url(#drg-babyBody)" filter="url(#drg-glowPurpleBaby)"/>
  <!-- Small round body -->
  <ellipse cx="35" cy="52" rx="13" ry="11" fill="url(#drg-babyBody)"/>
  <!-- Round belly -->
  <ellipse cx="35" cy="53" rx="9" ry="8" fill="url(#drg-babyBelly)" opacity="0.5"/>
  <!-- Stubby wings -->
  <ellipse cx="18" cy="44" rx="7" ry="5" fill="#8b5cf6" opacity="0.7" transform="rotate(-20,18,44)"/>
  <ellipse cx="52" cy="44" rx="7" ry="5" fill="#8b5cf6" opacity="0.7" transform="rotate(20,52,44)"/>
  <!-- Big round eyes -->
  <g class="eye-blink">
    <circle cx="28" cy="28" r="5" fill="white"/>
    <circle cx="42" cy="28" r="5" fill="white"/>
    <circle cx="29" cy="27" r="3" fill="#1e1b4b"/>
    <circle cx="43" cy="27" r="3" fill="#1e1b4b"/>
    <circle cx="30" cy="26" r="1.2" fill="white"/>
    <circle cx="44" cy="26" r="1.2" fill="white"/>
  </g>
  <!-- Cute nostrils -->
  <circle cx="32" cy="36" r="1" fill="#6d28d9"/>
  <circle cx="38" cy="36" r="1" fill="#6d28d9"/>
  <!-- Smile -->
  <path d="M30 38 Q35 42 40 38" stroke="#6d28d9" stroke-width="1" fill="none"/>
  <!-- Short tail -->
  <path d="M48 55 Q56 52 54 48" stroke="#8b5cf6" stroke-width="4" fill="none" stroke-linecap="round" class="tail-wag"/>
  <!-- Tiny legs -->
  <ellipse cx="28" cy="62" rx="4" ry="3" fill="#7c3aed"/>
  <ellipse cx="42" cy="62" rx="4" ry="3" fill="#7c3aed"/>
</svg>`;
          }
        },

        /* --- Dragon : Junior --- */
        junior: {
          name: 'Junior',
          xpRequired: 80,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 85 90" class="breathe">
  <defs>
    <linearGradient id="drg-jrWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#6d28d9"/>
    </linearGradient>
    <radialGradient id="drg-jrBody" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="70%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#6d28d9"/>
    </radialGradient>
    <radialGradient id="drg-jrBelly" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#e9d5ff"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </radialGradient>
    <filter id="drg-glowPurpleJr">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Body -->
  <ellipse cx="42" cy="50" rx="16" ry="14" fill="url(#drg-jrBody)"/>
  <!-- Head -->
  <ellipse cx="42" cy="28" rx="15" ry="14" fill="url(#drg-jrBody)" filter="url(#drg-glowPurpleJr)"/>
  <!-- Belly -->
  <ellipse cx="42" cy="52" rx="10" ry="10" fill="url(#drg-jrBelly)" opacity="0.4"/>
  <!-- Small horns -->
  <path d="M30 16 L28 8 L33 17" fill="#7c3aed"/>
  <path d="M54 16 L56 8 L51 17" fill="#7c3aed"/>
  <!-- Bat wings (left) -->
  <g class="wing-flap">
    <path d="M26 38 L6 22 L10 34 L4 28 L12 38 L8 34 L18 42" fill="url(#drg-jrWing)" opacity="0.85"/>
    <path d="M24 38 L8 26" stroke="#4c1d95" stroke-width="0.5" opacity="0.3"/>
    <path d="M22 40 L10 32" stroke="#4c1d95" stroke-width="0.5" opacity="0.3"/>
  </g>
  <!-- Bat wings (right) -->
  <g class="wing-flap-right" style="transform-origin: 58px 38px;">
    <path d="M58 38 L78 22 L74 34 L80 28 L72 38 L76 34 L66 42" fill="url(#drg-jrWing)" opacity="0.85"/>
    <path d="M60 38 L76 26" stroke="#4c1d95" stroke-width="0.5" opacity="0.3"/>
    <path d="M62 40 L74 32" stroke="#4c1d95" stroke-width="0.5" opacity="0.3"/>
  </g>
  <!-- Determined eyes -->
  <g class="eye-blink">
    <ellipse cx="35" cy="26" rx="4.5" ry="4" fill="white"/>
    <ellipse cx="49" cy="26" rx="4.5" ry="4" fill="white"/>
    <circle cx="36" cy="25" r="2.5" fill="#1e1b4b"/>
    <circle cx="50" cy="25" r="2.5" fill="#1e1b4b"/>
    <circle cx="37" cy="24" r="1" fill="white"/>
    <circle cx="51" cy="24" r="1" fill="white"/>
  </g>
  <!-- Determined eyebrows -->
  <path d="M29 20 L37 22" stroke="#4c1d95" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M55 20 L47 22" stroke="#4c1d95" stroke-width="1.5" stroke-linecap="round"/>
  <!-- One fang -->
  <path d="M38 34 L39 38" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
  <!-- Nostrils -->
  <circle cx="39" cy="32" r="1" fill="#6d28d9"/>
  <circle cx="45" cy="32" r="1" fill="#6d28d9"/>
  <!-- Tail with flame -->
  <g class="tail-wag" style="transform-origin: 56px 55px;">
    <path d="M56 55 Q68 48 72 42 Q76 36 74 32" stroke="#8b5cf6" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g class="flame-flicker" style="transform-origin: 74px 30px;">
      <ellipse cx="74" cy="28" rx="4" ry="6" fill="#c084fc" opacity="0.7"/>
      <ellipse cx="74" cy="26" rx="2.5" ry="4" fill="#e9d5ff" opacity="0.5"/>
    </g>
  </g>
  <!-- Legs -->
  <path d="M32 62 L30 70 L34 70" fill="#7c3aed"/>
  <path d="M52 62 L54 70 L50 70" fill="#7c3aed"/>
</svg>`;
          }
        },

        /* --- Dragon : Adult --- */
        adult: {
          name: 'Adulte',
          xpRequired: 200,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 95 100" class="breathe">
  <defs>
    <linearGradient id="drg-adultBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#5b21b6"/>
    </linearGradient>
    <linearGradient id="drg-adultWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#4c1d95"/>
    </linearGradient>
    <filter id="drg-glowPurpleBig">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Big wings (left) -->
  <g class="wing-flap" style="transform-origin: 28px 30px;">
    <path d="M28 30 L2 6 L8 22 L0 12 L10 28 L4 18 L14 32 L6 24 L20 36" fill="url(#drg-adultWing)" opacity="0.9"/>
    <path d="M26 30 L5 10" stroke="#3b0764" stroke-width="0.6" opacity="0.3"/>
    <path d="M24 32 L7 18" stroke="#3b0764" stroke-width="0.6" opacity="0.3"/>
    <path d="M22 34 L9 24" stroke="#3b0764" stroke-width="0.6" opacity="0.3"/>
  </g>
  <!-- Big wings (right) -->
  <g class="wing-flap-right" style="transform-origin: 68px 30px;">
    <path d="M68 30 L92 6 L86 22 L94 12 L84 28 L90 18 L80 32 L88 24 L74 36" fill="url(#drg-adultWing)" opacity="0.9"/>
    <path d="M70 30 L89 10" stroke="#3b0764" stroke-width="0.6" opacity="0.3"/>
    <path d="M72 32 L87 18" stroke="#3b0764" stroke-width="0.6" opacity="0.3"/>
    <path d="M74 34 L85 24" stroke="#3b0764" stroke-width="0.6" opacity="0.3"/>
  </g>
  <!-- Muscular body -->
  <ellipse cx="48" cy="55" rx="18" ry="16" fill="url(#drg-adultBody)"/>
  <!-- Head -->
  <ellipse cx="48" cy="30" rx="14" ry="13" fill="url(#drg-adultBody)" filter="url(#drg-glowPurpleBig)"/>
  <!-- Belly -->
  <ellipse cx="48" cy="57" rx="11" ry="12" fill="#ddd6fe" opacity="0.15"/>
  <!-- Crown -->
  <path d="M36 18 L38 10 L42 16 L46 6 L50 16 L54 10 L56 18" fill="#fbbf24" opacity="0.8"/>
  <!-- Big horns -->
  <path d="M36 20 L30 6 L38 22" fill="#5b21b6"/>
  <path d="M60 20 L66 6 L58 22" fill="#5b21b6"/>
  <!-- Slit eyes -->
  <g class="eye-blink">
    <ellipse cx="41" cy="28" rx="4" ry="3.5" fill="#fde68a"/>
    <ellipse cx="55" cy="28" rx="4" ry="3.5" fill="#fde68a"/>
    <ellipse cx="41" cy="28" rx="1.2" ry="3.5" fill="#1e1b4b"/>
    <ellipse cx="55" cy="28" rx="1.2" ry="3.5" fill="#1e1b4b"/>
  </g>
  <!-- Fierce brows -->
  <path d="M35 23 L43 25" stroke="#3b0764" stroke-width="2" stroke-linecap="round"/>
  <path d="M61 23 L53 25" stroke="#3b0764" stroke-width="2" stroke-linecap="round"/>
  <!-- Two fangs -->
  <path d="M43 36 L44 40" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M53 36 L52 40" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Nostrils with smoke -->
  <circle cx="44" cy="34" r="1.2" fill="#3b0764"/>
  <circle cx="52" cy="34" r="1.2" fill="#3b0764"/>
  <g opacity="0.3" class="flame-flicker">
    <circle cx="42" cy="32" r="2" fill="#c084fc"/>
    <circle cx="54" cy="32" r="2" fill="#c084fc"/>
  </g>
  <!-- Powerful tail with big flame -->
  <g class="tail-wag" style="transform-origin: 64px 60px;">
    <path d="M64 60 Q78 50 82 40 Q86 30 84 22 Q88 16 86 12" stroke="#7c3aed" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g class="flame-flicker" style="transform-origin: 86px 10px;">
      <ellipse cx="86" cy="8" rx="6" ry="10" fill="#a855f7" opacity="0.7"/>
      <ellipse cx="86" cy="5" rx="4" ry="7" fill="#c084fc" opacity="0.6"/>
      <ellipse cx="86" cy="3" rx="2" ry="4" fill="#e9d5ff" opacity="0.5"/>
    </g>
  </g>
  <!-- Strong legs with claws -->
  <path d="M38 68 L34 78 L30 78 L34 78 L38 78" fill="#6d28d9"/>
  <path d="M58 68 L62 78 L66 78 L62 78 L58 78" fill="#6d28d9"/>
  <circle cx="31" cy="78" r="1" fill="#4c1d95"/>
  <circle cx="34" cy="79" r="1" fill="#4c1d95"/>
  <circle cx="37" cy="78" r="1" fill="#4c1d95"/>
  <circle cx="59" cy="78" r="1" fill="#4c1d95"/>
  <circle cx="62" cy="79" r="1" fill="#4c1d95"/>
  <circle cx="65" cy="78" r="1" fill="#4c1d95"/>
</svg>`;
          }
        }
      }
    },

    /* ==================== LOUP / RENARD MAGIQUE ==================== */
    fox: {
      name: 'Loup / Renard Magique',
      emoji: '\uD83E\uDD8A',
      theme: 'fire',
      glowColor: '#f97316',
      unlockRequirement: 0,
      unlockLabel: 'Disponible d\u00e8s le d\u00e9part',
      tagline: 'Esprit du feu incarn\u00e9, gardien des for\u00eats anciennes',
      stages: {

        /* --- Fox : Egg --- */
        egg: {
          name: '\u0152uf',
          xpRequired: 0,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 60 72" class="breathe">
  <defs>
    <radialGradient id="fox-eggFire" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </radialGradient>
    <radialGradient id="fox-eggFireGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
    </radialGradient>
    <filter id="fox-glowFire">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="30" cy="40" rx="22" ry="28" fill="url(#fox-eggFire)" filter="url(#fox-glowFire)"/>
  <ellipse cx="30" cy="36" rx="14" ry="16" fill="url(#fox-eggFireGlow)" class="egg-pulse"/>
  <ellipse cx="22" cy="28" rx="6" ry="10" fill="white" opacity="0.12" transform="rotate(-15,22,28)"/>
  <!-- Flame patterns -->
  <path d="M20 52 Q22 44 18 38 Q22 42 24 36 Q24 44 22 52" fill="#fbbf24" opacity="0.4"/>
  <path d="M36 54 Q38 46 34 40 Q38 44 40 38 Q40 46 38 54" fill="#fbbf24" opacity="0.35"/>
  <path d="M26 56 Q30 48 28 42 Q32 46 30 50" fill="#fde68a" opacity="0.3"/>
</svg>`;
          }
        },

        /* --- Fox : Baby --- */
        baby: {
          name: 'B\u00e9b\u00e9',
          xpRequired: 20,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 70 80" class="breathe">
  <defs>
    <radialGradient id="fox-babyBody" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="70%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </radialGradient>
    <radialGradient id="fox-babyBelly" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </radialGradient>
    <filter id="fox-glowFireBaby">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Round body (sitting chibi fox) -->
  <ellipse cx="35" cy="50" rx="16" ry="14" fill="url(#fox-babyBody)" filter="url(#fox-glowFireBaby)"/>
  <!-- White belly -->
  <ellipse cx="35" cy="53" rx="10" ry="9" fill="url(#fox-babyBelly)" opacity="0.5"/>
  <!-- Round head -->
  <circle cx="35" cy="32" r="15" fill="url(#fox-babyBody)"/>
  <!-- White muzzle -->
  <ellipse cx="35" cy="38" rx="8" ry="5" fill="#fef3c7" opacity="0.6"/>
  <!-- Huge pointy ears -->
  <path d="M20 26 L16 10 L28 24" fill="#f97316"/>
  <path d="M50 26 L54 10 L42 24" fill="#f97316"/>
  <path d="M22 24 L19 14 L27 23" fill="#fbbf24" opacity="0.6"/>
  <path d="M48 24 L51 14 L43 23" fill="#fbbf24" opacity="0.6"/>
  <!-- Big sparkling eyes -->
  <g class="eye-blink">
    <circle cx="28" cy="30" r="5" fill="white"/>
    <circle cx="42" cy="30" r="5" fill="white"/>
    <circle cx="29" cy="29" r="3" fill="#431407"/>
    <circle cx="43" cy="29" r="3" fill="#431407"/>
    <circle cx="30" cy="28" r="1.3" fill="white"/>
    <circle cx="44" cy="28" r="1.3" fill="white"/>
    <circle cx="27" cy="31" r="0.7" fill="white"/>
    <circle cx="41" cy="31" r="0.7" fill="white"/>
  </g>
  <!-- Tiny nose -->
  <ellipse cx="35" cy="35" rx="2.5" ry="2" fill="#431407"/>
  <!-- Tiny smile -->
  <path d="M32 37 Q35 40 38 37" stroke="#431407" stroke-width="0.8" fill="none"/>
  <!-- Tiny legs -->
  <ellipse cx="26" cy="62" rx="4" ry="2.5" fill="#ea580c"/>
  <ellipse cx="44" cy="62" rx="4" ry="2.5" fill="#ea580c"/>
  <!-- HUGE fluffy tail -->
  <g class="tail-wag" style="transform-origin: 50px 48px;">
    <path d="M50 48 Q62 38 60 28 Q64 32 62 40 Q66 34 62 44 Q58 50 52 50" fill="#f97316"/>
    <path d="M58 30 Q60 34 58 40" fill="#fbbf24" opacity="0.5"/>
  </g>
</svg>`;
          }
        },

        /* --- Fox : Junior --- */
        junior: {
          name: 'Junior',
          xpRequired: 80,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 90 85" class="breathe">
  <defs>
    <linearGradient id="fox-jrBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <filter id="fox-glowFireJr">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Sleek horizontal body on 4 legs -->
  <ellipse cx="45" cy="44" rx="22" ry="12" fill="url(#fox-jrBody)" filter="url(#fox-glowFireJr)"/>
  <!-- Head -->
  <ellipse cx="20" cy="32" rx="12" ry="11" fill="url(#fox-jrBody)"/>
  <!-- Pointed muzzle -->
  <path d="M14 34 L6 36 L14 38" fill="#ea580c"/>
  <ellipse cx="12" cy="36" rx="5" ry="3" fill="#fef3c7" opacity="0.4"/>
  <!-- Nose -->
  <circle cx="7" cy="36" r="2" fill="#431407"/>
  <!-- Sharp ears -->
  <path d="M14 24 L10 12 L20 22" fill="#f97316"/>
  <path d="M26 24 L30 12 L22 22" fill="#f97316"/>
  <path d="M16 22 L13 15 L19 21" fill="#fbbf24" opacity="0.5"/>
  <path d="M24 22 L27 15 L21 21" fill="#fbbf24" opacity="0.5"/>
  <!-- Confident eyes -->
  <g class="eye-blink">
    <ellipse cx="16" cy="30" rx="3.5" ry="3" fill="white"/>
    <ellipse cx="26" cy="30" rx="3.5" ry="3" fill="white"/>
    <circle cx="17" cy="29" r="2" fill="#431407"/>
    <circle cx="27" cy="29" r="2" fill="#431407"/>
    <circle cx="18" cy="28" r="0.8" fill="white"/>
    <circle cx="28" cy="28" r="0.8" fill="white"/>
  </g>
  <!-- Fangs -->
  <path d="M10 38 L10 41" stroke="white" stroke-width="1" stroke-linecap="round"/>
  <!-- Flame patterns on body -->
  <path d="M35 38 Q37 34 39 38 Q41 34 43 38" fill="#fde68a" opacity="0.3"/>
  <path d="M50 40 Q52 36 54 40" fill="#fde68a" opacity="0.25"/>
  <!-- 4 legs -->
  <path d="M30 54 L28 66 L32 66" fill="#ea580c"/>
  <path d="M38 54 L36 66 L40 66" fill="#ea580c"/>
  <path d="M52 54 L50 66 L54 66" fill="#ea580c"/>
  <path d="M60 54 L58 66 L62 66" fill="#ea580c"/>
  <!-- Bushy tail with fire -->
  <g class="tail-wag" style="transform-origin: 66px 42px;">
    <path d="M66 42 Q78 34 80 26 Q84 30 80 38 Q84 32 82 40 Q78 46 70 46" fill="#f97316"/>
    <g class="flame-flicker" style="transform-origin: 80px 24px;">
      <ellipse cx="80" cy="22" rx="4" ry="6" fill="#fbbf24" opacity="0.7"/>
      <ellipse cx="80" cy="20" rx="2.5" ry="4" fill="#fef3c7" opacity="0.5"/>
    </g>
  </g>
  <!-- Belly -->
  <ellipse cx="45" cy="48" rx="14" ry="6" fill="#fef3c7" opacity="0.15"/>
</svg>`;
          }
        },

        /* --- Fox : Adult (Kitsune) --- */
        adult: {
          name: 'Adulte',
          xpRequired: 200,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 95 100" class="breathe">
  <defs>
    <linearGradient id="fox-kitsuneBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="40%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <filter id="fox-glowFireBig">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="fox-flameAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Flame aura -->
  <ellipse cx="42" cy="50" rx="44" ry="38" fill="url(#fox-flameAura)" class="egg-pulse"/>
  <!-- Powerful body -->
  <ellipse cx="42" cy="52" rx="22" ry="14" fill="url(#fox-kitsuneBody)" filter="url(#fox-glowFireBig)"/>
  <!-- Flame mane -->
  <g class="flame-flicker">
    <path d="M24 36 Q20 28 24 24 Q26 30 28 26 Q28 32 32 28 Q30 34 26 36" fill="#fbbf24" opacity="0.7"/>
    <path d="M28 34 Q26 26 30 22 Q30 28 34 24 Q32 30 28 34" fill="#fde68a" opacity="0.5"/>
  </g>
  <!-- Head (wolf-like) -->
  <ellipse cx="22" cy="34" rx="13" ry="12" fill="url(#fox-kitsuneBody)"/>
  <!-- Muzzle -->
  <path d="M14 38 L4 40 L14 42" fill="#ea580c"/>
  <ellipse cx="12" cy="40" rx="6" ry="3.5" fill="#fef3c7" opacity="0.3"/>
  <!-- Nose -->
  <circle cx="5" cy="40" r="2.5" fill="#431407"/>
  <!-- Noble fierce eyes -->
  <g class="eye-blink">
    <ellipse cx="17" cy="32" rx="4" ry="3" fill="#fef3c7"/>
    <ellipse cx="29" cy="32" rx="4" ry="3" fill="#fef3c7"/>
    <ellipse cx="17" cy="32" rx="1.5" ry="3" fill="#7c2d12"/>
    <ellipse cx="29" cy="32" rx="1.5" ry="3" fill="#7c2d12"/>
  </g>
  <!-- Ears -->
  <path d="M12 24 L6 10 L18 22" fill="#f97316"/>
  <path d="M30 24 L36 10 L24 22" fill="#f97316"/>
  <path d="M14 22 L9 13 L17 21" fill="#fbbf24" opacity="0.5"/>
  <path d="M28 22 L33 13 L25 21" fill="#fbbf24" opacity="0.5"/>
  <!-- 3 fire tails -->
  <g class="tail-wag" style="transform-origin: 64px 48px;">
    <!-- Tail 1 -->
    <path d="M64 46 Q78 34 82 24 Q86 18 84 12" stroke="#f97316" stroke-width="4" fill="none" stroke-linecap="round"/>
    <g class="flame-flicker" style="transform-origin: 84px 10px;">
      <ellipse cx="84" cy="8" rx="5" ry="8" fill="#fbbf24" opacity="0.7"/>
      <ellipse cx="84" cy="5" rx="3" ry="5" fill="#fef3c7" opacity="0.5"/>
    </g>
    <!-- Tail 2 -->
    <path d="M64 50 Q80 44 86 36 Q90 30 88 24" stroke="#ea580c" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <g class="flame-flicker" style="transform-origin: 88px 22px;">
      <ellipse cx="88" cy="20" rx="4" ry="7" fill="#fbbf24" opacity="0.6"/>
      <ellipse cx="88" cy="18" rx="2.5" ry="4" fill="#fef3c7" opacity="0.4"/>
    </g>
    <!-- Tail 3 -->
    <path d="M64 54 Q76 56 82 50 Q88 44 86 38" stroke="#dc2626" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g class="flame-flicker" style="transform-origin: 86px 36px;">
      <ellipse cx="86" cy="34" rx="4" ry="6" fill="#f97316" opacity="0.6"/>
      <ellipse cx="86" cy="32" rx="2.5" ry="4" fill="#fbbf24" opacity="0.4"/>
    </g>
  </g>
  <!-- Powerful legs -->
  <path d="M28 64 L24 76 L20 76 L24 76 L28 76" fill="#c2410c"/>
  <path d="M36 64 L32 76 L28 76 L32 76 L36 76" fill="#c2410c"/>
  <path d="M50 64 L54 76 L58 76 L54 76 L50 76" fill="#c2410c"/>
  <path d="M58 64 L62 76 L66 76 L62 76 L58 76" fill="#c2410c"/>
  <!-- Belly -->
  <ellipse cx="42" cy="56" rx="14" ry="7" fill="#fef3c7" opacity="0.12"/>
</svg>`;
          }
        }
      }
    },

    /* ==================== TORTUE CRISTAL ==================== */
    turtle: {
      name: 'Tortue Cristal',
      emoji: '\uD83D\uDC22',
      theme: 'ice',
      glowColor: '#38bdf8',
      unlockRequirement: 14,
      unlockLabel: 'Se d\u00e9bloque apr\u00e8s 14 jours cons\u00e9cutifs',
      tagline: 'Ancienne gardienne des glaciers, porteuse de sagesse cristalline',
      stages: {

        /* --- Turtle : Egg --- */
        egg: {
          name: '\u0152uf',
          xpRequired: 0,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 60 72" class="breathe">
  <defs>
    <radialGradient id="trt-eggIce" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#7dd3fc"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>
    <radialGradient id="trt-eggIceGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e0f2fe" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
    </radialGradient>
    <filter id="trt-glowIce">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="30" cy="40" rx="22" ry="28" fill="url(#trt-eggIce)" filter="url(#trt-glowIce)"/>
  <ellipse cx="30" cy="36" rx="14" ry="16" fill="url(#trt-eggIceGlow)" class="egg-pulse"/>
  <ellipse cx="22" cy="28" rx="6" ry="10" fill="white" opacity="0.15" transform="rotate(-15,22,28)"/>
  <!-- Snowflakes -->
  <g transform="translate(24,30)" opacity="0.5">
    <line x1="0" y1="-5" x2="0" y2="5" stroke="#e0f2fe" stroke-width="0.8"/>
    <line x1="-4.3" y1="-2.5" x2="4.3" y2="2.5" stroke="#e0f2fe" stroke-width="0.8"/>
    <line x1="-4.3" y1="2.5" x2="4.3" y2="-2.5" stroke="#e0f2fe" stroke-width="0.8"/>
  </g>
  <g transform="translate(38,42)" opacity="0.4">
    <line x1="0" y1="-4" x2="0" y2="4" stroke="#e0f2fe" stroke-width="0.7"/>
    <line x1="-3.5" y1="-2" x2="3.5" y2="2" stroke="#e0f2fe" stroke-width="0.7"/>
    <line x1="-3.5" y1="2" x2="3.5" y2="-2" stroke="#e0f2fe" stroke-width="0.7"/>
  </g>
  <!-- Frost lines -->
  <path d="M18 48 L22 44 L20 40" stroke="#bae6fd" stroke-width="0.6" fill="none" opacity="0.4"/>
  <path d="M38 50 L40 46 L36 42" stroke="#bae6fd" stroke-width="0.6" fill="none" opacity="0.35"/>
</svg>`;
          }
        },

        /* --- Turtle : Baby --- */
        baby: {
          name: 'B\u00e9b\u00e9',
          xpRequired: 20,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 70 75" class="breathe">
  <defs>
    <radialGradient id="trt-babyShell" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#7dd3fc"/>
      <stop offset="60%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>
    <radialGradient id="trt-babyBody" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#67e8f9"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </radialGradient>
    <filter id="trt-glowIceBaby">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Round dome shell -->
  <ellipse cx="35" cy="42" rx="22" ry="16" fill="url(#trt-babyShell)" filter="url(#trt-glowIceBaby)"/>
  <ellipse cx="35" cy="38" rx="18" ry="14" fill="url(#trt-babyShell)"/>
  <ellipse cx="32" cy="34" rx="10" ry="8" fill="white" opacity="0.1"/>
  <!-- Simple shell pattern -->
  <ellipse cx="35" cy="38" rx="8" ry="6" fill="none" stroke="#0369a1" stroke-width="0.8" opacity="0.4"/>
  <!-- Head poking out -->
  <circle cx="14" cy="42" r="9" fill="url(#trt-babyBody)"/>
  <!-- Big innocent eyes -->
  <g class="eye-blink">
    <circle cx="10" cy="40" r="4" fill="white"/>
    <circle cx="18" cy="40" r="3.5" fill="white"/>
    <circle cx="11" cy="39" r="2.5" fill="#164e63"/>
    <circle cx="19" cy="39" r="2" fill="#164e63"/>
    <circle cx="12" cy="38" r="1" fill="white"/>
    <circle cx="20" cy="38" r="0.8" fill="white"/>
  </g>
  <!-- Tiny smile -->
  <path d="M10 45 Q14 48 18 45" stroke="#0e7490" stroke-width="0.8" fill="none"/>
  <!-- 4 stubby legs -->
  <ellipse cx="22" cy="55" rx="5" ry="3" fill="url(#trt-babyBody)" opacity="0.8"/>
  <ellipse cx="48" cy="55" rx="5" ry="3" fill="url(#trt-babyBody)" opacity="0.8"/>
  <ellipse cx="28" cy="56" rx="4" ry="2.5" fill="url(#trt-babyBody)" opacity="0.6"/>
  <ellipse cx="42" cy="56" rx="4" ry="2.5" fill="url(#trt-babyBody)" opacity="0.6"/>
  <!-- Tiny tail -->
  <ellipse cx="56" cy="44" rx="3" ry="2" fill="url(#trt-babyBody)" opacity="0.7"/>
</svg>`;
          }
        },

        /* --- Turtle : Junior --- */
        junior: {
          name: 'Junior',
          xpRequired: 80,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 85 85" class="breathe">
  <defs>
    <linearGradient id="trt-jrShell" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7dd3fc"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="trt-crystal1" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a78bfa"/>
      <stop offset="100%" stop-color="#e9d5ff"/>
    </linearGradient>
    <linearGradient id="trt-crystal2" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
    <radialGradient id="trt-jrBody" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#67e8f9"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </radialGradient>
    <filter id="trt-glowIceJr">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Bigger dome shell -->
  <ellipse cx="42" cy="48" rx="26" ry="18" fill="url(#trt-jrShell)" filter="url(#trt-glowIceJr)"/>
  <ellipse cx="42" cy="44" rx="22" ry="16" fill="url(#trt-jrShell)"/>
  <ellipse cx="38" cy="40" rx="12" ry="9" fill="white" opacity="0.08"/>
  <!-- Shell pattern -->
  <path d="M35 36 L42 34 L48 38 L46 44 L38 46 L34 42 Z" fill="none" stroke="#0369a1" stroke-width="0.8" opacity="0.4"/>
  <path d="M28 42 L34 40 L36 46 L30 48 Z" fill="none" stroke="#0369a1" stroke-width="0.6" opacity="0.3"/>
  <path d="M48 40 L54 42 L52 48 L46 46 Z" fill="none" stroke="#0369a1" stroke-width="0.6" opacity="0.3"/>
  <!-- Crystal formations -->
  <g class="crystal-float">
    <polygon points="38,28 40,18 42,28" fill="url(#trt-crystal1)" opacity="0.8"/>
    <polygon points="39,28 40,20 41,28" fill="white" opacity="0.2"/>
  </g>
  <g class="crystal-float" style="animation-delay: 0.5s;">
    <polygon points="46,30 49,22 52,30" fill="url(#trt-crystal2)" opacity="0.7"/>
    <polygon points="47.5,30 49,24 50.5,30" fill="white" opacity="0.2"/>
  </g>
  <g class="crystal-float" style="animation-delay: 1s;">
    <polygon points="32,32 34,26 36,32" fill="url(#trt-crystal1)" opacity="0.6"/>
  </g>
  <!-- Head with crystal horn -->
  <ellipse cx="14" cy="44" rx="11" ry="10" fill="url(#trt-jrBody)"/>
  <polygon points="12,34 14,24 16,34" fill="url(#trt-crystal2)" opacity="0.8"/>
  <!-- Wise eyes -->
  <g class="eye-blink">
    <ellipse cx="9" cy="42" rx="4" ry="3.5" fill="white"/>
    <ellipse cx="19" cy="42" rx="3.5" ry="3" fill="white"/>
    <circle cx="10" cy="41" r="2.5" fill="#164e63"/>
    <circle cx="20" cy="41" r="2" fill="#164e63"/>
    <circle cx="11" cy="40" r="1" fill="white"/>
    <circle cx="21" cy="40" r="0.8" fill="white"/>
  </g>
  <!-- Wise eyebrows -->
  <path d="M5 38 L11 39" stroke="#0e7490" stroke-width="0.8" stroke-linecap="round" opacity="0.5"/>
  <path d="M23 38 L17 39" stroke="#0e7490" stroke-width="0.8" stroke-linecap="round" opacity="0.5"/>
  <!-- Calm mouth -->
  <path d="M10 48 Q14 50 18 48" stroke="#0e7490" stroke-width="0.8" fill="none"/>
  <!-- Visible legs -->
  <ellipse cx="22" cy="62" rx="6" ry="4" fill="url(#trt-jrBody)"/>
  <ellipse cx="58" cy="62" rx="6" ry="4" fill="url(#trt-jrBody)"/>
  <ellipse cx="32" cy="64" rx="5" ry="3" fill="url(#trt-jrBody)" opacity="0.8"/>
  <ellipse cx="52" cy="64" rx="5" ry="3" fill="url(#trt-jrBody)" opacity="0.8"/>
  <!-- Tail -->
  <ellipse cx="68" cy="50" rx="4" ry="3" fill="url(#trt-jrBody)" opacity="0.7"/>
</svg>`;
          }
        },

        /* --- Turtle : Adult --- */
        adult: {
          name: 'Adulte',
          xpRequired: 200,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 95 100" class="breathe">
  <defs>
    <linearGradient id="trt-adultShell" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7dd3fc"/>
      <stop offset="50%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
    <linearGradient id="trt-crystalTall" x1="0%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stop-color="#818cf8"/>
      <stop offset="50%" stop-color="#c4b5fd"/>
      <stop offset="100%" stop-color="#ede9fe"/>
    </linearGradient>
    <linearGradient id="trt-crystalBlue" x1="0%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="trt-crystalPink" x1="0%" y1="100%" x2="50%" y2="0%">
      <stop offset="0%" stop-color="#c026d3"/>
      <stop offset="50%" stop-color="#e879f9"/>
      <stop offset="100%" stop-color="#fae8ff"/>
    </linearGradient>
    <radialGradient id="trt-adultBody" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#67e8f9"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </radialGradient>
    <filter id="trt-glowIceBig">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Majestic dome shell -->
  <ellipse cx="50" cy="60" rx="30" ry="20" fill="url(#trt-adultShell)" filter="url(#trt-glowIceBig)"/>
  <ellipse cx="50" cy="55" rx="26" ry="18" fill="url(#trt-adultShell)"/>
  <!-- Shell patterns -->
  <path d="M40 48 L50 45 L58 50 L55 58 L44 60 L38 54 Z" fill="none" stroke="#075985" stroke-width="1" opacity="0.4"/>
  <path d="M30 54 L38 52 L40 58 L34 62 L28 58 Z" fill="none" stroke="#075985" stroke-width="0.8" opacity="0.3"/>
  <path d="M58 52 L66 54 L64 60 L56 60 Z" fill="none" stroke="#075985" stroke-width="0.8" opacity="0.3"/>
  <path d="M44 44 L48 40 L54 42 L52 48 L46 48 Z" fill="none" stroke="#075985" stroke-width="0.6" opacity="0.25"/>
  <!-- Crystal spires -->
  <g class="crystal-float">
    <polygon points="46,38 50,12 54,38" fill="url(#trt-crystalTall)" opacity="0.85"/>
    <polygon points="48,38 50,16 52,38" fill="white" opacity="0.15"/>
  </g>
  <g class="crystal-float" style="animation-delay: 0.4s;">
    <polygon points="58,40 62,20 66,40" fill="url(#trt-crystalBlue)" opacity="0.8"/>
    <polygon points="60,40 62,24 64,40" fill="white" opacity="0.12"/>
  </g>
  <g class="crystal-float" style="animation-delay: 0.8s;">
    <polygon points="34,42 37,24 40,42" fill="url(#trt-crystalPink)" opacity="0.75"/>
    <polygon points="36,42 37,28 38,42" fill="white" opacity="0.12"/>
  </g>
  <g class="crystal-float" style="animation-delay: 1.2s;">
    <polygon points="52,36 54,22 56,36" fill="url(#trt-crystalTall)" opacity="0.6"/>
  </g>
  <g class="crystal-float" style="animation-delay: 0.6s;">
    <polygon points="40,40 42,30 44,40" fill="url(#trt-crystalBlue)" opacity="0.65"/>
  </g>
  <!-- Head -->
  <ellipse cx="16" cy="56" rx="13" ry="11" fill="url(#trt-adultBody)"/>
  <!-- Ice crown -->
  <polygon points="10,46 12,38 14,46" fill="url(#trt-crystalBlue)" opacity="0.7"/>
  <polygon points="16,44 18,36 20,44" fill="url(#trt-crystalTall)" opacity="0.6"/>
  <!-- Glowing wise eyes -->
  <g class="eye-blink">
    <ellipse cx="10" cy="54" rx="4.5" ry="3.5" fill="#e0f2fe"/>
    <ellipse cx="22" cy="54" rx="4" ry="3" fill="#e0f2fe"/>
    <circle cx="10" cy="54" r="2" fill="#0c4a6e"/>
    <circle cx="22" cy="54" r="1.8" fill="#0c4a6e"/>
    <circle cx="10" cy="54" r="4.5" fill="#7dd3fc" opacity="0.15"/>
    <circle cx="22" cy="54" r="4" fill="#7dd3fc" opacity="0.15"/>
  </g>
  <!-- Wise expression -->
  <path d="M5 50 L12 52" stroke="#0e7490" stroke-width="0.8" stroke-linecap="round" opacity="0.4"/>
  <path d="M27 50 L20 52" stroke="#0e7490" stroke-width="0.8" stroke-linecap="round" opacity="0.4"/>
  <path d="M10 60 Q16 62 22 60" stroke="#0e7490" stroke-width="0.8" fill="none"/>
  <!-- Sturdy legs -->
  <ellipse cx="26" cy="76" rx="7" ry="5" fill="#06b6d4"/>
  <ellipse cx="68" cy="76" rx="7" ry="5" fill="#06b6d4"/>
  <ellipse cx="38" cy="78" rx="6" ry="4" fill="#06b6d4" opacity="0.8"/>
  <ellipse cx="60" cy="78" rx="6" ry="4" fill="#06b6d4" opacity="0.8"/>
  <!-- Floating snowflakes -->
  <g class="crystal-float" style="animation-delay: 0.3s;" opacity="0.5">
    <line x1="74" y1="38" x2="74" y2="44" stroke="#e0f2fe" stroke-width="0.6"/>
    <line x1="71" y1="41" x2="77" y2="41" stroke="#e0f2fe" stroke-width="0.6"/>
  </g>
  <g class="crystal-float" style="animation-delay: 1.5s;" opacity="0.4">
    <line x1="28" y1="30" x2="28" y2="35" stroke="#e0f2fe" stroke-width="0.5"/>
    <line x1="25.5" y1="32.5" x2="30.5" y2="32.5" stroke="#e0f2fe" stroke-width="0.5"/>
  </g>
  <g class="crystal-float" style="animation-delay: 2s;" opacity="0.35">
    <line x1="70" y1="50" x2="70" y2="54" stroke="#e0f2fe" stroke-width="0.5"/>
    <line x1="68" y1="52" x2="72" y2="52" stroke="#e0f2fe" stroke-width="0.5"/>
  </g>
  <!-- Tail -->
  <ellipse cx="80" cy="62" rx="5" ry="3.5" fill="#06b6d4" opacity="0.7"/>
</svg>`;
          }
        }
      }
    },

    /* ==================== GRIFFON DORE ==================== */
    griffon: {
      name: 'Griffon Dor\u00e9',
      emoji: '\uD83E\uDD85',
      theme: 'gold',
      glowColor: '#fbbf24',
      unlockRequirement: 30,
      unlockLabel: 'Se d\u00e9bloque apr\u00e8s 30 jours cons\u00e9cutifs',
      tagline: 'Roi des cieux et des terres, symbole de noblesse et de courage',
      stages: {

        /* --- Griffon : Egg --- */
        egg: {
          name: '\u0152uf',
          xpRequired: 0,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 60 72" class="breathe">
  <defs>
    <radialGradient id="grf-eggGold" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#b45309"/>
    </radialGradient>
    <radialGradient id="grf-eggGoldGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fefce8" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
    </radialGradient>
    <filter id="grf-glowGold">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="30" cy="40" rx="22" ry="28" fill="url(#grf-eggGold)" filter="url(#grf-glowGold)"/>
  <ellipse cx="30" cy="36" rx="14" ry="16" fill="url(#grf-eggGoldGlow)" class="egg-pulse"/>
  <ellipse cx="22" cy="28" rx="6" ry="10" fill="white" opacity="0.15" transform="rotate(-15,22,28)"/>
  <!-- Feather patterns -->
  <path d="M22 28 Q26 32 22 36 Q24 32 22 28" fill="#b45309" opacity="0.3"/>
  <path d="M36 32 Q40 36 36 40 Q38 36 36 32" fill="#b45309" opacity="0.25"/>
  <path d="M28 44 Q32 48 28 52 Q30 48 28 44" fill="#b45309" opacity="0.2"/>
  <!-- Paw print -->
  <circle cx="38" cy="48" r="2" fill="#92400e" opacity="0.2"/>
  <circle cx="36" cy="45" r="1" fill="#92400e" opacity="0.15"/>
  <circle cx="40" cy="45" r="1" fill="#92400e" opacity="0.15"/>
  <circle cx="42" cy="47" r="1" fill="#92400e" opacity="0.15"/>
</svg>`;
          }
        },

        /* --- Griffon : Baby --- */
        baby: {
          name: 'B\u00e9b\u00e9',
          xpRequired: 20,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 70 80" class="breathe">
  <defs>
    <radialGradient id="grf-babyBody" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="60%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </radialGradient>
    <filter id="grf-glowGoldBaby">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Fluffy round body -->
  <circle cx="35" cy="46" r="18" fill="url(#grf-babyBody)" filter="url(#grf-glowGoldBaby)"/>
  <!-- Fluffy texture -->
  <circle cx="20" cy="40" r="5" fill="#fbbf24" opacity="0.5"/>
  <circle cx="50" cy="40" r="5" fill="#fbbf24" opacity="0.5"/>
  <circle cx="22" cy="52" r="4" fill="#fbbf24" opacity="0.4"/>
  <circle cx="48" cy="52" r="4" fill="#fbbf24" opacity="0.4"/>
  <circle cx="28" cy="30" r="4" fill="#fbbf24" opacity="0.4"/>
  <circle cx="42" cy="30" r="4" fill="#fbbf24" opacity="0.4"/>
  <!-- Head -->
  <circle cx="35" cy="30" r="14" fill="url(#grf-babyBody)"/>
  <!-- Head fluff -->
  <circle cx="24" cy="24" r="4" fill="#fde68a" opacity="0.5"/>
  <circle cx="46" cy="24" r="4" fill="#fde68a" opacity="0.5"/>
  <circle cx="35" cy="18" r="4" fill="#fde68a" opacity="0.4"/>
  <!-- Small beak -->
  <path d="M32 34 L35 38 L38 34" fill="#f59e0b"/>
  <path d="M33 34 L35 37 L37 34" fill="#d97706"/>
  <!-- Big innocent eyes -->
  <g class="eye-blink">
    <circle cx="28" cy="28" r="5" fill="white"/>
    <circle cx="42" cy="28" r="5" fill="white"/>
    <circle cx="29" cy="27" r="3" fill="#451a03"/>
    <circle cx="43" cy="27" r="3" fill="#451a03"/>
    <circle cx="30" cy="26" r="1.3" fill="white"/>
    <circle cx="44" cy="26" r="1.3" fill="white"/>
  </g>
  <!-- Tiny lion paws -->
  <ellipse cx="26" cy="62" rx="5" ry="3" fill="#d97706"/>
  <ellipse cx="44" cy="62" rx="5" ry="3" fill="#d97706"/>
  <!-- Tiny wing nubs -->
  <ellipse cx="18" cy="42" rx="5" ry="4" fill="#fbbf24" opacity="0.6" transform="rotate(-15,18,42)"/>
  <ellipse cx="52" cy="42" rx="5" ry="4" fill="#fbbf24" opacity="0.6" transform="rotate(15,52,42)"/>
  <!-- Tiny tail tuft -->
  <g class="tail-wag" style="transform-origin: 50px 50px;">
    <circle cx="54" cy="50" r="4" fill="#fbbf24"/>
    <circle cx="56" cy="48" r="2.5" fill="#fde68a" opacity="0.6"/>
  </g>
</svg>`;
          }
        },

        /* --- Griffon : Junior --- */
        junior: {
          name: 'Junior',
          xpRequired: 80,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 85 90" class="breathe">
  <defs>
    <linearGradient id="grf-jrBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="grf-jrWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <filter id="grf-glowGoldJr">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Lion back body -->
  <ellipse cx="48" cy="52" rx="18" ry="13" fill="url(#grf-jrBody)" filter="url(#grf-glowGoldJr)"/>
  <!-- Front chest -->
  <ellipse cx="32" cy="44" rx="14" ry="14" fill="url(#grf-jrBody)"/>
  <!-- Eagle head -->
  <ellipse cx="30" cy="26" rx="12" ry="10" fill="url(#grf-jrBody)"/>
  <!-- Forming beak -->
  <path d="M20 28 L15 30 L20 32" fill="#b45309"/>
  <path d="M20 29 L17 30 L20 31" fill="#92400e"/>
  <!-- Golden feathers -->
  <path d="M24 18 Q22 14 26 16" fill="#fde68a" opacity="0.6"/>
  <path d="M28 16 Q26 12 30 14" fill="#fde68a" opacity="0.5"/>
  <path d="M34 18 Q36 14 32 16" fill="#fde68a" opacity="0.6"/>
  <!-- Eyes -->
  <g class="eye-blink">
    <ellipse cx="25" cy="24" rx="3.5" ry="3" fill="white"/>
    <ellipse cx="35" cy="24" rx="3.5" ry="3" fill="white"/>
    <circle cx="26" cy="23" r="2" fill="#451a03"/>
    <circle cx="36" cy="23" r="2" fill="#451a03"/>
    <circle cx="27" cy="22" r="0.8" fill="white"/>
    <circle cx="37" cy="22" r="0.8" fill="white"/>
  </g>
  <!-- Small wings -->
  <g class="wing-flap" style="transform-origin: 34px 38px;">
    <path d="M34 38 L18 24 L22 32 L16 28 L26 36" fill="url(#grf-jrWing)" opacity="0.8"/>
    <path d="M32 38 L20 28" stroke="#92400e" stroke-width="0.5" opacity="0.3"/>
  </g>
  <g class="wing-flap-right" style="transform-origin: 40px 38px;">
    <path d="M40 38 L56 24 L52 32 L58 28 L48 36" fill="url(#grf-jrWing)" opacity="0.8"/>
    <path d="M42 38 L54 28" stroke="#92400e" stroke-width="0.5" opacity="0.3"/>
  </g>
  <!-- Front talons -->
  <path d="M24 56 L22 66 L20 64 L22 66 L24 64 L22 66 L26 66" fill="#b45309"/>
  <path d="M36 56 L34 66 L32 64 L34 66 L36 64 L34 66 L38 66" fill="#b45309"/>
  <!-- Back lion paws -->
  <path d="M52 62 L50 70 L54 70" fill="#d97706"/>
  <path d="M62 62 L60 70 L64 70" fill="#d97706"/>
  <!-- Golden fur -->
  <ellipse cx="48" cy="56" rx="12" ry="8" fill="#fde68a" opacity="0.12"/>
  <!-- Tail tuft -->
  <g class="tail-wag" style="transform-origin: 64px 50px;">
    <path d="M64 50 Q72 46 74 40" stroke="#b45309" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="74" cy="38" r="4" fill="#fbbf24"/>
    <circle cx="74" cy="36" r="2.5" fill="#fde68a" opacity="0.5"/>
  </g>
</svg>`;
          }
        },

        /* --- Griffon : Adult --- */
        adult: {
          name: 'Adulte',
          xpRequired: 200,
          svg: function (size) {
            size = size || 60;
            return `<svg width="${size}" height="${size}" viewBox="0 0 95 100" class="breathe">
  <defs>
    <linearGradient id="grf-adultBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="40%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="grf-adultWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fefce8"/>
      <stop offset="30%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <radialGradient id="grf-haloGold" cx="50%" cy="50%" r="50%">
      <stop offset="60%" stop-color="#fbbf24" stop-opacity="0"/>
      <stop offset="80%" stop-color="#fbbf24" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
    </radialGradient>
    <filter id="grf-glowGoldBig">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Golden halo -->
  <circle cx="34" cy="22" r="16" fill="url(#grf-haloGold)" class="shimmer"/>
  <!-- Large wings (left) -->
  <g class="wing-flap" style="transform-origin: 30px 34px;">
    <path d="M30 34 L4 10 L10 22 L2 14 L12 26 L6 20 L16 30 L8 24 L22 34" fill="url(#grf-adultWing)" opacity="0.9"/>
    <path d="M28 34 L6 14" stroke="#78350f" stroke-width="0.5" opacity="0.25"/>
    <path d="M26 34 L8 20" stroke="#78350f" stroke-width="0.5" opacity="0.25"/>
    <path d="M24 34 L12 26" stroke="#78350f" stroke-width="0.5" opacity="0.25"/>
    <path d="M4 10 L2 8" stroke="#fde68a" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
    <path d="M2 14 L0 12" stroke="#fde68a" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
  </g>
  <!-- Large wings (right) -->
  <g class="wing-flap-right" style="transform-origin: 42px 34px;">
    <path d="M42 34 L68 10 L62 22 L70 14 L60 26 L66 20 L56 30 L64 24 L50 34" fill="url(#grf-adultWing)" opacity="0.9"/>
    <path d="M44 34 L66 14" stroke="#78350f" stroke-width="0.5" opacity="0.25"/>
    <path d="M46 34 L64 20" stroke="#78350f" stroke-width="0.5" opacity="0.25"/>
    <path d="M48 34 L60 26" stroke="#78350f" stroke-width="0.5" opacity="0.25"/>
    <path d="M68 10 L70 8" stroke="#fde68a" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
    <path d="M70 14 L72 12" stroke="#fde68a" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
  </g>
  <!-- Lion body -->
  <ellipse cx="52" cy="58" rx="20" ry="14" fill="url(#grf-adultBody)"/>
  <!-- Front chest -->
  <ellipse cx="34" cy="48" rx="16" ry="16" fill="url(#grf-adultBody)" filter="url(#grf-glowGoldBig)"/>
  <!-- Belly fur -->
  <ellipse cx="52" cy="62" rx="13" ry="8" fill="#fde68a" opacity="0.12"/>
  <!-- Sharp eagle head -->
  <ellipse cx="34" cy="24" rx="13" ry="11" fill="url(#grf-adultBody)"/>
  <!-- Crown -->
  <path d="M24 14 L26 6 L30 12 L34 4 L38 12 L42 6 L44 14" fill="#fbbf24" opacity="0.8"/>
  <circle cx="34" cy="8" r="2" fill="#fef3c7" class="shimmer"/>
  <!-- Hooked beak -->
  <path d="M22 26 L14 28 L18 32 L22 30" fill="#b45309"/>
  <path d="M22 27 L16 29 L19 31 L22 29" fill="#92400e"/>
  <!-- Piercing eyes -->
  <g class="eye-blink">
    <ellipse cx="28" cy="22" rx="4" ry="3.5" fill="#fef3c7"/>
    <ellipse cx="40" cy="22" rx="4" ry="3.5" fill="#fef3c7"/>
    <ellipse cx="28" cy="22" rx="1.5" ry="3.5" fill="#451a03"/>
    <ellipse cx="40" cy="22" rx="1.5" ry="3.5" fill="#451a03"/>
    <circle cx="28" cy="22" r="4" fill="#fbbf24" opacity="0.1"/>
    <circle cx="40" cy="22" r="4" fill="#fbbf24" opacity="0.1"/>
  </g>
  <!-- Fierce brows -->
  <path d="M22 18 L30 20" stroke="#78350f" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M46 18 L38 20" stroke="#78350f" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Feather crest -->
  <path d="M26 16 Q24 12 28 14" fill="#fde68a" opacity="0.5"/>
  <path d="M30 14 Q28 10 32 12" fill="#fde68a" opacity="0.4"/>
  <path d="M38 14 Q40 10 36 12" fill="#fde68a" opacity="0.4"/>
  <path d="M42 16 Q44 12 40 14" fill="#fde68a" opacity="0.5"/>
  <!-- Front talons -->
  <path d="M26 62 L22 74 L20 72 L22 74 L24 72 L22 74 L26 74" fill="#b45309"/>
  <path d="M38 62 L34 74 L32 72 L34 74 L36 72 L34 74 L38 74" fill="#b45309"/>
  <!-- Back lion paws -->
  <path d="M56 68 L54 78 L50 78 L54 78 L58 78" fill="#d97706"/>
  <path d="M66 68 L64 78 L60 78 L64 78 L68 78" fill="#d97706"/>
  <!-- Flowing tail -->
  <g class="tail-wag" style="transform-origin: 70px 56px;">
    <path d="M70 56 Q82 48 84 38 Q88 32 86 26" stroke="#b45309" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="86" cy="24" r="5" fill="#fbbf24"/>
    <circle cx="86" cy="22" r="3.5" fill="#fde68a" opacity="0.5"/>
    <circle cx="84" cy="20" r="2.5" fill="#fefce8" opacity="0.3"/>
  </g>
</svg>`;
          }
        }
      }
    }
  },

  /* ------------------------------------------------------------------ */
  /*  Stage ordering                                                     */
  /* ------------------------------------------------------------------ */
  stageOrder: ['egg', 'baby', 'junior', 'adult'],

  /* ------------------------------------------------------------------ */
  /*  XP computation from a daily entry                                  */
  /* ------------------------------------------------------------------ */
  computeDailyXp: function (entry, streak) {
    var xp = 0;
    var habits = ['drank1L', 'medsMorning', 'medsNoon', 'medsEvening', 'mealBreakfast', 'mealLunch', 'mealDinner'];
    var checkedCount = 0;
    habits.forEach(function (h) {
      if (entry[h]) { xp += 1; checkedCount++; }
    });
    if (checkedCount === 7) xp += 3; // perfect day bonus
    if (entry.mood != null) xp += 1;
    if (entry.sleepQuality) xp += 1;
    if (entry.notes && entry.notes.length > 10) xp += 1;
    if (streak >= 7) xp += 2;
    else if (streak >= 3) xp += 1;
    return xp;
  },

  /* ------------------------------------------------------------------ */
  /*  Get the current stage for a given XP total                         */
  /* ------------------------------------------------------------------ */
  getStageForXp: function (xp, collection) {
    var stages = this.stageOrder;
    var coll = this.collections[collection];
    if (!coll) return 'egg';
    var current = 'egg';
    for (var i = 0; i < stages.length; i++) {
      if (xp >= coll.stages[stages[i]].xpRequired) current = stages[i];
    }
    return current;
  },

  /* ------------------------------------------------------------------ */
  /*  Get the next stage after the current one (or null if adult)        */
  /* ------------------------------------------------------------------ */
  getNextStage: function (currentStage) {
    var idx = this.stageOrder.indexOf(currentStage);
    if (idx < 0 || idx >= this.stageOrder.length - 1) return null;
    return this.stageOrder[idx + 1];
  },

  /* ------------------------------------------------------------------ */
  /*  Get XP remaining to next stage + progress ratio                    */
  /* ------------------------------------------------------------------ */
  getXpToNextStage: function (xp, collection) {
    var current = this.getStageForXp(xp, collection);
    var next = this.getNextStage(current);
    if (!next) return { needed: 0, progress: 1 };
    var coll = this.collections[collection];
    var currentReq = coll.stages[current].xpRequired;
    var nextReq = coll.stages[next].xpRequired;
    return {
      needed: nextReq - xp,
      progress: (xp - currentReq) / (nextReq - currentReq)
    };
  }
};
