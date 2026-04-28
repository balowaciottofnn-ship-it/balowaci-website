const express = require('express');
const router = express.Router();
const timeController = require('../controllers/timeController');

// GET current time interpretations
router.get('/current', timeController.getCurrentInterpretation);

// GET time interpretation history (future feature)
router.get('/history', timeController.getInterpretationHistory);

module.exports = router;
