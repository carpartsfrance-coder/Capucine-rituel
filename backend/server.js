const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3001;

// --- Sécurité ---------------------------------------------------------------

// Helmet : en-têtes de sécurité raisonnables. CSP désactivée car le front
// charge Tailwind/Google Fonts via CDN ; à durcir plus tard.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS : si ALLOWED_ORIGIN est défini on restreint, sinon on garde le
// comportement actuel (ouvert) pour ne pas casser le déploiement existant.
const allowedOrigin = process.env.ALLOWED_ORIGIN || null;
app.use(
  cors({
    origin: allowedOrigin || true,
    methods: ['GET', 'POST'],
  })
);

app.use(express.json({ limit: '6mb' }));

// Rate-limit générique sur l'API (60 req/min/IP, suffisant pour un usage perso)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/entries', apiLimiter);

// Auth par token partagé : si CAPUCINE_TOKEN est défini dans .env, toute
// requête sur /entries doit présenter `Authorization: Bearer <token>` ou
// l'en-tête `X-Capucine-Token`. Sinon, l'app reste ouverte (compat).
const sharedToken = process.env.CAPUCINE_TOKEN || null;
function requireToken(req, res, next) {
  if (!sharedToken) return next();
  const auth = req.get('authorization') || '';
  const bearer = auth.toLowerCase().startsWith('bearer ')
    ? auth.slice(7).trim()
    : null;
  const headerToken = req.get('x-capucine-token') || null;
  const provided = bearer || headerToken;
  if (provided && provided === sharedToken) return next();
  return res.status(401).json({ error: 'Token manquant ou invalide.' });
}

// --- DB ---------------------------------------------------------------------

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI manquant dans le fichier .env');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Connecté à MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB :', err);
    process.exit(1);
  });

const entrySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true },
    drank1L: Boolean,
    medsMorning: Boolean,
    medsNoon: Boolean,
    medsEvening: Boolean,
    mealBreakfast: Boolean,
    mealLunch: Boolean,
    mealDinner: Boolean,
    weightKg: Number,
    bpSystolic: Number,
    bpDiastolic: Number,
    mood: Number,
    fatigue: Boolean,
    breathless: Boolean,
    sleepQuality: String,
    notes: String,
    painLevel: Number,
    painZones: [String],
    nausea: Boolean,
    dizziness: Boolean,
    contractions: Boolean,
    customTags: [String],
    medsReminders: { type: Object, default: undefined },
  },
  {
    timestamps: true,
  }
);

const Entry = mongoose.model('Entry', entrySchema);

// --- Validation -------------------------------------------------------------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLEEP_VALUES = new Set(['oui', 'non', 'cauchemar']);
const PAIN_ZONES = new Set([
  'tete', 'poitrine', 'ventre', 'dos', 'bras-g', 'bras-d', 'jambe-g', 'jambe-d', 'bassin',
]);

function pickNumber(value, { min, max }) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n < min || n > max) return null;
  return n;
}

function pickSleep(value) {
  if (typeof value !== 'string' || !value) return null;
  const seen = new Set();
  const out = [];
  for (const raw of value.split(',')) {
    const p = raw.trim();
    if (SLEEP_VALUES.has(p) && !seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }
  return out.length ? out.join(',') : null;
}

function sanitizeEntry(data) {
  if (!data || typeof data !== 'object') {
    return { error: 'Corps de requête invalide.' };
  }
  if (!data.date || typeof data.date !== 'string' || !DATE_RE.test(data.date)) {
    return { error: 'Le champ "date" est obligatoire (format YYYY-MM-DD).' };
  }

  const notes = typeof data.notes === 'string' ? data.notes.slice(0, 5000) : '';

  const entry = {
    date: data.date,
    drank1L: !!data.drank1L,
    medsMorning: !!data.medsMorning,
    medsNoon: !!data.medsNoon,
    medsEvening: !!data.medsEvening,
    mealBreakfast: !!data.mealBreakfast,
    mealLunch: !!data.mealLunch,
    mealDinner: !!data.mealDinner,
    weightKg: pickNumber(data.weightKg, { min: 20, max: 300 }),
    bpSystolic: pickNumber(data.bpSystolic, { min: 50, max: 260 }),
    bpDiastolic: pickNumber(data.bpDiastolic, { min: 30, max: 200 }),
    mood: pickNumber(data.mood, { min: 1, max: 5 }),
    fatigue: !!data.fatigue,
    breathless: !!data.breathless,
    sleepQuality: pickSleep(data.sleepQuality),
    notes,
    painLevel: pickNumber(data.painLevel, { min: 0, max: 10 }),
    painZones: Array.isArray(data.painZones)
      ? Array.from(
          new Set(
            data.painZones
              .filter((z) => typeof z === 'string')
              .map((z) => z.trim())
              .filter((z) => PAIN_ZONES.has(z))
          )
        )
      : [],
    nausea: !!data.nausea,
    dizziness: !!data.dizziness,
    contractions: !!data.contractions,
    customTags: Array.isArray(data.customTags)
      ? data.customTags
          .filter((t) => typeof t === 'string')
          .map((t) => t.trim().slice(0, 30))
          .filter(Boolean)
          .slice(0, 10)
      : [],
    medsReminders:
      data.medsReminders && typeof data.medsReminders === 'object'
        ? sanitizeReminders(data.medsReminders)
        : undefined,
  };

  return { entry };
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
function sanitizeReminders(obj) {
  const out = {};
  for (const slot of ['morning', 'noon', 'evening']) {
    const v = obj[slot];
    if (v && typeof v === 'object') {
      const time = typeof v.time === 'string' && TIME_RE.test(v.time) ? v.time : null;
      const enabled = !!v.enabled;
      if (time) out[slot] = { time, enabled };
    }
  }
  return Object.keys(out).length ? out : undefined;
}

// --- Routes -----------------------------------------------------------------

// Front statique : sert index.html, app.js, style.css depuis le dossier parent
const FRONT_DIR = path.join(__dirname, '..');
app.use(express.static(FRONT_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(FRONT_DIR, 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/entries', requireToken, async (req, res) => {
  try {
    const entries = await Entry.find({}).sort({ date: 1 });
    res.json(entries);
  } catch (err) {
    console.error('Erreur GET /entries :', err);
    res
      .status(500)
      .json({ error: 'Erreur serveur lors de la récupération des entrées.' });
  }
});

app.post('/entries', requireToken, async (req, res) => {
  try {
    const { entry: update, error } = sanitizeEntry(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    const entry = await Entry.findOneAndUpdate({ date: update.date }, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    res.json(entry);
  } catch (err) {
    if (err && err.code === 11000) {
      // Conflit de clé dupliquée (race upsert) : on retourne l'existant.
      try {
        const existing = await Entry.findOne({ date: req.body && req.body.date });
        if (existing) return res.json(existing);
      } catch (_) {}
    }
    console.error('Erreur POST /entries :', err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de l'enregistrement de la journée." });
  }
});

// --- Bisou à Bibi via ntfy.sh --------------------------------------------
// Si NTFY_TOPIC est défini, POST /kiss envoie une notif vers ntfy.sh.
const ntfyTopic = process.env.NTFY_TOPIC || null;
const ntfyServer = process.env.NTFY_SERVER || 'https://ntfy.sh';
const publicBaseUrl = process.env.PUBLIC_BASE_URL || allowedOrigin || '';

// Modèles de bisous (clé envoyée par le front → message + tags)
// Tags ntfy : https://docs.ntfy.sh/emojis/
const KISS_TYPES = {
  bisou:  { title: 'Bisou de Capucine',  body: 'Capucine t\'envoie un bisou tout doux',     tags: 'kissing_heart,heart' },
  calin:  { title: 'Calin de Capucine',  body: 'Capucine t\'envoie un gros calin',          tags: 'people_hugging,sparkling_heart' },
  pense:  { title: 'Capucine pense a toi', body: 'Capucine pense fort a toi en ce moment',   tags: 'cherry_blossom,sparkles' },
  force:  { title: 'Capucine a besoin de force', body: 'Capucine a besoin de douceur, peux-tu lui repondre ?', tags: 'muscle,heart' },
};

// Schemas pour le compteur et les réponses de Bibi -----------------------
const kissLogSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'bisou' },
    message: String,
    hour: Number,
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
const KissLog = mongoose.model('KissLog', kissLogSchema);

const bibiReplySchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // love, hug, call, coming, here
    label: String,
    receivedAt: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const BibiReply = mongoose.model('BibiReply', bibiReplySchema);

const REPLY_TYPES = {
  love:   { label: 'Bibi t\'aime fort',         emoji: '❤️' },
  hug:    { label: 'Bibi t\'envoie un calin',   emoji: '🤗' },
  call:   { label: 'Bibi va t\'appeler',        emoji: '📞' },
  coming: { label: 'Bibi arrive',               emoji: '🚗' },
  here:   { label: 'Bibi est avec toi',         emoji: '🌸' },
};

function buildReplyActions(token) {
  // Les actions ntfy http permettent à Bibi de répondre depuis la notif.
  // Format : "http, Label, URL, method=POST, headers=..."
  // On embed le token dans l'URL pour authentifier sans browser.
  if (!publicBaseUrl) return null;
  const base = publicBaseUrl.replace(/\/$/, '');
  const t = encodeURIComponent(token || '');
  const mk = (type, label) =>
    `http, ${label}, ${base}/reply?type=${type}&t=${t}, method=POST, clear=true`;
  // ntfy limite à 3 action buttons par notification
  return [
    mk('love', 'Je t\'aime'),
    mk('hug', 'Calin'),
    mk('call', 'J\'appelle'),
  ].join('; ');
}

app.post('/kiss', requireToken, async (req, res) => {
  try {
    const data = req.body || {};
    const type = KISS_TYPES[data.type] ? data.type : 'bisou';
    const tpl = KISS_TYPES[type];
    const userMsg = typeof data.message === 'string' ? data.message.slice(0, 200).trim() : '';
    const finalMessage = userMsg || tpl.body;

    // Compte total + log (best-effort, ne bloque pas l'envoi)
    let count = 0;
    try {
      await KissLog.create({ type, message: userMsg || null, hour: new Date().getHours() });
      count = await KissLog.countDocuments({});
    } catch (e) {
      console.warn('KissLog write failed:', e.message);
    }

    if (!ntfyTopic) {
      return res.json({ ok: true, delivered: false, reason: 'no-topic', count });
    }

    const url = `${ntfyServer.replace(/\/$/, '')}/${encodeURIComponent(ntfyTopic)}`;

    // Message bonus aux jalons
    let bodyToSend = finalMessage;
    const milestone = [10, 25, 50, 100, 250, 500, 1000].includes(count);
    if (milestone) {
      bodyToSend += `\n\n🎉 ${count}eme bisou envoye a Bibi !`;
    }

    // Headers ntfy : tout ASCII (pas d'emoji)
    const headers = {
      Title: tpl.title,
      Priority: type === 'force' ? 'high' : 'default',
      Tags: tpl.tags,
    };
    const actions = buildReplyActions(sharedToken);
    if (actions) headers.Actions = actions;

    let r;
    // Si une image est jointe (base64), on envoie en deux étapes :
    // d'abord la photo (PUT body=binary), puis le message texte avec la même tag.
    if (typeof data.imageBase64 === 'string' && data.imageBase64.startsWith('data:image/')) {
      try {
        const m = data.imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (m) {
          const mime = m[1];
          const buf = Buffer.from(m[2], 'base64');
          if (buf.length < 5 * 1024 * 1024) {
            await fetch(url, {
              method: 'PUT',
              headers: {
                'Content-Type': mime,
                Filename: 'capucine.jpg',
                Title: tpl.title,
                Tags: tpl.tags,
                Message: 'Photo de Capucine',
              },
              body: buf,
            });
          }
        }
      } catch (e) {
        console.warn('Image upload to ntfy failed:', e.message);
      }
    }

    r = await fetch(url, {
      method: 'POST',
      headers,
      body: bodyToSend,
    });

    return res.json({ ok: r.ok, delivered: r.ok, count, milestone });
  } catch (err) {
    console.error('Erreur POST /kiss :', err);
    return res.status(500).json({ error: 'Impossible d\'envoyer le bisou.' });
  }
});

// GET stats : compteur + dernières réponses de Bibi
app.get('/kiss-stats', requireToken, async (req, res) => {
  try {
    const count = await KissLog.countDocuments({}).catch(() => 0);
    const replies = await BibiReply.find({}).sort({ receivedAt: -1 }).limit(5).lean().catch(() => []);
    return res.json({ count, replies });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur stats bisous.' });
  }
});

// POST /reply : appelé depuis les action buttons ntfy de Bibi.
// Authent par query param ?t=<token> (compat ntfy qui ne sait pas envoyer
// d'en-tête Authorization).
app.post('/reply', async (req, res) => {
  try {
    if (sharedToken) {
      const t = (req.query && req.query.t) || '';
      if (t !== sharedToken) {
        return res.status(401).json({ error: 'token invalide' });
      }
    }
    const type = (req.query && req.query.type) || (req.body && req.body.type) || '';
    if (!REPLY_TYPES[type]) {
      return res.status(400).json({ error: 'type invalide' });
    }
    const reply = await BibiReply.create({ type, label: REPLY_TYPES[type].label });
    return res.json({ ok: true, reply: { type, label: reply.label, receivedAt: reply.receivedAt } });
  } catch (err) {
    console.error('Erreur POST /reply :', err);
    return res.status(500).json({ error: 'Erreur reply.' });
  }
});

// POST /replies/seen : marque toutes les réponses comme vues
app.post('/replies/seen', requireToken, async (req, res) => {
  try {
    await BibiReply.updateMany({ seen: false }, { $set: { seen: true } });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur seen.' });
  }
});

app.listen(port, () => {
  console.log(`Serveur backend en écoute sur le port ${port}`);
  if (!sharedToken) {
    console.warn(
      "[!] CAPUCINE_TOKEN non défini : l'API /entries est ouverte sans authentification."
    );
  }
  if (!allowedOrigin) {
    console.warn(
      '[!] ALLOWED_ORIGIN non défini : CORS ouvert à toutes les origines.'
    );
  }
});
