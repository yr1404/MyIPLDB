const express = require('express');
const queryController = require('../controllers/queryController');

const router = express.Router();

// POST /query - Execute custom SQL query
router.post('/', queryController.executeQuery);

// GET /query/presets - Get preset useful queries
router.get('/presets', queryController.getPresetQueries);

// GET /query/help - Get query help and examples
router.get('/help', queryController.getQueryHelp);

// GET /query/schema - Get database schema
router.get('/schema', queryController.getSchema);

module.exports = router;