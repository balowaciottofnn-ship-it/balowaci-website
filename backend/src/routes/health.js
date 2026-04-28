const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      status: 'API is running',
      database: 'Connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.json({
      success: true,
      status: 'API is running',
      database: 'Unavailable',
      storage: 'File fallback active',
      warning: 'PostgreSQL is not connected; feedback will be stored in backend/data/feedback.json',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
