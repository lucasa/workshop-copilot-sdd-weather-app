import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, WeatherServiceError } from '../../../src/services/weatherService';
import type { City } from '../../../src/types/weather';

const city: City = {
  id: 3448439,
  name: 'São Paulo',
  country: 'Brasil',
  latitude: -23.5475,
  longitude: -46.6361,
};

describe('getWeather', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests five forecast days and maps current and parallel daily values', async () => {
    const dailyDates = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'];
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          current: {
            time: '2026-10-01T12:00',
            temperature_2m: 21.4,
            apparent_temperature: 22.1,
            relative_humidity_2m: 68,
            wind_speed_10m: 12.3,
            weather_code: 2,
          },
          daily: {
            time: dailyDates,
            temperature_2m_min: [16, 17, 18, 19, 20],
            temperature_2m_max: [25, 26, 27, 28, 29],
            weather_code: [2, 3, 1, 61, 2],
            precipitation_probability_max: [10, 15, 5, 70, null],
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);
    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string);

    expect(requestedUrl.origin + requestedUrl.pathname).toBe(
      'https://api.open-meteo.com/v1/forecast',
    );
    expect(requestedUrl.searchParams.get('latitude')).toBe(String(city.latitude));
    expect(requestedUrl.searchParams.get('longitude')).toBe(String(city.longitude));
    expect(requestedUrl.searchParams.get('forecast_days')).toBe('5');
    expect(requestedUrl.searchParams.get('timezone')).toBe('auto');
    expect(requestedUrl.searchParams.get('temperature_unit')).toBe('celsius');
    expect(requestedUrl.searchParams.get('current')).toContain('temperature_2m');
    expect(requestedUrl.searchParams.get('daily')).toContain('temperature_2m_max');
    expect(result.city).toBe(city);
    expect(result.current).toEqual({
      time: '2026-10-01T12:00',
      temperatureC: 21.4,
      apparentTemperatureC: 22.1,
      relativeHumidityPercent: 68,
      windSpeedKmh: 12.3,
      weatherCode: 2,
    });
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[3]).toEqual({
      date: '2026-10-04',
      minimumC: 19,
      maximumC: 28,
      weatherCode: 61,
      precipitationProbabilityPercent: 70,
    });
    expect(result.forecast[4].precipitationProbabilityPercent).toBe(0);
  });

  it('throws WeatherServiceError when the forecast response is not ok', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('preserves partial forecast data without inventing missing values', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          current: { temperature_2m: 0, weather_code: 0 },
          daily: { time: ['2026-10-01', '2026-10-02'] },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    expect(result.current).toEqual({ temperatureC: 0, weatherCode: 0 });
    expect(result.forecast).toEqual([{ date: '2026-10-01' }, { date: '2026-10-02' }]);
  });

  it.each([
    { current: { temperature_2m: 20 } },
    { daily: { time: ['2026-10-01'] } },
  ])('throws WeatherServiceError when a required response section is absent', async (data) => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(data), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });
});
