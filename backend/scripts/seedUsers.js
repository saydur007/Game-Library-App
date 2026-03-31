/**
 * Seed test users for development/demo purposes.
 *
 * Usage:
 *   cd backend
 *   node scripts/seedUsers.js
 *
 * Requires MongoDB to be running locally (or set MONGODB_URI in .env).
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gamelibrary';

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true },
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  steamId:      { type: String, default: null },
  createdAt:    { type: Date,   default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const TEST_USERS = [
  { username: 'alice',   email: 'alice@test.com',   password: 'password123' },
  { username: 'bob',     email: 'bob@test.com',     password: 'password123' },
  { username: 'charlie', email: 'charlie@test.com', password: 'password123' },
];

async function seed() {
  console.log(`Connecting to ${MONGODB_URI}…`);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  for (const u of TEST_USERS) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`  ⏭  ${u.username} already exists — skipped`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 12);
    await User.create({ username: u.username, email: u.email, passwordHash });
    console.log(`  ✅  Created: ${u.username} (${u.email})`);
  }

  await mongoose.disconnect();

  console.log('\n────────────────────────────────────────────');
  console.log('Test credentials (all passwords: password123)');
  console.log('────────────────────────────────────────────');
  TEST_USERS.forEach(u => {
    console.log(`  ${u.username.padEnd(8)} │ ${u.email}`);
  });
  console.log('────────────────────────────────────────────');
  console.log('Tip: Open alice in one tab, bob in incognito to test DMs.\n');
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
