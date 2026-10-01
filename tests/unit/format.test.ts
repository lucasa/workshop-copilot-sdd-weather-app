import { describe, expect, it } from 'vitest';
import { getDayLabel, getShortDate } from '../../src/lib/format';

describe('weather date formatting', () => {
  it('labels the first and second forecast days', () => {
    expect(getDayLabel('2026-10-01', 0)).toBe('Hoje');
    expect(getDayLabel('2026-10-02', 1)).toBe('Amanhã');
  });

  it('uses the weekday for later forecast days', () => {
    expect(getDayLabel('2026-10-03', 2)).toBe('sábado');
  });

  it('formats a short date in Brazilian Portuguese', () => {
    expect(getShortDate('2026-10-01')).toMatch(/1.*out/i);
  });
});
