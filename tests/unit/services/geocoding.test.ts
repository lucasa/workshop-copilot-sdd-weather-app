import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCities, WeatherServiceError } from '../../../src/services/weatherService';

describe('searchCities', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an empty list without requesting for a blank name', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('encodes the name and maps geocoding results to cities', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 3448439,
              name: 'São Paulo',
              latitude: -23.5475,
              longitude: -46.6361,
              country: 'Brasil',
              admin1: 'São Paulo',
              country_code: 'BR',
              timezone: 'America/Sao_Paulo',
            },
            {
              id: 1,
              name: 'Cidade sem dados opcionais',
              latitude: 10,
              longitude: 20,
              country: 'Brasil',
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const cities = await searchCities('São Paulo & região');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Paulo%20%26%20regi%C3%A3o&count=10&language=pt&format=json',
      { signal: expect.any(AbortSignal) },
    );
    expect(cities).toEqual([
      {
        id: 3448439,
        name: 'São Paulo',
        latitude: -23.5475,
        longitude: -46.6361,
        country: 'Brasil',
        admin1: 'São Paulo',
        countryCode: 'BR',
        timezone: 'America/Sao_Paulo',
      },
      {
        id: 1,
        name: 'Cidade sem dados opcionais',
        latitude: 10,
        longitude: 20,
        country: 'Brasil',
      },
    ]);
  });

  it('returns an empty list when results is absent', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('São Paulo')).resolves.toEqual([]);
  });

  it('throws WeatherServiceError when the response is not ok', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
  });
});
