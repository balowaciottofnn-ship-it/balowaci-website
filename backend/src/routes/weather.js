const express = require('express');
const https = require('https');

const router = express.Router();

function cleanDisplayLocationName(lat, lon, geocodedLocation, fallbackName) {
  if (geocodedLocation?.name) {
    return geocodedLocation.state
      ? `${geocodedLocation.name}, ${geocodedLocation.state}`
      : geocodedLocation.name;
  }

  if (typeof fallbackName === 'string' && fallbackName.toLowerCase().includes('baculis')) {
    return 'Iowa City';
  }

  return fallbackName || 'Local area';
}

function fetchJson(url, errorLabel) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode >= 400) {
            return reject(new Error(data.message || `${errorLabel} error ${res.statusCode}`));
          }
          resolve(data);
        } catch (error) {
          reject(new Error(`Unable to parse ${errorLabel} response`)); 
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function fetchOpenWeather(lat, lon, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&units=imperial&appid=${encodeURIComponent(apiKey)}`;
  return fetchJson(url, 'weather service');
}

async function fetchReverseGeocode(lat, lon, apiKey) {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&limit=1&appid=${encodeURIComponent(apiKey)}`;
  const data = await fetchJson(url, 'reverse geocoding service');
  return Array.isArray(data) ? data[0] : null;
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
    const [weatherData, geocodedLocation] = await Promise.all([
      fetchOpenWeather(lat, lon, apiKey),
      fetchReverseGeocode(lat, lon, apiKey).catch(() => null)
    ]);
    const weather = Array.isArray(weatherData.weather) ? weatherData.weather[0] : null;

    if (!weather) {
      return res.status(502).json({ error: 'Weather service responded without weather details' });
    }

    res.json({
      locationName: cleanDisplayLocationName(lat, lon, geocodedLocation, weatherData.name),
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
