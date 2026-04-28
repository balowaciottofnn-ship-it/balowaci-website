// BaloWaci Time Interpretation Service

function getTimeInterpretations() {
  const now = new Date();
  
  // Standard Time
  const standardTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Military Time (24-hour)
  const militaryTime = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Rotational Time (0-360 degrees, 360 degrees = 24 hours)
  const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const rotationalDegrees = (totalSeconds / 86400) * 360;
  const rotationalTime = rotationalDegrees.toFixed(2);

  // Cultural Time maps the standard 12-hour face through the opposite side of the dial.
  const culturalHour = ((now.getHours() + 6) % 12) || 12;
  const culturalTime = `${String(culturalHour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return {
    timestamp: now.toISOString(),
    standard: standardTime,
    military: militaryTime,
    rotational: rotationalTime + '°',
    cultural: culturalTime,
    raw: {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds()
    }
  };
}

exports.getCurrentInterpretation = (req, res) => {
  try {
    const interpretation = getTimeInterpretations();
    res.json({
      success: true,
      data: interpretation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getInterpretationHistory = (req, res) => {
  try {
    // This can be extended to pull from database
    const interpretation = getTimeInterpretations();
    res.json({
      success: true,
      data: interpretation,
      note: 'History feature coming soon'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
