# GameVault — MERN Web Application

## Overview

GameVault is a full-stack web application built using the MERN stack (MongoDB, Express.js, React, Node.js) that allows users to manage and track their personal video game library. The application provides a modern, visually polished dashboard where users can organize their collection, monitor stats like total hours played and total library value, search for new games through the IGDB (Internet Game Database) API, and browse trending titles.

The concept behind GameVault is to go beyond a simple CRUD list and deliver a real-world feeling application with a cohesive design system, live external data, and a clean user experience. In the future, GameVault could be extended with user authentication to support multiple separate accounts, advanced filtering and sorting options, personalized game recommendations powered by IGDB data, social features like sharing libraries with friends, and cloud deployment for public access.

---

## Documentation

### Prerequisites

#### Option A — Run with Docker (Recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

#### Option B — Run Locally
- Node.js installed
- MongoDB installed and running locally

---

### How to Run — Docker (Recommended)

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

> On subsequent runs you can skip `--build` and just run `docker compose up`.

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

### How to Use the Application

| View | URL | Description |
|---|---|---|
| **Dashboard** | `/` | Library stats — total games, total value, hours played, recent additions |
| **Library** | `/library` | Full CRUD table — add, edit, delete games in your collection |
| **Search** | `/search` | Search the IGDB database and discover new titles |
| **Trending** | `/trending` | Browse currently trending games pulled live from IGDB |

---

## Reflection

### What Was Built

GameVault is a fully decoupled MERN application consisting of three independently running services — a React/Vite frontend, an Express REST API backend, and a MongoDB database. The backend exposes a complete set of RESTful endpoints (GET, POST, PUT, DELETE) for managing the game library, as well as a separate route layer that proxies requests to the external IGDB API for live game data. The frontend consumes these endpoints through a centralized Axios API client and renders four distinct views managed by React Router.

The project is fully containerized with Docker and Docker Compose, allowing the entire stack to be launched with a single command on any machine without any manual setup.

### Challenges

**UI Responsiveness and Animations** — One of the more time-consuming aspects of this project was building a UI that felt polished and responsive across different screen sizes. Achieving the glassmorphic dark aesthetic required careful layering of CSS backdrop filters, gradients, and box shadows. Adding smooth transitions and hover animations to cards, buttons, and table rows without impacting performance required iteration and fine-tuning. Getting every view to feel consistent in style while each serving a different purpose was a challenge in itself.

**Integrating Frontend and Backend** — Connecting the React frontend to the Express backend introduced several challenges around CORS configuration, consistent API response structures, and error handling. We built a centralized `unwrap` helper in `api.js` to normalize all server responses, which significantly reduced repetitive error handling logic across every component. Ensuring the frontend gracefully handled loading states, empty data, and API failures required careful state management throughout.

**IGDB API Integration** — Working with the IGDB API presented its own set of challenges. The API requires OAuth2 token-based authentication through Twitch, meaning the backend had to handle token fetching and forwarding before making any game data requests. Parsing and transforming the IGDB response format into something consistent and usable by the frontend required careful mapping, especially for fields like cover art URLs and genre IDs which use nested reference structures.

### Successes

**Team Collaboration** — Group collaboration was central to the success of this project. Dividing responsibilities across frontend, backend, and API integration allowed work to happen in parallel without blocking each other. Regular communication around API contracts — what endpoints exist, what they return, what the frontend expects — kept integration smooth. Git was used throughout to manage contributions, and having a shared understanding of the project structure from the start made merging work straightforward.

**End Result** — The final product is a genuinely functional and visually impressive application. The dark glassmorphic design system gives GameVault a premium feel that goes well beyond the tutorial baseline. The auto-seeding of the database on first run eliminates cold-start friction. Docker containerization makes the entire stack fully portable. The IGDB integration brings real, live data into the application, making the Search and Trending views feel like a real product rather than an assignment. Overall, the project came together exactly as envisioned and exceeded the initial scope in both functionality and visual quality.
