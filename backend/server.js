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

app.use(express.json({ limit: '64kb' }));

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
  },
  {
    timestamps: true,
  }
);

const Entry = mongoose.model('Entry', entrySchema);

// --- Validation -------------------------------------------------------------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLEEP_VALUES = new Set(['oui', 'non', 'cauchemar']);

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
  };

  return { entry };
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
