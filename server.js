const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const gamesRouter = require('./routes/games');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/games', gamesRouter);
app.use('/api/igdb', require('./routes/igdb'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});