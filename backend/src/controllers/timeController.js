// BaloWaci Time Interpretation Service

function getTimeParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    hours: Number(values.hour === '24' ? '0' : values.hour),
    minutes: Number(values.minute),
    seconds: Number(values.second)
  };
}

function normalizeTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
    return timeZone;
  } catch (error) {
    return 'UTC';
  }
}

function getDayPeriod(hours) {
  if (hours >= 5 && hours < 12) return 'asubuhi';
  if (hours >= 12 && hours < 18) return 'mchana';
  if (hours >= 18 && hours < 21) return 'jioni';
  return 'usiku';
}

function getTimeInterpretations(timeZone = 'UTC') {
  const now = new Date();
  const resolvedTimeZone = normalizeTimeZone(timeZone);
  const parts = getTimeParts(now, resolvedTimeZone);
  
  // Standard Time
  const standardTime = now.toLocaleTimeString('en-US', {
    timeZone: resolvedTimeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Military Time (24-hour)
  const militaryTime = now.toLocaleTimeString('en-US', {
    timeZone: resolvedTimeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Rotational Time (0-360 degrees, 360 degrees = 24 hours)
  const totalSeconds = parts.hours * 3600 + parts.minutes * 60 + parts.seconds;
  const rotationalDegrees = (totalSeconds / 86400) * 360;
  const rotationalTime = rotationalDegrees.toFixed(2);

  // Swahili cultural time counts hours from sunrise/sunset, offset six positions from the Western dial.
  const culturalHour = ((parts.hours + 6) % 12) || 12;
  const culturalTime = `Saa ${String(culturalHour).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}:${String(parts.seconds).padStart(2, '0')} ${getDayPeriod(parts.hours)}`;

  return {
    timestamp: now.toISOString(),
    timezone: resolvedTimeZone,
    standard: standardTime,
    military: militaryTime,
    rotational: rotationalTime + '°',
    cultural: culturalTime,
    raw: {
      hours: parts.hours,
      minutes: parts.minutes,
      seconds: parts.seconds
    }
  };
}

exports.getCurrentInterpretation = (req, res) => {
  try {
    const interpretation = getTimeInterpretations(req.query.timezone || 'UTC');
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
