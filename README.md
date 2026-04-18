# Internship Task 6: Full-Stack User Management System

## Overview
A complete, end-to-end full stack web application demonstrating seamless cross-origin communication between a React frontend and an Express/SQLite backend system. This application is a fully realized "User Management System," allowing an administrator to Create, Read, Update, and Delete user profile entities efficiently.

## Architecture & Features
- **Frontend (`/frontend`)**: 
  - Constructed using React and bundled with Vite.
  - Implements dynamic interface behaviors, real-time fetching logic, and comprehensive REST payload generation to modify persistent user data.
  - Uses a standardized module-component interface design.
- **Backend (`/backend`)**:
  - Express.js-led REST API acting as the central nexus logic controller.
  - Deploys custom SQLite persistence implementations (`database.js`).
  - Evaluates logic bounds natively (`email` validations, integer limits parameterization mappings).

## API Integration
The frontend cleanly interfaces with the REST backend routes configured specifically at `/api/users/`. 

## How To Run

### 1. Initialize the Backend Server
1. Open a terminal and step into the backend root: `cd backend`
2. Install required microservices/modules: `npm install`
3. Launch the Express server and configure SQLite Database linking:
   ```bash
   node server.js
   ```

### 2. Initialize the Frontend Server
1. Open a parallel terminal instance and navigate into the frontend zone: `cd frontend`
2. Download React scaffolding configurations: `npm install`
3. Launch the Vite development server stream:
   ```bash
   npm run dev
   ```
4. Load the designated Localhost Vite URL (e.g. `http://localhost:5173`) into your browser window to browse your data sets synchronously.
