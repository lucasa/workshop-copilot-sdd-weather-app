import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCities } from '../../../src/services/weatherService';

describe('weather service request errors', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it.each([
    [
      Object.assign(new Error('aborted'), { name: 'AbortError' }),
      'A conexão demorou mais de 10 segundos. Tente novamente.',
    ],
    [
      new TypeError('Failed to fetch'),
      'Não foi possível conectar. Verifique sua conexão com a internet e tente novamente.',
    ],
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

  it('aborts the request after ten seconds', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
          });
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = searchCities('São Paulo');
    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'A conexão demorou mais de 10 segundos. Tente novamente.',
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await rejection;
  });
});
