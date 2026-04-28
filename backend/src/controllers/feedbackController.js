const feedbackStore = require('../services/feedbackStore');

function escapeCsv(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

exports.submitFeedback = async (req, res) => {
  try {
    const {
      visitorName,
      visitorEmail,
      visitorPhone,
      firstImpression,
      isUnique,
      interests,
      journeyThoughts,
      targetCustomer,
      problemSolved,
      willingnessToPay,
      watchValueEstimate,
      adoptionBarriers,
      mustHaveFeatures,
      pilotInterest
    } = req.body;

    // Validate input
    if (
      !visitorName ||
      !visitorEmail ||
      !firstImpression ||
      !isUnique ||
      !interests ||
      !targetCustomer ||
      !problemSolved ||
      !willingnessToPay ||
      !watchValueEstimate ||
      !adoptionBarriers ||
      !mustHaveFeatures ||
      !pilotInterest
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing required feedback or investor insight fields'
      });
    }

    const result = await feedbackStore.insertFeedback({
      visitorName,
      visitorEmail,
      visitorPhone,
      firstImpression,
      isUnique,
      interests,
      journeyThoughts,
      targetCustomer,
      problemSolved,
      willingnessToPay,
      watchValueEstimate,
      adoptionBarriers,
      mustHaveFeatures,
      pilotInterest
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      storage: result.storage,
      data: result.row
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
      details: error.message
    });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const result = await feedbackStore.getAllFeedback(100);

    res.json({
      success: true,
      storage: result.storage,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Feedback retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback',
      details: error.message
    });
  }
};

exports.getFeedbackStats = async (req, res) => {
  try {
    const result = await feedbackStore.getFeedbackStats();

    res.json({
      success: true,
      storage: result.storage,
      data: result.stats
    });
  } catch (error) {
    console.error('Stats retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve stats',
      details: error.message
    });
  }
};

exports.exportFeedbackCsv = async (req, res) => {
  try {
    const result = await feedbackStore.getAllFeedback(10000);
    const headers = feedbackStore.columns;

    const rows = result.rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(','));
    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="balowaci-feedback.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Feedback export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export feedback',
      details: error.message
    });
  }
};
