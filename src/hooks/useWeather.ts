import { useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

type LastOperation = { type: 'search'; name: string } | { type: 'weather'; city: City };

interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | undefined;
  cities: City[];
  error: string | undefined;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.';
}

export default function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData>();
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string>();
  const [query, setQuery] = useState('');
  const lastOperation = useRef<LastOperation | undefined>(undefined);
  const operationId = useRef(0);

  async function loadCityWeather(city: City): Promise<void> {
    const currentOperationId = ++operationId.current;
    setStatus('loading');
    setData(undefined);
    setError(undefined);

    try {
      const weather = await getWeather(city);
      if (currentOperationId !== operationId.current) return;

      setData(weather);
      setStatus('success');
    } catch (weatherError) {
      if (currentOperationId !== operationId.current) return;

      setError(getErrorMessage(weatherError));
      setStatus('error');
    }
  }

  async function runSearch(name: string): Promise<void> {
    const currentOperationId = ++operationId.current;
    lastOperation.current = { type: 'search', name };
    setQuery(name);
    setStatus('loading');
    setData(undefined);
    setCities([]);
    setError(undefined);

    if (!name) {
      setStatus('idle');
      return;
    }

    try {
      const results = await searchCities(name);
      if (currentOperationId !== operationId.current) return;

      setCities(results);
      if (results.length === 0) {
        setStatus('empty');
        return;
      }

      const firstCity = results[0];
      lastOperation.current = { type: 'weather', city: firstCity };
      await loadCityWeather(firstCity);
    } catch (searchError) {
      if (currentOperationId !== operationId.current) return;

      setError(getErrorMessage(searchError));
      setStatus('error');
    }
  }

  async function search(name: string): Promise<void> {
    await runSearch(name.trim());
  }

  async function selectCity(city: City): Promise<void> {
    lastOperation.current = { type: 'weather', city };
    setQuery(city.name);
    await loadCityWeather(city);
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (!operation) return;

    if (operation.type === 'search') {
      await runSearch(operation.name);
    } else {
      await loadCityWeather(operation.city);
    }
  }

  return { status, data, cities, error, query, search, selectCity, retry };
}
