# Game Library Hub

## Overview

Game Library Hub is a full-stack web application built with the MERN technology stack. It gives users a personal space to manage their video game library, track hours played, organize games into tier lists, explore where games were developed around the world, and chat with other users in real time. The app connects to the IGDB API for live game data and supports Steam library imports so users can bring in their existing collection.

All features require an account. Users register, log in, and everything they do is scoped to their profile.

---

## Documentation

### Prerequisites

#### Option A — Run with Docker (recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

#### Option B — Run Locally
- Node.js installed
- MongoDB installed and running locally

---

### Environment Variables

Before running, create a `backend/.env` file with the following:

```
IGDB_CLIENT_ID=your_twitch_client_id
IGDB_CLIENT_SECRET=your_twitch_client_secret
JWT_SECRET=any_long_random_string_32_chars_or_more
STEAM_API_KEY=your_key_from_steamcommunity.com/dev/apikey
PORT=8080
```

`MONGODB_URI` is set automatically by Docker Compose. For local runs it defaults to `mongodb://127.0.0.1:27017/gamelibrary`.

---

### How to Run — Docker

Docker handles everything automatically. No need to install Node.js, MongoDB, or start any services manually.

1. Clone the repository and navigate to the project root:
   ```bash
   cd "Assigment 1"
   ```

2. Build and start all services (backend, frontend, MongoDB) with one command:
   ```bash
   docker compose up --build
   ```

3. Open your browser and go to:
   ```
   http://localhost:5173
   ```

4. To stop all services:
   ```bash
   docker compose down
   ```

5. To wipe the database and start fresh:
   ```bash
   docker compose down -v
   ```

---

### How to Run — Locally

#### 1. Start MongoDB
```bash
brew services start mongodb/brew/mongodb-community
```

#### 2. Start the Backend
```bash
cd backend
npm install
npm start
```
The API server runs on `http://localhost:8080`. On first run, the database is automatically seeded with sample game data.

#### 3. Start the Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

### Seeding Test Users

To create test accounts for trying out all features (including the chat):

```bash
cd backend
node scripts/seedUsers.js
```

This creates three accounts, all with the password `password123`:

| Username | Email |
|----------|-------|
| alice | alice@test.com |
| bob | bob@test.com |
| charlie | charlie@test.com |

To test the real-time chat, log in as alice in a normal browser tab and as bob in an incognito window, then go to `/chat`.

---

### How to Use the Application

| View | URL | Auth | Description |
|------|-----|------|-------------|
| **Home** | `/` | No | Landing page |
| **Search** | `/search` | No | Search IGDB and discover titles |
| **Trending** | `/trending` | No | Browse currently trending games from IGDB |
| **Login** | `/login` | No | Sign in to your account |
| **Register** | `/register` | No | Create a new account |
| **Library** | `/library` | Yes | Your personal game collection with full CRUD |
| **Chat** | `/chat` | Yes | Real-time direct messages with other users |
| **Game Passport** | `/passport` | Yes | 3D globe showing where your games were developed |
| **Tier List** | `/tierlist` | Yes | Drag and drop games into S/A/B/C/D tiers, export as PNG |
| **Profile** | `/profile` | Yes | Account info and Steam library import |

---

## Reflection

### What Was Built

Game Library Hub is a fully featured MERN application that grew significantly from its original scope. The backend is an Express REST API running on Node.js, upgraded to use an HTTP server with Socket.io for real-time messaging. It handles JWT-based authentication, user-scoped game management, persistent tier lists, Steam library import, and real-time direct messages between users.

The frontend is a React 19 app built with Vite, organized around a React Context layer that manages authentication state and the Socket.io connection. Every protected view checks for a valid token and redirects to login if it is missing. The UI uses a consistent dark gaming aesthetic across all views, with glassmorphism cards, red accents, and smooth animations.

The entire stack runs in Docker with live hot module reload enabled for the frontend, so development changes appear instantly without a rebuild.

### Challenges

**Authentication and User-Scoped Data** — Adding authentication was one of the core requirements for Assignment 3 and required building the feature from scratch. This meant creating a new User model in Mongoose, setting up bcrypt for password hashing, issuing and verifying JWT tokens, and writing middleware that protects routes without breaking the existing guest experience. Beyond the login flow itself, every part of the app that touches game data had to be updated so that each user only sees and modifies their own records. The optional auth pattern on the games route, where authenticated users get their own library and unauthenticated visitors get seed data, required careful handling to make sure nothing leaked between accounts. Managing token state across page refreshes, automatic logout on expiry, and keeping the Axios client in sync with localStorage all added to the complexity.

**Real-Time Communication with Socket.io** — Building the chat feature introduced a different kind of complexity compared to the REST API work. Socket.io runs on the same HTTP server as Express, which meant upgrading from a simple `app.listen()` call to an `http.createServer()` setup so both could share the same port. Authenticating socket connections required verifying the JWT at connection time using the handshake object rather than request headers. Routing messages between specific users without broadcasting to everyone required each user to join a personal room on connect. Tracking who is online, notifying all clients when someone joins or leaves, and making sure messages are both persisted to MongoDB and emitted in real time all had to work together reliably. A subtle bug also came up where the sender ID from the socket payload was not matching the user ID stored in React context after a page refresh, causing sent messages to show up on the wrong side of the chat until the page was reloaded.

**Nielsen Usability Principles** — Applying the Nielsen heuristics was more involved than expected because it touched nearly every view in the application. Visibility of system status meant adding loading spinners and save indicators everywhere an async action happens. Error prevention meant disabling buttons while requests are in flight and validating inputs like the Steam64 ID before they even reach the server. User control meant adding confirmation dialogs before destructive actions and cancel buttons on every edit form. Accessibility required auditing every input for a proper label, adding `role="alert"` to all error messages, and making sure all images had descriptive alt text. Going through each of the ten heuristics systematically and applying them consistently across ten different views took significant time but produced a noticeably more polished and reliable experience.

**UI Responsiveness and Animations** — Building a UI that felt polished and consistent across every view was one of the more time-consuming parts of the project. Achieving the dark aesthetic required careful layering of CSS backdrop filters, gradients, and box shadows. Adding smooth transitions and hover animations without impacting performance required iteration. Getting every view to feel like it belongs to the same product while each serving a completely different purpose was a design challenge in itself.

**Integrating Frontend and Backend** — Connecting the React frontend to the Express backend introduced several challenges around CORS configuration, consistent API response structures, and error handling. We built a centralized `unwrap` helper in `api.js` to normalize all server responses, which significantly reduced repetitive error handling logic across every component. Ensuring the frontend gracefully handled loading states, empty data, and API failures required careful state management throughout.

**IGDB API Integration** — Working with the IGDB API presented its own challenges. The API requires OAuth2 token-based authentication through Twitch, meaning the backend had to handle token fetching and caching before making any game data requests. Parsing and transforming the IGDB response format into something consistent and usable by the frontend required careful mapping, especially for fields like cover art URLs and numeric country codes that needed to be converted into something meaningful.

**Drag and Drop Across Empty Containers** — Getting dnd-kit to work correctly when dragging into empty tier rows required more than expected. SortableContext only makes individual items droppable, not the container itself. The fix was wrapping each tier row with useDroppable so the row is always a valid drop target regardless of whether it has any games in it yet.

**Cross-Origin Images in Canvas** — The tier list PNG export was producing blank game covers because IGDB and Steam images come from different domains. Browsers block cross-origin content from being drawn to a canvas by default. The fix required adding `crossOrigin="anonymous"` to all cover images and enabling `useCORS: true` in html2canvas.

### Successes

**Team Collaboration** — Group collaboration was central to the success of this project. Dividing responsibilities across frontend, backend, and API integration allowed work to happen in parallel without blocking each other. Regular communication around API contracts, what endpoints exist, what they return, and what the frontend expects kept integration smooth. Git was used throughout to manage contributions, and having a shared understanding of the project structure from the start made merging work straightforward.

**End Result** — The final product is a genuinely functional and visually impressive application. The dark gradient design system gives it a distinctive feel that holds together across every page. Docker containerization makes the entire stack fully portable and deployable with one command. The addition of real-time chat, a 3D interactive globe, a drag and drop tier list builder, and Steam import went well beyond the original scope and turned the app into something that actually feels like a product. The project came together exactly as envisioned and exceeded the initial scope in both functionality and visual quality.
