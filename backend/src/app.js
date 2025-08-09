const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const playerRoutes = require('./routes/players');
const teamRoutes = require('./routes/teams');
const statsRoutes = require('./routes/stats');
const queryRoutes = require('./routes/query');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/players', playerRoutes);
app.use('/teams', teamRoutes);
app.use('/stats', statsRoutes);
app.use('/query', queryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MyIPLDB API is running' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;