# Game Library Hub - IGDB Integration Guide

## Setup Instructions

### 1. Get IGDB API Credentials

1. Go to https://www.igdb.com/api
2. Create a free account
3. You'll get a **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Edit the `.env` file in the project root:

```
IGDB_CLIENT_ID=your_actual_client_id
IGDB_CLIENT_SECRET=your_actual_client_secret
PORT=3000
```

**Replace** `your_actual_client_id` and `your_actual_client_secret` with your real credentials.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Server

```bash
npm start
# or
node server.js
```

## API Endpoints

### Local Game Library (Your Collection)

- **GET** `/api/games` - Get all your games
- **POST** `/api/games` - Add a game to your library
- **DELETE** `/api/games/:id` - Remove a game from your library

### IGDB Integration (External Games Database)

#### Get Trending Games
```
GET /api/igdb/trending
```
Returns top-rated games from IGDB (rating > 80)

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1020,
      "name": "Super Metroid",
      "rating": 93.5,
      "genres": [1, 2],
      "platforms": [6]
    }
  ],
  "message": "Trending games fetched from IGDB"
}
```

#### Search Games by Name
```
GET /api/igdb/search/:name
```

**Example:**
```
GET /api/igdb/search/zelda
```

Returns games matching the search query from IGDB.

#### Get Games by Genre
```
GET /api/igdb/genre/:genreId
```

**Common Genre IDs:**
- 1 = Point-and-click
- 2 = Shooter
- 4 = Fighting
- 5 = Shooter
- 7 = Racing
- 8 = Platform
- 9 = Puzzle
- 10 = RPG
- 11 = Simulator
- 12 = Sport
- 13 = Strategy
- 14 = Turn-based strategy
- 15 = Tactical
- 16 = Hack and slash/Beat 'em up
- 24 = Tactical RPG
- 25 = Musescore
- 26 = Quiz/Trivia

**Example:**
```
GET /api/igdb/genre/10
```

Returns RPG games sorted by rating.

## How It Works

### Authentication Flow

1. Your app sends your Client ID and Client Secret to Twitch
2. Twitch returns an access token (valid for ~64 days)
3. Token is cached in memory and auto-refreshes when expired
4. You include the token in every IGDB API request

### Rate Limiting

IGDB has rate limits. Free tier allows:
- 4 requests per second
- The code handles token refresh automatically

## Integration Example

In your frontend JavaScript, you can call:

```javascript
// Get trending games from IGDB
fetch('/api/igdb/trending')
  .then(res => res.json())
  .then(data => console.log(data))

// Search for a game
fetch('/api/igdb/search/minecraft')
  .then(res => res.json())
  .then(data => console.log(data))

// Add a game to your personal library (local API)
fetch('/api/games', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Minecraft',
    genre: 'Sandbox',
    hoursPlayed: 100,
    price: 26.95,
    buyLink: 'https://www.minecraft.net'
  })
})
```

## Troubleshooting

### "Failed to authenticate with IGDB"
- Check your `.env` file has correct Client ID and Secret
- Verify credentials from https://www.igdb.com/api

### "Empty response from IGDB"
- The query syntax might be incorrect
- Check IGDB API documentation: https://api-docs.igdb.com/

### "Rate limited"
- IGDB free tier: 4 requests/second
- Implement request queuing if needed

## Security Notes

⚠️ **Never commit `.env` file to git!**

Add to `.gitignore`:
```
.env
node_modules/
```

Keep your Client Secret private - treat it like a password!

## Next Steps

1. Update your trending page to fetch from IGDB instead of local games
2. Add search functionality to find new games
3. Add a "Similar Games" feature using genre filtering
