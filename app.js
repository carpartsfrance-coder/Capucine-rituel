(function () {
  const STORAGE_KEY = 'capucine_rituel_journal_v1';

  const TASK_FIELDS = [
    'drank1L',
    'medsMorning',
    'medsNoon',
    'medsEvening',
    'mealBreakfast',
    'mealLunch',
    'mealDinner',
  ];

  const SUCCESS_ORDER_KEY = 'capucine_success_images_order';

  function loadSuccessOrder() {
    try {
      const raw = localStorage.getItem(SUCCESS_ORDER_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  async function shareVictoryForEntry(entry) {
    if (!entry) return;
    const dateHuman = formatDateHuman(entry.date);
    const mood = entry.mood ? getMoodEmoji(entry.mood) : '🙂';

    const meds = [entry.medsMorning && 'matin', entry.medsNoon && 'midi', entry.medsEvening && 'soir']
      .filter(Boolean)
      .join(', ');
    const meals = [entry.mealBreakfast && 'petit déj', entry.mealLunch && 'déjeuner', entry.mealDinner && 'dîner']
      .filter(Boolean)
      .join(', ');

    const weight = entry.weightKg != null ? `${entry.weightKg} kg` : '--';
    const bp = entry.bpSystolic != null && entry.bpDiastolic != null ? `${entry.bpSystolic}/${entry.bpDiastolic}` : '--';

    const lines = [
      `Rituel de Capucine – ${dateHuman}`,
      `Humeur: ${mood}`,
      `Hydratation: ${entry.drank1L ? '✅' : '—'}`,
      `Médicaments: ${meds || '—'}`,
      `Repas: ${meals || '—'}`,
      `Poids: ${weight}  |  Tension: ${bp}`,
    ];
    if (entry.notes && entry.notes.trim()) {
      lines.push(`Notes: ${entry.notes.trim()}`);
    }
    // Lien direct vers l'app sur la journée partagée
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'history');
      url.searchParams.set('date', entry.date);
      lines.push('', `Voir cette journée dans son rituel : ${url.toString()}`);
    } catch (_) {
      // en cas d'erreur d'URL, on ignore simplement
    }
    lines.push('— partagé depuis son petit rituel ✨');

    const text = lines.join('\n');

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Rituel de Capucine', text });
        return;
      }
    } catch (_) {}

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast('Message copié. Tu peux le coller dans Messages/WhatsApp.');
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Message copié. Tu peux le coller dans Messages/WhatsApp.');
      }
    } catch (_) {
      showToast("Impossible de partager automatiquement. Copie manuelle nécessaire.");
    }
  }

  function saveSuccessOrder(order) {
    try {
      localStorage.setItem(SUCCESS_ORDER_KEY, JSON.stringify(order));
    } catch (_) {
      // ignore
    }
  }

  function generateSuccessOrder(n) {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function getSuccessImageForCount(totalDays) {
    if (!SUCCESS_IMAGES.length || totalDays <= 0) {
      return 'assets/turtle-enceinte.png';
    }

    let order = loadSuccessOrder();
    if (!order || order.length !== SUCCESS_IMAGES.length) {
      order = generateSuccessOrder(SUCCESS_IMAGES.length);
      saveSuccessOrder(order);
    }

    let pos = (totalDays - 1) % SUCCESS_IMAGES.length;
    // Au début d'un nouveau cycle (et seulement si on a déjà complété au moins un cycle), on régénère l'ordre
    if (pos === 0 && totalDays > 1) {
      order = generateSuccessOrder(SUCCESS_IMAGES.length);
      saveSuccessOrder(order);
      pos = 0;
    }

    const idx = order[pos];
    return SUCCESS_IMAGES[idx] || 'assets/turtle-enceinte.png';
  }

  const SUCCESS_DATE_MAP_KEY = 'capucine_success_images_by_date';

  function loadSuccessDateMap() {
    try {
      const raw = localStorage.getItem(SUCCESS_DATE_MAP_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveSuccessDateMap(map) {
    try {
      localStorage.setItem(SUCCESS_DATE_MAP_KEY, JSON.stringify(map));
    } catch (_) {
      // ignore
    }
  }

  function getSuccessImageForDate(dateKey) {
    if (!SUCCESS_IMAGES.length) {
      return 'assets/turtle-enceinte.png';
    }

    // Calcul déterministe basé sur la date pour que tous les appareils
    // obtiennent exactement la même image pour un jour donné
    const source = `${dateKey}-success`;
    let hash = 0;
    for (let i = 0; i < source.length; i += 1) {
      hash = (hash << 5) - hash + source.charCodeAt(i);
      hash |= 0; // force en entier 32 bits
    }
    const index = Math.abs(hash) % SUCCESS_IMAGES.length;
    return SUCCESS_IMAGES[index] || 'assets/turtle-enceinte.png';
  }

  function openImageLightbox(url) {
    if (!url) return;
    const existing = document.getElementById('image-lightbox');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'image-lightbox';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    const imgBox = document.createElement('div');
    imgBox.style.width = '90%';
    imgBox.style.maxWidth = '420px';
    imgBox.style.aspectRatio = '3 / 4';
    imgBox.style.borderRadius = '24px';
    imgBox.style.overflow = 'hidden';
    imgBox.style.boxShadow = '0 20px 50px rgba(0,0,0,0.4)';
    imgBox.style.backgroundImage = `url('${url}')`;
    imgBox.style.backgroundSize = 'cover';
    imgBox.style.backgroundPosition = 'center';

    overlay.appendChild(imgBox);
    overlay.addEventListener('click', () => {
      overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  const QUOTE_IDX_KEY_PREFIX = 'capucine_daily_quote_idx_';

  const moodEmojis = {
    1: '😞',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😄',
  };

  const DAILY_QUOTES = [
    'Merci de prendre soin de toi aujourd’hui. Tu n’es jamais seule.',
    'On avance ensemble, doucement mais sûrement. On est tous fiers de toi.',
    'On est là pour toi à chaque instant.',
    'Chaque petit geste compte. On veille sur toi avec douceur.',
    'Tu peux t’appuyer sur nous, on reste à tes côtés quoi qu’il arrive.',
    'On te chuchote que tu peux ralentir, on t’attend juste ici 💕',
    'Tu illumines nos journées, merci de continuer à ton rythme.',
    'On te serre fort, prends le temps dont tu as besoin.',
    'Aujourd’hui, tu as déjà fait beaucoup. Repose-toi sans culpabilité.',
    'Chaque pas compte, même tout petit. On marche avec toi.',
    'On croit en toi, un jour après l’autre, à ton rythme.',
    'Tu peux être fière de toi aujourd’hui. Vraiment.',
    'Si c’est difficile, on reste à côté, main dans la main.',
    'Merci pour ta douceur, elle illumine nos journées.',
    'On t’envoie de la force et un grand câlin tout en douceur.',
    'On prépare un nid tout doux pour toi, prends ton rythme.',
    'Ta présence est précieuse, on t’aime très fort.',
    'Ralentir, c’est aussi avancer. On t’attend sans pression.',
    'Ton courage nous impressionne chaque jour.',
    'On est là le matin, le midi, le soir, toujours.',
    'Aujourd’hui, pense à te féliciter.',
    'Aujourd’hui, on te couvre de douceur. Prends juste ce qui te fait du bien.',
    'Un petit pas suffit. Le reste peut attendre sans pression.',
    'Tu as le droit de te reposer. Nous veillons au calme autour de toi.',
    'Ta force nous inspire chaque jour.',
    'Tu avances à ton rythme et c’est parfait ainsi.',
    'Si tu te sens fatiguée, ralentis. On t’entoure d’un grand câlin.',
    'Chaque est une victoire. On le célèbre avec toi.',
    'Il n’y a rien à prouver, juste à prendre soin de toi.',
    'Tu mérites la douceur que tu donnes aux autres.',
    'On t’enveloppe de chaleur et de paix.',
    'Aujourd’hui peut être simple. Et ce sera déjà beaucoup.',
    'Tes efforts invisibles comptent autant que les visibles.',
    'Tu peux lâcher prise un instant, on tient la main.',
    'Rien n’est urgent sauf toi. On priorise ton confort.',
    'Ton sourire est notre soleil. On t’en envoie un rayon.',
    'Ton repos construit demain.',
    'On avance ensemble, même quand on reste immobiles.',
    'Tu es assez, exactement comme tu es aujourd’hui.',
    'Respire profondément, laisse couler ce qui pèse.',
    'Tu peux dire non, on dira oui à ton bien‑être.',
    'Une sieste, un thé, un câlin : choisis ce qui te plaît.',
    'Ton rythme est le bon. On s’y ajuste avec amour.',
    'Tu as déjà fait beaucoup en étant là.',
    'On dépose de la lumière sur ta journée.',
    'Tu peux t’appuyer sur nous pour la suite.',
    'Un instant après l’autre, on est fiers de toi.',
    'Merci d’exister avec tant de douceur.',
    'Tu as le droit d’être lente, douce, tranquille.',
    'On garde le cap avec toi, sans te presser.',
    'Une étape minuscule, et c’est superbe.',
    'On te rappelle que tu n’es jamais seule.',
    'Tes larmes sont accueillies, tes sourires aussi.',
    'On transforme la fatigue en tendresse partagée.',
    'Tu peux fermer les yeux, on reste là.',
    'Ta paix est notre priorité du jour.',
    'On te soutient sans condition, du matin au soir.',
    'Tu peux reprendre quand tu veux. Pas d’horloge ici.',
    'On te prépare un coin douillet pour te reposer.',
    'Chaque verre d’eau est une petite victoire.',
    'On fête le simple, le doux, le possible.',
    'Tu grandis même en te reposant.',
    'On te garde contre nous par la pensée.',
  ];

  const SUCCESS_IMAGES = [
    'assets/photos-capucine/PHOTO-2025-01-04-20-44-13.jpg',
    'assets/photos-capucine/PHOTO-2025-02-21-13-08-57.jpg',
    'assets/photos-capucine/PHOTO-2025-03-23-19-06-59.jpg',
    'assets/photos-capucine/PHOTO-2025-03-24-22-37-40.jpg',
    'assets/photos-capucine/PHOTO-2025-04-02-20-44-18.jpg',
    'assets/photos-capucine/PHOTO-2025-04-05-08-21-34.jpg',
    'assets/photos-capucine/PHOTO-2025-04-26-20-05-34.jpg',
    'assets/photos-capucine/PHOTO-2025-05-03-22-17-26.jpg',
    'assets/photos-capucine/PHOTO-2025-05-06-21-56-10.jpg',
    'assets/photos-capucine/PHOTO-2025-05-07-21-49-47.jpg',
    'assets/photos-capucine/PHOTO-2025-05-08-20-47-18.jpg',
    'assets/photos-capucine/PHOTO-2025-05-10-14-18-49.jpg',
    'assets/photos-capucine/PHOTO-2025-05-10-14-18-51.jpg',
    'assets/photos-capucine/PHOTO-2025-05-19-21-14-34 2.jpg',
    'assets/photos-capucine/PHOTO-2025-05-19-21-14-34.jpg',
    'assets/photos-capucine/PHOTO-2025-05-19-21-14-35 2.jpg',
    'assets/photos-capucine/PHOTO-2025-05-19-21-14-35.jpg',
    'assets/photos-capucine/PHOTO-2025-05-24-22-26-51.jpg',
    'assets/photos-capucine/PHOTO-2025-05-25-15-21-04.jpg',
    'assets/photos-capucine/PHOTO-2025-05-25-16-02-25.jpg',
    'assets/photos-capucine/PHOTO-2025-05-25-17-16-08.jpg',
    'assets/photos-capucine/PHOTO-2025-06-07-20-14-12.jpg',
    'assets/photos-capucine/PHOTO-2025-06-07-20-15-42.jpg',
    'assets/photos-capucine/PHOTO-2025-06-10-11-55-24.jpg',
    'assets/photos-capucine/PHOTO-2025-06-20-11-18-34.jpg',
    'assets/photos-capucine/PHOTO-2025-06-20-14-29-49.jpg',
    'assets/photos-capucine/PHOTO-2025-06-20-14-35-20.jpg',
    'assets/photos-capucine/PHOTO-2025-06-23-21-58-49.jpg',
    'assets/photos-capucine/PHOTO-2025-06-23-21-59-46.jpg',
    'assets/photos-capucine/PHOTO-2025-06-24-08-18-23.jpg',
    'assets/photos-capucine/PHOTO-2025-06-25-07-58-39.jpg',
    'assets/photos-capucine/PHOTO-2025-07-05-20-36-52.jpg',
    'assets/photos-capucine/PHOTO-2025-07-12-20-56-28.jpg',
    'assets/photos-capucine/PHOTO-2025-07-20-01-54-32.jpg',
    'assets/photos-capucine/PHOTO-2025-07-21-20-25-37.jpg',
    'assets/photos-capucine/PHOTO-2025-07-21-22-25-46.jpg',
    'assets/photos-capucine/PHOTO-2025-07-26-23-06-45.jpg',
    'assets/photos-capucine/PHOTO-2025-07-31-20-04-48.jpg',
    'assets/photos-capucine/PHOTO-2025-07-31-20-04-49.jpg',
    'assets/photos-capucine/PHOTO-2025-07-31-20-04-50.jpg',
    'assets/photos-capucine/PHOTO-2025-07-31-20-05-43.jpg',
    'assets/photos-capucine/PHOTO-2025-07-31-20-18-24.jpg',
    'assets/photos-capucine/PHOTO-2025-08-02-17-18-28.jpg',
    'assets/photos-capucine/PHOTO-2025-08-02-17-22-31.jpg',
    'assets/photos-capucine/PHOTO-2025-08-02-17-27-14 2.jpg',
    'assets/photos-capucine/PHOTO-2025-08-02-17-27-14 3.jpg',
    'assets/photos-capucine/PHOTO-2025-08-02-17-27-14.jpg',
    'assets/photos-capucine/PHOTO-2025-08-04-13-14-58.jpg',
    'assets/photos-capucine/PHOTO-2025-08-04-19-43-35.jpg',
    'assets/photos-capucine/PHOTO-2025-08-07-19-03-02.jpg',
    'assets/photos-capucine/PHOTO-2025-08-07-19-27-58.jpg',
    'assets/photos-capucine/PHOTO-2025-08-07-19-29-23.jpg',
    'assets/photos-capucine/PHOTO-2025-08-08-16-39-00.jpg',
    'assets/photos-capucine/PHOTO-2025-08-09-09-09-16.jpg',
    'assets/photos-capucine/PHOTO-2025-08-11-22-36-06.jpg',
    'assets/photos-capucine/PHOTO-2025-09-06-11-16-44.jpg',
    'assets/photos-capucine/PHOTO-2025-09-15-13-40-10.jpg',
    'assets/photos-capucine/PHOTO-2025-09-20-20-54-11.jpg',
    'assets/photos-capucine/PHOTO-2025-09-20-22-50-59.jpg',
    'assets/photos-capucine/PHOTO-2025-09-21-21-33-41.jpg',
    'assets/photos-capucine/PHOTO-2025-09-21-21-38-57.jpg',
    'assets/photos-capucine/PHOTO-2025-09-24-13-00-48.jpg',
    'assets/photos-capucine/PHOTO-2025-09-24-19-12-40.jpg',
    'assets/photos-capucine/PHOTO-2025-09-24-19-16-24.jpg',
    'assets/photos-capucine/PHOTO-2025-09-24-20-20-44.jpg',
    'assets/photos-capucine/PHOTO-2025-09-25-20-46-21.jpg',
    'assets/photos-capucine/PHOTO-2025-09-27-18-58-23.jpg',
    'assets/photos-capucine/PHOTO-2025-09-27-20-50-32.jpg',
    'assets/photos-capucine/PHOTO-2025-09-27-20-57-16.jpg',
    'assets/photos-capucine/PHOTO-2025-09-27-20-57-29.jpg',
    'assets/photos-capucine/PHOTO-2025-09-27-20-57-45.jpg',
    'assets/photos-capucine/PHOTO-2025-09-28-12-44-57.jpg',
    'assets/photos-capucine/PHOTO-2025-10-02-15-01-08.jpg',
    'assets/photos-capucine/PHOTO-2025-10-05-09-51-28.jpg',
    'assets/photos-capucine/PHOTO-2025-10-05-15-09-54.jpg',
    'assets/photos-capucine/PHOTO-2025-10-05-19-20-12.jpg',
    'assets/photos-capucine/PHOTO-2025-10-05-19-20-40.jpg',
    'assets/photos-capucine/PHOTO-2025-10-05-19-26-57.jpg',
    'assets/photos-capucine/PHOTO-2025-10-05-19-36-30.jpg',
    'assets/photos-capucine/PHOTO-2025-10-05-19-38-19.jpg',
    'assets/photos-capucine/PHOTO-2025-10-05-21-07-16.jpg',
    'assets/photos-capucine/PHOTO-2025-10-09-21-22-33.jpg',
    'assets/photos-capucine/PHOTO-2025-10-11-17-51-02.jpg',
    'assets/photos-capucine/PHOTO-2025-10-11-17-51-06.jpg',
    'assets/photos-capucine/PHOTO-2025-10-12-16-11-34.jpg',
    'assets/photos-capucine/PHOTO-2025-10-12-18-11-13.jpg',
    'assets/photos-capucine/PHOTO-2025-10-19-09-22-43.jpg',
    'assets/photos-capucine/PHOTO-2025-10-19-09-24-02.jpg',
    'assets/photos-capucine/PHOTO-2025-10-19-11-30-51.jpg',
    'assets/photos-capucine/PHOTO-2025-10-19-21-52-06.jpg',
    'assets/photos-capucine/PHOTO-2025-10-27-07-36-25.jpg',
    'assets/photos-capucine/PHOTO-2025-10-27-07-37-08.jpg',
    'assets/photos-capucine/PHOTO-2025-10-30-15-26-13.jpg',
    'assets/photos-capucine/PHOTO-2025-11-09-16-49-45.jpg',
    'assets/photos-capucine/PHOTO-2025-11-20-18-27-27.jpg',
    'assets/photos-capucine/PHOTO-2025-11-24-20-37-18.jpg',
    'assets/photos-capucine/PHOTO-2025-11-24-21-02-09.jpg',
    'assets/photos-capucine/PHOTO-2025-11-26-22-37-37.jpg',
    'assets/photos-capucine/PHOTO-2025-12-01-09-22-24.jpg',
    'assets/photos-capucine/PHOTO-2025-12-01-17-14-55.jpg',
    'assets/photos-capucine/PHOTO-2025-12-10-20-32-29.jpg',
    'assets/photos-capucine/PHOTO-2025-12-13-19-33-32.jpg',
    'assets/photos-capucine/PHOTO-2025-12-17-14-23-17.jpg',
    'assets/photos-capucine/PHOTO-2025-12-17-15-31-47.jpg',
    'assets/photos-capucine/PHOTO-2025-12-18-14-44-46.jpg',
    'assets/photos-capucine/PHOTO-2025-12-18-18-28-41.jpg',
    'assets/photos-capucine/PHOTO-2025-12-20-21-54-55.jpg',
    'assets/photos-capucine/PHOTO-2025-12-22-19-54-50.jpg',
    'assets/photos-capucine/PHOTO-2025-12-22-19-55-52.jpg',
    'assets/photos-capucine/PHOTO-2025-12-22-20-39-08.jpg',
    'assets/photos-capucine/PHOTO-2025-12-23-10-29-00.jpg',
    'assets/photos-capucine/PHOTO-2025-12-25-21-25-44.jpg',
    'assets/photos-capucine/PHOTO-2025-12-26-11-21-19.jpg',
    'assets/photos-capucine/PHOTO-2025-12-29-10-09-33.jpg',
    'assets/photos-capucine/PHOTO-2025-12-30-09-31-06.jpg',
    'assets/photos-capucine/PHOTO-2025-12-30-11-11-31.jpg',
    'assets/photos-capucine/PHOTO-2025-12-31-09-21-47.jpg',
    'assets/photos-capucine/PHOTO-2025-12-31-10-09-20.jpg',
    'assets/photos-capucine/PHOTO-2026-01-04-11-11-18.jpg',
    'assets/photos-capucine/PHOTO-2026-01-06-15-12-46.jpg',
    'assets/photos-capucine/PHOTO-2026-01-07-21-29-03.jpg',
  ];

  // Base API dynamique: en prod et en local, on utilise la même origine
  const API_BASE_URL = '';

  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function openDetailOverlay(entry) {
    const overlay = document.getElementById('detail-overlay');
    if (!overlay || !entry) return;

    // Image : reprend la même photo que sur l'écran "Bien joué" pour cette date
    const detailImageCircle = overlay.querySelector('.aspect-square');
    if (detailImageCircle) {
      const imgUrl = getSuccessImageForDate(entry.date);
      detailImageCircle.style.backgroundImage = `url('${imgUrl}')`;
      detailImageCircle.style.backgroundSize = 'cover';
      detailImageCircle.style.backgroundPosition = 'center';
      detailImageCircle.style.cursor = 'pointer';
      detailImageCircle.onclick = () => openImageLightbox(imgUrl);
    }

    const titleEl = document.getElementById('detail-title');
    const moodLabelEl = document.getElementById('detail-mood-label');
    const weightEl = document.getElementById('detail-weight');
    const bpEl = document.getElementById('detail-bp');
    const medsTextEl = document.getElementById('detail-meds-text');
    const medsStatusEl = document.getElementById('detail-meds-status');
    const mealsTextEl = document.getElementById('detail-meals-text');
    const mealsStatusEl = document.getElementById('detail-meals-status');
    const symptomsEl = document.getElementById('detail-symptoms');
    const notesEl = document.getElementById('detail-notes');
    const hydrationStatusEl = document.getElementById('detail-hydration-status');

    if (titleEl) {
      titleEl.textContent = formatDateHuman(entry.date);
    }

    if (moodLabelEl) {
      const mood = entry.mood || 0;
      const labels = {
        1: 'Très difficile',
        2: 'Plutôt difficile',
        3: 'Neutre',
        4: 'Plutôt joyeux',
        5: 'Très joyeux',
      };
      moodLabelEl.textContent = labels[mood] || 'Humeur';
    }

    if (weightEl) {
      weightEl.textContent =
        entry.weightKg != null && !Number.isNaN(entry.weightKg)
          ? String(entry.weightKg)
          : '--';
    }

    if (bpEl) {
      if (entry.bpSystolic != null && entry.bpDiastolic != null) {
        bpEl.textContent = `${entry.bpSystolic} / ${entry.bpDiastolic}`;
      } else {
        bpEl.textContent = '-- / --';
      }
    }

    if (medsTextEl || medsStatusEl) {
      const times = [];
      if (entry.medsMorning) times.push('matin');
      if (entry.medsNoon) times.push('midi');
      if (entry.medsEvening) times.push('soir');
      const text = times.length
        ? `Pris : ${times.join(', ')}`
        : 'Aucune prise renseignée';
      if (medsTextEl) medsTextEl.textContent = text;
      if (medsStatusEl) {
        if (times.length) {
          medsStatusEl.classList.remove('opacity-40');
        } else {
          medsStatusEl.classList.add('opacity-40');
        }
      }
    }

    if (mealsTextEl || mealsStatusEl) {
      const meals = [];
      if (entry.mealBreakfast) meals.push('petit déj');
      if (entry.mealLunch) meals.push('déjeuner');
      if (entry.mealDinner) meals.push('dîner');
      const textMeals = meals.length
        ? `${meals.length} repas enregistrés (${meals.join(', ')})`
        : 'Aucun repas renseigné';
      if (mealsTextEl) mealsTextEl.textContent = textMeals;
      if (mealsStatusEl) {
        if (meals.length) {
          mealsStatusEl.classList.remove('opacity-40');
        } else {
          mealsStatusEl.classList.add('opacity-40');
        }
      }
    }

    if (hydrationStatusEl) {
      hydrationStatusEl.textContent = entry.drank1L
        ? 'Objectif atteint'
        : 'Pas renseigné';
    }

    if (symptomsEl) {
      symptomsEl.innerHTML = '';
      const chips = [];
      if (entry.fatigue) {
        chips.push({ icon: 'bolt', label: 'Fatigue' });
      }
      if (entry.breathless) {
        chips.push({ icon: 'air', label: 'Essoufflée' });
      }

      if (!chips.length) {
        const span = document.createElement('span');
        span.className =
          'inline-flex items-center rounded-full border border-gray-100 bg-white px-4 py-2 text-sm font-medium text-text-sub-light shadow-sm dark:border-surface-dark dark:bg-surface-dark dark:text-text-sub-dark';
        span.textContent = 'Aucun symptôme particulier noté.';
        symptomsEl.appendChild(span);
      } else {
        chips.forEach((chip) => {
          const span = document.createElement('span');
          span.className =
            'inline-flex items-center rounded-full border border-transparent bg-primary/10 px-4 py-2 text-sm font-medium text-primary dark:bg-primary/20';
          const icon = document.createElement('span');
          icon.className = 'material-symbols-outlined mr-1.5 text-[18px]';
          icon.textContent = chip.icon;
          span.appendChild(icon);
          span.append(chip.label);
          symptomsEl.appendChild(span);
        });
      }
    }

    if (notesEl) {
      notesEl.textContent = entry.notes && entry.notes.trim()
        ? entry.notes
        : 'Aucune note enregistrée pour ce jour.';
    }

    overlay.dataset.date = entry.date;
    overlay.classList.remove('hidden');
  }

  async function shareVictory() {
    // Récupère l'entrée du jour (ou la plus récente en secours)
    const all = loadEntries();
    if (!all.length) {
      showToast("Aucune journée à partager pour l'instant.");
      return;
    }
    const todayKey = formatDate(new Date());
    const entry = all.find((e) => e.date === todayKey) || [...all].sort((a, b) => (a.date < b.date ? 1 : -1))[0];

    // Construit un message simple et bien lisible
    const dateHuman = formatDateHuman(entry.date);
    const mood = entry.mood ? getMoodEmoji(entry.mood) : '🙂';

    const meds = [entry.medsMorning && 'matin', entry.medsNoon && 'midi', entry.medsEvening && 'soir']
      .filter(Boolean)
      .join(', ');
    const meals = [entry.mealBreakfast && 'petit déj', entry.mealLunch && 'déjeuner', entry.mealDinner && 'dîner']
      .filter(Boolean)
      .join(', ');

    const weight = entry.weightKg != null ? `${entry.weightKg} kg` : '--';
    const bp = entry.bpSystolic != null && entry.bpDiastolic != null ? `${entry.bpSystolic}/${entry.bpDiastolic}` : '--';

    const lines = [
      `Rituel de Capucine – ${dateHuman}`,
      `Humeur: ${mood}`,
      `Hydratation: ${entry.drank1L ? '✅' : '—'}`,
      `Médicaments: ${meds || '—'}`,
      `Repas: ${meals || '—'}`,
      `Poids: ${weight}  |  Tension: ${bp}`,
    ];
    if (entry.notes && entry.notes.trim()) {
      lines.push(`Notes: ${entry.notes.trim()}`);
    }
    // Lien direct vers l'app sur la journée partagée
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'history');
      url.searchParams.set('date', entry.date);
      lines.push('', `Voir cette journée dans son rituel : ${url.toString()}`);
    } catch (_) {
      // en cas d'erreur d'URL, on ignore simplement
    }
    lines.push('— partagé depuis son petit rituel ✨');

    const text = lines.join('\n');

    // Partage natif si possible, sinon copie dans le presse‑papiers
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Rituel de Capucine', text });
        return;
      }
    } catch (err) {
      // Si l'utilisateur annule, on ne fait rien de plus
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast('Message copié. Tu peux le coller dans Messages/WhatsApp.');
      } else {
        // Fallback ultime
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Message copié. Tu peux le coller dans Messages/WhatsApp.');
      }
    } catch (e) {
      showToast("Impossible de partager automatiquement. Copie manuelle nécessaire.");
    }
  }

  function parseDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDateHuman(str) {
    const date = parseDate(str);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function pickMessage(messages, dateKey, salt = '') {
    if (!messages || !messages.length) return '';
    let hash = 0;
    const source = `${dateKey}-${salt}`;
    for (let i = 0; i < source.length; i += 1) {
      hash = (hash << 5) - hash + source.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % messages.length;
    return messages[index];
  }

  function getStoredQuoteIndex(dateKey) {
    try {
      const raw = localStorage.getItem(QUOTE_IDX_KEY_PREFIX + dateKey);
      const n = raw != null ? Number(raw) : NaN;
      return Number.isNaN(n) ? null : n;
    } catch (_) {
      return null;
    }
  }

  function setStoredQuoteIndex(dateKey, index) {
    try {
      localStorage.setItem(QUOTE_IDX_KEY_PREFIX + dateKey, String(index));
    } catch (_) {
      // ignore
    }
  }

  function setDailyQuote(dateKey, advance = false) {
    const dailyMessage = document.getElementById('daily-message');
    const dailyMessageVisual = document.getElementById('daily-message-visual');
    if (!dailyMessage) return;

    const baseIndex = DAILY_QUOTES.length
      ? Math.abs((dateKey + '-all').split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)) % DAILY_QUOTES.length
      : 0;

    const stored = getStoredQuoteIndex(dateKey);
    let index = stored != null ? stored : baseIndex;
    if (advance && DAILY_QUOTES.length) {
      index = (index + 1) % DAILY_QUOTES.length;
      setStoredQuoteIndex(dateKey, index);
    } else if (stored == null) {
      // mémorise l’index initial pour stabilité dans la journée
      setStoredQuoteIndex(dateKey, index);
    }

    const quote = DAILY_QUOTES[index] || '';
    const full = `Papa, Maman, Turtle, Bibi : ${quote}`;
    dailyMessage.textContent = full;
    if (dailyMessageVisual) {
      dailyMessageVisual.textContent = full;
    }
  }

  async function fetchEntriesFromBackend() {
    try {
      const response = await fetch(`${API_BASE_URL}/entries`);
      if (!response.ok) {
        throw new Error('Réponse HTTP non valide');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        // On garde aussi une copie locale en secours
        saveEntries(data);
        return data;
      }
      return loadEntries();
    } catch (e) {
      // Si le backend n'est pas joignable, on revient au stockage local
      return loadEntries();
    }
  }

  async function saveEntryToBackend(entry) {
    try {
      const response = await fetch(`${API_BASE_URL}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error('Réponse HTTP non valide');
      }

      const saved = await response.json();
      const entries = loadEntries();
      const index = entries.findIndex((e) => e.date === saved.date);
      if (index >= 0) {
        entries[index] = saved;
      } else {
        entries.push(saved);
      }
      saveEntries(entries);
      return entries;
    } catch (e) {
      // Secours : on garde quand même la journée en local
      const updatedEntries = upsertEntry(entry);
      showToast(
        "Impossible de se connecter au serveur. Ta journée est gardée sur cet appareil seulement."
      );
      return updatedEntries;
    }
  }

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function upsertEntry(entry) {
    const entries = loadEntries();
    const index = entries.findIndex((e) => e.date === entry.date);
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    saveEntries(entries);
    return entries;
  }

  function computeTasks(entry) {
    let completed = 0;
    TASK_FIELDS.forEach((key) => {
      if (entry[key]) completed += 1;
    });
    return { completed, total: TASK_FIELDS.length };
  }

  function computeStreak(entries) {
    if (!entries.length) return 0;
    const dates = Array.from(new Set(entries.map((e) => e.date))).sort();
    const last = dates[dates.length - 1];
    if (!last) return 0;
    let streak = 0;
    let current = parseDate(last);
    const dateSet = new Set(dates);
    while (true) {
      const key = formatDate(current);
      if (!dateSet.has(key)) break;
      streak += 1;
      current.setDate(current.getDate() - 1);
    }
    return streak;
  }

  function getMoodEmoji(mood) {
    return moodEmojis[mood] || '';
  }

  function getEncouragementText(entry, streak) {
    const { completed, total } = computeTasks(entry);
    if (streak >= 7) {
      return "Tu construis une belle habitude. Bibi, ta famille et Turtle sont tellement fiers de toi.";
    }
    if (completed === total && total > 0) {
      return "Tu as pris soin de toi à 100% aujourd'hui. Bibi, ta famille et Turtle t'envoient un gros câlin.";
    }
    if (entry.mood && entry.mood <= 2) {
      return "Journée difficile, mais tu n'es pas seule. Bibi, ta famille et Turtle sont juste à côté de toi.";
    }
    if (completed >= Math.round(total * 0.6)) {
      return "Tu avances pas après pas, et c'est déjà beaucoup. Bibi est fier de toi.";
    }
    return "Prends le temps dont tu as besoin. Chaque petit geste compte, et tout le monde est derrière toi.";
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
      toast.classList.add('hidden');
    }, 3500);
  }

  function setActiveTab(tabName) {
    const tabToday = document.getElementById('tab-today');
    const tabHistory = document.getElementById('tab-history');
    const buttons = document.querySelectorAll('.tab-button');
    const floating = document.getElementById('floating-submit');

    if (tabName === 'today') {
      tabToday.classList.add('active');
      tabHistory.classList.remove('active');
      if (floating) floating.classList.remove('hidden');
    } else {
      tabToday.classList.remove('active');
      tabHistory.classList.add('active');
      if (floating) floating.classList.add('hidden');
    }

    buttons.forEach((btn) => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function populateTodayDate() {
    const todayDateEl = document.getElementById('today-date');
    const today = new Date();
    const human = today.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (todayDateEl) {
      todayDateEl.textContent = `Aujourd'hui : ${human}`;
    }
    const todayKey = formatDate(today);
    setDailyQuote(todayKey);
  }

  function populateTodayFromEntry(entry) {
    document.getElementById('drank1L').checked = !!entry.drank1L;
    document.getElementById('medsMorning').checked = !!entry.medsMorning;
    document.getElementById('medsNoon').checked = !!entry.medsNoon;
    document.getElementById('medsEvening').checked = !!entry.medsEvening;
    document.getElementById('mealBreakfast').checked = !!entry.mealBreakfast;
    document.getElementById('mealLunch').checked = !!entry.mealLunch;
    document.getElementById('mealDinner').checked = !!entry.mealDinner;

    document.getElementById('weightKg').value = entry.weightKg != null ? entry.weightKg : '';
    document.getElementById('bpSystolic').value = entry.bpSystolic != null ? entry.bpSystolic : '';
    document.getElementById('bpDiastolic').value = entry.bpDiastolic != null ? entry.bpDiastolic : '';

    document.getElementById('fatigue').checked = !!entry.fatigue;
    document.getElementById('breathless').checked = !!entry.breathless;
    document.getElementById('notes').value = entry.notes || '';

    const moodValueInput = document.getElementById('moodValue');
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach((btn) => btn.classList.remove('selected'));
    if (entry.mood) {
      moodValueInput.value = String(entry.mood);
      const active = document.querySelector(`.mood-btn[data-mood="${entry.mood}"]`);
      if (active) active.classList.add('selected');
    } else {
      moodValueInput.value = '';
    }
  }

  function getTodayEntryFromForm() {
    const today = new Date();
    const dateKey = formatDate(today);

    const drank1L = document.getElementById('drank1L').checked;
    const medsMorning = document.getElementById('medsMorning').checked;
    const medsNoon = document.getElementById('medsNoon').checked;
    const medsEvening = document.getElementById('medsEvening').checked;
    const mealBreakfast = document.getElementById('mealBreakfast').checked;
    const mealLunch = document.getElementById('mealLunch').checked;
    const mealDinner = document.getElementById('mealDinner').checked;

    const weightRaw = document.getElementById('weightKg').value;
    const bpSysRaw = document.getElementById('bpSystolic').value;
    const bpDiaRaw = document.getElementById('bpDiastolic').value;

    const moodValueInput = document.getElementById('moodValue');
    const mood = moodValueInput.value ? Number(moodValueInput.value) : null;

    const fatigue = document.getElementById('fatigue').checked;
    const breathless = document.getElementById('breathless').checked;
    const notes = document.getElementById('notes').value.trim();

    const weightKg = weightRaw !== '' ? Number(weightRaw) : null;
    const bpSystolic = bpSysRaw !== '' ? Number(bpSysRaw) : null;
    const bpDiastolic = bpDiaRaw !== '' ? Number(bpDiaRaw) : null;

    return {
      date: dateKey,
      drank1L,
      medsMorning,
      medsNoon,
      medsEvening,
      mealBreakfast,
      mealLunch,
      mealDinner,
      weightKg,
      bpSystolic,
      bpDiastolic,
      mood,
      fatigue,
      breathless,
      notes,
    };
  }

  async function saveTodayEntryFromForm(options = { showToast: false }) {
    const entry = getTodayEntryFromForm();
    const updatedEntries = await saveEntryToBackend(entry);
    updateTodaySummary(entry);
    renderHistory(updatedEntries);
    updateHeaderAndStreak(updatedEntries);
    updateHistoryStats(updatedEntries);
    if (options.showToast) {
      showToast('Ta journée a bien été enregistrée.');
    }
  }

  function updateTodaySummary(entry) {
    const summaryEl = document.getElementById('today-summary');
    if (!summaryEl) return;
    summaryEl.textContent = '';
  }

  function renderHistory(entries) {
    const emptyEl = document.getElementById('history-empty');
    const contentEl = document.getElementById('history-content');
    const container = document.getElementById('history-body');
    if (!emptyEl || !contentEl || !container) return;

    container.innerHTML = '';

    if (!entries.length) {
      emptyEl.classList.remove('hidden');
      contentEl.classList.add('hidden');
      return;
    }

    emptyEl.classList.add('hidden');
    contentEl.classList.remove('hidden');

    const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));

    sorted.forEach((entry) => {
      const { completed, total } = computeTasks(entry);
      const isPerfect = total > 0 && completed === total;
      const hasSome = total > 0 && completed > 0 && completed < total;
      const ratio = total > 0 ? completed / total : 0;
      const percent = total > 0 ? Math.round(ratio * 100) : 0;

      const card = document.createElement('div');
      let classes =
        'group relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all active:scale-[0.98]';

      if (isPerfect) {
        // Jour parfait (fond vert doux)
        classes += ' bg-success-soft dark:bg-green-900/20';
      } else {
        // Jour normal / incomplet
        classes +=
          ' bg-surface-light dark:bg-surface-dark shadow-sm border border-transparent hover:border-black/5 dark:hover:border-white/5';
      }
      card.className = classes;
      card.dataset.date = entry.date;

      const left = document.createElement('div');
      left.className = 'flex items-center gap-4 flex-1';

      // Icône à gauche
      const iconWrap = document.createElement('div');
      if (isPerfect) {
        iconWrap.className =
          'relative flex items-center justify-center rounded-full bg-white dark:bg-green-800 shrink-0 size-12 shadow-sm';
      } else if (hasSome) {
        iconWrap.className =
          'flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 shrink-0 size-12';
      } else {
        iconWrap.className =
          'flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 shrink-0 size-12';
      }

      const icon = document.createElement('span');
      icon.className = 'material-symbols-outlined text-3xl';
      if (isPerfect) {
        icon.classList.add('text-yellow-500');
        icon.textContent = 'sentiment_very_satisfied';
      } else if (hasSome) {
        icon.classList.add('text-gray-500', 'dark:text-gray-300');
        icon.textContent = 'sentiment_neutral';
      } else {
        icon.classList.add('text-gray-400');
        icon.textContent = 'sentiment_dissatisfied';
      }
      iconWrap.appendChild(icon);

      if (isPerfect) {
        // Petit cœur en bas à droite comme dans le design
        const favWrap = document.createElement('div');
        favWrap.className =
          'absolute -bottom-1 -right-1 bg-white dark:bg-surface-dark rounded-full p-0.5';
        const favIcon = document.createElement('span');
        favIcon.className = 'material-symbols-outlined text-[16px] text-primary';
        favIcon.textContent = 'favorite';
        favWrap.appendChild(favIcon);
        iconWrap.appendChild(favWrap);
      }

      const textCol = document.createElement('div');
      textCol.className = 'flex flex-col gap-1 overflow-hidden';

      const titleRow = document.createElement('div');
      titleRow.className = 'flex items-center gap-2';

      const dateP = document.createElement('p');
      dateP.className =
        'text-[#1b0d11] dark:text-white text-base font-semibold leading-tight truncate';
      dateP.textContent = formatDateHuman(entry.date);
      titleRow.appendChild(dateP);

      if (isPerfect) {
        const badge = document.createElement('span');
        badge.className =
          'shrink-0 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 text-[10px] font-semibold uppercase tracking-wide';
        badge.textContent = 'Parfait !';
        titleRow.appendChild(badge);
      }

      let secondLine;
      if (hasSome) {
        // Barre de progression comme dans la carte moyenne
        secondLine = document.createElement('div');
        secondLine.className = 'flex items-center gap-2';

        const barBg = document.createElement('div');
        barBg.className =
          'h-1.5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden';
        const barFill = document.createElement('div');
        barFill.className = 'h-full bg-primary rounded-full';
        const safePercent = Math.max(5, Math.min(percent, 100));
        barFill.style.width = `${safePercent}%`;
        barBg.appendChild(barFill);
        secondLine.appendChild(barBg);
      } else {
        // Jour de repos ou aucune mission
        secondLine = document.createElement('p');
        secondLine.className =
          'text-gray-400 dark:text-gray-500 text-xs font-medium leading-normal truncate';
        secondLine.textContent = '';
      }

      textCol.appendChild(titleRow);
      textCol.appendChild(secondLine);

      left.appendChild(iconWrap);
      left.appendChild(textCol);

      const right = document.createElement('div');
      right.className = 'shrink-0 flex items-center gap-2';

      const shareBtn = document.createElement('button');
      shareBtn.type = 'button';
      shareBtn.title = 'Partager';
      shareBtn.className = 'h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors';
      const shareIcon = document.createElement('span');
      shareIcon.className = 'material-symbols-outlined';
      shareIcon.textContent = 'ios_share';
      shareBtn.appendChild(shareIcon);
      shareBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        shareVictoryForEntry(entry);
      });
      right.appendChild(shareBtn);

      const circle = document.createElement('div');
      circle.className =
        'h-10 w-10 flex items-center justify-center rounded-full bg-white/50 dark:bg-black/20 group-hover:bg-white dark:group-hover:bg-black/40 transition-colors';
      const chevron = document.createElement('span');
      chevron.className =
        'material-symbols-outlined text-success-text dark:text-green-300';
      chevron.textContent = 'chevron_right';
      circle.appendChild(chevron);
      right.appendChild(circle);

      card.appendChild(left);
      card.appendChild(right);

      card.addEventListener('click', () => {
        openDetailOverlay(entry);
      });

      container.appendChild(card);
    });
  }

  function updateHistoryStats(entries) {
    const streakDaysEl = document.getElementById('history-streak-days');
    const successRateEl = document.getElementById('history-success-rate');
    if (!streakDaysEl) return;

    const streak = computeStreak(entries);
    streakDaysEl.textContent = String(streak);

    if (successRateEl) {
      successRateEl.textContent = '';
      if (successRateEl.parentElement) {
        successRateEl.parentElement.style.display = 'none';
      }
    }
  }

  function updateHeaderAndStreak(entries) {
    const streak = computeStreak(entries);
    const streakLine = document.getElementById('streak-line');
    if (streakLine) {
      if (streak > 0) {
        streakLine.textContent = `Tu as pris soin de toi ${streak} jour(s) de suite.`;
      } else {
        streakLine.textContent = '';
      }
    }
  }

  function showSuccessOverlay(entries) {
    const overlay = document.getElementById('success-overlay');
    const streakText = document.getElementById('success-streak-text');
    const successImage = document.getElementById('success-image');
    if (!overlay) return;

    const streak = computeStreak(entries);
    if (streakText) {
      if (streak >= 2) {
        streakText.textContent = `${streak} jour(s) de suite, bravo !`;
      } else {
        streakText.textContent = 'Jolie série en cours !';
      }
    }

    // Image dynamique aléatoire sans répétition (cycle mélangé)
    if (successImage) {
      const todayKey = formatDate(new Date());
      const imageUrl = getSuccessImageForDate(todayKey);
      successImage.style.backgroundImage = `url('${imageUrl}')`;
    }

    // Ajoute un gros bouton "Partager ma victoire" sous le visuel (UI améliorée)
    const existingCta = document.getElementById('success-share-cta');
    if (!existingCta) {
      const overlayMain = overlay.querySelector('main');
      if (overlayMain) {
        const btn = document.createElement('button');
        btn.id = 'success-share-cta';
        btn.type = 'button';
        btn.className =
          'w-full bg-primary hover:bg-red-600 text-white font-bold py-3 px-4 rounded-full shadow-[0_8px_20px_rgba(238,43,91,0.4)] transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 text-sm mt-2 mb-6';
        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined text-base';
        icon.textContent = 'ios_share';
        const label = document.createElement('span');
        label.textContent = 'Partager ma victoire';
        btn.appendChild(icon);
        btn.appendChild(label);
        btn.addEventListener('click', async () => {
          await shareVictory();
        });

        // Insère juste après le conteneur du visuel si possible
        let visualContainer = successImage;
        while (
          visualContainer &&
          !(visualContainer.className && String(visualContainer.className).includes('aspect-square'))
        ) {
          visualContainer = visualContainer.parentElement;
        }
        if (visualContainer && visualContainer.parentElement === overlayMain) {
          overlayMain.insertBefore(btn, visualContainer.nextSibling);
        } else {
          overlayMain.appendChild(btn);
        }
      }
    }

    overlay.classList.remove('hidden');
  }

  function toCsvValue(value) {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  }

  function exportForDoctor(entries, existingWindow) {
    if (!entries.length) {
      showToast("Pas encore de journée à exporter.");
      return;
    }
    const sorted = entries
      .slice()
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    const fromDate = formatDateHuman(sorted[0].date);
    const toDate = formatDateHuman(sorted[sorted.length - 1].date);

    const buildBool = (v) => (v ? 'Oui' : 'Non');

    const rowsHtml = sorted
      .map((e) => {
        const date = formatDateHuman(e.date);
        const weight = e.weightKg != null ? `${e.weightKg} kg` : '—';
        const bp =
          e.bpSystolic != null && e.bpDiastolic != null
            ? `${e.bpSystolic}/${e.bpDiastolic} mmHg`
            : '—';
        const mood = e.mood != null ? `${e.mood}/5` : '—';
        const meds = [
          e.medsMorning && 'matin',
          e.medsNoon && 'midi',
          e.medsEvening && 'soir',
        ]
          .filter(Boolean)
          .join(', ') || '—';
        const meals = [
          e.mealBreakfast && 'petit déj',
          e.mealLunch && 'déjeuner',
          e.mealDinner && 'dîner',
        ]
          .filter(Boolean)
          .join(', ') || '—';
        const symptoms = [
          e.fatigue && 'Fatigue',
          e.breathless && 'Essoufflée',
        ]
          .filter(Boolean)
          .join(', ') || 'Aucun';
        const notes =
          e.notes && e.notes.trim()
            ? e.notes
                .trim()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
            : '';

        return `
          <tr>
            <td>${date}</td>
            <td>${weight}</td>
            <td>${bp}</td>
            <td>${mood}</td>
            <td>${buildBool(e.drank1L)}</td>
            <td>${meds}</td>
            <td>${meals}</td>
            <td>${symptoms}</td>
            <td class="notes">${notes}</td>
          </tr>`;
      })
      .join('');

    const docHtml = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <title>Suivi de Capucine - Export médecin</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              margin: 24px;
              background: #ffffff;
              color: #1b0d11;
            }
            h1 {
              font-size: 20px;
              margin-bottom: 4px;
            }
            h2 {
              font-size: 14px;
              margin-top: 0;
              color: #666;
            }
            .meta {
              font-size: 12px;
              margin-bottom: 16px;
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            thead {
              background: #fce4ec;
            }
            th, td {
              border: 1px solid #e0e0e0;
              padding: 6px 8px;
              vertical-align: top;
            }
            th {
              text-align: left;
              font-weight: 600;
            }
            tbody tr:nth-child(even) {
              background: #fafafa;
            }
            .notes {
              white-space: pre-wrap;
            }
            @media print {
              body {
                margin: 8mm;
              }
            }
          </style>
        </head>
        <body>
          <h1>Suivi quotidien de Capucine</h1>
          <h2>Export pour le médecin</h2>
          <div class="meta">
            Période : du ${fromDate} au ${toDate}<br />
            Généré le ${new Date().toLocaleString('fr-FR')}
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Poids</th>
                <th>Tension</th>
                <th>Humeur</th>
                <th>Hydratation (≥1L)</th>
                <th>Médicaments</th>
                <th>Repas</th>
                <th>Symptômes</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>`;

    let win = existingWindow;
    if (!win) {
      win = window.open('', '_blank');
      if (!win) {
        showToast("Impossible d'ouvrir le rapport. Vérifie que les fenêtres pop-up sont autorisées.");
        return;
      }
    }
    win.document.open();
    win.document.write(docHtml);
    win.document.close();
    win.focus();
    // Ouvre directement la boîte de dialogue d'impression pour permettre l'enregistrement en PDF
    try {
      win.print();
    } catch (_) {
      // si le navigateur bloque, le médecin pourra lancer l'impression manuellement
    }
  }

  function setupMoodButtons() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const moodValueInput = document.getElementById('moodValue');
    moodButtons.forEach((btn) => {
      btn.textContent = getMoodEmoji(Number(btn.dataset.mood));
      btn.addEventListener('click', () => {
        const value = btn.dataset.mood;
        moodValueInput.value = value;
        moodButtons.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        saveTodayEntryFromForm({ showToast: false });
      });
    });
  }

  function setupAutoSaveForTodayForm() {
    const autoSave = () => saveTodayEntryFromForm({ showToast: false });

    const checkboxIds = [
      'drank1L',
      'medsMorning',
      'medsNoon',
      'medsEvening',
      'mealBreakfast',
      'mealLunch',
      'mealDinner',
      'fatigue',
      'breathless',
    ];

    checkboxIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', autoSave);
      }
    });

    const inputIds = ['weightKg', 'bpSystolic', 'bpDiastolic', 'notes'];

    inputIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', autoSave);
      }
    });
  }

  async function init() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        setActiveTab(btn.dataset.tab);
      });
    });

    // État initial: onglet Aujourd'hui visible => bouton flottant visible
    setActiveTab('today');

    setupMoodButtons();
    populateTodayDate();

    const entries = await fetchEntriesFromBackend();
    const todayKey = formatDate(new Date());
    const todayEntry = entries.find((e) => e.date === todayKey);
    if (todayEntry) {
      populateTodayFromEntry(todayEntry);
      updateTodaySummary(todayEntry);
    }

    renderHistory(entries);
    updateHeaderAndStreak(entries);
    updateHistoryStats(entries);

    // Deep-linking : si l’URL contient ?tab=history&date=YYYY-MM-DD,
    // on ouvre directement l’onglet Historique et, si possible, la journée ciblée.
    try {
      const params = new URLSearchParams(window.location.search || '');
      const initialTab = params.get('tab');
      const targetDate = params.get('date');

      if (initialTab === 'history') {
        setActiveTab('history');
        if (targetDate) {
          const targetEntry = entries.find((e) => e.date === targetDate);
          if (targetEntry) {
            openDetailOverlay(targetEntry);
          }
        }
      }
    } catch (_) {
      // si l'URL n'est pas exploitable, on ignore simplement
    }

    setupAutoSaveForTodayForm();

    const form = document.getElementById('today-form');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        saveTodayEntryFromForm({ showToast: true });
        const allEntries = loadEntries();
        showSuccessOverlay(allEntries);
      });
    }

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        // Ouvre la fenêtre tout de suite pour éviter les blocages de pop-up sur mobile
        const win = window.open('', '_blank');
        const allEntries = await fetchEntriesFromBackend();
        exportForDoctor(allEntries, win);
      });
    }

    const overlay = document.getElementById('success-overlay');
    const closeBtn = document.getElementById('success-close');
    const mainCta = document.getElementById('success-main-cta');
    const secondaryCta = document.getElementById('success-secondary-cta');
    const overlayShareBtn = document.getElementById('success-share');

    const hideOverlay = () => {
      if (overlay) overlay.classList.add('hidden');
    };

    if (closeBtn) closeBtn.addEventListener('click', hideOverlay);
    if (mainCta)
      mainCta.addEventListener('click', () => {
        // Ferme l'overlay de succès
        hideOverlay();
        // Bascule vers l'onglet Historique
        setActiveTab('history');
        // Ouvre directement la fiche détail de la journée enregistrée (aujourd'hui)
        const all = loadEntries();
        const todayKey = formatDate(new Date());
        const entry = all.find((e) => e.date === todayKey);
        if (entry) {
          openDetailOverlay(entry);
        }
      });
    if (secondaryCta)
      secondaryCta.addEventListener('click', async () => {
        await shareVictory();
        hideOverlay();
      });

    if (overlayShareBtn)
      overlayShareBtn.addEventListener('click', async () => {
        await shareVictory();
      });

    // Overlay détail & modification
    const detailOverlay = document.getElementById('detail-overlay');
    const detailBack = document.getElementById('detail-back');
    const detailEdit = document.getElementById('detail-edit');
    const editOverlay = document.getElementById('edit-overlay');
    const editCancel = document.getElementById('edit-cancel');
    const editSave = document.getElementById('edit-save');

    const editWeight = document.getElementById('edit-weight');
    const editBpSys = document.getElementById('edit-bp-sys');
    const editBpDia = document.getElementById('edit-bp-dia');
    const editDrank1L = document.getElementById('edit-drank1L');
    const editMedsMorning = document.getElementById('edit-medsMorning');
    const editMedsNoon = document.getElementById('edit-medsNoon');
    const editMedsEvening = document.getElementById('edit-medsEvening');
    const editMealBreakfast = document.getElementById('edit-mealBreakfast');
    const editMealLunch = document.getElementById('edit-mealLunch');
    const editMealDinner = document.getElementById('edit-mealDinner');
    const editMoodValue = document.getElementById('edit-moodValue');
    const editMoodButtons = document.querySelectorAll('.edit-mood-btn');
    const editFatigue = document.getElementById('edit-fatigue');
    const editBreathless = document.getElementById('edit-breathless');
    const editNotes = document.getElementById('edit-notes');

    const hideDetail = () => {
      if (detailOverlay) detailOverlay.classList.add('hidden');
    };

    if (detailBack) detailBack.addEventListener('click', hideDetail);

    const openEditFromDetail = () => {
      if (!detailOverlay || !editOverlay) return;
      const date = detailOverlay.dataset.date;
      if (!date) return;
      const entriesAll = loadEntries();
      const entry = entriesAll.find((e) => e.date === date);
      if (!entry) return;

      if (editWeight) {
        editWeight.value =
          entry.weightKg != null && !Number.isNaN(entry.weightKg)
            ? String(entry.weightKg)
            : '';
      }
      if (editBpSys) {
        editBpSys.value =
          entry.bpSystolic != null && !Number.isNaN(entry.bpSystolic)
            ? String(entry.bpSystolic)
            : '';
      }
      if (editBpDia) {
        editBpDia.value =
          entry.bpDiastolic != null && !Number.isNaN(entry.bpDiastolic)
            ? String(entry.bpDiastolic)
            : '';
      }
      if (editMoodValue) {
        editMoodValue.value = entry.mood != null ? String(entry.mood) : '';
      }
      if (editMoodButtons && editMoodButtons.length) {
        editMoodButtons.forEach((btn) => {
          btn.classList.remove('ring-2', 'ring-primary', 'bg-primary/10');
          const value = Number(btn.dataset.mood);
          if (entry.mood === value) {
            btn.classList.add('ring-2', 'ring-primary', 'bg-primary/10');
          }
        });
      }
      if (editDrank1L) editDrank1L.checked = !!entry.drank1L;
      if (editMedsMorning) editMedsMorning.checked = !!entry.medsMorning;
      if (editMedsNoon) editMedsNoon.checked = !!entry.medsNoon;
      if (editMedsEvening) editMedsEvening.checked = !!entry.medsEvening;
      if (editMealBreakfast)
        editMealBreakfast.checked = !!entry.mealBreakfast;
      if (editMealLunch) editMealLunch.checked = !!entry.mealLunch;
      if (editMealDinner) editMealDinner.checked = !!entry.mealDinner;
      if (editFatigue) editFatigue.checked = !!entry.fatigue;
      if (editBreathless) editBreathless.checked = !!entry.breathless;
      if (editNotes) editNotes.value = entry.notes || '';

      editOverlay.dataset.date = date;
      editOverlay.classList.remove('hidden');
    };

    if (detailEdit) detailEdit.addEventListener('click', openEditFromDetail);

    const hideEdit = () => {
      if (editOverlay) editOverlay.classList.add('hidden');
    };

    if (editCancel) editCancel.addEventListener('click', hideEdit);

    if (editSave) {
      editSave.addEventListener('click', async () => {
        if (!editOverlay) return;
        const date = editOverlay.dataset.date;
        if (!date) return;

        const entriesAll = loadEntries();
        const idx = entriesAll.findIndex((e) => e.date === date);
        if (idx === -1) return;

        const entry = { ...entriesAll[idx] };

        if (editWeight) {
          const v = editWeight.value.trim();
          entry.weightKg = v !== '' ? Number(v) : null;
        }
        if (editBpSys) {
          const v = editBpSys.value.trim();
          entry.bpSystolic = v !== '' ? Number(v) : null;
        }
        if (editBpDia) {
          const v = editBpDia.value.trim();
          entry.bpDiastolic = v !== '' ? Number(v) : null;
        }
        if (editMoodValue) {
          const v = editMoodValue.value.trim();
          entry.mood = v !== '' ? Number(v) : null;
        }
        if (editDrank1L) entry.drank1L = !!editDrank1L.checked;
        if (editMedsMorning) entry.medsMorning = !!editMedsMorning.checked;
        if (editMedsNoon) entry.medsNoon = !!editMedsNoon.checked;
        if (editMedsEvening) entry.medsEvening = !!editMedsEvening.checked;
        if (editMealBreakfast)
          entry.mealBreakfast = !!editMealBreakfast.checked;
        if (editMealLunch) entry.mealLunch = !!editMealLunch.checked;
        if (editMealDinner) entry.mealDinner = !!editMealDinner.checked;
        if (editFatigue) entry.fatigue = !!editFatigue.checked;
        if (editBreathless) entry.breathless = !!editBreathless.checked;
        if (editNotes) entry.notes = editNotes.value.trim();

        const updatedEntries = await saveEntryToBackend(entry);

        // Met à jour tous les écrans concernés
        const todayKey = formatDate(new Date());
        if (entry.date === todayKey) {
          populateTodayFromEntry(entry);
          updateTodaySummary(entry);
        }
        renderHistory(updatedEntries);
        updateHeaderAndStreak(updatedEntries);
        updateHistoryStats(updatedEntries);
        openDetailOverlay(entry);
        hideEdit();
      });
    }

    if (editMoodButtons && editMoodButtons.length && editMoodValue) {
      editMoodButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const value = btn.dataset.mood;
          editMoodValue.value = value;
          editMoodButtons.forEach((b) =>
            b.classList.remove('ring-2', 'ring-primary', 'bg-primary/10')
          );
          btn.classList.add('ring-2', 'ring-primary', 'bg-primary/10');
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
