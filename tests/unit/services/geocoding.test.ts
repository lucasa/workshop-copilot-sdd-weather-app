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

    const [requestUrl, requestOptions] = fetchMock.mock.calls[0];
    expect(new URL(String(requestUrl)).searchParams.get('name')).toBe('São Paulo & região');
    expect(requestUrl).toContain('S%C3%A3o%20Paulo%20%26%20regi%C3%A3o');
    expect(requestOptions?.signal).toBeInstanceOf(AbortSignal);
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

  it('converts invalid JSON and malformed results into a friendly service error', async () => {
    const invalidJsonFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('{', { status: 200 }));
    vi.stubGlobal('fetch', invalidJsonFetch);

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'A resposta da busca de cidades é inválida. Tente novamente.',
    });

    const malformedFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ results: 'nenhuma cidade' }), { status: 200 }),
      );
    vi.stubGlobal('fetch', malformedFetch);

    await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
  });
});
