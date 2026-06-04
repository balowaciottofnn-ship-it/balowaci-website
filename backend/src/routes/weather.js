const express = require('express');
const https = require('https');

const router = express.Router();

const trustedLocalCities = [
  { name: 'Coralville', state: 'IA', lat: 41.6764, lon: -91.5804 },
  { name: 'Iowa City', state: 'IA', lat: 41.6611, lon: -91.5302 },
  { name: 'North Liberty', state: 'IA', lat: 41.7492, lon: -91.5979 },
  { name: 'Tiffin', state: 'IA', lat: 41.7058, lon: -91.6627 },
  { name: 'University Heights', state: 'IA', lat: 41.6556, lon: -91.5560 },
  { name: 'Solon', state: 'IA', lat: 41.8072, lon: -91.4941 },
  { name: 'West Branch', state: 'IA', lat: 41.6714, lon: -91.3466 },
  { name: 'Hills', state: 'IA', lat: 41.5542, lon: -91.5346 },
  { name: 'Lone Tree', state: 'IA', lat: 41.4881, lon: -91.4254 },
  { name: 'Swisher', state: 'IA', lat: 41.8458, lon: -91.6927 }
];

function getMilesBetween(latA, lonA, latB, lonB) {
  const toRadians = (value) => value * Math.PI / 180;
  const earthMiles = 3958.8;
  const dLat = toRadians(latB - latA);
  const dLon = toRadians(lonB - lonA);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(latA)) * Math.cos(toRadians(latB)) * Math.sin(dLon / 2) ** 2;
  return earthMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getTrustedLocalCity(lat, lon) {
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const nearest = trustedLocalCities
    .map((city) => ({
      ...city,
      distance: getMilesBetween(latitude, longitude, city.lat, city.lon)
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  return nearest && nearest.distance <= 9
    ? `${nearest.name}, ${nearest.state}`
    : null;
}

function cleanDisplayLocationName(lat, lon, geocodedLocation, fallbackName) {
  const trustedLocalCity = getTrustedLocalCity(lat, lon);
  if (trustedLocalCity) return trustedLocalCity;

  if (geocodedLocation?.name) {
    return geocodedLocation.state
      ? `${geocodedLocation.name}, ${geocodedLocation.state}`
      : geocodedLocation.name;
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
