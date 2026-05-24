const express = require('express');
const https = require('https');

const router = express.Router();

function getDisplayLocationName(lat, lon, fallbackName) {
  return fallbackName || 'Local area';
}

function fetchOpenWeather(lat, lon, apiKey) {
  return new Promise((resolve, reject) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&units=imperial&appid=${encodeURIComponent(apiKey)}`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode >= 400) {
            return reject(new Error(data.message || `Weather API error ${res.statusCode}`));
          }
          resolve(data);
        } catch (error) {
          reject(new Error('Unable to parse weather response')); 
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

router.get('/', async (req, res, next) => {
  const apiKey = process.env.OPEN_WEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenWeather API key is not configured' });
  }

  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat and lon query parameters' });
  }

  try {
    const weatherData = await fetchOpenWeather(lat, lon, apiKey);
    const weather = Array.isArray(weatherData.weather) ? weatherData.weather[0] : null;

    if (!weather) {
      return res.status(502).json({ error: 'Weather service responded without weather details' });
    }

    res.json({
      locationName: getDisplayLocationName(lat, lon, weatherData.name),
      temperature: weatherData.main?.temp ?? null,
      temperatureUnit: 'F',
      feelsLike: weatherData.main?.feels_like ?? null,
      humidity: weatherData.main?.humidity ?? null,
      condition: weather.main,
      description: weather.description,
      weatherId: weather.id,
      icon: weather.icon
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
