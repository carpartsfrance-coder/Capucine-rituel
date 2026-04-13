/* creature.js — Creature system engine for Capucine Rituel */
(function() {
  'use strict';

  const CREATURE_STATE_KEY = 'capucine_creature_state_v1';
  const DATA = window.CREATURE_DATA;

  // ============ STATE MANAGEMENT ============

  let state = null; // loaded from localStorage

  function getDefaultState() {
    return {
      activeCollection: 'dragon',
      collections: {
        dragon: { xp: 0, stage: 'egg', unlockedAt: new Date().toISOString().slice(0,10) },
        fox: { xp: 0, stage: 'egg', unlockedAt: new Date().toISOString().slice(0,10) },
        turtle: null, // locked
        griffon: null  // locked
      },
      totalDaysTracked: 0,
      lastXpDate: null,
      pendingEvolution: null
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(CREATURE_STATE_KEY);
      if (raw) {
        state = JSON.parse(raw);
        // Migrate: ensure all collections exist
        ['dragon','fox','turtle','griffon'].forEach(c => {
          if (!(c in state.collections)) state.collections[c] = null;
        });
      } else {
        state = getDefaultState();
      }
    } catch(e) {
      state = getDefaultState();
    }
    return state;
  }

  function saveState() {
    try {
      localStorage.setItem(CREATURE_STATE_KEY, JSON.stringify(state));
    } catch(e) {}
  }

  // ============ XP & EVOLUTION ============

  // Called from app.js after saving today's entry.
  // entry = the form data, streak = current consecutive days.
  // Recalculates XP for today — if the new total is higher, awards the difference.
  // Returns { xpGained, evolved, newStage } or null if no change.
  function awardDailyXp(entry, streak) {
    if (!state || !entry || !entry.date) return null;

    const todayXp = DATA.computeDailyXp(entry, streak || 0);
    if (todayXp <= 0) return null;

    const collKey = state.activeCollection;
    const coll = state.collections[collKey];
    if (!coll) return null;

    // Track how much XP was already given today
    const isNewDay = state.lastXpDate !== entry.date;
    const previouslyAwarded = isNewDay ? 0 : (state._todayXpAwarded || 0);
    const xpGained = todayXp - previouslyAwarded;

    if (xpGained <= 0) return null;

    const oldStage = coll.stage;
    coll.xp += xpGained;
    state._todayXpAwarded = todayXp;
    state.lastXpDate = entry.date;

    const newStage = DATA.getStageForXp(coll.xp, collKey);
    coll.stage = newStage;

    // Count total days only on first award of the day
    if (isNewDay) {
      state.totalDaysTracked = (state.totalDaysTracked || 0) + 1;
    }

    // Check collection unlocks
    checkUnlocks();

    const evolved = oldStage !== newStage;
    if (evolved) {
      state.pendingEvolution = { collection: collKey, fromStage: oldStage, toStage: newStage };
    }

    saveState();
    syncToBackend();

    return { xpGained, evolved, newStage, oldStage };
  }

  function checkUnlocks() {
    const days = state.totalDaysTracked || 0;
    Object.keys(DATA.collections).forEach(key => {
      const req = DATA.collections[key].unlockRequirement;
      if (state.collections[key] === null && days >= req) {
        state.collections[key] = {
          xp: 0, stage: 'egg',
          unlockedAt: new Date().toISOString().slice(0,10)
        };
        // Show unlock notification after a short delay
        setTimeout(() => showUnlockNotification(key), 500);
      }
    });
  }

  // ============ RENDERING ============

  let creatureContainer = null;
  let heartEl = null;
  let xpFloatEl = null;
  let progressRing = null;

  function initCreatureUI() {
    // Create the creature container if it doesn't exist
    creatureContainer = document.getElementById('creature-display');
    if (!creatureContainer) {
      creatureContainer = document.createElement('div');
      creatureContainer.id = 'creature-display';
      creatureContainer.className = 'creature-display';
      document.body.appendChild(creatureContainer);
    }

    // Heart element for reactions
    heartEl = document.createElement('div');
    heartEl.className = 'creature-heart';
    heartEl.textContent = '\uD83D\uDC96';
    creatureContainer.appendChild(heartEl);

    // XP float element
    xpFloatEl = document.createElement('div');
    xpFloatEl.className = 'creature-xp-float';
    creatureContainer.appendChild(xpFloatEl);

    // SVG container
    const svgWrap = document.createElement('div');
    svgWrap.id = 'creature-svg-wrap';
    svgWrap.className = 'creature-svg-wrap';
    creatureContainer.appendChild(svgWrap);

    // Progress ring (SVG)
    const ringSize = 68;
    const ringStroke = 3;
    const radius = (ringSize - ringStroke) / 2;
    const circumference = 2 * Math.PI * radius;
    progressRing = document.createElementNS('http://www.w3.org/2000/svg','svg');
    progressRing.setAttribute('class', 'creature-progress-ring');
    progressRing.setAttribute('width', ringSize);
    progressRing.setAttribute('height', ringSize);
    progressRing.innerHTML = `
      <circle cx="${ringSize/2}" cy="${ringSize/2}" r="${radius}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="${ringStroke}"/>
      <circle id="creature-progress-circle" cx="${ringSize/2}" cy="${ringSize/2}" r="${radius}" fill="none" stroke="currentColor" stroke-width="${ringStroke}" stroke-linecap="round"
        stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"
        transform="rotate(-90 ${ringSize/2} ${ringSize/2})"
        style="transition: stroke-dashoffset 0.8s ease;"/>
    `;
    creatureContainer.appendChild(progressRing);

    // Click handler: single tap opens panel, double tap triggers reaction
    let tapCount = 0;
    let tapTimer = null;
    creatureContainer.addEventListener('click', (e) => {
      tapCount++;
      if (tapCount === 1) {
        tapTimer = setTimeout(() => {
          tapCount = 0;
          openCreaturePanel();
        }, 300);
      } else if (tapCount >= 2) {
        clearTimeout(tapTimer);
        tapCount = 0;
        // Double tap = fun reaction
        creatureReact('check');
      }
    });

    renderCreature();
    updateProgressRing();
  }

  function renderCreature() {
    const svgWrap = document.getElementById('creature-svg-wrap');
    if (!svgWrap || !state) return;

    const collKey = state.activeCollection;
    const coll = state.collections[collKey];
    if (!coll) return;

    const collData = DATA.collections[collKey];
    if (!collData) return;

    const stageData = collData.stages[coll.stage];
    if (!stageData) return;

    svgWrap.innerHTML = stageData.svg(60);

    // Set theme color on progress ring
    if (progressRing) {
      progressRing.style.color = collData.glowColor;
    }

    // Set glow color on container
    if (creatureContainer) {
      creatureContainer.style.setProperty('--creature-glow', collData.glowColor);
    }
  }

  function updateProgressRing() {
    const circle = document.getElementById('creature-progress-circle');
    if (!circle || !state) return;

    const collKey = state.activeCollection;
    const info = DATA.getXpToNextStage(
      state.collections[collKey]?.xp || 0,
      collKey
    );

    const ringSize = 68;
    const ringStroke = 3;
    const radius = (ringSize - ringStroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - info.progress);
    circle.setAttribute('stroke-dashoffset', offset);
  }

  // ============ REACTIONS / ANIMATIONS ============

  let currentAnimState = 'idle';
  let animTimeout = null;
  let idleTimer = null;
  let blinkInterval = null;

  function setAnimState(newState, duration) {
    if (!creatureContainer) return;
    creatureContainer.className = 'creature-display';
    currentAnimState = newState;
    void creatureContainer.offsetWidth; // force reflow
    creatureContainer.classList.add('creature-state-' + newState);

    if (animTimeout) clearTimeout(animTimeout);
    if (duration) {
      animTimeout = setTimeout(() => setAnimState('idle'), duration);
    }
    resetIdleTimer();
  }

  function showHeart() {
    if (!heartEl) return;
    heartEl.classList.remove('show');
    void heartEl.offsetWidth;
    heartEl.classList.add('show');
    setTimeout(() => heartEl.classList.remove('show'), 1000);
  }

  function showXpFloat(amount) {
    if (!xpFloatEl || !amount) return;
    xpFloatEl.textContent = `+${amount} XP`;
    xpFloatEl.classList.remove('show');
    void xpFloatEl.offsetWidth;
    xpFloatEl.classList.add('show');
    setTimeout(() => xpFloatEl.classList.remove('show'), 1500);
  }

  function creatureReact(action) {
    switch(action) {
      case 'check':
        setAnimState('jump', 600);
        showHeart();
        break;
      case 'mood-happy':
        setAnimState('big-jump', 800);
        break;
      case 'mood-sad':
        setAnimState('sad', 3000);
        break;
      case 'all-done':
        setAnimState('dance', 3000);
        break;
      case 'submit':
        setAnimState('big-jump', 1000);
        showHeart();
        break;
      case 'sleep':
        setAnimState('sleep');
        break;
      case 'wake':
        setAnimState('idle');
        break;
      default:
        setAnimState('idle');
    }
  }

  function resetIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (currentAnimState === 'idle') setAnimState('sit');
    }, 30000);
  }

  function startBlinking() {
    if (blinkInterval) clearInterval(blinkInterval);
    blinkInterval = setInterval(() => {
      if (currentAnimState !== 'idle' && currentAnimState !== 'sit') return;
      const eyes = creatureContainer?.querySelectorAll('.eye-blink');
      if (eyes) {
        eyes.forEach(g => {
          g.style.transform = 'scaleY(0.1)';
          setTimeout(() => { g.style.transform = ''; }, 150);
        });
      }
    }, 3000 + Math.random() * 2000);
  }

  // ============ CREATURE PANEL (Collection view) ============

  function openCreaturePanel() {
    let panel = document.getElementById('creature-panel');
    if (!panel) {
      panel = createCreaturePanel();
      document.body.appendChild(panel);
    }
    updatePanelContent();
    panel.classList.remove('hidden');
    panel.classList.add('open');
  }

  function closeCreaturePanel() {
    const panel = document.getElementById('creature-panel');
    if (panel) {
      panel.classList.remove('open');
      setTimeout(() => panel.classList.add('hidden'), 300);
    }
  }

  function createCreaturePanel() {
    const panel = document.createElement('div');
    panel.id = 'creature-panel';
    panel.className = 'creature-panel hidden';
    panel.innerHTML = `
      <div class="creature-panel-backdrop"></div>
      <div class="creature-panel-content">
        <div class="creature-panel-header">
          <h3>Mes Cr\u00e9atures</h3>
          <button id="creature-panel-close" class="creature-panel-close">\u2715</button>
        </div>
        <div id="creature-panel-active" class="creature-panel-active"></div>
        <div id="creature-panel-grid" class="creature-panel-grid"></div>
      </div>
    `;

    panel.querySelector('.creature-panel-backdrop').addEventListener('click', closeCreaturePanel);
    panel.querySelector('#creature-panel-close').addEventListener('click', closeCreaturePanel);

    return panel;
  }

  function updatePanelContent() {
    const activeSection = document.getElementById('creature-panel-active');
    const grid = document.getElementById('creature-panel-grid');
    if (!activeSection || !grid || !state) return;

    // Active creature display
    const collKey = state.activeCollection;
    const coll = state.collections[collKey];
    const collData = DATA.collections[collKey];

    if (coll && collData) {
      const stageData = collData.stages[coll.stage];
      const xpInfo = DATA.getXpToNextStage(coll.xp, collKey);
      const nextStage = DATA.getNextStage(coll.stage);

      activeSection.innerHTML = `
        <div class="creature-active-display" style="--theme: ${collData.glowColor}">
          <div class="creature-active-svg">${stageData.svg(90)}</div>
          <div class="creature-active-info">
            <h4>${collData.emoji} ${collData.name}</h4>
            <p class="creature-stage-name">${stageData.name} \u2022 ${coll.xp} XP</p>
            ${nextStage ? `
              <div class="creature-xp-bar">
                <div class="creature-xp-bar-fill" style="width: ${Math.round(xpInfo.progress * 100)}%; background: ${collData.glowColor}"></div>
              </div>
              <p class="creature-xp-label">${xpInfo.needed} XP avant ${DATA.collections[collKey].stages[nextStage].name}</p>
            ` : '<p class="creature-xp-label">\u00c9volution maximale ! \u2728</p>'}
          </div>
        </div>
      `;
    }

    // Collection grid
    let gridHtml = '';
    Object.keys(DATA.collections).forEach(key => {
      const cd = DATA.collections[key];
      const cs = state.collections[key];
      const isLocked = cs === null;
      const isActive = key === state.activeCollection;

      let cardContent;
      if (isLocked) {
        cardContent = `
          <div class="creature-card-svg">${cd.stages.egg.svg(50)}</div>
          <div class="creature-card-info">
            <span class="creature-card-name">${cd.emoji} ${cd.name}</span>
            <span class="creature-card-status locked">\uD83D\uDD12 ${cd.unlockRequirement} jours requis</span>
          </div>
        `;
      } else {
        const stage = cd.stages[cs.stage];
        cardContent = `
          <div class="creature-card-svg">${stage.svg(50)}</div>
          <div class="creature-card-info">
            <span class="creature-card-name">${cd.emoji} ${cd.name}</span>
            <span class="creature-card-status">${stage.name} \u2022 ${cs.xp} XP</span>
            ${isActive
              ? '<span class="creature-card-badge active">Active</span>'
              : `<button class="creature-card-activate" data-collection="${key}">Activer</button>`
            }
          </div>
        `;
      }

      gridHtml += `<div class="creature-card ${isLocked ? 'locked' : ''} ${isActive ? 'active' : ''}" style="--theme: ${cd.glowColor}">${cardContent}</div>`;
    });
    grid.innerHTML = gridHtml;

    // Bind activate buttons
    grid.querySelectorAll('.creature-card-activate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = btn.dataset.collection;
        switchCollection(key);
      });
    });
  }

  function switchCollection(collKey) {
    if (!state || !state.collections[collKey]) return;
    state.activeCollection = collKey;
    saveState();
    syncToBackend();
    renderCreature();
    updateProgressRing();
    updatePanelContent();
  }

  // ============ EVOLUTION OVERLAY ============

  function checkPendingEvolution() {
    if (!state || !state.pendingEvolution) return;
    const evo = state.pendingEvolution;
    state.pendingEvolution = null;
    saveState();
    showEvolutionOverlay(evo);
  }

  // Generate N particles as HTML
  function generateParticles(count, color) {
    let html = '';
    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i;
      const distance = 80 + Math.random() * 60;
      const size = 4 + Math.random() * 6;
      const delay = Math.random() * 0.3;
      const shapes = ['\u2728', '\u2B50', '\u2726', '\u25CF'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      html += `<span class="evo-particle" style="
        --angle: ${angle}deg;
        --distance: ${distance}px;
        --size: ${size}px;
        --delay: ${delay}s;
        color: ${color};
        font-size: ${size}px;
      ">${shape}</span>`;
    }
    return html;
  }

  function showEvolutionOverlay(evo) {
    const collData = DATA.collections[evo.collection];
    if (!collData) return;

    const oldStage = collData.stages[evo.fromStage];
    const newStage = collData.stages[evo.toStage];
    const glowColor = collData.glowColor;

    const overlay = document.createElement('div');
    overlay.className = 'evolution-overlay';
    overlay.innerHTML = `
      <div class="evolution-content">
        <div class="evo-glow-ring" style="--glow-color: ${glowColor}"></div>
        <div class="evo-particles">${generateParticles(20, glowColor)}</div>
        <div class="evo-flash" style="--glow-color: ${glowColor}"></div>
        <div class="evo-scene">
          <div class="evo-old-creature">${oldStage.svg(90)}</div>
          <div class="evo-new-creature">${newStage.svg(90)}</div>
        </div>
        <p class="evo-title-text">Évolution !</p>
        <p class="evo-creature-name">${collData.emoji} ${newStage.name} ${collData.name}</p>
        <p class="evo-subtitle">Ton compagnon a évolué grâce à tes efforts !</p>
        <button class="evo-close-btn" style="--glow-color: ${glowColor}">Trop bien !</button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animation timeline
    requestAnimationFrame(() => {
      overlay.classList.add('show');
      // Phase 1 (0ms): overlay appears, old creature visible + shaking
      setTimeout(() => overlay.classList.add('phase-flash'), 1200);   // Phase 2: flash
      setTimeout(() => overlay.classList.add('phase-reveal'), 1600);  // Phase 3: particles + new creature
      setTimeout(() => overlay.classList.add('phase-done'), 2400);    // Phase 4: text + button
    });

    const closeOverlay = () => {
      overlay.classList.add('phase-exit');
      setTimeout(() => overlay.remove(), 500);
    };
    overlay.querySelector('.evo-close-btn').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });
  }

  function showUnlockNotification(collKey) {
    const cd = DATA.collections[collKey];
    if (!cd) return;

    const overlay = document.createElement('div');
    overlay.className = 'evolution-overlay unlock-overlay';
    overlay.innerHTML = `
      <div class="evolution-content">
        <div class="evo-glow-ring" style="--glow-color: ${cd.glowColor}"></div>
        <div class="evo-particles">${generateParticles(16, cd.glowColor)}</div>
        <div class="evo-flash" style="--glow-color: ${cd.glowColor}"></div>
        <div class="unlock-egg-scene">
          <div class="unlock-egg-shake">${cd.stages.egg.svg(90)}</div>
        </div>
        <p class="evo-title-text">Nouvelle collection !</p>
        <p class="evo-creature-name">${cd.emoji} ${cd.name}</p>
        <p class="evo-subtitle">Tu as debloque une nouvelle famille de creatures !</p>
        <button class="evo-close-btn" style="--glow-color: ${cd.glowColor}">Decouvrir</button>
      </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('show');
      setTimeout(() => overlay.classList.add('phase-flash'), 1000);
      setTimeout(() => overlay.classList.add('phase-reveal'), 1400);
      setTimeout(() => overlay.classList.add('phase-done'), 2000);
    });

    const closeOverlay = () => {
      overlay.classList.add('phase-exit');
      setTimeout(() => {
        overlay.remove();
        // Open the creature panel to show the new collection
        openCreaturePanel();
      }, 500);
    };
    overlay.querySelector('.evo-close-btn').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });
  }

  // ============ BACKEND SYNC ============

  let syncTimeout = null;
  function syncToBackend() {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(doSync, 2000);
  }

  async function doSync() {
    try {
      const apiBase = window._capucineApiBase || '';
      const token = localStorage.getItem('capucine_api_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['X-Capucine-Token'] = token;

      await fetch(apiBase + '/creature', {
        method: 'POST',
        headers,
        body: JSON.stringify(state)
      });
    } catch(e) {
      // Offline — state is in localStorage, will sync later
    }
  }

  async function fetchFromBackend() {
    try {
      const apiBase = window._capucineApiBase || '';
      const token = localStorage.getItem('capucine_api_token');
      const headers = {};
      if (token) headers['X-Capucine-Token'] = token;

      const resp = await fetch(apiBase + '/creature', { headers });
      if (resp.ok) {
        const remote = await resp.json();
        if (remote && remote.activeCollection) {
          // Merge: higher XP wins per collection
          Object.keys(remote.collections || {}).forEach(key => {
            const local = state.collections[key];
            const rem = remote.collections[key];
            if (!local && rem) {
              state.collections[key] = rem;
            } else if (local && rem && rem.xp > local.xp) {
              state.collections[key] = rem;
            }
          });
          if ((remote.totalDaysTracked || 0) > (state.totalDaysTracked || 0)) {
            state.totalDaysTracked = remote.totalDaysTracked;
          }
          saveState();
        }
      }
    } catch(e) { /* offline */ }
  }

  // ============ MAIN INIT ============

  function initCreatureSystem() {
    loadState();
    initCreatureUI();
    startBlinking();

    // Night mode: creature sleeps between 22h and 6h
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      creatureReact('sleep');
    }

    // Idle timer
    resetIdleTimer();
    document.addEventListener('touchstart', resetIdleTimer, { passive: true });
    document.addEventListener('click', () => {
      if (currentAnimState === 'sit') setAnimState('idle');
      resetIdleTimer();
    });

    // Objective checkboxes — creature reacts when objectives are checked
    const objectiveIds = ['drank1L','medsMorning','medsNoon','medsEvening','mealBreakfast','mealLunch','mealDinner'];
    objectiveIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          if (el.checked) {
            const allDone = objectiveIds.every(oid => {
              const e = document.getElementById(oid);
              return e && e.checked;
            });
            creatureReact(allDone ? 'all-done' : 'check');
          }
        });
      }
    });

    // Mood buttons — creature mirrors the selected mood
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mood = Number(btn.dataset.mood);
        if (mood >= 4) creatureReact('mood-happy');
        else if (mood <= 2) creatureReact('mood-sad');
        else setAnimState('idle');
      });
    });

    // Try backend sync, then refresh UI
    fetchFromBackend().then(() => {
      renderCreature();
      updateProgressRing();
      checkPendingEvolution();
    });
  }

  // ============ PUBLIC API ============
  // Exposed on window for app.js to call

  window.CreatureSystem = {
    init: initCreatureSystem,
    react: creatureReact,
    awardXp: awardDailyXp,
    showXpFloat: showXpFloat,
    renderCreature: renderCreature,
    updateProgress: updateProgressRing,
    checkEvolution: checkPendingEvolution,
    getState: () => state,
    openPanel: openCreaturePanel,
  };

})();
