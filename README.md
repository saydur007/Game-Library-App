# GameVault - MERN Web Application

## Overview
GameVault is a medium-fidelity web application built using the MERN stack (MongoDB, Express, React, Node.js). Its purpose is to provide users with a sleek, modern dashboard to organize, manage, and track their personal video game library. The app goes beyond a simple list by providing library statistics (total games, total value, hours played) and recent addition previews.
In the future, this concept could be extended seamlessly by incorporating external APIs (like IGDB or rawg.io) to fetch artwork, user authentication to support multiple separate accounts, and advanced sorting/filtering mechanisms.

## Documentation
### Prerequisites
- Node.js installed
- MongoDB installed and running locally (`mongodb://127.0.0.1:27017`), or update the connection string in `backend/server.js`.

### How to Run the Project
This project is divided into two separate applications: the backend API and the frontend client.

#### 1. Start the Backend API
1. Open a terminal and navigate to the `backend` folder.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the server (it runs on port `8080` and will auto-seed the database if empty):
   ```bash
   npm run start
   ```

#### 2. Start the Frontend Application
1. Open a new terminal and navigate to the `frontend` folder.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL provided (typically `http://localhost:5173`).

### How to Record the Video Assignment
To record the short video (< 60s) of your working project as requested by the assignment parameters:
1. Open the application in your browser (`http://localhost:5173`).
2. On macOS, press `Cmd + Shift + 5` to open the screen recording tool.
3. Select the portion of the screen containing the browser.
4. Click "Record".
5. Quickly demonstrate the 3 views: Dashboard, Library list, and Add/Edit Game form (Showcase all CRUD operations).
6. Click the stop button on your menu bar when finished. The `.mov` file can be found on your desktop.
7. Rename or convert it to `.mp4` if strictly required.

## Reflection
This submission successfully transitions a standard Node app into a fully decoupled MERN architecture. The frontend was entirely rebuilt using React and Vite to ensure a snappy single-page application experience. It implements three distinct web views managed by `react-router-dom`: 
- **Dashboard (`/`)**: A read-only analytical view showcasing aggregation and recent items.
- **Library (`/games`)**: The primary CRUD table to read, edit, or delete items.
- **Game Form (`/add` or `/edit/:id`)**: The interactive entry point for inserting new documents or mutating existing ones.

The backend was refactored to use standard `mongoose` models and dynamically seeds initial test data upon booting, solving the "first-time run" cold start problem perfectly. A major success during this implementation was creating a customized CSS design system prioritizing "Visual Excellence" through a dark, glassmorphic aesthetic—ensuring the application meets the criteria for going "beyond the tutorials."
