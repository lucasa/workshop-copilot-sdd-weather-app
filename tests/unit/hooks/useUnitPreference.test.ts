import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useUnitPreference from '../../../src/hooks/useUnitPreference';

describe('useUnitPreference', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to Celsius and persists a changed unit', () => {
    const { result } = renderHook(() => useUnitPreference());

    expect(result.current[0]).toBe('celsius');
    act(() => result.current[1]('fahrenheit'));

    expect(result.current[0]).toBe('fahrenheit');
    expect(window.localStorage.getItem('weather-view-unit')).toBe('fahrenheit');
  });

  it('restores a valid saved unit and ignores invalid values', () => {
    window.localStorage.setItem('weather-view-unit', 'fahrenheit');
    expect(renderHook(() => useUnitPreference()).result.current[0]).toBe('fahrenheit');

    window.localStorage.setItem('weather-view-unit', 'kelvin');
    expect(renderHook(() => useUnitPreference()).result.current[0]).toBe('celsius');
  });

  it('keeps the preference usable when local storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    const { result } = renderHook(() => useUnitPreference());

    expect(result.current[0]).toBe('celsius');
    act(() => result.current[1]('fahrenheit'));

    expect(result.current[0]).toBe('fahrenheit');
  });
});
