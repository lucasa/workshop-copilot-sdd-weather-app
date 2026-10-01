import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    admin1: 'São Paulo',
    country: 'Brasil',
    countryCode: 'BR',
    latitude: -23.5475,
    longitude: -46.6361,
    timezone: 'America/Sao_Paulo',
  },
  current: {
    time: '2026-10-01T14:00',
    temperatureC: 21.4,
    apparentTemperatureC: 22.1,
    relativeHumidityPercent: 68,
    windSpeedKmh: 12.3,
    precipitationMm: 0.2,
    pressureHpa: 1014,
    weatherCode: 2,
  },
  forecast: [
    {
      date: '2026-10-01',
      minimumC: 16.2,
      maximumC: 25,
      weatherCode: 2,
      precipitationProbabilityPercent: 10,
    },
    {
      date: '2026-10-02',
      minimumC: 17,
      maximumC: 26.1,
      weatherCode: 3,
      precipitationProbabilityPercent: 15,
    },
    {
      date: '2026-10-03',
      minimumC: 18.1,
      maximumC: 27.3,
      weatherCode: 1,
      precipitationProbabilityPercent: 5,
    },
    {
      date: '2026-10-04',
      minimumC: 17.5,
      maximumC: 24.8,
      weatherCode: 61,
      precipitationProbabilityPercent: 70,
    },
    {
      date: '2026-10-05',
      minimumC: 16.8,
      maximumC: 23.9,
      weatherCode: 2,
      precipitationProbabilityPercent: 20,
    },
  ],
};
