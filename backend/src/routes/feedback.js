const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// POST new feedback
router.post('/submit', feedbackController.submitFeedback);

// GET all feedback (admin)
router.get('/all', feedbackController.getAllFeedback);

// GET feedback stats
router.get('/stats', feedbackController.getFeedbackStats);

// GET feedback export
router.get('/export.csv', feedbackController.exportFeedbackCsv);

module.exports = router;
