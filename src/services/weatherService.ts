import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  country_code?: string;
  timezone?: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastCurrentResponse {
  time?: string;
  temperature_2m?: number | null;
  apparent_temperature?: number | null;
  relative_humidity_2m?: number | null;
  wind_speed_10m?: number | null;
  weather_code?: number | null;
}

interface ForecastDailyResponse {
  time: string[];
  temperature_2m_min?: (number | null)[];
  temperature_2m_max?: (number | null)[];
  weather_code?: (number | null)[];
  precipitation_probability_max?: (number | null)[];
}

interface ForecastResponse {
  current?: ForecastCurrentResponse;
  daily?: ForecastDailyResponse;
}

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais.');
    }
    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const searchTerm = name.trim();
  if (!searchTerm) return [];

  const response = await fetchWithTimeout(
    `${GEOCODING_URL}?name=${encodeURIComponent(searchTerm)}&count=10&language=pt&format=json`,
  );

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível buscar cidades.');
  }

  const data = (await response.json()) as GeocodingResponse;
  return (data.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
    ...(result.admin1 !== undefined && { admin1: result.admin1 }),
    ...(result.country_code !== undefined && { countryCode: result.country_code }),
    ...(result.timezone !== undefined && { timezone: result.timezone }),
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
    temperature_unit: 'celsius',
  });
  const response = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível carregar a previsão do tempo.');
  }

  const data = (await response.json()) as ForecastResponse;
  if (!data.current || !data.daily) {
    throw new WeatherServiceError('A resposta da previsão do tempo está incompleta.');
  }

  const current: CurrentWeather = {
    ...(data.current.time !== undefined && { time: data.current.time }),
    ...(data.current.temperature_2m != null && {
      temperatureC: data.current.temperature_2m,
    }),
    ...(data.current.apparent_temperature != null && {
      apparentTemperatureC: data.current.apparent_temperature,
    }),
    ...(data.current.relative_humidity_2m != null && {
      relativeHumidityPercent: data.current.relative_humidity_2m,
    }),
    ...(data.current.wind_speed_10m != null && {
      windSpeedKmh: data.current.wind_speed_10m,
    }),
    ...(data.current.weather_code != null && { weatherCode: data.current.weather_code }),
  };

  const forecast: ForecastDay[] = data.daily.time.map((date, index) => {
    const precipitationProbability = data.daily?.precipitation_probability_max?.[index];

    return {
      date,
      ...(data.daily?.temperature_2m_min?.[index] != null && {
        minimumC: data.daily.temperature_2m_min[index],
      }),
      ...(data.daily?.temperature_2m_max?.[index] != null && {
        maximumC: data.daily.temperature_2m_max[index],
      }),
      ...(data.daily?.weather_code?.[index] != null && {
        weatherCode: data.daily.weather_code[index],
      }),
      ...(precipitationProbability !== undefined && {
        precipitationProbabilityPercent: precipitationProbability ?? 0,
      }),
    };
  });

  return { city, current, forecast };
}
