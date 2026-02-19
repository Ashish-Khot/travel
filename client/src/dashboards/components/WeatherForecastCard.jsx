// WeatherForecastCard.jsx
// Modern weather forecast card for dashboard
import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded';
import ThunderstormRoundedIcon from '@mui/icons-material/ThunderstormRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import NightlightRoundedIcon from '@mui/icons-material/NightlightRounded';
import { motion } from 'framer-motion';


const API_KEY = 'b3d31044024d27916dfdcd9a4530b279';
const DEFAULT_LOCATION = 'Santorini, Greece';


function getIconByWeatherCodeAndTemp(code, temp, isNight = false) {
  // Thunderstorm
  if (code >= 200 && code < 300) return <ThunderstormRoundedIcon sx={{ color: '#616161', fontSize: 40 }} />;
  // Drizzle/Rain
  if (code >= 300 && code < 600) return <WaterDropRoundedIcon sx={{ color: '#2196f3', fontSize: 40 }} />;
  // Snow
  if (code >= 600 && code < 700) return <AcUnitRoundedIcon sx={{ color: '#90caf9', fontSize: 40 }} />;
  // Atmosphere (fog, mist)
  if (code >= 700 && code < 800) return <CloudQueueRoundedIcon sx={{ color: '#bdbdbd', fontSize: 40 }} />;
  // Clear
  if (code === 800) {
    if (isNight) return <NightlightRoundedIcon sx={{ color: '#ffd600', fontSize: 40 }} />;
    if (temp >= 35) return <WbSunnyRoundedIcon sx={{ color: '#ff5722', fontSize: 40 }} />; // Hot
    if (temp <= 0) return <AcUnitRoundedIcon sx={{ color: '#90caf9', fontSize: 40 }} />; // Freezing
    return <WbSunnyRoundedIcon sx={{ color: '#FDB813', fontSize: 40 }} />;
  }
  // Clouds
  if (code > 800) {
    if (temp <= 0) return <AcUnitRoundedIcon sx={{ color: '#90caf9', fontSize: 40 }} />;
    return <CloudQueueRoundedIcon sx={{ color: '#90caf9', fontSize: 40 }} />;
  }
  return <CloudQueueRoundedIcon sx={{ color: '#90caf9', fontSize: 40 }} />;
}


export default function WeatherForecastCard({ onClick, clickable }) {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = DEFAULT_LOCATION;

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setError('');
      try {
        // 1. Get geocoding for city name
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${API_KEY}`);
        const geoData = await geoRes.json();
        if (!geoData[0]) throw new Error('Location not found');
        const { lat, lon } = geoData[0];
        // 2. Get current weather
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        const weatherData = await weatherRes.json();
        // 3. Get 5-day forecast
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        const forecastData = await forecastRes.json();
        // Group forecast by day (get one per day, midday)
        const days = [];
        const usedDays = new Set();
        for (const entry of forecastData.list) {
          const date = new Date(entry.dt * 1000);
          const day = date.toLocaleDateString(undefined, { weekday: 'short' });
          const isNight = date.getHours() < 6 || date.getHours() > 18;
          if (!usedDays.has(day) && date.getHours() === 12) {
            days.push({
              day,
              temp: Math.round(entry.main.temp),
              code: entry.weather[0].id,
              isNight,
            });
            usedDays.add(day);
          }
          if (days.length === 5) break;
        }
        setWeather({
          temp: Math.round(weatherData.main.temp),
          code: weatherData.weather[0].id,
          desc: weatherData.weather[0].main,
          location: `${geoData[0].name}, ${geoData[0].country}`,
          isNight: weatherData.weather[0].icon && weatherData.weather[0].icon.includes('n'),
        });
        setForecast(days);
      } catch (err) {
        setError('Unable to fetch weather.');
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Card
        sx={{
          borderRadius: 5,
          boxShadow: '0 4px 24px 0 rgba(80, 120, 200, 0.10)',
          minWidth: 340,
          maxWidth: 420,
          width: '100%',
          mb: 4,
          bgcolor: '#fafdff',
          px: 3,
          py: 2.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: clickable ? 'pointer' : 'default',
          transition: 'box-shadow 0.2s',
          '&:hover': clickable ? { boxShadow: '0 8px 32px 0 rgba(80, 120, 200, 0.18)' } : {},
        }}
        onClick={clickable ? onClick : undefined}
      >
        <CardContent sx={{ p: 0 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <CloudQueueRoundedIcon sx={{ color: '#1976d2', mr: 1, fontSize: 28 }} />
            <Typography variant="h6" fontWeight={800} letterSpacing={0.2}>
              Weather Forecast
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={2} fontWeight={500}>
            Your next destination
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          ) : error ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
              <Typography color="error.main">{error}</Typography>
            </Box>
          ) : weather ? (
            <>
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <Box mr={2} display="flex" flexDirection="column" alignItems="center">
                  {getIconByWeatherCodeAndTemp(weather.code, weather.temp, weather.isNight)}
                  <Typography variant="h2" fontWeight={900} color={weather.temp >= 35 ? '#ff5722' : weather.temp <= 0 ? '#1976d2' : '#FDB813'} lineHeight={1.1}>
                    {weather.temp}&deg;C
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.primary" fontWeight={700} fontSize={18}>
                    {weather.location}
                  </Typography>
                  <Typography color="text.secondary" fontWeight={500} fontSize={15}>
                    {weather.desc}
                  </Typography>
                </Box>
              </Box>
              <Box mt={2}>
                {forecast.map((d) => (
                  <Box key={d.day} display="flex" alignItems="center" justifyContent="space-between" mb={1.2}>
                    <Typography variant="body1" fontWeight={600} color="text.secondary">{d.day}</Typography>
                    <Box display="flex" alignItems="center">
                      {getIconByWeatherCodeAndTemp(d.code, d.temp, d.isNight)}
                      <Typography variant="body1" fontWeight={700} ml={1} color={d.temp >= 35 ? '#ff5722' : d.temp <= 0 ? '#1976d2' : '#FDB813'}>
                        {d.temp}&deg;C
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
