import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string | null;
  admin1?: string | null;
  country_code?: string | null;
  timezone?: string | null;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastCurrentResponse {
  time?: string | null;
  temperature_2m?: number | null;
  apparent_temperature?: number | null;
  relative_humidity_2m?: number | null;
  wind_speed_10m?: number | null;
  precipitation?: number | null;
  surface_pressure?: number | null;
  weather_code?: number | null;
}

interface ForecastDailyResponse {
  time?: string[];
  temperature_2m_min?: (number | null)[];
  temperature_2m_max?: (number | null)[];
  weather_code?: (number | null)[];
  precipitation_probability_max?: (number | null)[];
}

interface ForecastResponse {
  current?: ForecastCurrentResponse;
  daily?: ForecastDailyResponse;
}

interface RequestErrorMessages {
  http: string;
  invalidJson: string;
}

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAbortError(error: unknown): boolean {
  return isRecord(error) && error.name === 'AbortError';
}

function isGeocodingResult(value: unknown): value is GeocodingResult {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    Number.isFinite(value.id) &&
    typeof value.name === 'string' &&
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude) &&
    (value.country === undefined || value.country === null || typeof value.country === 'string') &&
    (value.admin1 === undefined || value.admin1 === null || typeof value.admin1 === 'string') &&
    (value.country_code === undefined ||
      value.country_code === null ||
      typeof value.country_code === 'string') &&
    (value.timezone === undefined || value.timezone === null || typeof value.timezone === 'string')
  );
}

function isGeocodingResponse(value: unknown): value is GeocodingResponse {
  return (
    isRecord(value) &&
    (value.results === undefined ||
      (Array.isArray(value.results) && value.results.every(isGeocodingResult)))
  );
}

function isNullableNumberArray(value: unknown): value is (number | null)[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => entry === null || (typeof entry === 'number' && Number.isFinite(entry)))
  );
}

function isForecastCurrentResponse(value: unknown): value is ForecastCurrentResponse {
  if (!isRecord(value)) return false;

  const numericFields = [
    'temperature_2m',
    'apparent_temperature',
    'relative_humidity_2m',
    'wind_speed_10m',
    'precipitation',
    'surface_pressure',
    'weather_code',
  ];

  return (
    (value.time === undefined || value.time === null || typeof value.time === 'string') &&
    numericFields.every(
      (field) =>
        value[field] === undefined ||
        value[field] === null ||
        (typeof value[field] === 'number' && Number.isFinite(value[field])),
    )
  );
}

function isForecastDailyResponse(value: unknown): value is ForecastDailyResponse {
  if (!isRecord(value)) {
    return false;
  }

  if (
    value.time !== undefined &&
    (!Array.isArray(value.time) || !value.time.every((date) => typeof date === 'string'))
  ) {
    return false;
  }

  const numericArrays = [
    'temperature_2m_min',
    'temperature_2m_max',
    'weather_code',
    'precipitation_probability_max',
  ];

  return numericArrays.every(
    (field) => value[field] === undefined || isNullableNumberArray(value[field]),
  );
}

function isForecastResponse(value: unknown): value is ForecastResponse {
  return (
    isRecord(value) &&
    (value.current === undefined || isForecastCurrentResponse(value.current)) &&
    (value.daily === undefined || isForecastDailyResponse(value.daily))
  );
}

async function fetchJsonWithTimeout(url: string, messages: RequestErrorMessages): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new WeatherServiceError(messages.http);

    try {
      return (await response.json()) as unknown;
    } catch (error) {
      if (controller.signal.aborted || isAbortError(error)) throw error;
      throw new WeatherServiceError(messages.invalidJson);
    }
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (controller.signal.aborted || isAbortError(error)) {
      throw new WeatherServiceError('A conexão demorou mais de 10 segundos. Tente novamente.');
    }
    throw new WeatherServiceError(
      'Não foi possível conectar. Verifique sua conexão com a internet e tente novamente.',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const searchTerm = name.trim();
  if (!searchTerm) return [];

  const data = await fetchJsonWithTimeout(
    `${GEOCODING_URL}?name=${encodeURIComponent(searchTerm)}&count=10&language=pt&format=json`,
    {
      http: 'O serviço de busca de cidades está indisponível. Tente novamente.',
      invalidJson: 'A resposta da busca de cidades é inválida. Tente novamente.',
    },
  );

  if (!isGeocodingResponse(data)) {
    throw new WeatherServiceError('A resposta da busca de cidades é inválida. Tente novamente.');
  }

  return (data.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    country: result.country ?? '',
    latitude: result.latitude,
    longitude: result.longitude,
    ...(result.admin1 != null && { admin1: result.admin1 }),
    ...(result.country_code != null && { countryCode: result.country_code }),
    ...(result.timezone != null && { timezone: result.timezone }),
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
    temperature_unit: 'celsius',
  });
  const data = await fetchJsonWithTimeout(`${FORECAST_URL}?${params.toString()}`, {
    http: 'O serviço de previsão está indisponível. Tente novamente.',
    invalidJson: 'A resposta da previsão do tempo é inválida. Tente novamente.',
  });

  if (!isForecastResponse(data)) {
    throw new WeatherServiceError('A resposta da previsão do tempo é inválida. Tente novamente.');
  }

  const current: CurrentWeather = {
    ...(data.current?.time != null && { time: data.current.time }),
    ...(data.current?.temperature_2m != null && {
      temperatureC: data.current.temperature_2m,
    }),
    ...(data.current?.apparent_temperature != null && {
      apparentTemperatureC: data.current.apparent_temperature,
    }),
    ...(data.current?.relative_humidity_2m != null && {
      relativeHumidityPercent: data.current.relative_humidity_2m,
    }),
    ...(data.current?.wind_speed_10m != null && {
      windSpeedKmh: data.current.wind_speed_10m,
    }),
    ...(data.current?.precipitation != null && { precipitationMm: data.current.precipitation }),
    ...(data.current?.surface_pressure != null && { pressureHpa: data.current.surface_pressure }),
    ...(data.current?.weather_code != null && { weatherCode: data.current.weather_code }),
  };

  const forecast: ForecastDay[] = (data.daily?.time ?? []).map((date, index) => {
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
      ...(precipitationProbability != null && {
        precipitationProbabilityPercent: precipitationProbability,
      }),
    };
  });

  return { city, current, forecast };
}
