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

function fetchOpenMeteoNow(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`;
  return fetchJson(url, 'local precipitation service');
}

async function fetchReverseGeocode(lat, lon, apiKey) {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&limit=1&appid=${encodeURIComponent(apiKey)}`;
  const data = await fetchJson(url, 'reverse geocoding service');
  return Array.isArray(data) ? data[0] : null;
}

function getOpenMeteoWeatherFromCode(current = {}) {
  const weatherCode = Number(current.weather_code);
  const cloudCover = Number(current.cloud_cover);
  const weatherCodeMap = new Map([
    [0, ['Clear', 'clear skies', 800]],
    [1, ['Clear', 'mainly clear', 800]],
    [2, ['Clouds', 'partly cloudy', 802]],
    [3, ['Clouds', 'overcast', 804]],
    [45, ['Clouds', 'fog', 741]],
    [48, ['Clouds', 'depositing rime fog', 741]],
    [51, ['Drizzle', 'light drizzle', 300]],
    [53, ['Drizzle', 'moderate drizzle', 301]],
    [55, ['Drizzle', 'dense drizzle', 302]],
    [56, ['Drizzle', 'light freezing drizzle', 511]],
    [57, ['Drizzle', 'dense freezing drizzle', 511]],
    [61, ['Rain', 'slight rain', 500]],
    [63, ['Rain', 'moderate rain', 501]],
    [65, ['Rain', 'heavy rain', 502]],
    [66, ['Rain', 'light freezing rain', 511]],
    [67, ['Rain', 'heavy freezing rain', 511]],
    [71, ['Snow', 'slight snow', 600]],
    [73, ['Snow', 'moderate snow', 601]],
    [75, ['Snow', 'heavy snow', 602]],
    [77, ['Snow', 'snow grains', 611]],
    [80, ['Rain', 'slight rain showers', 520]],
    [81, ['Rain', 'moderate rain showers', 521]],
    [82, ['Rain', 'violent rain showers', 522]],
    [85, ['Snow', 'slight snow showers', 620]],
    [86, ['Snow', 'heavy snow showers', 621]],
    [95, ['Thunderstorm', 'thunderstorm', 200]],
    [96, ['Thunderstorm', 'thunderstorm with slight hail', 200]],
    [99, ['Thunderstorm', 'thunderstorm with heavy hail', 202]]
  ]);
  const mapped = weatherCodeMap.get(weatherCode);

  if (mapped) {
    const [main, description, id] = mapped;
    return { main, description, id, icon: null };
  }

  if (Number.isFinite(cloudCover) && cloudCover >= 45) {
    return {
      main: 'Clouds',
      description: cloudCover >= 75 ? 'mostly cloudy' : 'partly cloudy',
      id: cloudCover >= 75 ? 803 : 802,
      icon: null
    };
  }

  return { main: 'Clear', description: 'clear skies', id: 800, icon: null };
}

function isOpenMeteoPrecipitating(current = {}) {
  const precipitation = Number(current.precipitation || 0);
  const rain = Number(current.rain || 0);
  const showers = Number(current.showers || 0);
  const snowfall = Number(current.snowfall || 0);
  const weatherCode = Number(current.weather_code);
  const precipitationCodes = new Set([
    51, 53, 55, 56, 57,
    61, 63, 65, 66, 67,
    71, 73, 75, 77,
    80, 81, 82,
    85, 86,
    95, 96, 99
  ]);

  return precipitation > 0 || rain > 0 || showers > 0 || snowfall > 0 || precipitationCodes.has(weatherCode);
}

function resolveWeatherDisplay(openWeatherData, openMeteoData) {
  const current = openMeteoData?.current || null;
  const weather = Array.isArray(openWeatherData?.weather) ? openWeatherData.weather[0] : null;
  if (!weather) return current ? getOpenMeteoWeatherFromCode(current) : null;
  if (!current) return weather;

  const openWeatherSaysRain = weather.id >= 200 && weather.id < 600;
  if (!openWeatherSaysRain || isOpenMeteoPrecipitating(current)) return weather;

  const cloudCover = Number(current.cloud_cover);
  if (Number.isFinite(cloudCover) && cloudCover >= 45) {
    return {
      ...weather,
      id: 803,
      main: 'Clouds',
      description: cloudCover >= 75 ? 'mostly cloudy' : 'partly cloudy',
      correctedFrom: weather.main
    };
  }

  return {
    ...weather,
    id: 800,
    main: 'Clear',
    description: 'clear skies',
    correctedFrom: weather.main
  };
}

router.get('/', async (req, res, next) => {
  const apiKey = process.env.OPEN_WEATHER_API_KEY;
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat and lon query parameters' });
  }

  try {
    const [weatherData, localPrecipitationData, geocodedLocation] = await Promise.all([
      apiKey ? fetchOpenWeather(lat, lon, apiKey).catch(() => null) : null,
      fetchOpenMeteoNow(lat, lon).catch(() => null),
      apiKey ? fetchReverseGeocode(lat, lon, apiKey).catch(() => null) : null
    ]);
    const weather = resolveWeatherDisplay(weatherData, localPrecipitationData);

    if (!weather) {
      return res.status(502).json({ error: 'Weather services responded without weather details' });
    }

    const localCurrent = localPrecipitationData?.current || {};

    res.json({
      locationName: cleanDisplayLocationName(lat, lon, geocodedLocation, weatherData?.name),
      temperature: localCurrent.temperature_2m ?? weatherData?.main?.temp ?? null,
      temperatureUnit: 'F',
      feelsLike: localCurrent.apparent_temperature ?? weatherData?.main?.feels_like ?? null,
      humidity: localCurrent.relative_humidity_2m ?? weatherData?.main?.humidity ?? null,
      condition: weather.main,
      description: weather.description,
      weatherId: weather.id,
      icon: weather.icon,
      precipitationNow: localCurrent.precipitation ?? null,
      correctedFrom: weather.correctedFrom || null
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
