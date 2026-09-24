# Yatrik - AI Powered Travel Planner

Yatrik is a full-stack travel planning application using a Node.js/Express backend with a MySQL database and a vanilla JavaScript frontend. It includes an AI-based travel planner using Ollama and a robust fallback mechanism.

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- Ollama (running locally) with the `llama3` model (optional, falls back to rule-based planner if unavailable)

## Setup Instructions

### 1. Database Setup
1. Ensure your MySQL server is running.
2. Open your MySQL client or command line and run the provided SQL scripts:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   mysql -u root -p < backend/database/seed.sql
   ```
   *(This creates the `yatrik` database and seeds it with destination data)*

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder with your database credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=yatrik
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama3
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```
   *The server should run on http://localhost:5000*

### 3. Frontend Setup
1. Serve the frontend directory using any simple HTTP server. For example:
   ```bash
   cd frontend
   npx serve -l 3000
   ```
2. Open your browser and navigate to the local server address (e.g. `http://localhost:3000`).

### 4. Running the AI (Optional)
1. Install Ollama from [ollama.com](https://ollama.com).
2. Pull and run the `llama3` model (or configure `.env` to use another model):
   ```bash
   ollama run llama3
   ```
3. Ensure Ollama is running on the default port `11434`.

## Notes
- Ensure all backend routes match the expected frontend API calls.
- By default, the application is pre-seeded with 23 destinations and multiple choices for transport, foods, attractions, restaurants, and souvenirs.
