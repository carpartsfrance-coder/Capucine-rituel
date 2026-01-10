const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
    // Index de la pensée du jour (dans DAILY_QUOTES côté front)
    quoteIndex: Number,
    // Index de la photo de récompense (dans SUCCESS_IMAGES côté front)
    successImageIndex: Number,
  },
  {
    timestamps: true,
  }
);

const Entry = mongoose.model('Entry', entrySchema);

// Front statique : sert index.html, app.js, style.css depuis le dossier parent
const FRONT_DIR = path.join(__dirname, '..');
app.use(express.static(FRONT_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(FRONT_DIR, 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/entries', async (req, res) => {
  try {
    const entries = await Entry.find({}).sort({ date: 1 });
    res.json(entries);
  } catch (err) {
    console.error('Erreur GET /entries :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des entrées.' });
  }
});

app.post('/entries', async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.date) {
      return res.status(400).json({ error: 'Le champ "date" est obligatoire.' });
    }

    const update = {
      date: data.date,
      drank1L: !!data.drank1L,
      medsMorning: !!data.medsMorning,
      medsNoon: !!data.medsNoon,
      medsEvening: !!data.medsEvening,
      mealBreakfast: !!data.mealBreakfast,
      mealLunch: !!data.mealLunch,
      mealDinner: !!data.mealDinner,
      weightKg: data.weightKg ?? null,
      bpSystolic: data.bpSystolic ?? null,
      bpDiastolic: data.bpDiastolic ?? null,
      mood: data.mood ?? null,
      fatigue: !!data.fatigue,
      breathless: !!data.breathless,
      sleepQuality: data.sleepQuality || null,
      notes: data.notes || '',
      quoteIndex:
        typeof data.quoteIndex === 'number' && !Number.isNaN(data.quoteIndex)
          ? data.quoteIndex
          : null,
      successImageIndex:
        typeof data.successImageIndex === 'number' && !Number.isNaN(data.successImageIndex)
          ? data.successImageIndex
          : null,
    };

    const entry = await Entry.findOneAndUpdate(
      { date: data.date },
      update,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json(entry);
  } catch (err) {
    console.error('Erreur POST /entries :', err);
    res.status(500).json({ error: 'Erreur serveur lors de lenregistrement de la journée.' });
  }
});

app.listen(port, () => {
  console.log(`Serveur backend en écoute sur le port ${port}`);
});
