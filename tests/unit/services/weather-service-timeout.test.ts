import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCities } from '../../../src/services/weatherService';

describe('weather service request errors', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    [Object.assign(new Error('aborted'), { name: 'AbortError' }), 'A requisição demorou demais.'],
    [new Error('offline'), 'Falha de rede.'],
  ])('converts request failures to WeatherServiceError', async (failure, message) => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(failure);
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message,
    });

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 10_000);
    expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
