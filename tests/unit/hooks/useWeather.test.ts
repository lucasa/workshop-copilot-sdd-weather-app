import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useWeather from '../../../src/hooks/useWeather';
import { getWeather, searchCities } from '../../../src/services/weatherService';
import type { City, WeatherData } from '../../../src/types/weather';

vi.mock('../../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

const city: City = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  latitude: -23.5,
  longitude: -46.6,
};

const weather: WeatherData = { city, current: { temperatureC: 20 }, forecast: [] };

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches cities and loads weather for the first result', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockResolvedValue(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('  São Paulo  ');
    });

    expect(searchCities).toHaveBeenCalledWith('São Paulo');
    expect(getWeather).toHaveBeenCalledWith(city);
    expect(result.current).toMatchObject({
      status: 'success',
      data: weather,
      cities: [city],
      query: 'São Paulo',
      error: undefined,
    });
  });

  it('sets empty when the search has no cities', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });

    expect(getWeather).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({ status: 'empty', cities: [], query: 'Lisboa' });
  });

  it('retries the failed forecast for the same city', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockRejectedValueOnce(new Error('Falha de rede.'));
    vi.mocked(getWeather).mockResolvedValueOnce(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });
    expect(result.current).toMatchObject({ status: 'error', error: 'Falha de rede.' });

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenNthCalledWith(2, city);
    await waitFor(() => expect(result.current).toMatchObject({ status: 'success', data: weather }));
  });

  it('loads a city selected directly', async () => {
    vi.mocked(getWeather).mockResolvedValue(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(city);
    });

    expect(result.current).toMatchObject({ status: 'success', data: weather, query: city.name });
  });
});
