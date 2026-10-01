import { describe, expect, it } from 'vitest';
import { getWeatherInfo } from '../../src/lib/weatherCodes';

describe('getWeatherInfo', () => {
  it('returns the label and icon for a known weather code', () => {
    expect(getWeatherInfo(61)).toEqual({ label: 'Chuva fraca', icon: '🌦️' });
  });

  it('returns the fallback for an unknown code', () => {
    expect(getWeatherInfo(999)).toEqual({ label: 'Condição indisponível', icon: '🌡️' });
  });
});
