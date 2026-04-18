const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/users', usersRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'User Management API is running.' });
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found.` });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Backend API running at http://localhost:${PORT}`);
  console.log(`   Health check → http://localhost:${PORT}/api/health`);
  console.log(`   Users API   → http://localhost:${PORT}/api/users`);
});
