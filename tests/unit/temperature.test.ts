import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('temperature helpers', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converts %d°C to %d°F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('keeps Celsius and converts Fahrenheit in convertTemperature', () => {
    expect(convertTemperature(20, 'celsius')).toBe(20);
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
  });

  it('rounds formatted values and includes the selected unit symbol', () => {
    expect(formatTemperature(20.4, 'celsius')).toBe('20 °C');
    expect(formatTemperature(20.6, 'fahrenheit')).toBe('69 °F');
  });

  it('returns the unit symbol', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
