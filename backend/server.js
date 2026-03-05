const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Game = require('./models/Game');
const gamesRouter = require('./routes/games');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gamelibrary')
  .then(async () => {
    console.log('Connected to MongoDB');
    // Seed database if empty
    const count = await Game.countDocuments();
    if (count === 0) {
      console.log('Database empty, seeding with initial data from games.json');
      try {
        const data = fs.readFileSync(path.join(__dirname, 'games.json'), 'utf8');
        const games = JSON.parse(data);
        await Game.insertMany(games);
        console.log('Database seeded successfully');
      } catch (err) {
        console.error('Error seeding database:', err);
      }
    }
  }).catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.use('/api/games', gamesRouter);
app.use('/api/igdb', require('./routes/igdb'));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});