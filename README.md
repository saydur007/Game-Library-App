# Game Library Hub

## Overview
Game Library Hub is a simple web app for tracking a personal video game collection. It lets users add games, log hours played, and browse trending titles pulled from IGDB with quick buy links. The project demonstrates a MERN-style workflow with an Express backend, a JSON data store, and a multi-page frontend.

Future extensions could include: user accounts, MongoDB persistence, search and filters, platform/genre tags, and richer IGDB data (covers, release dates, and ratings).

## Documentation

### How to Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Enable IGDB integration by adding a `.env` file in the project root:
   ```env
   IGDB_CLIENT_ID=your_client_id
   IGDB_CLIENT_SECRET=your_client_secret
   PORT=3000
   ```
   See `IGDB_SETUP.md` for details.
3. Start the server:
   ```bash
   npm start
   ```
4. Open the app:
   - Home: `http://localhost:3000/`
   - My Library: `http://localhost:3000/manage.html`
   - Trending: `http://localhost:3000/trending.html`

### How to Use
- **Home page**: Intro and navigation.
- **My Library**:
  - View your saved games.
  - Add a game (title, genre, hours played, price, buy link).
  - Edit hours played and delete games.
- **Trending**:
  - See IGDB trending games (if IGDB is configured).
  - Add a trending game to your library.
  - Filter between IGDB results and your local library.

### REST API (Express)
- `GET /api/games` — list all games in your library
- `POST /api/games` — add a game
- `DELETE /api/games/:id` — remove a game
- `PUT /api/games/:id` — update hours played

### Data Storage
Local games are stored in `games.json` and read/written by the API.

## Reflection
This submission includes an Express server (`server.js`), REST endpoints in `routes/games.js`, IGDB integration in `routes/igdb.js`/`igdb.js`, and three HTML pages with separate JS/CSS for UI and interactions. 

**Successes:** building a working CRUD flow (add, delete, update hours), connecting the frontend to the API, and integrating external data from IGDB for trending games.  
**Challenges:** coordinating the IGDB auth flow and handling errors (token refresh, failed requests), and keeping the UI state consistent after updates. Those were handled with clear API responses and reloads after actions.
